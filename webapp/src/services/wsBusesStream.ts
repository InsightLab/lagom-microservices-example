import { useEffect } from 'react';
import { Bus, MessageCallback } from "../types/index";

let baseURL = `${window.location.host}/ws`;

if (process.env.REACT_APP_SERVER_HOST) {
    baseURL = `${process.env.REACT_APP_SERVER_HOST}`;
}

let wsBusesStream = new WebSocket(`ws://${baseURL}/`);

function handleMessages(message: MessageEvent) {
    let data: Bus[] = [];

    try {
        data = JSON.parse(message.data);
    } catch (e) {
        console.log('This doesn\'t look like a valid JSON: ',
            message.data);
        return;
    }

    if (data) {
        messageCallbacks.forEach(callback => {
            callback(data);
        });
    }
};

export const setBusLineAndDirection = (busLine: number) => {
    if (busLine) {
        if (wsBusesStream.readyState === 1) {
            wsBusesStream.send(busLine.toString());
        } else {
            wsBusesStream.onopen = () => wsBusesStream.send(busLine.toString());
        }
    }
};

wsBusesStream.onmessage = handleMessages;

// setBusLineAndDirection(pathname.split('/').slice(1)[0], 1);

let messageCallbacks: MessageCallback[] = [];

export const useMessageCallback = (callback: MessageCallback) => {
    useEffect(() => {
        messageCallbacks.push(callback)
    }, []);
};