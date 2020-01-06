const axios = require('axios');

const BusesAPI = axios.create({
    baseURL: `http://api.olhovivo.sptrans.com.br/v2.1`,
    withCredentials: true
});

axios.defaults.withCredentials = true;

BusesAPI.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // BusesAPI.defaults.headers.common['Cookie'] = 'apiCredentials=38CBF97EE1DA61F5827A7A0989890FAB6AA0AA19C92592593468FB15121979AABD5FF3EE4CF65AA5AD1D9AC1BC6C1394199A9402723555DE6DF7A3011123C1C5953F5B18;' // response.headers['set-cookie'][0];

            try {
                const response = await BusesAPI.post('/Login/Autenticar', {}, {
                    params: { token: process.env.API_OLHO_VIVO_TOKEN }
                });
            
                const { data: isAuthenticated } = response;
            
                if (isAuthenticated) {
                    BusesAPI.defaults.headers.common['Cookie'] = response.headers['set-cookie'][0];
                }   

                return axios(originalRequest);
            } catch(e) {
                return axios(originalRequest);
            }
        }
    }
);

module.exports = BusesAPI;