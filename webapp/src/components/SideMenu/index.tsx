import React, { FunctionComponent, useContext } from 'react';
import cx from 'classnames';
import mainCtx from '../../contexts/mainCtx';
import InsightLogo from '../../assets/logo-insight.png';
import "./styles.scss";

const SideMenu: FunctionComponent = props => {
    const { menuOpen, setMenuOpen } = useContext(mainCtx);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <div className={cx("side-menu-container", {
            open: menuOpen
        })}>
            <div onClick={toggleMenu} className="menu-icon">
                <span className="menu-icon-line" />
                <span className="menu-icon-line" />
                <span className="menu-icon-line" />
            </div>
            <div className="side-menu-body">
                
            </div>
            <div className="side-menu-footer">
                <img src={InsightLogo} alt='Logotipo do Insight Data Science Lab' />
            </div>
        </div>
    );
};

export default SideMenu;