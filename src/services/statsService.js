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

export default {
    getEventStats
};
