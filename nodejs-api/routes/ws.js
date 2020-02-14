const BusesController = require('../controllers/buses');

module.exports = wsServer => {
    wsServer.on('request', BusesController.handleStreamConnection);
};
