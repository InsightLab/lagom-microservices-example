import axios from 'axios';

const busesApi = axios.create({
    baseURL: `/api/sp`
});

export default busesApi; 