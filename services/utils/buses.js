const { DATETIME, BUS_ID, LAT, LNG, LINE_NAME, LINE_CODE, DIRECTION, NUM_VEHICLES } = require('./api-translation'); 

const convertBusfromTheyToUs = (bus, busLine) => ({
    datetime: bus[DATETIME],
    busId: bus[BUS_ID],
    line: busLine,
    lat: bus[LAT],
    lng: bus[LNG]
});

const convertLinefromTheyToUs = line => ({
    lineName: line[LINE_NAME],
    lineCode: line[LINE_CODE],
    direction: line[DIRECTION],
    numVehicles: line[NUM_VEHICLES]
});

module.exports = {
    convertBusfromTheyToUs,
    convertLinefromTheyToUs
};