import api from './api';

const TOKEN_KEY = 'njoy_access_token';
const REFRESH_TOKEN_KEY = 'njoy_refresh_token';
const USER_KEY = 'njoy_user';

/**
 * Authentication service for handling login, registration, and token management
 */
class AuthService {
    /**
     * Login user with email and password
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {Promise<Object>} Login response with tokens and user data
     */
    async login(email, password) {
        try {
            const response = await api.post('/login', { email, contrasena: password });

            if (response.data.access_token) {
                this.setTokens(response.data.access_token, response.data.refresh_token);

                // Store user data if provided
                if (response.data.user) {
                    this.setUser(response.data.user);
                }
            }

            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw this.handleAuthError(error);
        }
    }

    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} Registration response
     */
    async register(userData) {
        try {
            const response = await api.post('/register', userData);
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            throw this.handleAuthError(error);
        }
    }

    /**
     * Logout the current user
     */
    logout() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }

    /**
     * Refresh the access token using refresh token
     * @returns {Promise<string>} New access token
     */
    async refreshToken() {
        try {
            const refreshToken = this.getRefreshToken();

            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await api.post('/token/refresh', {
                refresh_token: refreshToken
            });

            if (response.data.access_token) {
                this.setToken(response.data.access_token);
                return response.data.access_token;
            }

            throw new Error('No access token in response');
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout(); // Clear invalid tokens
            throw error;
        }
    }

    /**
     * Get the current access token
     * @returns {string|null} Access token or null if not found
     */
    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }

    /**
     * Get the current refresh token
     * @returns {string|null} Refresh token or null if not found
     */
    getRefreshToken() {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }

    /**
     * Set access token
     * @param {string} token - Access token to store
     */
    setToken(token) {
        localStorage.setItem(TOKEN_KEY, token);
    }

    /**
     * Set both access and refresh tokens
     * @param {string} accessToken - Access token
     * @param {string} refreshToken - Refresh token
     */
    setTokens(accessToken, refreshToken) {
        localStorage.setItem(TOKEN_KEY, accessToken);
        if (refreshToken) {
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
    }

    /**
     * Get current user data
     * @returns {Object|null} User object or null
     */
    getUser() {
        const userStr = localStorage.getItem(USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Set current user data
     * @param {Object} user - User object to store
     */
    setUser(user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} True if user has a valid token
     */
    isAuthenticated() {
        return !!this.getToken();
    }

    /**
     * Handle authentication errors and provide user-friendly messages
     * @param {Error} error - The error object
     * @returns {Error} Processed error with user-friendly message
     */
    handleAuthError(error) {
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.detail || error.response.data?.message;

            switch (status) {
                case 401:
                    return new Error(message || 'Usuario o contraseña incorrectos');
                case 400:
                    return new Error(message || 'Datos inválidos. Por favor, verifica tu información');
                case 409:
                    return new Error(message || 'Este email ya está registrado');
                case 500:
                    return new Error('Error del servidor. Por favor, intenta más tarde');
                default:
                    return new Error(message || 'Error de autenticación');
            }
        }

        if (error.request) {
            return new Error('No se pudo conectar con el servidor. Verifica tu conexión');
        }

        return new Error(error.message || 'Error desconocido');
    }
}

export default new AuthService();
