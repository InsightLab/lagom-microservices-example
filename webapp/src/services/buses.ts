import busesApi from "./busesApi";

export default {
    getAllBuses() {
        return busesApi.get('/buses');
    },
    getBusesLines() {
        return busesApi.get('/buses-lines');
    },
    searchLines(q: string) {
        return busesApi.get('/buses-lines/search', {
            params: { q }
        });
    },
    getStopsByLineAndDirection(lineName: number | string, direction: number | string) {
        return busesApi.get(`/buses-stops/${lineName}/${direction}`);
    },
    getStopsWithinCircle(coordinates: [number, number], radius: number) {
        return busesApi.get(`/buses-stops/within-circle/${coordinates[1]},${coordinates[0]}/${radius}`);
    },
    getStopPrevision(stopId: number) {
        return busesApi.get(`/buses-stops/previsions/${stopId}`);
    },
    getTripByLineAndDirection(lineName: number | string, direction: number | string) {
        return busesApi.get(`/trip/${lineName}/${direction}`);
    }
};