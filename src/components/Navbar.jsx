import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './Navbar.css';

const Navbar = ({ onLoginClick, onCreateEventClick, location, setLocation }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [user, setUser] = useState(null);

    // Check if user is authenticated on mount
    useEffect(() => {
        const currentUser = authService.getUser();
        setUser(currentUser);

        // Listen for login events
        const handleLogin = (event) => {
            setUser(event.detail || authService.getUser());
        };

        // Listen for logout events
        const handleLogout = () => {
            setUser(null);
            setIsUserMenuOpen(false);
        };

        window.addEventListener('auth-login', handleLogin);
        window.addEventListener('auth-logout', handleLogout);

        return () => {
            window.removeEventListener('auth-login', handleLogin);
            window.removeEventListener('auth-logout', handleLogout);
        };
    }, []);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setIsLangMenuOpen(false);
    };

    const handleLogout = () => {
        authService.logout();
        setIsUserMenuOpen(false);
    };

    return (
        <nav className="navbar glass">
            <div className="container navbar-content">
                <a href="#" className="logo" onClick={(e) => e.preventDefault()}>
                    <span className="logo-n">n</span>joy
                </a>

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

                    <div className="language-selector-container">
                        <button
                            className="language-toggle"
                            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                            onBlur={() => setTimeout(() => setIsLangMenuOpen(false), 200)}
                        >
                            <span className="lang-flag" style={{ fontSize: '1.2rem' }}>
                                {{
                                    en: '🇬🇧',
                                    es: '🇪🇸',
                                    fr: '🇫🇷',
                                    pt: '🇵🇹',
                                    it: '🇮🇹',
                                    de: '🇩🇪'
                                }[i18n.language.split('-')[0]] || '🌐'}
                            </span>
                            <span className="current-lang">{i18n.language.split('-')[0].toUpperCase()}</span>
                            <i className={`fa-solid fa-chevron-down ${isLangMenuOpen ? 'rotate' : ''}`}></i>
                        </button>

                        <div className={`language-menu glass ${isLangMenuOpen ? 'show' : ''}`}>
                            <button onClick={() => changeLanguage('en')} className={i18n.language === 'en' ? 'active' : ''}>
                                🇬🇧 English
                            </button>
                            <button onClick={() => changeLanguage('es')} className={i18n.language === 'es' ? 'active' : ''}>
                                🇪🇸 Español
                            </button>
                            <button onClick={() => changeLanguage('fr')} className={i18n.language === 'fr' ? 'active' : ''}>
                                🇫🇷 Français
                            </button>
                            <button onClick={() => changeLanguage('pt')} className={i18n.language === 'pt' ? 'active' : ''}>
                                🇵🇹 Português
                            </button>
                            <button onClick={() => changeLanguage('it')} className={i18n.language === 'it' ? 'active' : ''}>
                                🇮🇹 Italiano
                            </button>
                            <button onClick={() => changeLanguage('de')} className={i18n.language === 'de' ? 'active' : ''}>
                                🇩🇪 Deutsch
                            </button>
                        </div>
                    </div>

                    {user ? (
                        <div className="user-menu-container">
                            <button
                                className="user-button"
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                onBlur={() => setTimeout(() => setIsUserMenuOpen(false), 200)}
                            >
                                <i className="fa-solid fa-user-circle"></i>
                                <span>{user.nombre || 'User'}</span>
                                <i className={`fa-solid fa-chevron-down ${isUserMenuOpen ? 'rotate' : ''}`}></i>
                            </button>

                            <div className={`user-dropdown glass ${isUserMenuOpen ? 'show' : ''}`}>
                                <div className="user-info">
                                    <strong>{user.nombre} {user.apellidos}</strong>
                                    <span>{user.email}</span>
                                </div>
                                <hr />
                                <button
                                    className="dropdown-link"
                                    onClick={() => {
                                        setIsUserMenuOpen(false);
                                        navigate('/profile');
                                    }}
                                >
                                    <i className="fa-solid fa-user"></i>
                                    {t('navbar.profile')}
                                </button>
                                {onCreateEventClick && (
                                    <>
                                        <button
                                            className="dropdown-link"
                                            onClick={() => {
                                                setIsUserMenuOpen(false);
                                                onCreateEventClick();
                                            }}
                                        >
                                            <i className="fa-solid fa-plus"></i>
                                            {t('navbar.createEvent')}
                                        </button>
                                    </>
                                )}
                                <hr />
                                <button className="dropdown-link logout" onClick={handleLogout}>
                                    <i className="fa-solid fa-right-from-bracket"></i>
                                    {t('navbar.logout')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button className="btn btn-primary" onClick={onLoginClick}>
                            {t('navbar.login')}
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
