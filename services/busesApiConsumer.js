const axios = require('axios');

const BusesAPIConsumer = axios.create({
    baseURL: `http://olhovivo.sptrans.com.br/data`,
    withCredentials: true
});

axios.defaults.withCredentials = true;

BusesAPIConsumer.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            BusesAPIConsumer.defaults.headers.common['Cookie'] = 'apiCredentials=10930E9D904938310BA8D20EAE26F38827EC47538859F08EE5D3C383C788A5B0CFEBDF7C22519E1F4C8913259F2678FB4EE278C8180F50F90707D27DAAD316E096DF7ACB;' // response.headers['set-cookie'][0];

            // try {
            //     const response = await BusesAPIConsumer.post('/Login/Autenticar', {}, {
            //         params: { token: process.env.API_OLHO_VIVO_TOKEN }
            //     });
            
            //     const { data: isAuthenticated } = response;
            
            //     if (isAuthenticated) {
            //         BusesAPIConsumer.defaults.headers.common['Cookie'] = response.headers['set-cookie'][0];
            //     }   

            //     return axios(originalRequest);
            // } catch(e) {
            //     return axios(originalRequest);
            // }
        }
    }
);

module.exports = BusesAPIConsumer;