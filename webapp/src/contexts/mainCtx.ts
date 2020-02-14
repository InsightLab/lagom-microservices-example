import React from 'react';
import { BusLine, BusDirection } from '../types';

interface MainContext {
    currentLine: BusLine | undefined;
    setCurrentLine: (busLine: BusLine) => void;
    currentDirection: BusDirection | undefined;
    setCurrentDirection: (busDirection: BusDirection) => void;
    menuOpen: boolean;
    setMenuOpen: (menuOpen: boolean) => void;
    stopsVisibility: boolean;
    setStopsVisibility: (stopsVisible: boolean) => void;
    busesVisibility: boolean;
    setBusesVisibility: (busesVisible: boolean) => void;
    circleRadius: number;
    setCircleRadius: (radius: number) => void;
};

export default React.createContext<MainContext>({
    currentLine: undefined,
    setCurrentLine: () => {},
    currentDirection: undefined,
    setCurrentDirection: () => {},
    menuOpen: false,
    setMenuOpen: () => {},
    stopsVisibility: true,
    setStopsVisibility: () => {},
    circleRadius: 500,
    setCircleRadius: () => {},
    busesVisibility: true,
    setBusesVisibility: () => {}
});