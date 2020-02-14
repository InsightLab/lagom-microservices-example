import React, { FunctionComponent, useState, useContext } from 'react';
import { LatLngTuple } from 'leaflet';
import { Map, TileLayer, ZoomControl } from 'react-leaflet';
import cx from 'classnames';
import mainCtx from '../../contexts/mainCtx';

interface SVGGradientProps {
    id: string,
    stops: string[],
    rotation: number
};
const SVGGradient: FunctionComponent<SVGGradientProps> = ({ stops, id, rotation }) => (
    <svg width={0} height={0} style={{ position: 'absolute' }}>
        <linearGradient id={id} gradientTransform={`rotate(${rotation})`}>
            {stops.map((stopColor, i) => (
                <stop
                    key={`${stopColor}-${i}`}
                    offset={`${i * 100 / (stops.length - 1)}%`}
                    stopColor={stopColor}
                />
            ))}
        </linearGradient>
    </svg>
);


interface BusMapProps {
    bounds?: LatLngTuple[],
    center?: LatLngTuple
};
const BusMap: FunctionComponent<BusMapProps> = ({ children, center, bounds }) => {
    const {
        menuOpen
    } = useContext(mainCtx);
    const [theme, setTheme] = useState<string>('light');
    
    return (
        <div className={cx("bus-map-wrapper", {
            'menu-open': menuOpen
        })}>
            <SVGGradient
                rotation={0}
                id='primary-gradient'
                stops={['#446DFF', '#00C6DB']}
            />
            <Map
                bounds={bounds}
                zoomControl={false}
                className="buses-map"
                center={center}
                zoom={15}
                minZoom={12}
                maxZoom={20}
                maxBounds={[[-23.365086,-46.8289817], [-23.9109176, -46.359972]]}
            >
                <TileLayer
                    url={`https://{s}.basemaps.cartocdn.com/${theme}_all/{z}/{x}/{y}{r}.png`}
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                {children}
                <ZoomControl position="bottomright" />
            </Map>
        </div>
    );
};

export default BusMap;