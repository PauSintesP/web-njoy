import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { getLocations } from '../services/api';
import './Navbar.css';

const Navbar = ({ onLoginClick, onCreateEventClick, location, setLocation }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [availableLocations, setAvailableLocations] = useState([]);

    // Check if user is authenticated on mount and fetch locations
    useEffect(() => {
        const currentUser = authService.getUser();
        setUser(currentUser);

        // Fetch available locations
        const fetchLocations = async () => {
            try {
                const locations = await getLocations();
                if (locations && locations.length > 0) {
                    // Remove duplicates based on city name
                    const uniqueLocations = Array.from(new Set(locations.map(l => l.ciudad)))
                        .map(city => locations.find(l => l.ciudad === city));
                    setAvailableLocations(uniqueLocations);

                    // If current location is not in list, set to first available or keep generic
                    // Use default 'Barcelona' if list is empty or current selection invalid?
                    // No, keep current logic: app handles default. 
                }
            } catch (err) {
                console.error("Failed to load locations", err);
            }
        };
        fetchLocations();

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
        // Redirect to home and force reload to clear all state
        window.location.href = '/';
    };

    return (
        <nav className="navbar glass">
            <div className="container navbar-content">
                <Link to="/" className="logo">
                    <span className="logo-n">n</span>joy
                </Link>

                <div className="nav-actions">


                    <div className="language-selector-container">
                        <button
                            className="language-toggle"
                            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                            onBlur={() => setTimeout(() => setIsLangMenuOpen(false), 200)}
                        >
                            <span className="lang-flag">
                                {{
                                    en: '🇬🇧',
                                    es: '🇪🇸',
                                    fr: '🇫🇷',
                                    pt: '🇵🇹',
                                    it: '🇮🇹',
                                    de: '🇩🇪'
                                }[i18n.language.split('-')[0]] || '🌐'}
                            </span>
                            <i className={`fa-solid fa-chevron-down ${isLangMenuOpen ? 'rotate' : ''}`}></i>
                        </button>

                        <div className={`language-menu ${isLangMenuOpen ? 'show' : ''}`}>
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

                            <div className={`user-dropdown ${isUserMenuOpen ? 'show' : ''}`}>
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
                                <button
                                    className="dropdown-link"
                                    onClick={() => {
                                        setIsUserMenuOpen(false);
                                        navigate('/my-tickets');
                                    }}
                                >
                                    <i className="fa-solid fa-ticket"></i>
                                    Mis Entradas
                                </button>
                                <button
                                    className="dropdown-link"
                                    onClick={() => {
                                        setIsUserMenuOpen(false);
                                        navigate('/teams');
                                    }}
                                >
                                    <i className="fa-solid fa-users-gear"></i>
                                    Equipos
                                </button>
                                {user && (user.role === 'promotor' || user.role === 'admin') && (
                                    <>
                                        <button
                                            className="dropdown-link"
                                            onClick={() => {
                                                setIsUserMenuOpen(false);
                                                navigate('/my-events');
                                            }}
                                        >
                                            <i className="fa-solid fa-calendar-days"></i>
                                            Mis Eventos
                                        </button>
                                        <button
                                            className="dropdown-link"
                                            onClick={() => {
                                                setIsUserMenuOpen(false);
                                                navigate('/create-event');
                                            }}
                                        >
                                            <i className="fa-solid fa-plus"></i>
                                            {t('navbar.createEvent')}
                                        </button>
                                    </>
                                )}
                                {user && ['scanner', 'promotor', 'owner', 'admin'].includes(user.role) && (
                                    <button
                                        className="dropdown-link"
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            navigate('/scanner');
                                        }}
                                    >
                                        <i className="fa-solid fa-qrcode"></i>
                                        {t('navbar.scanner') || 'Scanner'}
                                    </button>
                                )}
                                {user && user.role === 'admin' && (
                                    <button
                                        className="dropdown-link"
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            navigate('/admin');
                                        }}
                                    >
                                        <i className="fa-solid fa-shield-halved"></i>
                                        Panel Admin
                                    </button>
                                )}
                                <hr />
                                <button className="dropdown-link logout" onClick={handleLogout}>
                                    <i className="fa-solid fa-right-from-bracket"></i>
                                    {t('navbar.logout')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary">
                            {t('navbar.login')}
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
