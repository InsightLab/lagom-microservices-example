import React, { FunctionComponent } from 'react'
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { scaleLinear } from 'd3-scale';
import { Table, Tabs, Tooltip, Button } from 'antd';
import { useHistory } from 'react-router';
import StopIcon from '../../assets/stop-icon.png';
import BusIcon from '../../assets/onibus-icon-rounded.png';
import { BusLine, Bus, BusDirection, Stop } from '../../types';
import "./styles.scss";

const { TabPane } = Tabs;

interface PrevisionPanelProps {
    previsions: BusLine[],
    stop: Stop
};

const remainingTimeColor = scaleLinear<string>()
    .domain([0, 3, 6, 100])
    .range(['#e74c3c', '#e67e22', '#2ecc71', '#16a085']);


const panelHeight = 350;
const panelHeaderHeight = 50;

const PrevisionPanel: FunctionComponent<PrevisionPanelProps> = ({ previsions, stop }) => {
    const history = useHistory();
    const date = new Date();

    function getBusRemainingTime(bus: Bus) {
        const [predictedHour, predictedMinutes] = (bus.predictedTime || '00:00').split(':');
        const busTime = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            parseInt(predictedHour),
            parseInt(predictedMinutes)
        );
        const dateDiff = moment(busTime).diff(date);
        const duration = moment.duration(dateDiff); 
        const remainingTime = duration.hours() * 60 + duration.minutes();
        let finalText = remainingTime === 0 ? 'Agora' : remainingTime + ' min';

        if (remainingTime === 2 || remainingTime === 1) {
            finalText = 'Aprox.'
        };

        return {
            remainingTime,
            finalText
        };
    }

    const columns = [{
        title: '',
        dataIndex: 'icon',
        key: 'icon',
        width: 50,
        render: () => (
            <img
                src={BusIcon}
                alt="Ícone de ônibus"
                width={30}
                style={{
                    transform: 'rotate(-90deg)'
                }}
            />
        )
    }, {
        title: 'Horário',
        dataIndex: 'hour',
        key: 'hour',
        width: 60
    },{
        title: 'Restante',
        dataIndex: 'remaining',
        key: 'remaining',
        render: ({ finalText, remainingTime }: { finalText: string, remainingTime: number }) => {
            return (
                <div style={{ textAlign: 'center' }}>
                    <span
                        className="prevision-time-badge"
                        style={{
                            background: remainingTimeColor(remainingTime)
                        }}
                    >
                        {finalText}
                    </span>
                </div>
            );
        }
    }, {
        title: 'Rota',
        dataIndex: 'route',
        key: 'route',
        width: 50,
        render: ({ lineName, direction }: { lineName: string, direction: BusDirection }) => (
            <Tooltip autoAdjustOverflow={true} placement='right' title='Ver trajeto'>
                <Button
                    shape="circle"
                    onClick={() => {
                        history.push(`/line/${lineName}/${direction}`);
                    }}
                >
                    <FontAwesomeIcon icon="map-marked-alt" />
                </Button>
            </Tooltip>
        )
    }];

    return (
        <div
            style={{ maxHeight: panelHeight }}
            className="stop-previsions-panel"
        >
            <div
                style={{ height: panelHeaderHeight }}
                className="stop-previsions-panel-header"
            >
                <img
                    src={StopIcon}
                    alt="ícone parada de ônibus"
                />
                <h2>Parada <strong>{stop.name}</strong></h2>
            </div>
            <Tabs
                size='small'
                style={{ height: panelHeight - panelHeaderHeight }}
                tabPosition={'left'}
                animated={true}
            >
                {previsions.map(busLine => (
                    <TabPane
                        key={busLine.lineName}
                        tab={
                            <Tooltip
                                key={busLine.lineCode}
                                autoAdjustOverflow={true}
                                placement={'left'}
                                title={busLine.terminal2}
                            >
                                <span>{busLine.lineName}</span>
                            </Tooltip>
                        }
                    >
                        <div className="stop-previsions-buses">
                            <div style={{ height: 90 }}>
                                <h3 className="stop-previsions-bounds">
                                    <span className="stop-previsions-bound">{busLine.terminal1}</span> <br/>
                                    <span className="stop-previsions-bound">{busLine.terminal2}</span>
                                </h3>
                            </div>
                            <div>
                                <Table
                                    showHeader={false}
                                    pagination={false}
                                    bordered={false}
                                    scroll={{ y: panelHeight - panelHeaderHeight - 90 }}
                                    columns={columns}
                                    size='small'
                                    dataSource={(busLine.vehicles || []).map(bus => ({
                                        key: bus.busId,
                                        hour: bus.predictedTime || 'indisponível',
                                        remaining: getBusRemainingTime(bus),
                                        route: {
                                            lineName: busLine.lineName,
                                            direction: busLine.direction
                                        }
                                    }))}
                                />
                            </div>
                        </div>
                    </TabPane>
                ))}
            </Tabs>
        </div>
    );
};

export default PrevisionPanel;