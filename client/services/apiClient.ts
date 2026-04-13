import axios from 'axios';
import API_CONFIG from '@/config/apiConfig'; 

export const apiClient = axios.create({
	baseURL: API_CONFIG.BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 10000,
	withCredentials: true,
});

apiClient.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('@token');
		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('@token');
            localStorage.removeItem('@user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);