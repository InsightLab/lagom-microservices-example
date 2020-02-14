import { BusLine, BusDirection } from "../../types";

export function getLinecodeByDirection(busLine: BusLine, direction: BusDirection): number | undefined {
    if (busLine.subLines) {
        if (busLine.subLines[0] && busLine.subLines[0].direction === direction) {
            return busLine.subLines[0].lineCode;
        }
        if (busLine.subLines[1] && busLine.subLines[1].direction === direction) {
            return busLine.subLines[1].lineCode;
        }
    }
}