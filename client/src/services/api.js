import axios from 'axios';

// No fijamos Content-Type: axios infiere JSON para objetos y multipart/form-data
// para FormData (y el navegador añade el boundary correctamente).
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const gamesApi = {
    list: () => api.get('/games'),
    covers: () => api.get('/games/covers'),
    create: (game) => api.post('/games', game),
    update: (id, game) => api.put(`/games/${id}`, game),
    remove: (id) => api.delete(`/games/${id}`),
    uploadImage: (id, file) => {
        const data = new FormData();
        data.append('file', file);
        return api.post(`/games/${id}/image`, data);
    },
    removeImage: (id) => api.delete(`/games/${id}/image`)
};

export const authApi = {
    login: (credentials) => api.post('/auth/login', credentials)
};

export default api;
