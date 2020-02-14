import React, { FunctionComponent, useEffect, useState, useRef } from 'react';
import cx from 'classnames';
import "./styles.scss";

interface OverlayLoadingProps {
    loading: boolean
};

const OverlayLoading: FunctionComponent<OverlayLoadingProps> = ({ loading }) => {
    const [hidden, setHidden] = useState<boolean>(false);
    const hideTimeout = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (hideTimeout.current) {
            clearTimeout(hideTimeout.current);
        }

        hideTimeout.current = setTimeout(() => setHidden(!loading), 400);
    }, [loading]);

    return (
        <div
            hidden={hidden}
            className={cx("overlay-loading", {
                loaded: !loading
            })}
        />
    );
};

export default OverlayLoading;