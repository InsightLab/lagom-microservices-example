import React, { FunctionComponent, useEffect, useState, useContext } from 'react';
import { useParams } from "react-router-dom";
import { Bus, BusLine, BusDirection } from '../../types';
import { useMessageCallback, setBusLineAndDirection } from '../../services/wsBusesStream';
import FloaterCard from '../FloaterCard';
import BusLineSelector from './BusLineSelector';
import BusesService from '../../services/buses';
import mainCtx from '../../contexts/mainCtx';
import { Switch } from 'antd';
import { getLinecodeByDirection } from './utils';
import "./styles.scss";

interface BusesLinesResponse {
    data: BusLine[]
};

interface LocationParams {
    busLine: string,
    busDirection: string
};

const BusLineSettings: FunctionComponent = () => {
    const {
        setCurrentLine,
        setCurrentDirection,
        setStopsVisibility,
        setBusesVisibility,
    } = useContext(mainCtx);
    const [buses, setBuses] = useState<Bus[]>([]);
    const { busLine, busDirection } = useParams<LocationParams>();
    
    useEffect(() => {
        if (busLine && busDirection) {
            BusesService.getBusesLines()
            .then(({ data }: BusesLinesResponse) => {
                const busesLines: BusLine[] = data || [];
                
                if (busLine) {
                    const currentLine = busesLines.find(bl => bl.lineName === busLine);
                    if (currentLine) {
                        const _busDirection = parseInt(busDirection) as BusDirection;
                        const lineCode = getLinecodeByDirection(currentLine, _busDirection);
                        setCurrentLine(currentLine);
                        setCurrentDirection(_busDirection);
                        setBusLineAndDirection(lineCode || 0);
                    }
                }
            });
        }
    }, [busLine, busDirection, setCurrentDirection, setCurrentLine]);

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
                <BusLineSelector value={busLine} />
                <p><strong>{buses.length}</strong> ônibus em trânsito.</p>
                <div>
                    <Switch
                        size='small'
                        defaultChecked
                        onChange={setStopsVisibility}
                    />
                    &nbsp;
                    Mostrar paradas
                </div>
                <div>
                    <Switch
                        size='small'
                        defaultChecked
                        onChange={setBusesVisibility}
                    />
                    &nbsp;
                    Mostrar ônibus
                </div>
            </div>
        </FloaterCard>
    );
};

export default BusLineSettings;