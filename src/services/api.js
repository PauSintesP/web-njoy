import axios from 'axios';
import { mapEventsFromAPI, mapEventFromAPI } from '../utils/dataMapper';

// URL base de la API
const API_URL = 'https://projecte-n-obijiuwkl-pausintesps-projects.vercel.app';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('njoy_access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('njoy_refresh_token');

                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/token/refresh`, {
                        refresh_token: refreshToken,
                    });

                    const { access_token } = response.data;
                    localStorage.setItem('njoy_access_token', access_token);

                    // Retry the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                localStorage.removeItem('njoy_access_token');
                localStorage.removeItem('njoy_refresh_token');
                localStorage.removeItem('njoy_user');
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

/**
 * Get all events from the API
 * @param {Object} params - Optional query parameters (e.g., ciudad, categoria)
 * @returns {Promise<Array>} Array of events in frontend format
 */
export const getEvents = async (params = {}) => {
    try {
        const response = await api.get('/evento/', { params });
        // Map Spanish field names to English for frontend
        return mapEventsFromAPI(response.data);
    } catch (error) {
        console.error("Error fetching events:", error);
        throw error;
    }
};

/**
 * Get a single event by ID
 * @param {number} eventId - The event ID
 * @returns {Promise<Object>} Event object in frontend format
 */
export const getEventById = async (eventId) => {
    try {
        const response = await api.get(`/evento/${eventId}`);
        return mapEventFromAPI(response.data);
    } catch (error) {
        console.error(`Error fetching event ${eventId}:`, error);
        throw error;
    }
};

/**
 * Get current user information
 * @returns {Promise<Object>} User object
 */
export const getCurrentUser = async () => {
    try {
        const response = await api.get('/usuario/');
        return response.data;
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
};

export default api;
