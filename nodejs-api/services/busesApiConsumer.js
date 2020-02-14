const axios = require('axios');

const BusesAPIConsumer = axios.create({
    baseURL: `http://api.olhovivo.sptrans.com.br/v2.1`,
    withCredentials: true
});

axios.defaults.withCredentials = true;

BusesAPIConsumer.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // BusesAPIConsumer.defaults.headers.common['Cookie'] = 'apiCredentials=3113927B596D6F763D8692E4BFEE28130C156D383B676F4F5107A563E2C484DF913A3FD652EC6BED3FC90A3C16D35869054034ECF2CFA1A0AC3D60DC4B50E537147630CF;' // response.headers['set-cookie'][0];

            try {
                const response = await BusesAPIConsumer.post('/Login/Autenticar', {}, {
                    params: { token: process.env.API_OLHO_VIVO_TOKEN }
                });
            
                const { data: isAuthenticated } = response;
            
                if (isAuthenticated) {
                    BusesAPIConsumer.defaults.headers.common['Cookie'] = response.headers['set-cookie'][0];
                }   

                return axios(originalRequest);
            } catch {
                return axios(originalRequest);
            }
        }
    }
);

module.exports = BusesAPIConsumer;