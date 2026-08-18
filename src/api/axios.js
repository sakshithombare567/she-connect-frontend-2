
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token in headers
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // Prevent infinite loops on /auth/refresh-token itself
        if (originalRequest.url === '/auth/refresh-token') {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = sessionStorage.getItem('refresh_token');
                if (!refreshToken) {
                    throw new Error("No refresh token available");
                }
                
                // Do a raw axios call to avoid interceptor loops
                const res = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
                    {},
                    { headers: { Authorization: `Bearer ${refreshToken}` } }
                );

                if (res.status === 200) {
                    sessionStorage.setItem('token', res.data.access_token);
                    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
                    originalRequest.headers['Authorization'] = `Bearer ${res.data.access_token}`;
                    return api(originalRequest);
                }
            } catch (err) {
                console.error("Refresh token failed", err);
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('refresh_token');
                // Force logout redirect could be added here
                window.location.href = '/login';
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
