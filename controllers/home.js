const path = require('path');

module.exports = {
    getHomePage(_, res) {
        res.json({
            status: 'running'
        });
    }
}