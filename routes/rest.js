const express = require('express');
const BusesController = require('../controllers/buses');
const HomeController = require('../controllers/home');

module.exports = app => {
    const APIRouter = new express.Router();

    APIRouter.get('/buses-lines', BusesController.getBusesLines);
    APIRouter.get('/buses-stations/:lineCode', BusesController.getStationsByLineAndDirection);
    APIRouter.get('/buses', BusesController.getAllBuses);

    app.use('/api', APIRouter);
    app.get('/*', HomeController.getHomePage);
};