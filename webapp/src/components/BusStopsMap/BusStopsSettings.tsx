import React, { FunctionComponent, useState, useContext } from 'react';
import { Slider, Icon } from 'antd';
import { Bus } from '../../types';
import { useMessageCallback, } from '../../services/wsBusesStream';
import FloaterCard from '../FloaterCard';
import mainCtx from '../../contexts/mainCtx';
import "./styles.scss";


const BusStopsSettings: FunctionComponent = () => {
    const {
        circleRadius, setCircleRadius
    } = useContext(mainCtx);
    const [buses, setBuses] = useState<Bus[]>([]);

    useMessageCallback((data: Bus[]) => {
        setBuses(data);
    });

    return (
        <FloaterCard
            handle=".handle"
            defaultPosition={{
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            }}
        >
            <div className="main-floater-card">
                <div className="handle">
                    <h2>Linha atual</h2>
                </div>
                <p><strong>{buses.length}</strong> ônibus em trânsito.</p>
                <div className="circle-radius-slider-wrapper">
                    <Icon
                        style={{ color: '#999', fontSize: '0.8rem' }}
                        type="minus-circle"
                    />
                    <Slider
                        min={500}
                        step={250}
                        max={2000}
                        value={circleRadius}
                        onChange={value => setCircleRadius(value as number)}
                        marks={{
                            500: '500m',
                            1000: '1km',
                            2000: '2km'
                        }}
                    />
                    <Icon
                        style={{ color: '#999', fontSize: '1rem' }}
                        type="plus-circle"
                    />
                </div>
            </div>
        </FloaterCard>
    );
};

export default BusStopsSettings;