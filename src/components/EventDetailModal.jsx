import React from 'react';
import './EventDetailModal.css';

const EventDetailModal = ({ event, isOpen, onClose }) => {
    if (!isOpen || !event) return null;

    const formatDate = (dateString) => {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="event-detail-modal glass" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>&times;</button>

                <div className="event-detail-header">
                    <img src={event.image} alt={event.title} className="event-detail-image" />
                    <div className="event-detail-badge">{event.category}</div>
                </div>

                <div className="event-detail-content">
                    <h2 className="event-detail-title">{event.title}</h2>

                    <div className="event-detail-info">
                        <div className="info-item">
                            <i className="fa-solid fa-calendar"></i>
                            <div>
                                <span className="info-label">Fecha</span>
                                <span className="info-value">{formatDate(event.date)}</span>
                            </div>
                        </div>

                        <div className="info-item">
                            <i className="fa-solid fa-location-dot"></i>
                            <div>
                                <span className="info-label">Ubicación</span>
                                <span className="info-value">
                                    {event.location.venue && `${event.location.venue}, `}
                                    {event.location.city}
                                </span>
                            </div>
                        </div>

                        <div className="info-item">
                            <i className="fa-solid fa-tag"></i>
                            <div>
                                <span className="info-label">Precio</span>
                                <span className="info-value">{event.price}€</span>
                            </div>
                        </div>
                    </div>

                    <div className="event-detail-description">
                        <h3>Descripción</h3>
                        <p>{event.description || 'Disfruta de este increíble evento. ¡No te lo pierdas!'}</p>
                    </div>

                    <div className="event-detail-actions">
                        <button className="btn btn-primary full-width">
                            <i className="fa-solid fa-ticket"></i> Comprar Entradas
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailModal;
