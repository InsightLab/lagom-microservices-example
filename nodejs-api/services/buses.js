const BusesApiConsumer = require('./busesApiConsumer');
const { convertLinefromTheyToUs } = require('./utils/buses');
const { BUSES_BY_LINE, STOP } = require('./utils/api-translation');
const _ = require('lodash');

let busesLines = []; // Cache of buses lines data

let busesData = {}; // Cache of buses data

const wsConnections = {}; // List of all websocket connections


const getLines = async () => {
    if (busesLines.length === 0) {
        try {
            const lines = await getAllBuses();
            const busesByLines = _.groupBy(
                lines.map(line => ({
                    ...line,
                    vehicles: undefined
                })),
                'lineName'
            );

            busesLines = Object.keys(busesByLines).map(lineName => ({
                lineName,
                terminal1: busesByLines[lineName][0].terminal1,
                terminal2: busesByLines[lineName][0].terminal2,
                subLines: busesByLines[lineName]
            }));
        } catch {
            busesLines = [];
        }
    }

    return busesLines;
};

function _computeAngle([ax, ay], [bx, by]) {
    return (Math.atan2(by - ay, bx - ax) * 180 / Math.PI);
};

const fetchAllData = async () => {
    let busesLines = [];
    try {
        busesLines = await getAllBuses();
    } catch {
        console.error(new Error('An error occurred in fetch some bus data.'));
    }

    busesLines.forEach(busLine => {
        if (Array.isArray(busesData[busLine.lineCode])) {
            busesData[busLine.lineCode] = busesData[busLine.lineCode].sort((b1, b2) => b1.busId - b2.busId);
        } else {
            busesData[busLine.lineCode] = [];
        }

        busesData[busLine.lineCode] = busLine.vehicles
        .sort((b1, b2) => b1.busId - b2.busId)
        .map((bus, i) => {
            const newBus = bus;
            const oldBus = busesData[busLine.lineCode][i];
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

async function getAllBuses() {
    try {
        const { data } = await BusesApiConsumer.get('/Posicao');
        const lines = data[BUSES_BY_LINE].map(convertLinefromTheyToUs);
        return lines;
    } catch {
        return [];
    }
};

async function getStopPrevisions(stopId) {
    let previsions;

    try {
        const { data } = await BusesApiConsumer.get(`/Previsao/Parada?codigoParada=${stopId}`);
        previsions = data[STOP][BUSES_BY_LINE].map(convertLinefromTheyToUs);
    } catch {
        return [];
    }

    return previsions;
}

async function searchLines(searchString) {
    let lines;

    try {
        const { data } = await BusesApiConsumer.get(`/Linha/Buscar?termosBusca=${searchString}`);
        lines = data.map(convertLinefromTheyToUs)
        lines = _.groupBy(lines, ({ signText, operationMode }) => {
            return `${signText}-${operationMode}`;
        });
    } catch {
        return [];
    }

    return lines;
}

module.exports = {
    getLines,
    getAllBuses,
    searchLines,
    fetchAllData,
    getStopPrevisions,
    sendBusesLineData,
    broadcastBusesData,
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