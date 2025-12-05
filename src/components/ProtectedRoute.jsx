import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute component - protects routes based on user authentication and role
 * @param {object} user - Current user object
 * @param {string} requiredRole - Required role to access this route (optional)
 * @param {React.ReactNode} children - Child components to render if authorized
 */
const ProtectedRoute = ({ user, requiredRole, children }) => {
    // Check if user is logged in
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Check if specific role is required and user has it
    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    // User is authorized, render children
    return children;
};

export default ProtectedRoute;
