import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './NotFound.css';

const NotFound = () => {
    const { t } = useTranslation();

    return (
        <div className="not-found-page">
            <div className="not-found-container">
                <div className="error-animation">
                    <div className="error-code">
                        <span className="four">4</span>
                        <span className="zero">
                            <i className="fa-solid fa-circle-exclamation"></i>
                        </span>
                        <span className="four">4</span>
                    </div>
                </div>

                <h1 className="error-title">Página no encontrada</h1>
                <p className="error-description">
                    Lo sentimos, la página que buscas no existe o ha sido movida.
                </p>

                <div className="error-actions">
                    <Link to="/" className="btn btn-primary">
                        <i className="fa-solid fa-home"></i>
                        Volver al inicio
                    </Link>
                    <Link to="/login" className="btn btn-outline">
                        <i className="fa-solid fa-right-to-bracket"></i>
                        Iniciar sesión
                    </Link>
                </div>

                <div className="error-suggestions">
                    <h3>Páginas populares:</h3>
                    <div className="suggestion-links">
                        <Link to="/">
                            <i className="fa-solid fa-ticket"></i>
                            Eventos
                        </Link>
                        <Link to="/my-tickets">
                            <i className="fa-solid fa-receipt"></i>
                            Mis Tickets
                        </Link>
                        <Link to="/profile">
                            <i className="fa-solid fa-user"></i>
                            Perfil
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
