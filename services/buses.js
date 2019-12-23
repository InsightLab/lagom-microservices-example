const axios = require('axios');
const _ = require('lodash');

const BusAPI = axios.create({
    baseURL: `http://api.olhovivo.sptrans.com.br/v2.1`,
    withCredentials: true
});

axios.defaults.withCredentials = true;

const refreshToken = async () => {
    try {
        const response = await BusAPI.post('/Login/Autenticar', {}, {
            params: {
                token: process.env.API_OLHO_VIVO_TOKEN
            }
        });

        const { data: isAuthenticated } = response;

        if (isAuthenticated) {
            BusAPI.defaults.headers = {
                Cookie: response.headers['set-cookie'][0]
            };
        }   
    } catch(e) { }
}


refreshToken();

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
            const { l: lines } = data;
            busesLines = _.groupBy(
                lines.map(line => ({
                    ...line,
                    vs: null
                })),
                'c'
            );
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
            busesData[busLine] = data.vs.map(bus => ({
                datetime: bus.ta,
                busId: bus.p,
                line: busLine,
                lat: bus.py,
                lng: bus.px,
                velocity: null
            }));
        } catch (e) {
            busesData[busLine] = [];
            console.error(new Error(`An error occurred in fetch the buses data of line ${busLine}.`));
        }
    }
};

const fetchAllData = async () => {
    try {
        const { data: { l: busesLines } } = await getAllBuses();
        busesLines.forEach((busLine, i) => {
            busesData[busLine.cl] = busLine.vs.map(bus => ({
                datetime: bus.ta,
                busId: bus.p,
                line: busLine,
                lat: bus.py,
                lng: bus.px,
                velocity: null
            }));
        });
    } catch(e) {
        console.log(e);
        console.error(new Error('An error occurred in fetch some bus data.'));
    }
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
        const { data } = await BusAPI.get(`/Linha/BuscarLinhaSentido?termosBusca=${lineCode}&sentido=${direction}`);
        const line = data.filter(line => line.tl === 10)[0];
        console.log(data);
        const { data: stations } = await BusAPI.get(`/Parada/BuscarParadasPorLinha?codigoLinha=${line}`);
        return stations;
    } catch { }
};

module.exports = {
    getAllBuses,
    broadcastBusesData,
    fetchAllData,
    sendBusesLineData,
    getWsConnections() {
        return wsConnections;
    },
    getGetBusesLines() {
        return busesLines;
    },
    getLines,
    getBusesByLine,
    getStationsByLineAndDirection
};