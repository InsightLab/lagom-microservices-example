const mongoose = require('mongoose');
const db = require('./db');

const tripSchema = new mongoose.Schema({
    route_id: 'string',
    trip_id: 'string',
    trip_headsign: 'string',
    direction_id: 'number',
    shape_id: 'number',
    shape_path: [{
        lat: 'number',
        lng: 'number',
        dist: 'number'
    }]
});

const Trip = db.model('trips', tripSchema);

module.exports = Trip;