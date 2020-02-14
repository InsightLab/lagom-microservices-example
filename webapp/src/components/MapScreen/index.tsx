import React, { FunctionComponent, useEffect, useState, useContext } from 'react';
import { LatLngTuple, LatLngExpression } from 'leaflet';
import { useParams, Switch, Route, Redirect } from "react-router-dom";
import { Bus, Stop, BusLine, BusDirection } from '../../types';
import { useMessageCallback, setBusLineAndDirection } from '../../services/wsBusesStream';
import BusLineMap from '../BusLineMap';
import BusStopsMap from '../BusStopsMap';
import OverlayBorder from '../OverlayBorder';
import SideMenu from '../SideMenu';
import OverlayLoading from '../OverlayLoading';
import BusesService from '../../services/buses';
import mainCtx from '../../contexts/mainCtx';
import "./styles.scss";
import { getLinecodeByDirection } from '../BusLineMap/utils';

interface BusesLinesResponse {
    data: {
        busesLines: BusLine[]
    }
};

interface LocationParams {
    busLine: string,
    busDirection: string
};


const BusLineScreen: FunctionComponent = () => {
    const {
        currentLine, setCurrentLine,
        currentDirection, setCurrentDirection,
    } = useContext(mainCtx);
    const position: LatLngTuple = [51.505, -0.09];
    const [buses, setBuses] = useState<Bus[]>([]);
    const [stops, setStops] = useState<Stop[]>([]);
    const [routePath, setRoutePath] = useState<LatLngExpression[]>([]);
    const { busLine, busDirection } = useParams<LocationParams>();
    
    useEffect(() => {
        if (currentLine && currentDirection) {
            BusesService.getStopsByLineAndDirection(currentLine.lineName, currentDirection)
            .then(({ data }) => {
                setStops(data || []);
            });

            BusesService.getTripByLineAndDirection(currentLine.lineName, currentDirection)
            .then(({ data }) => {
                if (data) {
                    const path = data.shapePath.map((point: { lat: number, lng: number }) => [
                        point.lat, point.lng
                    ]);
                    setRoutePath(path || []);
                }
            });
        }
    }, [currentLine, currentDirection]);

    useEffect(() => {
        if (busLine && busDirection) {
            BusesService.getBusesLines()
            .then(({ data }: BusesLinesResponse) => {
                const busesLines: BusLine[] = data.busesLines || [];
                
                if (busLine) {
                    const currentLine = busesLines.find(bl => bl.lineName === busLine);
                    if (currentLine) {
                        const _busDirection = parseInt(busDirection) as BusDirection;
                        setCurrentLine(currentLine);
                        setCurrentDirection(_busDirection);
                        setBusLineAndDirection(getLinecodeByDirection(currentLine, _busDirection) || 0);
                    }
                }
            });
        }
    }, [busLine, busDirection]);
    useMessageCallback((data: Bus[]) => {
        setBuses(data);
    });

    return (
        <BusLineMap
            buses={buses}
            stops={stops}
            originalCenter={position}
            routePath={routePath}
        />
    );
};

const MapScreen: FunctionComponent = () => {
    const position: LatLngTuple = [51.505, -0.09];
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setTimeout(setLoading, 100, false);
    }, []);

    return (
        <>
            <OverlayBorder />
            <OverlayLoading loading={loading} />
            <div className="app-wrapper">
                <SideMenu />
                <Switch>
                    <Route path="/line/:busLine/:busDirection" component={BusLineScreen} />
                    <Redirect from="/line/:busLine" to='/line/:busLine/1' />
                    <Route path="/">
                        <BusStopsMap originalCenter={position} />
                    </Route>
                    <Redirect from="/line" to='/' />
                </Switch>
            </div>
        </>
    );
};

export default MapScreen;