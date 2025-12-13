// API functions for event management

import api from './api';
import { mapEventsFromAPI, mapEventFromAPI } from '../utils/dataMapper';

/**
 * Get events created by current user (promotor/admin)
 * @returns {Promise<Array>} Array of user's events
 */
export const getMyEvents = async () => {
    try {
        const [eventsResponse, locationsResponse] = await Promise.all([
            api.get('/eventos/mis-eventos'),
            api.get('/localidad/')
        ]);

        const locationsMap = {};
        if (Array.isArray(locationsResponse.data)) {
            locationsResponse.data.forEach(loc => {
                locationsMap[loc.id] = loc.ciudad;
            });
        }

        return mapEventsFromAPI(eventsResponse.data, locationsMap);
    } catch (error) {
        console.error("Error fetching my events:", error);
        throw error;
    }
};

/**
 * Update an existing event
 * @param {number} eventId - Event ID
 * @param {Object} eventData - Updated event data
 * @returns {Promise<Object>} Updated event
 */
export const updateEvent = async (eventId, eventData) => {
    try {
        const response = await api.put(`/evento/${eventId}`, eventData);
        return response.data;
    } catch (error) {
        console.error("Error updating event:", error);
        throw error;
    }
};

/**
 * Delete an event
 * @param {number} eventId - Event ID
 * @returns {Promise<Object>} Success response
 */
export const deleteEvent = async (eventId) => {
    try {
        const response = await api.delete(`/evento/${eventId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting event:", error);
        throw error;
    }
};

export default {
    getMyEvents,
    updateEvent,
    deleteEvent
};
