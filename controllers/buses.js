const BusesService = require('../services/buses');
const { BUSES_BY_LINE } = require('../services/utils/api-translation');
const Trip = require('../models/Trip');

module.exports = {
    async getBusesLines(req, res) {
        const busesLines = await BusesService.getLines();
        return res.json({
            busesLines
        });
    },
    getAllBuses(req, res) {
        BusesService.getAllBuses()
        .then(data => {
            res.json(data); 
        });
    },
    searchLines(req, res) {
        const { q } = req.query;
        BusesService.searchLines(q)
        .then((lines) => {
            res.json(lines); 
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
    },
    getTripByLineAndDirection(req, res) {
        const { line, direction } = req.params;
        Trip.findOne({
            route_id: line,
            direction_id: parseInt(direction) - 1
        })
        .select('-_id')
        .exec((err, trip) => {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    message: 'An error occurred in server. Try again.'
                });
            }

            if (trip) {
                res.json(trip);
            } else {
                res.status(404).json({
                    message: 'No trip found with this line and direction.'
                });
            }
        });
    }
}