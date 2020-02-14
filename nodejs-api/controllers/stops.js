
const Stop = require('../models/Stop');
const BusService = require('../services/buses');
const { convertStopFromTheyToUs } = require('../services/utils/stops');

module.exports = {
    async getStopsByLineAndDirection(req, res) {
        const { line, direction } = req.params;
        Stop.find({
            trips: `${line}-${+direction-1}`
        })
        .select('-_id -trips -location.type -location._id')
        .exec((err, stops) => {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    message: 'An error occurred in server. Try again.'
                });
            }

            if (stops) {
                res.json(stops.map(convertStopFromTheyToUs));
            } else {
                res.status(404).json({
                    message: 'No stops found with this line and direction.'
                });
            }
        });
    },
    getStopsWithinCircle(req, res) {
        const { coordinates, radius } = req.params;
        let [lng, lat] = coordinates.split(',');
        lat = parseFloat(lat);
        lng = parseFloat(lng);

        Stop.find({
            location: {
                $geoWithin: {
                    $centerSphere: [
                        [lng, lat], parseInt(radius) / 6378100
                    ]
                }
            }
        })
        .select('-_id -trips -location.type -location._id')
        .exec((err, stops) => {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    message: 'An error occurred in server. Try again.'
                });
            }

            if (stops) {
                res.json(stops.map(convertStopFromTheyToUs));
            } else {
                res.status(404).json({
                    message: 'No stops found with this line and direction.'
                });
            }
        });
    },
    getStopPrevisions(req, res) {
        const { stopId } = req.params;

        BusService.getStopPrevisions(stopId)
        .then(lines => {
            res.json(lines);
        });
    }
};