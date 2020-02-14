import React, { FunctionComponent, useRef, useEffect, useState, useContext } from 'react';
import Draggable, { DraggableProps } from 'react-draggable';
import mainCtx from '../../contexts/mainCtx';
import "./styles.scss";

interface FloaterCardProps extends Partial<DraggableProps> {};

const FloaterCard: FunctionComponent<FloaterCardProps> = ({ handle, children, defaultPosition={ x: 0, y: 0 } }) => {
    const { menuOpen } = useContext(mainCtx);
    const cardRef = useRef<HTMLDivElement>(null);
    const [cardDim, setCardDim] = useState<[number, number]>([0, 0]);
    const [relativePosition, setRelativePosition] = useState<[number, number]>([0, 0]);
    const [position, setPosition] = useState<[number, number]>([0, 0]);
    const [rotation, setRotation] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const menuSize = 400;
    const boundsMargin = [20, 20, 20, 80];

    useEffect(() => {
        if (position[0] < menuSize + boundsMargin[3]) {
            setPosition([menuSize + boundsMargin[3], position[1]]);
        }
    }, [menuOpen]);

    const updateShadow = () => {
        if (cardRef.current) {
            cardRef.current.style.boxShadow = `${relativePosition[0] * 10 - 5}rem ${relativePosition[1] * 5 + 2}rem ${(relativePosition[1]) + 1}rem 0 rgba(0, 0, 0, ${(1 - relativePosition[1]) * 0.05 + 0.1})`;
        }
    };

    useEffect(() => {
        updateShadow();
    }, [relativePosition]);

    useEffect(() => {
        const updateRotation = () => {
            if (cardRef.current) {
                if (isDragging) {
                    cardRef.current.style.transform = `rotateZ(${rotation}deg)`;
                } else {
                    cardRef.current.style.transform = `rotate(0deg)`;
                }
            }
        };
        
        updateRotation();
    }, [rotation, isDragging]);

    useEffect(() => {
        if (cardRef.current) {
            const { width, height } = cardRef.current.getBoundingClientRect();
            setCardDim([width, height]);
        }
        updateShadow();
        setRelativePosition([
            defaultPosition.x / (window.innerWidth - cardDim[0] - boundsMargin[1]),
            defaultPosition.y / (window.innerHeight - cardDim[1] - boundsMargin[2]) 
        ]);
    }, []);

    return (
        <Draggable
            handle={handle}
            defaultPosition={defaultPosition}
            position={{ x: position[0], y: position[1] }}
            onStart={() => { setIsDragging(true); }}
            onStop={() => { setIsDragging(false); }}
            onDrag={(_, data) => {
                setPosition([data.x, data.y]);
                setRotation(data.deltaX * 0.4);
                setRelativePosition([
                    data.x / (window.innerWidth - cardDim[0] - boundsMargin[1]),
                    data.y / (window.innerHeight - cardDim[1] - boundsMargin[2]) 
                ]);
            }}
            bounds={{
                left: boundsMargin[3] + (menuOpen ? menuSize : 0),
                right: window.innerWidth - cardDim[0] - boundsMargin[1],
                top: boundsMargin[0],
                bottom: window.innerHeight - cardDim[1] - boundsMargin[2]
            }}
        >
            <div className="floater-card-wrapper">
                <div ref={cardRef} className="floater-card">
                    <div className="floater-card-body">
                        {children}  
                    </div>
                </div>
            </div>
        </Draggable>
    );
}

export default FloaterCard;