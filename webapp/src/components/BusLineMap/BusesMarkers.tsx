import React, { FunctionComponent, useContext } from 'react'
import { Icon, icon, DivIcon, LatLngExpression } from 'leaflet';
import "leaflet-rotatedmarker";
import { Drift_Marker } from 'leaflet-drift-marker';
import {
    MapLayerProps,
    MapLayer,
    withLeaflet,
    Popup,
    LeafletProvider,
    Tooltip
} from 'react-leaflet';
import BusInfo from './BusInfo';
import BusIcon from '../../assets/onibus-icon-rounded.png';
import AccessibleIcon from '../../assets/accessible-icon.png';
import { Bus } from '../../types';
import mainCtx from '../../contexts/mainCtx';
import "./styles.scss";

const busIconSize: [number, number] = [51.5 * 1.1, 24 * 1.1];
const busIcon: Icon = icon({
    iconUrl: BusIcon,
    iconSize: busIconSize,
    popupAnchor:  [-3, -10]
});

type Props = {
    icon?: Icon | DivIcon,
    draggable?: boolean,
    opacity?: number,
    position: LatLngExpression,
    duration: number,
    keepAtCenter?: boolean,
    zIndexOffset?: number,
    rotationAngle?: number,
    rotationOrigin?: string
} & MapLayerProps
  
const LeafletBusMarker = withLeaflet<Props>(
class extends MapLayer<Props, Drift_Marker> {
    createLeafletElement(props: Props): Drift_Marker {
        const el = new Drift_Marker(props.position, this.getOptions(props))
        this.contextValue = { ...props.leaflet, popupContainer: el }
        return el;
    }
    
    updateLeafletElement(fromProps: Props, toProps: Props) {
        if (toProps.rotationAngle !== fromProps.rotationAngle && typeof toProps.rotationAngle == 'number') {
            this.leafletElement.setRotationAngle(toProps.rotationAngle);
        }
    
        if (toProps.position !== fromProps.position && typeof toProps.duration == 'number') {
            this.leafletElement.slideTo(toProps.position, {
                duration: toProps.duration,
                keepAtCenter: toProps.keepAtCenter
            });
        }

        if (toProps.icon !== fromProps.icon && toProps.icon) {
            this.leafletElement.setIcon(toProps.icon);
        }

        if (toProps.zIndexOffset !== fromProps.zIndexOffset && toProps.zIndexOffset !== undefined) {
            this.leafletElement.setZIndexOffset(toProps.zIndexOffset);
        }

        if (toProps.opacity !== fromProps.opacity && toProps.opacity !== undefined) {
            this.leafletElement.setOpacity(toProps.opacity);
        }

        if (toProps.draggable !== fromProps.draggable && this.leafletElement.dragging !== undefined) {
            if (toProps.draggable === true) {
                this.leafletElement.dragging.enable();
            } else {
                this.leafletElement.dragging.disable();
            }
        }
    }
      
    render() {
        const { children } = this.props
    
        return children == null || this.contextValue == null ? null : (
            <LeafletProvider value={this.contextValue}>
                {children}
            </LeafletProvider>
        );
    }
});

interface BusesMarkersProps {
    buses: Bus[],
    visible: boolean
};

const BusesMarkers: FunctionComponent<BusesMarkersProps> = ({ buses, visible }) => {
    const { currentLine } = useContext(mainCtx);

    return ( visible ? 
        <>
            {buses.map(bus => (
                <LeafletBusMarker
                    key={bus.busId}
                    position={[bus.lat, bus.lng]}
                    duration={1000}
                    rotationAngle={bus.rotationAngle}
                    rotationOrigin='center'
                    icon={busIcon}
                >   
                    {bus.accessible && (
                        <Tooltip className="buses-map-accessibility-tooltip" permanent={true} direction='top' offset={[0, -10]}>
                            <img alt="Ícone de acessibilidade" src={AccessibleIcon} width={15} height={15} />
                        </Tooltip>
                    )}
                    <Popup className="buses-map-bus-popup">
                        <BusInfo {...bus} target={currentLine ? currentLine.terminal2 : ''} />
                    </Popup>
                </LeafletBusMarker>
            ))}
        </> : <></>
    );
};

export default BusesMarkers;