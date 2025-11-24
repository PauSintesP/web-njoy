/**
 * Data mapper utility to convert between API (Spanish) and Frontend (English) field names
 */

/**
 * Maps an event from API format (Spanish) to frontend format (English)
 * @param {Object} apiEvent - Event object from the API
 * @param {Object} locationsMap - Map of location IDs to city names
 * @returns {Object} Event object formatted for the frontend
 */
export const mapEventFromAPI = (apiEvent, locationsMap = {}) => {
    if (!apiEvent) return null;

    const cityName = locationsMap[apiEvent.localidad_id] || 'Unknown Location';

    return {
        id: apiEvent.id,
        title: apiEvent.nombre || '',
        description: apiEvent.descripcion || '',
        date: apiEvent.fechayhora || '',
        location: {
            city: cityName,
            venue: apiEvent.recinto || ''
        },
        price: apiEvent.categoria_precio || 'Free',
        category: apiEvent.tipo || 'Other',
        image: apiEvent.imagen || ''
    };
};

/**
 * Maps multiple events from API to frontend format
 * @param {Array} apiEvents - Array of events from the API
 * @param {Object} locationsMap - Map of location IDs to city names
 * @returns {Array} Array of events formatted for the frontend
 */
export const mapEventsFromAPI = (apiEvents, locationsMap = {}) => {
    if (!Array.isArray(apiEvents)) return [];
    return apiEvents.map(event => mapEventFromAPI(event, locationsMap)).filter(event => event !== null);
};

/**
 * Parses the location field from the API
 * @deprecated Since API v3 uses localidad_id and separate endpoint
 */
const parseLocation = (ubicacion) => {
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
