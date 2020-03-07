import axios from 'axios';

let baseURL = `/api/sp`;

if (process.env.REACT_APP_SERVER_HOST) {
    baseURL = `http://${process.env.REACT_APP_SERVER_HOST}${baseURL}`;
}

const busesApi = axios.create({
    baseURL
});

export default busesApi; 