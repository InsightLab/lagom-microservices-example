import React, { FunctionComponent, useState, useEffect, useContext } from 'react';
import { LatLngTuple } from 'leaflet';
import debounce from 'lodash.debounce';
import { Stop } from '../../types/index';
import DefaultMap from '../DefaultMap';
import mainCtx from '../../contexts/mainCtx';
import StopsMarkers from '../StopsMarkers';
import CurrentPositionMarker from './CurrentPositionMarker';
import BusesService from '../../services/buses';
import BusStopsSettings from './BusStopsSettings';
import "./styles.scss";


interface BusStopsMapProps {
    originalCenter: LatLngTuple
};
const BusStopsMap: FunctionComponent<BusStopsMapProps> = ({ originalCenter }) => {
    const {
        circleRadius
    } = useContext(mainCtx);
    const [nearStops, setNearStops] = useState<Stop[]>([]);
    const [currentPosition, setCurrentPosition] = useState<LatLngTuple>([-23.681910999999998, -46.734472]);

    
    useEffect(() => {
        const fetchNearStops = debounce((currentPosition: LatLngTuple, circleRadius: number) => {
            BusesService.getStopsWithinCircle(currentPosition, circleRadius)
            .then(({ data }) => {
                setNearStops(data || []);
            });
        }, 100);

        fetchNearStops(currentPosition, circleRadius);
    }, [currentPosition, circleRadius]);

    return (
        <>
            <BusStopsSettings />
            <DefaultMap
                center={currentPosition}
                bounds={
                    nearStops.length > 1 ?
                    nearStops.map(({ lat, lng }) => [lat, lng]) :
                    [currentPosition, currentPosition]
                }
            >
                <CurrentPositionMarker
                    onDragEnd={setCurrentPosition}
                    initialPosition={currentPosition}
                    radius={circleRadius}
                />
                <StopsMarkers
                    visible={true}
                    stops={nearStops}
                />
            </DefaultMap>
        </>
    );
};

export default BusStopsMap;