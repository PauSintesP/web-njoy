import api from './api';

/**
 * Get statistics for a specific event
 * @param {number} eventId - Event ID
 * @returns {Promise<Object>} Event statistics
 */
export const getEventStats = async (eventId) => {
    try {
        const response = await api.get(`/evento/${eventId}/estadisticas`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching event stats for event ${eventId}:`, error);
        throw error;
    }
};

/**
 * Verify password to access event statistics
 * @param {number} eventId - Event ID
 * @param {string} password - User password for verification
 * @returns {Promise<Object>} Temporary access token
 */
export const verifyStatsAccess = async (eventId, password) => {
    try {
        const response = await api.post(`/evento/${eventId}/verificar-acceso-estadisticas`, {
            password
        });
        return response.data;
    } catch (error) {
        console.error(`Error verifying stats access for event ${eventId}:`, error);
        throw error;
    }
};

export default {
    getEventStats,
    verifyStatsAccess
};
