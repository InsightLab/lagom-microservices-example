const mongoose = require('mongoose');

const {
    MONGO_HOST,
    MONGO_PORT,
    MONGO_DB
} = process.env;

const db = mongoose.createConnection(`mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

module.exports = db;