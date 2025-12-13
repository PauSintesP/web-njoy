import api from './api';

/**
 * Ticket Service - API calls for ticket purchase and management
 */

/**
 * Purchase tickets for an event
 * @param {number} eventoId - Event ID
 * @param {number} cantidad - Number of tickets to purchase
 * @returns {Promise} Purchase confirmation with ticket IDs
 */
export const purchaseTickets = async (eventoId, cantidad = 1) => {
    try {
        const response = await api.post('/tickets/purchase', null, {
            params: { evento_id: eventoId, cantidad }
        });
        return response;
    } catch (error) {
        console.error('Error purchasing tickets:', error);
        throw error;
    }
};

/**
 * Get all tickets for the current user
 * @returns {Promise<Array>} List of user tickets with event information
 */
export const getMyTickets = async () => {
    try {
        const response = await api.get('/tickets/my-tickets');
        return Array.isArray(response) ? response : (response.data || []);
    } catch (error) {
        console.error('Error fetching my tickets:', error);
        return [];
    }
};

/**
 * Get details of a specific ticket
 * @param {number} ticketId - Ticket ID
 * @returns {Promise} Ticket details with event and user information
 */
export const getTicketDetail = async (ticketId) => {
    try {
        const response = await api.get(`/tickets/${ticketId}`);
        return response;
    } catch (error) {
        console.error(`Error fetching ticket ${ticketId}:`, error);
        throw error;
    }
};

export default {
    purchaseTickets,
    getMyTickets,
    getTicketDetail
};
