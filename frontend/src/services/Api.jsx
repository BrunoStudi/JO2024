import axios from 'axios';

// Pour AuthService (login, register)
export const APIAuth = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  withCredentials: true,
});

// Pour UserService (profil)
export const APIUser = axios.create({
  baseURL: "http://127.0.0.1:8001/api",
  withCredentials: true,
});

// Pour TicketService (offre)
export const TicketAuth = axios.create({
  baseURL: "http://127.0.0.1:8002/api",
  withCredentials: true,
});

// Ajouter le token JWT à toutes les requêtes TicketService
TicketAuth.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Ajouter le token JWT à toutes les requêtes AuthService
APIAuth.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Ajouter le token JWT à toutes les requêtes UserService
APIUser.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});