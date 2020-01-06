const mongoose = require('mongoose');
const db = require('./db');

const stopSchema = new mongoose.Schema({
    stop_id: 'string',
    stop_name: 'string',
    stop_desc: 'string',
    stop_lat: 'number',
    stop_lon: 'number'
});

const Stop = db.model('stops', stopSchema);

module.exports = Stop;