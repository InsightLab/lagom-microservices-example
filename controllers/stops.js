
const Stop = require('../models/Stop');

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
                res.json(stops);
            } else {
                res.status(404).json({
                    message: 'No stops found with this line and direction.'
                });
            }
        });
    },
    async getStopsWithinCircle(req, res) {
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
                console.log(err);
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
    }
};