import React from 'react';
import '../index.css';

/**
 * StatCard component - displays a single statistic with icon and value
 * @param {string} title - Card title
 * @param {string|number} value - Main value to display
 * @param {string} icon - Icon emoji or symbol
 * @param {string} color - Color theme (primary, success, warning, info)
 * @param {string} subtitle - Optional subtitle text
 */
const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => {
    const colorClasses = {
        primary: 'stat-card-primary',
        success: 'stat-card-success',
        warning: 'stat-card-warning',
        info: 'stat-card-info',
        danger: 'stat-card-danger'
    };

    return (
        <div className={`stat-card ${colorClasses[color]}`}>
            <div className="stat-card-icon">{icon}</div>
            <div className="stat-card-content">
                <h3 className="stat-card-title">{title}</h3>
                <p className="stat-card-value">{value}</p>
                {subtitle && <p className="stat-card-subtitle">{subtitle}</p>}
            </div>
        </div>
    );
};

export default StatCard;
