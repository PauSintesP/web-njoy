import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById } from '../services/api';
import ticketService from '../services/ticketService';
import authService from '../services/authService';
import './TicketPurchase.css';

export default function TicketPurchase() {
    const { eventoId } = useParams();
    const navigate = useNavigate();
    const [evento, setEvento] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [error, setError] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        loadEvento();
    }, [eventoId]);

    const loadEvento = async () => {
        try {
            setLoading(true);
            const data = await getEventById(eventoId);
            setEvento(data);
        } catch (err) {
            setError('Error cargando el evento');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async () => {
        if (!authService.isAuthenticated()) {
            navigate('/login');
            return;
        }

        try {
            setPurchasing(true);
            setError(null);
            await ticketService.purchaseTickets(eventoId, cantidad);
            setShowConfirmation(true);
            setTimeout(() => {
                navigate('/my-tickets');
            }, 2000);
        } catch (err) {
            console.error('Error purchasing tickets:', err);
            setError(err.response?.data?.detail || 'Error al comprar las entradas. Inténtalo de nuevo.');
        } finally {
            setPurchasing(false);
        }
    };

    const calculateTotal = () => {
        // Check for price (English key from dataMapper)
        if (evento?.price === 'Free' || !evento?.price) return 0;
        return (evento.price * cantidad).toFixed(2);
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="flex justify-center items-center h-64">
                    <div className="loading-spinner" style={{ width: '40px', height: '40px' }}></div>
                </div>
            </div>
        );
    }

    if (!evento) {
        return (
            <div className="page-container">
                <div className="alert alert-danger">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    Evento no encontrado
                </div>
            </div>
        );
    }

    if (showConfirmation) {
        return (
            <div className="modal-overlay">
                <div className="modal-content text-center">
                    <div className="success-icon mb-4" style={{ width: '80px', height: '80px', fontSize: '2.5rem', margin: '0 auto 1.5rem' }}>✓</div>
                    <h2 className="text-gradient mb-2">¡Compra Exitosa!</h2>
                    <p className="mb-4">Has adquirido {cantidad} entrada(s) para {evento.title}</p>
                    <p className="text-muted text-sm">Redirigiendo a Mis Entradas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="purchase-grid">
                {/* Left Column: Event Details */}
                <div className="event-section">
                    <h1 className="text-gradient mb-4" style={{ fontSize: '2.5rem' }}>{evento.title}</h1>

                    {evento.image && (
                        <div className="mb-6">
                            <img src={evento.image} alt={evento.title} className="event-image-large" />
                        </div>
                    )}

                    <div className="card mb-6">
                        <h3 className="mb-4">Información del Evento</h3>
                        <div className="info-row">
                            <i className="fa-solid fa-calendar"></i>
                            <span>
                                {evento.date ? new Date(evento.date).toLocaleDateString('es-ES', {
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                }) : 'Fecha por confirmar'}
                            </span>
                        </div>
                        <div className="info-row">
                            <i className="fa-solid fa-location-dot"></i>
                            {/* Updated to use nested location object from mapper */}
                            <span>{evento.location?.venue}, {evento.location?.city || 'Ubicación'}</span>
                        </div>
                        <p className="text-muted mt-4">{evento.description}</p>
                    </div>
                </div>

                {/* Right Column: Purchase Form */}
                <div className="purchase-section">
                    <div className="card sticky-card" style={{ position: 'sticky', top: '100px' }}>
                        <h2 className="mb-4">Seleccionar Entradas</h2>

                        {error && (
                            <div className="alert alert-error mb-4">
                                <i className="fa-solid fa-circle-exclamation"></i>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Cantidad</label>
                            <div className="qty-control">
                                <button
                                    className="qty-btn-icon"
                                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                                    disabled={cantidad <= 1}
                                >
                                    <i className="fa-solid fa-minus"></i>
                                </button>
                                <span className="qty-value">{cantidad}</span>
                                <button
                                    className="qty-btn-icon"
                                    onClick={() => setCantidad(Math.min(10, cantidad + 1))}
                                    disabled={cantidad >= 10}
                                >
                                    <i className="fa-solid fa-plus"></i>
                                </button>
                            </div>
                            <small className="form-hint text-center block mt-2">Máximo 10 entradas por compra</small>
                        </div>

                        <div className="summary-box">
                            <div className="flex justify-between mb-2 text-muted">
                                <span>Precio unitario</span>
                                <span>
                                    {evento.price !== 'Free' && evento.price
                                        ? `${Number(evento.price).toFixed(2)} €`
                                        : 'Gratis'}
                                </span>
                            </div>
                            <div className="total-row text-white font-bold">
                                <span>Total</span>
                                <span className="text-gradient-primary">{calculateTotal()} €</span>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary w-full py-4 text-lg"
                            onClick={handlePurchase}
                            disabled={purchasing}
                        >
                            {purchasing ? (
                                <>
                                    <div className="loading-spinner mr-2" style={{ width: '20px', height: '20px' }}></div>
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    Confirmar Compra
                                    <i className="fa-solid fa-arrow-right ml-2"></i>
                                </>
                            )}
                        </button>

                        <p className="text-xs text-muted text-center mt-4">
                            <i className="fa-solid fa-shield-halved mr-1"></i>
                            Pago seguro garantizado
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
