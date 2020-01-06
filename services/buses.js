const BusesApi = require('./busesApi');
const { convertBusfromTheyToUs, convertLinefromTheyToUs } = require('./utils/buses');
const {
    BUSES_BY_LINE,
    VEHICLES,
    TERMINAL_1,
    TERMINAL_2,
    LINE_CODE,
    OPERATION_MODE,
    BUS_ID,
    LINE_NAME
} = require('./utils/api-translation');
const _ = require('lodash');

let busesLines = [];

let busesData = {}; // Cache of buses data

const wsConnections = {}; // List of all websocket connections

const getBusesByLine = line => {
    return BusesApi.get(`/Posicao/Linha?codigoLinha=${line}`);
};

const getLines = async () => {
    if (busesLines.length === 0) {
        try {
            const { data } = await getAllBuses();
            const lines = data[BUSES_BY_LINE];
            const busesByLines = _.groupBy(
                lines.map(line => ({
                    ...line,
                    [VEHICLES]: undefined
                })),
                LINE_NAME
            );

            busesLines = Object.keys(busesByLines).map(lineName => ({
                lineName,
                terminal1: busesByLines[lineName][0][TERMINAL_1],
                terminal2: busesByLines[lineName][0][TERMINAL_2],
                sublines: busesByLines[lineName].map(line => convertLinefromTheyToUs(line))
            }));
        } catch (e) {
            busesLines = [];
        }
    }

    return busesLines;
};

const getDataByLine = async busLine => {
    if (busLine) {
        try {
            const { data } = await getBusesByLine(busLine);
            busesData[busLine] = data[VEHICLES].map(bus => convertBusfromTheyToUs(bus));
        } catch (e) {
            busesData[busLine] = [];
            console.error(new Error(`An error occurred in fetch the buses data of line ${busLine}.`));
        }
    }
};


function _computeAngle([ax, ay], [bx, by]) {
    return (Math.atan2(by - ay, bx - ax) * 180 / Math.PI);
};

const fetchAllData = async () => {
    let busesLines = [];
    try {
        const { data } = await getAllBuses();
        busesLines = data[BUSES_BY_LINE];
    } catch(e) {
        console.error(new Error('An error occurred in fetch some bus data.'));
    }

    busesLines.forEach((busLine) => {
        if (Array.isArray(busesData[busLine[LINE_CODE]])) {
            busesData[busLine[LINE_CODE]] = busesData[busLine[LINE_CODE]].sort((b1, b2) => b1.busId - b2.busId);
        } else {
            busesData[busLine[LINE_CODE]] = [];
        }

        busesData[busLine[LINE_CODE]] = busLine[VEHICLES]
        .sort((b1, b2) => b1[BUS_ID] - b2[BUS_ID])
        .map((bus, i) => {
            const newBus = convertBusfromTheyToUs(bus);
            const oldBus = busesData[busLine[LINE_CODE]][i];
            let rotationAngle = 0;

            if (oldBus) {
                rotationAngle = -_computeAngle(
                    [oldBus.lng, oldBus.lat],
                    [newBus.lng, newBus.lat]
                );
                rotationAngle = rotationAngle === 0 ? oldBus.rotationAngle : rotationAngle;
            }

            return {
                ...newBus,
                rotationAngle
            };
        });
    });
};

const sendBusesLineData = (connection, busLine) => {
    connection.send(JSON.stringify(busesData[busLine] || []));
};

const broadcastBusesData = async () => {
    for (let connectionId in wsConnections) {
        const { connection, busLine } = wsConnections[connectionId];
        sendBusesLineData(connection, busLine);
    }
};

function getAllBuses() {
    return BusesApi.get('/Posicao');
};

async function getStationsByLineAndDirection(lineCode, direction) {
    try {
        const { data: lines } = await BusesApi.get(`/Linha/BuscarLinhaSentido?termosBusca=${lineCode}&sentido=${direction}`);
        const line = lines.find(line => line[OPERATION_MODE] === 10);
        const { data: stations } = await BusesApi.get(`/Previsao/Linha?codigoLinha=${line[LINE_CODE]}`);
        return stations;
    } catch {
        return [];
    }
};

module.exports = {
    getAllBuses,
    broadcastBusesData,
    fetchAllData,
    sendBusesLineData,
    getLines,
    getBusesByLine,
    getStationsByLineAndDirection,
    getWsConnections() {
        return wsConnections;
    },
    removeWsConnection(connectionId) {
        delete wsConnections[connectionId];
    },
    addWsConnection(connection, busLine) {
        wsConnections[connection.id] = {
            connection,
            busLine
        };
    },
    getGetBusesLines() {
        return busesLines;
    }
};