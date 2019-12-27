const BusesService = require('../services/buses');
const { LINE_NAME, STATIONS } = require('../services/utils/api-translation');

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
        BusesService.getStationsByLineAndDirection(
            req.params.lineCode, req.query.direction
        ).then((data) => {
            res.json(data[STATIONS]);
        });
    },
    handleStreamConnection(request) {
        const connection = request.accept(null, request.origin);
 
        connection.on('message', async message => {
            if (message.type === 'utf8') {
                const [busLine, busDirection] = message.utf8Data.split(', ');
                const busesLines = await BusesService.getLines();

                if (busesLines.some(bl => bl.lineName === busLine)) {
                    const lineCode = busesLines
                                    .find(bl => bl.lineName === busLine)
                                    .sublines
                                    .find(sbl => sbl.direction === parseInt(busDirection))
                                    .lineCode;

                    BusesService.addWsConnection(connection, lineCode);
                    BusesService.sendBusesLineData(connection, lineCode);
                }
            }
        });
        
        connection.on('close', () => {
            BusesService.removeWsConnection(connection.id);
        });
    }
}