const {
    DATETIME,
    BUS_ID,
    LAT,
    LNG,
    LINE_NAME,
    LINE_CODE,
    DIRECTION,
    NUM_VEHICLES,
    VEHICLES,
    ACCESSIBLE,
    PREDICTED_TIME,
    TERMINAL_1,
    TERMINAL_2,
    DESTINATION_LABEL_1,
    DESTINATION_LABEL_2,
    OPERATION_MODE,
    SIGN_TEXT
} = require('./api-translation'); 

const convertBusfromTheyToUs = (bus, busLine) => ({
    datetime: bus[DATETIME],
    busId: bus[BUS_ID],
    line: busLine,
    lat: bus[LAT],
    lng: bus[LNG],
    accessible: bus[ACCESSIBLE],
    predictedTime: bus[PREDICTED_TIME]
});

const convertLinefromTheyToUs = line => ({
    lineName: line[LINE_NAME],
    lineCode: line[LINE_CODE],
    direction: line[DIRECTION],
    numVehicles: line[NUM_VEHICLES],
    terminal1: line[TERMINAL_1],
    terminal2: line[TERMINAL_2],
    destinationLabel1: line[DESTINATION_LABEL_1],
    destinationLabel2: line[DESTINATION_LABEL_2],
    operationMode: line[OPERATION_MODE],
    signText: line[SIGN_TEXT],
    vehicles: line[VEHICLES] && line[VEHICLES].map(convertBusfromTheyToUs)
});


module.exports = {
    convertBusfromTheyToUs,
    convertLinefromTheyToUs
};