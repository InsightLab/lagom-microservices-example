const BusesService = require('../services/buses');
const Trip = require('../models/Trip');
const Stop = require('../models/Stop');
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
        const { line, direction } = req.params;
        Stop.find({
            trips: `${line}-${+direction-1}`
        })
        .select('-_id -trips')
        .exec((err, stops) => {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    message: 'An error occurred in server. Try again.'
                });
            }

            if (stops) {
                res.json(stops);
            } else {
                res.status(404).json({
                    message: 'No stops found with this line and direction.'
                });
            }
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