import React from 'react';
import './EventCard.css';

const EventCard = ({ event, onClick }) => {
    const formatDate = (dateString) => {
        const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    return (
        <div className="event-card glass animate-fade-in" onClick={onClick}>
            <div className="event-image-container">
                <img src={event.image} alt={event.title} className="event-image" />
                <div className="event-category">{event.category}</div>
            </div>
            <div className="event-content">
                <div className="event-date">{formatDate(event.date)}</div>
                <h3 className="event-title">{event.title}</h3>
                <div className="event-location">
                    <i className="fa-solid fa-map-pin"></i>
                    <span>{event.location.venue && `${event.location.venue}, `}{event.location.city}</span>
                </div>
                <div className="event-footer">
                    <span className="event-price">{event.price}€</span>
                    <button className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); onClick(); }}>
                        Ver Detalles
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
