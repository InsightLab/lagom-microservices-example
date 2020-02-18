require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const http = require('http');
const WebSocketServer = require('websocket').server;
const app = express();
const { broadcastBusesData, fetchAllData } = require('./services/buses');
const setRestRoutes = require('./routes/rest');
const setWsRoutes = require('./routes/ws');
const server = http.createServer(app);
const wsServer = new WebSocketServer({
    httpServer: server
});
const JOB_TIMEOUT = 20000; // 20 sec

app.use((_, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

app.use(cookieParser());

setRestRoutes(app);
setWsRoutes(wsServer);

server.listen(process.env.PORT || 5000, async () => {
    setInterval(broadcastBusesData, JOB_TIMEOUT);
    await broadcastBusesData();

    setInterval(fetchAllData, JOB_TIMEOUT);
    await fetchAllData();

    console.log('Application running...');
});
