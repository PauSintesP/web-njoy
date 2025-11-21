/**
 * Data mapper utility to convert between API (Spanish) and Frontend (English) field names
 */

/**
 * Maps an event from API format (Spanish) to frontend format (English)
 * @param {Object} apiEvent - Event object from the API
 * @returns {Object} Event object formatted for the frontend
 */
export const mapEventFromAPI = (apiEvent) => {
    if (!apiEvent) return null;

    return {
        id: apiEvent.id,
        title: apiEvent.nombre || '',
        description: apiEvent.descripcion || '',
        date: apiEvent.fecha || '',
        location: parseLocation(apiEvent.ubicacion),
        price: apiEvent.precio || 0,
        category: apiEvent.categoria || 'Other',
        image: apiEvent.imagen_url || ''
    };
};

/**
 * Maps multiple events from API to frontend format
 * @param {Array} apiEvents - Array of events from the API
 * @returns {Array} Array of events formatted for the frontend
 */
export const mapEventsFromAPI = (apiEvents) => {
    if (!Array.isArray(apiEvents)) return [];
    return apiEvents.map(mapEventFromAPI).filter(event => event !== null);
};

/**
 * Parses the location field from the API
 * Handles both string format ("Barcelona") and object format ({ciudad: "Barcelona", venue: "Venue"})
 * @param {String|Object} ubicacion - Location data from API
 * @returns {Object} Location object with city and venue
 */
const parseLocation = (ubicacion) => {
    // If it's already an object with ciudad and venue
    if (typeof ubicacion === 'object' && ubicacion !== null) {
        return {
            city: ubicacion.ciudad || ubicacion.city || '',
            venue: ubicacion.venue || ubicacion.lugar || ''
        };
    }

    // If it's a string, try to parse it
    if (typeof ubicacion === 'string') {
        // Check if it contains a delimiter like " - " or ","
        if (ubicacion.includes(' - ')) {
            const [venue, city] = ubicacion.split(' - ');
            return { city: city.trim(), venue: venue.trim() };
        } else if (ubicacion.includes(',')) {
            const [venue, city] = ubicacion.split(',');
            return { city: city.trim(), venue: venue.trim() };
        }
        // Otherwise, assume it's just the city
        return { city: ubicacion, venue: '' };
    }

    // Fallback
    return { city: '', venue: '' };
};

/**
 * Maps user data from API format to frontend format
 * @param {Object} apiUser - User object from the API
 * @returns {Object} User object formatted for the frontend
 */
export const mapUserFromAPI = (apiUser) => {
    if (!apiUser) return null;

    return {
        id: apiUser.id,
        email: apiUser.email || '',
        firstName: apiUser.nombre || '',
        lastName: apiUser.apellidos || '',
        dateOfBirth: apiUser.fecha_nacimiento || '',
        country: apiUser.pais || ''
    };
};

/**
 * Maps user data from frontend format to API format for registration
 * @param {Object} userData - User data from frontend form
 * @returns {Object} User object formatted for API
 */
export const mapUserToAPI = (userData) => {
    return {
        email: userData.email,
        password: userData.password,
        nombre: userData.firstName || userData.nombre,
        apellidos: userData.lastName || userData.apellidos,
        fecha_nacimiento: userData.dateOfBirth || userData.fecha_nacimiento,
        pais: userData.country || userData.pais
    };
};
