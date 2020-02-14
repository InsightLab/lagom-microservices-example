import React, { FunctionComponent } from 'react';
import "./styles.scss";

const OverlayBorder: FunctionComponent = props => (
    <>
        <div className="map-border map-border-top" />
        <div className="map-border map-border-right" />
        <div className="map-border map-border-bottom" />
        <div className="map-border map-border-left" />
    </>
);

export default OverlayBorder;