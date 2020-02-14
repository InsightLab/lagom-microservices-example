import React, { FunctionComponent, useState } from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import { BusLine, BusDirection } from './types';
import MainCtx from './contexts/mainCtx';
import MapScreen from './components/MapScreen';

const App: FunctionComponent = () => {
  const [currentDirection, setCurrentDirection] = useState<BusDirection>(1);
  const [currentLine, setCurrentLine] = useState<BusLine>();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [stopsVisibility, setStopsVisibility] = useState<boolean>(true);
  const [busesVisibility, setBusesVisibility] = useState<boolean>(true);
  const [circleRadius, setCircleRadius] = useState(500);

  return (
    <MainCtx.Provider
      value={{
        currentDirection, setCurrentDirection,
        currentLine, setCurrentLine,
        menuOpen, setMenuOpen,
        stopsVisibility, setStopsVisibility,
        busesVisibility, setBusesVisibility,
        circleRadius, setCircleRadius
      }}
    >
      <Router>
        <MapScreen />
      </Router>
    </MainCtx.Provider>
  );
}

export default App;
