import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ticketService from '../services/ticketService';
import TicketCard from '../components/TicketCard';
import './MyTickets.css';

export default function MyTickets() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        try {
            setLoading(true);
            const data = await ticketService.getMyTickets();
            setTickets(data);
        } catch (err) {
            console.error('Error loading tickets:', err);
            setError('Error cargando tus entradas');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container loading-state">
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '3rem', color: 'var(--primary)' }}></i>
                <p>Cargando tus entradas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container error-state">
                <i className="fa-solid fa-circle-exclamation"></i>
                <p>{error}</p>
                <button onClick={loadTickets} className="btn btn-primary">
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="container">
                <div className="page-header center">
                    <button onClick={() => navigate('/')} className="btn btn-text back-button-floating">
                        <i className="fa-solid fa-arrow-left"></i>
                        Volver
                    </button>
                    <h1>
                        <i className="fa-solid fa-ticket"></i>
                        Mis Entradas
                    </h1>
                    <p className="subtitle">
                        {tickets.length === 0
                            ? 'Aún no tienes entradas'
                            : `Tienes ${tickets.length} entrada${tickets.length !== 1 ? 's' : ''}`
                        }
                    </p>
                </div>

                {tickets.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🎫</div>
                        <h2>No tienes entradas todavía</h2>
                        <p>Explora los eventos disponibles y compra tus primeras entradas</p>
                        <button
                            onClick={() => navigate('/')}
                            className="btn btn-primary"
                        >
                            <i className="fa-solid fa-magnifying-glass"></i>
                            Explorar Eventos
                        </button>
                    </div>
                ) : (
                    <div className="tickets-grid">
                        {tickets.map((ticket) => (
                            <TicketCard
                                key={ticket.ticket_id}
                                ticket={ticket}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
