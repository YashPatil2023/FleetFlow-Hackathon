import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Attach JWT token to every request
API.interceptors.request.use(config => {
    const token = localStorage.getItem('ff_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auto logout on 401
API.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401) {
            localStorage.removeItem('ff_token');
            localStorage.removeItem('ff_user');
            window.location.href = '/';
        }
        return Promise.reject(err);
    }
);

export default API;
