import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import authService from '../services/authService';
import './ScannerPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ScannerPage() {
    const navigate = useNavigate();
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const scannerRef = useRef(null);
    const [user, setUser] = useState(null);
    const [scanLogs, setScanLogs] = useState([]); // Visual logs state

    useEffect(() => {
        const currentUser = authService.getUser();
        setUser(currentUser);

        // Initialize QR scanner
        const scanner = new Html5QrcodeScanner(
            "qr-reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            },
            false
        );

        scanner.render(onScanSuccess, onScanError);
        scannerRef.current = scanner;

        return () => {
            scanner.clear().catch(error => {
                console.error("Failed to clear scanner", error);
            });
        };
    }, []);

    const onScanSuccess = async (decodedText) => {
        setLoading(true);

        try {
            // Parse QR code data (Try JSON, fallback to string)
            let codigo = decodedText; // Default to raw text
            try {
                const qrData = JSON.parse(decodedText);
                if (qrData.codigo) codigo = qrData.codigo;
            } catch (e) {
                // Not JSON, keep raw string
            }

            // Call API to validate ticket
            const token = authService.getToken();
            const response = await axios.post(
                `${API_URL}/tickets/scan/${codigo}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setScanResult(response.data);

            // Auto-clear result after 5 seconds
            setTimeout(() => {
                setScanResult(null);
            }, 5000);

            // Add to Visual Log
            const newLog = {
                time: new Date().toLocaleTimeString().split(' ')[0],
                success: response.data.success,
                code: codigo,
                message: response.data.message
            };
            setScanLogs(prev => [newLog, ...prev]);

        } catch (error) {
            console.error('Error scanning:', error);
            const errorMsg = error.response?.data?.detail || error.message || "Error desconocido";
            setScanResult({
                status: 'error',
                message: `ERROR: ${errorMsg}`,
                color: 'red'
            });

            // Log failure to debug console
            const newLog = {
                time: new Date().toLocaleTimeString().split(' ')[0],
                success: false,
                code: decodedText, // Use original text if parsing failed
                message: `API ERROR: ${errorMsg}`
            };
            setScanLogs(prev => [newLog, ...prev]);
        } finally {
            setLoading(false);
        }
    };

    const onScanError = (error) => {
        // Silently handle scan errors (continuous scanning)
    };

    return (
        <div className="scanner-page-mobile">
            <div className="scanner-header-mobile">
                <button onClick={() => navigate(-1)} className="back-btn-simple" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'white', fontSize: '1.2rem' }}>
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <h1>🎫 Escaneo QR</h1>
                {user && <p className="scanner-user">Inspector: {user.nombre}</p>}
            </div>

            {/* QR Scanner Camera */}
            <div className="qr-scanner-container">
                <div id="qr-reader"></div>
            </div>

            {/* Scan Result - Full Screen Overlay */}
            {scanResult && (
                <div
                    className={`scan-result-overlay ${scanResult.color}`}
                    onClick={() => setScanResult(null)} // Click to dismiss
                    style={{ cursor: 'pointer' }}
                >
                    <div className="result-content">
                        <div className="result-icon">
                            {scanResult.color === 'green' ? '✓' : '✗'}
                        </div>
                        <h2 className="result-message">{scanResult.message}</h2>

                        {scanResult.nombre_asistente && (
                            <div className="result-details">
                                <div className="detail-line">
                                    <strong>Asistente:</strong>
                                    <span>{scanResult.user_name || scanResult.nombre_asistente}</span>
                                </div>
                                <div className="detail-line">
                                    <strong>Evento:</strong>
                                    <span>{scanResult.event_name || scanResult.evento}</span>
                                </div>
                                <div className="detail-line">
                                    <strong>Código:</strong>
                                    <span>{scanResult.codigo}</span>
                                </div>
                            </div>
                        )}

                        <div className="result-footer">
                            {scanResult.color === 'green'
                                ? 'Acceso permitido ✓'
                                : 'Acceso denegado ✗'
                            }
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Validando...</p>
                </div>
            )}

            {/* --- VISUAL DEBUG LOGS (User Request) --- */}
            <div className="debug-console-overlay" style={{ zIndex: 9999 }}>
                <h3 style={{ fontSize: '10px', color: '#888', borderBottom: '1px solid #333', marginBottom: '5px' }}>📟 DEBUG LOGS</h3>
                <div className="debug-logs-list">
                    {scanLogs.map((log, i) => (
                        <div key={i} className="debug-log-entry">
                            <span className="log-time">{log.time}</span>
                            <span className={log.success ? "log-status success" : "log-status fail"}>
                                {log.success ? "OK" : "FAIL"}
                            </span>
                            <span style={{ fontSize: '9px', bg: '#222', padding: '2px', borderRadius: '3px', fontFamily: 'monospace', color: '#8ac' }}>
                                [{log.code ? log.code.substring(0, 15) : '?'}]
                            </span>
                            <span className="log-msg">{log.message}</span>
                        </div>
                    ))}
                    {scanLogs.length === 0 && <span style={{ color: '#444' }}>No logs yet...</span>}
                </div>
            </div>
        </div>
    );
}
