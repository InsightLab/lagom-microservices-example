const axios = require('axios');
const { convertBusfromTheyToUs, convertLinefromTheyToUs } = require('./utils/buses');
const {
    BUSES_BY_LINE,
    VEHICLES,
    TERMINAL_1,
    TERMINAL_2,
    LINE_CODE,
    OPERATION_MODE
} = require('./utils/api-translation');
const _ = require('lodash');

const BusAPI = axios.create({
    baseURL: `http://api.olhovivo.sptrans.com.br/v2.1`,
    withCredentials: true
});

axios.defaults.withCredentials = true;

BusAPI.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const response = await BusAPI.post('/Login/Autenticar', {}, {
                    params: { token: process.env.API_OLHO_VIVO_TOKEN }
                });
            
                const { data: isAuthenticated } = response;
            
                if (isAuthenticated) {
                    BusAPI.defaults.headers.common['Cookie'] = response.headers['set-cookie'][0];
                }   

                return axios(originalRequest);
            } catch(e) {
                return axios(originalRequest);
            }
        }
    }
);

let busesLines = [];

let busesData = {}; // Cache of buses data

const wsConnections = {}; // List of all websocket connections

const getBusesByLine = line => {
    return BusAPI.get(`/Posicao/Linha?codigoLinha=${line}`);
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
                'c'
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

const fetchAllData = async () => {
    let busesLines = [];
    try {
        const { data } = await getAllBuses();
        busesLines = data[BUSES_BY_LINE];
    } catch(e) {
        console.error(new Error('An error occurred in fetch some bus data.'));
    }

    busesLines.forEach((busLine) => {
        busesData[busLine[LINE_CODE]] = busLine[VEHICLES].map(bus => convertBusfromTheyToUs(bus));
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
    return BusAPI.get('/Posicao');
};

async function getStationsByLineAndDirection(lineCode, direction) {
    try {
        const { data: lines } = await BusAPI.get(`/Linha/BuscarLinhaSentido?termosBusca=${lineCode}&sentido=${direction}`);
        const line = lines.find(line => line[OPERATION_MODE] === 10);
        const { data: stations } = await BusAPI.get(`/Parada/BuscarParadasPorLinha?codigoLinha=${line[LINE_CODE]}`);
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
    },
    getLines,
    getBusesByLine,
    getStationsByLineAndDirection
};