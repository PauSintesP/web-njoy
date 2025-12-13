import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './EventDetailModal.css';

const EventDetailModal = ({ event, isOpen, onClose }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

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
        return new Date(dateString).toLocaleDateString(i18n.language, options);
    };

    const handleBuyTickets = () => {
        onClose();
        navigate(`/tickets/purchase/${event.id}`);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="event-detail-modal" onClick={(e) => e.stopPropagation()}>
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
                                <span className="info-label">{t('eventDetail.date')}</span>
                                <span className="info-value">{formatDate(event.date)}</span>
                            </div>
                        </div>

                        <div className="info-item">
                            <i className="fa-solid fa-location-dot"></i>
                            <div>
                                <span className="info-label">{t('eventDetail.location')}</span>
                                <span className="info-value">
                                    {event.location.venue && `${event.location.venue}, `}
                                    {event.location.city}
                                </span>
                            </div>
                        </div>

                        <div className="info-item">
                            <i className="fa-solid fa-tag"></i>
                            <div>
                                <span className="info-label">{t('eventDetail.price')}</span>
                                <span className="info-value">{event.price}€</span>
                            </div>
                        </div>
                    </div>

                    <div className="event-detail-description">
                        <h3>{t('eventDetail.description')}</h3>
                        <p>{event.description || 'Disfruta de este increíble evento. ¡No te lo pierdas!'}</p>
                    </div>

                    {/* Availability Info */}
                    <div className="availability-info" style={{ marginBottom: '20px', textAlign: 'center' }}>
                        {event.ticketsAvailable <= 0 ? (
                            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>SOLD OUT</span>
                        ) : event.ticketsAvailable < 20 ? (
                            <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                                ¡Solo quedan {event.ticketsAvailable} entradas!
                            </span>
                        ) : (
                            <span style={{ color: '#10b981' }}>
                                Entradas disponibles: {event.ticketsAvailable}
                            </span>
                        )}
                    </div>

                    <div className="event-detail-actions">
                        <button
                            className={`btn btn-primary full-width ${event.ticketsAvailable <= 0 ? 'disabled' : ''}`}
                            onClick={handleBuyTickets}
                            disabled={event.ticketsAvailable <= 0}
                            style={event.ticketsAvailable <= 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                            <i className="fa-solid fa-ticket"></i> {event.ticketsAvailable <= 0 ? 'SOLD OUT' : t('eventDetail.buyTickets')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailModal;
