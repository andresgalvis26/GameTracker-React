import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const gamesApi = {
    list: () => api.get('/games'),
    create: (game) => api.post('/games', game),
    update: (id, game) => api.put(`/games/${id}`, game),
    remove: (id) => api.delete(`/games/${id}`)
};

export const authApi = {
    login: (credentials) => api.post('/auth/login', credentials)
};

export default api;
