import api from './api';

/**
 * Admin Service - API calls for admin panel
 */

/**
 * Get all users with optional filters
 */
export const getAllUsers = async (filters = {}) => {
    try {
        const params = new URLSearchParams();

        if (filters.skip !== undefined) params.append('skip', filters.skip);
        if (filters.limit !== undefined) params.append('limit', filters.limit);
        if (filters.role) params.append('role', filters.role);
        if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
        if (filters.is_banned !== undefined) params.append('is_banned', filters.is_banned);
        if (filters.search) params.append('search', filters.search);

        const queryString = params.toString();
        const url = `/admin/users${queryString ? `?${queryString}` : ''}`;

        const response = await api.get(url);
        // Ensure we return an array - handle different response formats
        return Array.isArray(response) ? response : (response.data || response.users || []);
    } catch (error) {
        console.error('Error fetching users:', error);
        return []; // Return empty array instead of throwing
    }
};

/**
 * Get user details by ID
 */
export const getUserById = async (userId) => {
    try {
        const response = await api.get(`/admin/users/${userId}`);
        return response;
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        throw error;
    }
};

/**
 * Create new user (admin)
 */
export const createUser = async (userData) => {
    try {
        const response = await api.post('/admin/users', userData);
        return response;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

/**
 * Update user (admin)
 */
export const updateUser = async (userId, userData) => {
    try {
        const response = await api.put(`/admin/users/${userId}`, userData);
        return response;
    } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        throw error;
    }
};

/**
 * Delete user (admin)
 */
export const deleteUser = async (userId) => {
    try {
        const response = await api.delete(`/admin/users/${userId}`);
        return response;
    } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        throw error;
    }
};

/**
 * Ban user
 */
export const banUser = async (userId) => {
    try {
        const response = await api.post(`/admin/users/${userId}/ban`);
        return response;
    } catch (error) {
        console.error(`Error banning user ${userId}:`, error);
        throw error;
    }
};

/**
 * Unban user
 */
export const unbanUser = async (userId) => {
    try {
        const response = await api.post(`/admin/users/${userId}/unban`);
        return response;
    } catch (error) {
        console.error(`Error unbanning user ${userId}:`, error);
        throw error;
    }
};

/**
 * Promote user to owner role
 */
export const promoteToOwner = async (userId) => {
    try {
        const response = await api.post(`/admin/users/${userId}/promote-owner`);
        return response;
    } catch (error) {
        console.error(`Error promoting user ${userId} to owner:`, error);
        throw error;
    }
};

/**
 * Get user statistics
 */
export const getStatistics = async () => {
    try {
        const response = await api.get('/admin/statistics');
        // Handle different response formats
        return response.data || response;
    } catch (error) {
        console.error('Error fetching statistics:', error);
        return null; // Return null instead of throwing
    }
};

export default {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    banUser,
    unbanUser,
    promoteToOwner,
    getStatistics
};
