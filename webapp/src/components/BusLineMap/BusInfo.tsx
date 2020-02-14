import React, { FunctionComponent } from 'react';
import moment from 'moment';
import { Bus } from '../../types/index';

const BusInfo: FunctionComponent<Bus & { target: string }> = props => (
    <table>
        <tbody>
            <tr>
                <th className="bus-info-header">ID do ônibus: </th>
                <td>{props.busId}</td>
            </tr>
            <tr>
                <th className="bus-info-header">Última atualização: </th>
                <td>{moment(props.datetime).fromNow()}</td>
            </tr>
            <tr>
                <th className="bus-info-header">Acessível a cadeirantes: </th>
                <td>{props.accessible ? 'sim' : 'não'}</td>
            </tr>
            <tr>
                <th className="bus-info-header">Destino: </th>
                <td>{props.target}</td>
            </tr>
        </tbody>
    </table>
);

export default BusInfo;