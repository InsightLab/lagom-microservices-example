const convertTripFromTheyToUs = (trip) => ({
    routeId: trip.route_id,
    tripId: trip.trip_id,
    tripHeadsign: trip.trip_headsign,
    directionId: trip.direction_id,
    shapeId: trip.shape_id,
    shapePath: trip.shape_path
});

module.exports = {
    convertTripFromTheyToUs
};