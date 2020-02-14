import React, { FunctionComponent, useState, useEffect } from 'react'
import L, { Icon, icon } from 'leaflet';
import "leaflet-rotatedmarker";
import { Marker, useLeaflet, Popup } from 'react-leaflet';
import SmallStopIcon from '../../assets/small-stop-icon.png';
import { Stop, BusLine } from '../../types';
import BusService from '../../services/buses';
import PrevisionPanel from '../PrevisionPanel';
import "./styles.scss";

const stopIconSize: [number, number] = [17, 14];
const stopIcon: Icon = icon({
    iconUrl: SmallStopIcon,
    iconSize: stopIconSize
});

interface StopsMarkersProps {
    stops: Stop[],
    visible: boolean
};

const StopsMarkers: FunctionComponent<StopsMarkersProps> = ({ stops, visible }) => {
    const { map } = useLeaflet();
    const [selectedStopId, setSelectedStopId] = useState<number>();
    const [previsions, setPrevisions] = useState<BusLine[]>([]);

    function checkIfSelected(id: number) {
        if (selectedStopId === id || !selectedStopId) {
            return true;
        } else {
            return false;
        }
    }

    function fetchPrevisions(stopId: number) {
        BusService.getStopPrevision(stopId)
        .then(({ data }) => {
            setPrevisions(data);
        });
    }

    useEffect(() => {
        function unselectStops() {
            setSelectedStopId(undefined);
        }

        if (map) {
            map.on('click', () => {
                unselectStops();
            });
        }
    }, [map]);

    return visible ? (
        <>
            {stops.map((stop: Stop) => (
                <Marker
                    key={stop.stopId}
                    position={[stop.lat, stop.lng]}
                    icon={stopIcon}
                    opacity={checkIfSelected(stop.stopId) ? 1 : 0.3}
                    onClick={() => {
                        setSelectedStopId(stop.stopId);
                        map && map.panTo([stop.lat, stop.lng]);
                        fetchPrevisions(stop.stopId);
                    }}
                >
                    { (L.Browser.mobile && selectedStopId === stop.stopId) && (
                        <div className="full-screen-popup">
                            <PrevisionPanel previsions={previsions} stop={stop} />
                        </div>
                    ) }
                    { !L.Browser.mobile && (
                        <Popup maxWidth={500} className="buses-map-stop-popup">
                            <PrevisionPanel previsions={previsions} stop={stop} />
                        </Popup>
                    ) }
                </Marker>
            ))}
        </>
    ) : <></>;
};

export default StopsMarkers;