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

    // Verificar estado de la venta
    const now = new Date();
    const eventDate = new Date(event.date);
    const salesCloseTime = new Date(eventDate.getTime() - 10 * 60 * 1000); // 10 min antes

    const isEventPast = now >= eventDate;
    const isSalesClosed = now >= salesCloseTime;
    const isSoldOut = event.ticketsAvailable <= 0;
    const isSalesPaused = event.venta_pausada || event.salesPaused;

    // Determinar si se puede comprar
    const canPurchase = !isEventPast && !isSalesClosed && !isSoldOut && !isSalesPaused;

    // Mensaje de estado de venta
    const getSalesStatusMessage = () => {
        if (isSoldOut) return { text: 'SOLD OUT', color: '#ef4444' };
        if (isEventPast) return { text: 'Evento finalizado', color: '#6b7280' };
        if (isSalesClosed) return { text: 'Venta cerrada (10 min antes)', color: '#f59e0b' };
        if (isSalesPaused) return { text: '⏸️ Venta pausada temporalmente', color: '#f59e0b' };
        if (event.ticketsAvailable < 20) return { text: `¡Solo quedan ${event.ticketsAvailable} entradas!`, color: '#f59e0b' };
        return { text: `Entradas disponibles: ${event.ticketsAvailable}`, color: '#10b981' };
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
                        <span style={{ color: getSalesStatusMessage().color, fontWeight: 'bold' }}>
                            {getSalesStatusMessage().text}
                        </span>
                    </div>

                    <div className="event-detail-actions">
                        <button
                            className={`btn btn-primary full-width ${!canPurchase ? 'disabled' : ''}`}
                            onClick={handleBuyTickets}
                            disabled={!canPurchase}
                            style={!canPurchase ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                            <i className="fa-solid fa-ticket"></i> {!canPurchase ? getSalesStatusMessage().text : t('eventDetail.buyTickets')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailModal;
