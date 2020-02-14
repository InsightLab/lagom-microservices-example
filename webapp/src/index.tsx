import React from 'react';
import ReactDOM from 'react-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';
import './index.scss';
import App from './App';
import "antd/dist/antd.css";
import 'leaflet-routing-machine';
import 'moment/locale/pt-br';

import { unregister } from './serviceWorker';

library.add(fab, fas);

moment.locale('pt-BR');

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
unregister();