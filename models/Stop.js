const mongoose = require('mongoose');
const db = require('./db');

const pointSchema = new mongoose.Schema({
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
});

const stopSchema = new mongoose.Schema({
    stop_id: 'string',
    name: 'string',
    location: pointSchema
});

const Stop = db.model('stops', stopSchema);

module.exports = Stop;