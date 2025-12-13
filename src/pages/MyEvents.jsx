import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import authService from '../services/authService';
import './MyEvents.css';

export default function MyEvents() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        checkAuth();
        loadEvents();
    }, []);

    const checkAuth = () => {
        const currentUser = authService.getUser();
        setUser(currentUser);

        if (!currentUser || (currentUser.role !== 'promotor' && currentUser.role !== 'admin')) {
            setError('No tienes permiso para acceder a esta página');
            setTimeout(() => navigate('/'), 3000);
        }
    };

    const loadEvents = async () => {
        try {
            setLoading(true);
            const data = await eventService.getMyEvents();
            setEvents(data);
        } catch (err) {
            console.error('Error loading events:', err);
            setError('Error cargando tus eventos');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (eventId, eventName) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar "${eventName}"?`)) {
            return;
        }

        try {
            await eventService.deleteEvent(eventId);
            setEvents(events.filter(e => e.id !== eventId));
        } catch (err) {
            console.error('Error deleting event:', err);
            alert('Error eliminando el evento');
        }
    };

    if (loading) {
        return (
            <div className="my-events-page">
                <div className="loading-container">
                    <div className="loader"></div>
                    <p>Cargando tus eventos...</p>
                </div>
            </div>
        );
    }

    if (error && !user) {
        return (
            <div className="my-events-page">
                <div className="error-container">
                    <i className="fa-solid fa-lock"></i>
                    <h2>Acceso Denegado</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-events-page">
            <div className="events-container">
                <div className="page-header">
                    <button onClick={() => navigate('/')} className="back-button">
                        <i className="fa-solid fa-arrow-left"></i>
                        Volver
                    </button>
                    <h1>
                        <i className="fa-solid fa-calendar-days"></i>
                        {user?.role === 'admin' ? 'Todos los Eventos' : 'Mis Eventos'}
                    </h1>
                    <p className="subtitle">
                        {events.length === 0
                            ? 'Aún no has creado eventos'
                            : `Tienes ${events.length} evento${events.length !== 1 ? 's' : ''}`
                        }
                    </p>
                </div>

                <div className="actions-bar">
                    <button
                        onClick={() => navigate('/create-event')}
                        className="btn btn-primary"
                    >
                        <i className="fa-solid fa-plus"></i>
                        Crear Nuevo Evento
                    </button>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                {events.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📅</div>
                        <h2>No tienes eventos todavía</h2>
                        <p>Crea tu primer evento y comienza a gestionar tus actividades</p>
                        <button
                            onClick={() => navigate('/create-event')}
                            className="btn btn-primary"
                        >
                            <i className="fa-solid fa-plus"></i>
                            Crear Evento
                        </button>
                    </div>
                ) : (
                    <div className="events-grid">
                        {events.map((event) => (
                            <div key={event.id} className="event-card">
                                <div className="event-image">
                                    {event.image ? (
                                        <img src={event.image} alt={event.name} />
                                    ) : (
                                        <div className="placeholder-image">
                                            <i className="fa-solid fa-calendar"></i>
                                        </div>
                                    )}
                                    <div className="event-badge">{event.type}</div>
                                </div>
                                <div className="event-info">
                                    <h3>{event.name}</h3>
                                    <p className="event-description">{event.description}</p>
                                    <div className="event-meta">
                                        <span className="meta-item">
                                            <i className="fa-solid fa-calendar"></i>
                                            {new Date(event.date).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                        <span className="meta-item">
                                            <i className="fa-solid fa-location-dot"></i>
                                            {event.venue}
                                        </span>
                                        <span className="meta-item">
                                            <i className="fa-solid fa-users"></i>
                                            {event.capacity} plazas
                                        </span>
                                        {event.price && (
                                            <span className="meta-item price">
                                                <i className="fa-solid fa-euro-sign"></i>
                                                {event.price.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="event-actions">
                                        <button
                                            onClick={() => navigate(`/edit-event/${event.id}`)}
                                            className="btn btn-secondary"
                                        >
                                            <i className="fa-solid fa-pen"></i>
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(event.id, event.name)}
                                            className="btn btn-danger"
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
