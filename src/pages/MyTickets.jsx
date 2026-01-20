import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ticketService from '../services/ticketService';
import TicketCard from '../components/TicketCard';
import './MyTickets.css';

export default function MyTickets() {
    const { t } = useTranslation();
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
            setError(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container loading-state">
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '3rem', color: 'var(--primary)' }}></i>
                <p>{t('common.loading')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container error-state">
                <i className="fa-solid fa-circle-exclamation"></i>
                <p>{error}</p>
                <button onClick={loadTickets} className="btn btn-primary">
                    {t('common.retry') || 'Retry'}
                </button>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="container">
                <div className="page-header center">
                    <h1>
                        <i className="fa-solid fa-ticket"></i>
                        {t('myTickets.title')}
                    </h1>
                    <p className="subtitle">
                        {tickets.length === 0
                            ? t('myTickets.noTickets')
                            : t('myTickets.subtitle')
                        }
                    </p>
                </div>

                {tickets.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🎫</div>
                        <h2>{t('myTickets.noTickets')}</h2>
                        <p>{t('myTickets.noTicketsDescription')}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="btn btn-primary"
                        >
                            <i className="fa-solid fa-magnifying-glass"></i>
                            {t('myTickets.browseEvents')}
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
