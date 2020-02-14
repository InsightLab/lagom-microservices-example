import axios from 'axios';

const busesApi = axios.create({
    baseURL: `http://${process.env.REACT_APP_SERVER_HOST}/api/sp`
});

export default busesApi; 