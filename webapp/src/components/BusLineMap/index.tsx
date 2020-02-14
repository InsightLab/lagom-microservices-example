import React, { FunctionComponent, useState, useEffect, useContext } from 'react';
import { LatLngTuple, LatLngExpression } from 'leaflet';
import { CircleMarker, Polyline } from 'react-leaflet';
import { Bus, Stop } from '../../types/index';
import DefaultMap from '../DefaultMap';
import BusesMarkers from './BusesMarkers';
import mainCtx from '../../contexts/mainCtx';
import StopsMarkers from '../StopsMarkers';
import BusLineSettings from './BusLineSettings';
import "./styles.scss";


interface BusLineMapProps {
    buses: Bus[],
    originalCenter: LatLngTuple,
    stops: Stop[],
    routePath: LatLngExpression[]
};
const BusLineMap: FunctionComponent<BusLineMapProps> = ({ buses, originalCenter, stops, routePath }) => {
    const {
        stopsVisibility,
        busesVisibility,
    } = useContext(mainCtx);
    const [center, setCenter] = useState<LatLngTuple>(originalCenter);
    const [bounds, setBounds] = useState<LatLngTuple[]>([center, center]);

    const updateBounds = (newBounds: LatLngTuple[]) => {
        if (newBounds.length > 1) {
            setBounds(newBounds);
        }
    };

    useEffect(() => {
        updateBounds(routePath as LatLngTuple[]);
    }, [routePath]);

    return (
        <>
            <BusLineSettings />
            <DefaultMap bounds={bounds}>
                <BusesMarkers visible={busesVisibility} buses={buses} />
                <StopsMarkers visible={stopsVisibility} stops={stops} />
                {routePath[0] && (
                    <>
                        <CircleMarker
                            center={routePath[0]}
                            radius={3}
                            fillColor='#00C6DB'
                            color='#00C6DB'
                        />
                        <Polyline className="bus-route-path" positions={routePath} />
                        <CircleMarker
                            center={routePath[routePath.length - 1]}
                            radius={3}
                            fillColor='#446DFF'
                            color='#446DFF'
                        />
                    </>
                )}
            </DefaultMap>
        </>
    );
};

export default BusLineMap;