import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService from '../services/authService';
import api from '../services/api';
import './ScannerPage.css';

const ScannerPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [ticketId, setTicketId] = useState('');
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const currentUser = authService.getUser();
        if (!currentUser) {
            navigate('/login');
            return;
        }

        // Check if user has scanner permissions
        if (!['scanner', 'promotor', 'owner', 'admin'].includes(currentUser.role)) {
            navigate('/');
            return;
        }

        setUser(currentUser);
        loadEvents();
    }, [navigate]);

    const loadEvents = async () => {
        try {
            const response = await api.get('/scanner/my-events');
            setEvents(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error loading events:', error);
        }
    };

    const handleScan = async () => {
        if (!ticketId) {
            alert('Por favor ingresa un ID de ticket');
            return;
        }

        setLoading(true);
        setScanResult(null);

        try {
            // Validate ticket first
            const validateResponse = await api.post('/scanner/validate-ticket', {
                ticket_id: parseInt(ticketId)
            });

            if (validateResponse.data.success && validateResponse.data.ticket?.activado) {
                // If ticket is valid and not used, mark it as scanned
                const scanResponse = await api.post(`/scanner/activate-ticket/${ticketId}`);
                setScanResult(scanResponse.data);
            } else {
                // Ticket is invalid or already used
                setScanResult(validateResponse.data);
            }
        } catch (error) {
            console.error('Error scanning ticket:', error);
            setScanResult({
                success: false,
                message: 'Error al escanear el ticket. Inténtalo de nuevo.'
            });
        } finally {
            setLoading(false);
            setTicketId('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleScan();
        }
    };

    return (
        <div className="scanner-page">
            <div className="scanner-container">
                <div className="scanner-header">
                    <h1>
                        <i className="fa-solid fa-qrcode"></i>
                        Escaneo de Tickets
                    </h1>
                    <p>Validar y activar tickets de eventos</p>
                    {user && (
                        <div className="scanner-user-info">
                            <span>👤 {user.nombre} {user.apellidos}</span>
                            <span className="role-badge">{user.role}</span>
                        </div>
                    )}
                </div>

                <div className="scanner-input-section glass">
                    <div className="input-group">
                        <i className="fa-solid fa-ticket"></i>
                        <input
                            type="number"
                            placeholder="Ingresa ID del ticket..."
                            value={ticketId}
                            onChange={(e) => setTicketId(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                            autoFocus
                        />
                        <button
                            onClick={handleScan}
                            disabled={loading || !ticketId}
                            className="btn btn-scan"
                        >
                            {loading ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    Escaneando...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-barcode"></i>
                                    Escanear
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {scanResult && (
                    <div className={`scan-result glass ${scanResult.success ? 'success' : 'error'}`}>
                        <div className="result-header">
                            <i className={`fa-solid ${scanResult.success ? 'fa-circle-check' : 'fa-circle-xmark'}`}></i>
                            <h3>{scanResult.message}</h3>
                        </div>

                        {scanResult.ticket && (
                            <div className="result-details">
                                <div className="detail-item">
                                    <span className="label">Evento:</span>
                                    <span className="value">{scanResult.event_name}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Usuario:</span>
                                    <span className="value">{scanResult.user_name}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">ID Ticket:</span>
                                    <span className="value">#{scanResult.ticket.id}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Estado:</span>
                                    <span className="badge ${scanResult.ticket.activado ? 'badge-success' : 'badge-used'}">
                                        {scanResult.ticket.activado ? 'Válido' : 'Utilizado'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {events.length > 0 && (
                    <div className="events-list glass">
                        <h3>
                            <i className="fa-solid fa-calendar-days"></i>
                            Eventos disponibles ({events.length})
                        </h3>
                        <div className="events-grid-scanner">
                            {events.map(event => (
                                <div key={event.id} className="event-card-scanner">
                                    <div className="event-info">
                                        <h4>{event.nombre}</h4>
                                        <p>
                                            <i className="fa-solid fa-calendar"></i>
                                            {new Date(event.fechayhora).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScannerPage;
