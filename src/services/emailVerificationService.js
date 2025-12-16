import api from './api';

/**
 * Verify email using token from URL
 */
export const verifyEmailToken = async (token) => {
    try {
        const response = await api.get(`/verify-email/${token}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { detail: 'Error al verificar email' };
    }
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (email) => {
    try {
        const response = await api.post('/resend-verification', { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || { detail: 'Error al reenviar email' };
    }
};
