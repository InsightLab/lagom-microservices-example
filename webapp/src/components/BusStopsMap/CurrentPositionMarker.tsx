import React, { FunctionComponent, useState } from 'react'
import L, { LeafletMouseEvent, LatLngTuple } from 'leaflet';
import { useLeaflet, CircleMarker, Circle } from 'react-leaflet';

interface CurrentPositionMarkerProps {
    radius: number,
    initialPosition: LatLngTuple,
    onDragEnd: (latLng: LatLngTuple) => void
};

const CurrentPositionMarker: FunctionComponent<CurrentPositionMarkerProps> = ({ radius, initialPosition, onDragEnd }) => {
    const { map } = useLeaflet();
    const [center, setCenter] = useState<LatLngTuple>(initialPosition);
    let circleMarker: L.CircleMarker;

    const markerDraggingHandler = (e: LeafletMouseEvent) => {
        if (circleMarker) {
            e.originalEvent.stopPropagation();
            setCenter([e.latlng.lat, e.latlng.lng]);
        }
    };

    const startMarkerDraggingHandler = (e: LeafletMouseEvent) => {
        circleMarker = e.target;

        if (map) {
            setCenter([e.latlng.lat, e.latlng.lng]);

            map.on('mousemove', markerDraggingHandler);
            map.on('mouseup', endMarkerDraggingHandler);
        }
    };

    const endMarkerDraggingHandler = (e: LeafletMouseEvent) => {
        if (map) {
            map.removeEventListener('mousemove', markerDraggingHandler);
            map.removeEventListener('mouseup', endMarkerDraggingHandler);
        }
        setCenter([e.latlng.lat, e.latlng.lng]);
        onDragEnd([e.latlng.lat, e.latlng.lng]);
    };

    return (
        <>
            <Circle
                center={center}
                radius={radius}
                fillOpacity={0.05}
                weight={2}
                color='#446DFF'
                editable={true}
            />
            <CircleMarker
                draggable={true}
                onMouseDown={startMarkerDraggingHandler}
                className="buses-map-current-position"
                center={center}
                radius={10}
            />
        </>
    );
};

export default CurrentPositionMarker;