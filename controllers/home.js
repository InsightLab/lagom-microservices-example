const path = require('path');

module.exports = {
    getHomePage(req, res) {
        res.sendFile(path.resolve(__dirname, '../index.html'));
    }
}