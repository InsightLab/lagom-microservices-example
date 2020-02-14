const convertStopFromTheyToUs = (stop) => ({
    stopId: stop.stop_id,
    name: stop.name,
    trips: stop.trips,
    lat: stop.location.coordinates[1],
    lng: stop.location.coordinates[0]
});

module.exports = {
    convertStopFromTheyToUs
};