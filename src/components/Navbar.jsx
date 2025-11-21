import React from 'react';
import './Navbar.css';

const Navbar = ({ onLoginClick, location, setLocation, user, onLogout }) => {
    return (
        <nav className="navbar glass">
            <div className="container navbar-content">
                <div className="logo">
                    <span className="logo-n">n</span>joy
                </div>

                <div className="nav-actions">
                    <div className="location-selector">
                        <i className="fa-solid fa-location-dot"></i>
                        <select
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="location-select"
                        >
                            <option value="Barcelona">Barcelona</option>
                            <option value="Bilbao">Bilbao</option>
                        </select>
                    </div>

                    {user ? (
                        <div className="user-menu">
                            <span className="user-greeting">
                                <i className="fa-solid fa-user"></i> Hola, {user.nombre || user.firstName || 'User'}
                            </span>
                            <button className="btn btn-outline" onClick={onLogout}>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button className="btn btn-primary" onClick={onLoginClick}>
                            Login
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
