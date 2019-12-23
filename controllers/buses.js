const BusesService = require('../services/buses');

const wsConnections = BusesService.getWsConnections();

module.exports = {
    async getBusesLines(req, res) {
        const busesLines = await BusesService.getLines();
        return res.json({
            busesLines
        }); 
    },
    async getAllBuses(req, res) {
        BusesService.getAllBuses()
        .then(({ data }) => {
            res.json(data.l); 
        });
    },
    async getStationsByLineAndDirection(req, res) {
        BusesService.getStationsByLineAndDirection(req.params.lineCode, req.query.direction)
        .then(({ data }) => {
            res.json(data);
        });
    },
    handleStreamConnection(request) {
        const connection = request.accept(null, request.origin);

        connection.on('message', async message => {
            if (message.type === 'utf8') {
                const busLine = message.utf8Data;
                const busesLines = await BusesService.getLines();

                if (busesLines.includes(parseInt(busLine))) {
                    wsConnections[connection.id] = {
                        connection,
                        busLine
                    };

                    BusesService.sendBusesLineData(connection, busLine);
                }
            }
        });
        
        connection.on('close', () => {
            delete wsConnections[connection.id];
        });
    }
}