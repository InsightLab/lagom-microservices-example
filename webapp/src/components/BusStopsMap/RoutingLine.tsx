import React, { FunctionComponent, useEffect, useState } from 'react'
import L, { LatLng } from 'leaflet';
import { useLeaflet } from 'react-leaflet';
import "./styles.scss";

interface RoutingLineProps extends Partial<L.Routing.RoutingControlOptions> {
    waypoints: L.Routing.Waypoint[]
}

const RoutingLine: FunctionComponent<RoutingLineProps> = ({ waypoints }) => {
    const { map } = useLeaflet();
    const [route, setRoute] = useState<L.Routing.IRoute>();
    const [routeLine, setRouteLine] = useState<L.Routing.Line>();

    let router: L.Routing.IRouter = L.Routing.osrmv1({
        profile: 'driving'
    });

    const getCurrentRoute = (waypoints: L.Routing.Waypoint[]): Promise<L.Routing.IRoute> => {
        return new Promise((resolve, reject) => {
            if (map && waypoints.length) {
                router.route(waypoints, function () {                
                    const [error, routes] = [arguments[0], arguments[1]];

                    if (error) {
                        return reject(error);
                    }
                    
                    if (routes[0]) {
                        return resolve(routes[0]);
                    }
                
                    reject(new Error('An error occurred in fetch route data.'));
                });
            }
        })
    };

    const renderRountingLine = (route: L.Routing.IRoute) => {
        if (map) {
            if (routeLine) {
                routeLine.removeFrom(map);
            }

            const line =  L.Routing.line(route, {
                styles: [{
                    color: 'black',
                    opacity: 0.3,
                    weight: 4
                }]
            });
    
            line.addTo(map);
            setRouteLine(line);
        }
    };

    useEffect(() => {
        if (route) {
            renderRountingLine(route);
        }
    }, [route]);
    
    useEffect(() => {
        async function fetchRoute() {
            try {
                const currentRoute: L.Routing.IRoute = await getCurrentRoute(waypoints);

                if (currentRoute) {
                    let changed = true;
        
                    if (route && route.waypoints && currentRoute.waypoints) {
                        changed = route.waypoints.length !== currentRoute.waypoints.length ||
                        route.waypoints.some((waypoint: LatLng, i: number) => {
                            return currentRoute.waypoints && (
                                    currentRoute.waypoints[i].lat !== waypoint.lat ||
                                    currentRoute.waypoints[i].lng !== waypoint.lng);
                        });
                    }
        
                    if (changed) {
                        setRoute(currentRoute);
                    }
                }
            } catch (err) {
                console.log(err);
            }
        }

        fetchRoute();
    }, [waypoints]);

    return <></>;
};

export default RoutingLine;