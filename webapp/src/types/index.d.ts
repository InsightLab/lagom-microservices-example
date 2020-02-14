export type Bus = {
    datetime: string,
    busId: number,
    line: string,
    lat: number,
    lng: number,
    velocity: number,
    accessible: boolean,
    rotationAngle?: number,
    predictedTime?: string
};

export type Stop = {
    stopId: number,
    name: string,
    lat: number,
    lng: number
};

export type SubLine = {
    lineName: string,
    lineCode: number,
    direction: 1 | 2,
    numVehicles: number,
    vehicles?: Bus[]
};

export type BusLine = SubLine & {
    lineName: string,
    terminal1: string,
    terminal2: string,
    subLines: SubLine[],
    destinationLabel1?: string,
    destinationLabel2?: string,
    operationMode?: number,
    signText?: string
};

export type BusDirection = 1 | 2;

export type MessageCallback = (data: Bus[]) => void;