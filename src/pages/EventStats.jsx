import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StatCard from '../components/StatCard';
import AttendanceChart from '../components/AttendanceChart';
import { getEventStats } from '../services/statsService';
import { getEventById } from '../services/api';
import authService from '../services/authService';
import '../index.css';

const EventStats = () => {
    const { t } = useTranslation();
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [statsData, eventData] = await Promise.all([
                getEventStats(eventId),
                getEventById(eventId)
            ]);
            setStats(statsData);
            setEvent(eventData);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            console.error('Error fetching event stats:', err);
            setError(err.response?.data?.detail || 'Error al cargar estadísticas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check permissions
        const user = authService.getUser();
        if (!user || (user.role !== 'admin' && user.role !== 'promotor')) {
            navigate('/');
            return;
        }

        fetchStats();

        // Auto-refresh every 10 seconds
        let interval;
        if (autoRefresh) {
            interval = setInterval(() => {
                fetchStats();
            }, 10000); // 10 seconds
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [eventId, autoRefresh, navigate]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount || 0);
    };

    const formatDateTime = (date) => {
        if (!date) return '';
        return new Intl.DateTimeFormat('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    };

    if (loading && !stats) {
        return (
            <div className="container">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando estadísticas...</p>
                </div>
            </div>
        );
    }

    if (error && !stats) {
        return (
            <div className="container">
                <div className="error-container">
                    <h2>❌ Error</h2>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/my-events')}>
                        Volver a Mis Eventos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="event-stats-page">
            <div className="container">
                {/* Header */}
                <div className="stats-header">
                    <div className="header-left">
                        <button
                            className="btn-back"
                            onClick={() => navigate('/my-events')}
                            aria-label="Volver"
                        >
                            ← Volver
                        </button>
                        <div className="header-info">
                            <h1 className="stats-title">📊 Estadísticas del Evento</h1>
                            {event && <h2 className="event-name">{event.name}</h2>}
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="auto-refresh-toggle">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={autoRefresh}
                                    onChange={(e) => setAutoRefresh(e.target.checked)}
                                />
                                <span className="toggle-text">Auto-actualización</span>
                            </label>
                        </div>
                        {lastUpdated && (
                            <p className="last-updated">
                                Última actualización: {formatDateTime(lastUpdated)}
                            </p>
                        )}
                    </div>
                </div>

                {stats && (
                    <>
                        {/* Stats Grid */}
                        <div className="stats-grid">
                            <StatCard
                                title="💰 Ingresos Generados"
                                value={formatCurrency(stats.ingreso_total)}
                                icon="💵"
                                color="success"
                                subtitle={`${stats.tickets_vendidos} entradas vendidas`}
                            />

                            <StatCard
                                title="🎫 Entradas Vendidas"
                                value={`${stats.tickets_vendidos} / ${stats.capacidad_total}`}
                                icon="🎟️"
                                color="primary"
                                subtitle={`${stats.tickets_disponibles} disponibles`}
                            />

                            <StatCard
                                title="👥 Asistentes"
                                value={stats.tickets_escaneados}
                                icon="✅"
                                color="info"
                                subtitle="Tickets escaneados"
                            />

                            <StatCard
                                title="📊 Tasa de Asistencia"
                                value={`${stats.tasa_asistencia.toFixed(1)}%`}
                                icon="📈"
                                color={stats.tasa_asistencia >= 75 ? "success" : stats.tasa_asistencia >= 50 ? "warning" : "danger"}
                                subtitle={`${stats.tickets_escaneados} de ${stats.tickets_vendidos}`}
                            />

                            <StatCard
                                title="💵 Ingreso Promedio"
                                value={formatCurrency(stats.ingreso_promedio_ticket)}
                                icon="💳"
                                color="primary"
                                subtitle="Por entrada"
                            />

                            <StatCard
                                title="⏳ Disponibles"
                                value={stats.tickets_disponibles}
                                icon="🎫"
                                color={stats.tickets_disponibles > 10 ? "success" : stats.tickets_disponibles > 0 ? "warning" : "danger"}
                                subtitle={`de ${stats.capacidad_total} plazas`}
                            />
                        </div>

                        {/* Charts Section */}
                        <div className="charts-section">
                            <AttendanceChart
                                ticketsSold={stats.tickets_vendidos}
                                ticketsScanned={stats.tickets_escaneados}
                                attendanceRate={stats.tasa_asistencia}
                            />
                        </div>

                        {/* Manual Refresh Button */}
                        <div className="actions-section">
                            <button
                                className="btn btn-primary"
                                onClick={fetchStats}
                                disabled={loading}
                            >
                                {loading ? '🔄 Actualizando...' : '🔄 Actualizar Ahora'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EventStats;
