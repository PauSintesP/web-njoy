import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './TicketCard.css';

export default function TicketCard({ ticket }) {
    const ticketRef = useRef(null);
    const pdfTemplateRef = useRef(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const { ticket_id, codigo_ticket, activado, nombre_asistente, evento } = ticket;

    // Generate QR code data with secure code
    const qrData = JSON.stringify({
        codigo: codigo_ticket,
        eventoId: evento.id,
        eventoNombre: evento.nombre
    });

    const formatDate = (dateString, includeWeekDay = false) => {
        if (!dateString) return 'Fecha por confirmar';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: includeWeekDay ? 'long' : undefined,
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownloadPDF = async () => {
        if (isGeneratingPdf) return;
        setIsGeneratingPdf(true);

        try {
            const input = pdfTemplateRef.current;

            // Wait for images to render (simple timeout usually enough for cached images, 
            // or we could use onLoad handlers, but html2canvas handles it mostly)
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(input, {
                scale: 2, // Higher quality
                useCORS: true, // Allow cross-origin images
                logging: false,
                backgroundColor: '#ffffff',
                width: 794, // A4 width in px at 96 DPI approx (210mm)
                height: 1123, // Force A4 height ratio
                windowWidth: 1200
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // Generate safe filename
            const safeEventName = evento.nombre.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-');
            const fileName = `Entrada-${codigo_ticket}-${safeEventName}.pdf`;

            pdf.save(fileName);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error al generar el PDF. Inténtalo de nuevo.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleAddToGoogleWallet = () => {
        alert('Funcionalidad de Google Wallet próximamente disponible');
    };

    const handleAddToAppleWallet = () => {
        alert('Funcionalidad de Apple Wallet próximamente disponible');
    };

    return (
        <>
            <div className="ticket-card-wrapper">
                <div ref={ticketRef} className="ticket-card">
                    {/* Background Image with Gradient */}
                    <div className="ticket-background">
                        {evento.imagen && (
                            <img src={evento.imagen} alt={evento.nombre} className="ticket-bg-image" />
                        )}
                        <div className="ticket-gradient"></div>
                    </div>

                    {/* Ticket Content */}
                    <div className="ticket-content">
                        {/* Event Name */}
                        <div className="ticket-header">
                            <div className="event-genre-badge">
                                🎵 {evento.genero || 'Música'}
                            </div>
                            <h2 className="event-name">{evento.nombre}</h2>
                        </div>

                        <div className="ticket-divider"></div>

                        {/* Event Details */}
                        <div className="event-details-section">
                            <div className="detail-row">
                                <i className="fa-solid fa-calendar"></i>
                                <span>{formatDate(evento.fechayhora)}</span>
                            </div>
                            <div className="detail-row">
                                <i className="fa-solid fa-location-dot"></i>
                                <span>{evento.recinto}</span>
                            </div>
                            {nombre_asistente && (
                                <div className="detail-row">
                                    <i className="fa-solid fa-user"></i>
                                    <span>{nombre_asistente}</span>
                                </div>
                            )}
                        </div>

                        {/* QR Code - Click to enlarge */}
                        <div
                            className="qr-section"
                            onClick={() => setShowQRModal(true)}
                            title="Clic para ampliar QR"
                        >
                            <div className="qr-container">
                                <QRCodeCanvas
                                    value={qrData}
                                    size={180}
                                    level="H"
                                    includeMargin={true}
                                    className="qr-code"
                                />
                                <div className="qr-overlay">
                                    <i className="fa-solid fa-expand"></i>
                                    <span>Clic para ampliar</span>
                                </div>
                            </div>
                        </div>

                        {/* Ticket Info */}
                        <div className="ticket-info-section">
                            <div className="ticket-number">
                                {codigo_ticket}
                            </div>
                            <div className={`ticket-status ${activado ? 'valid' : 'used'}`}>
                                {activado ? (
                                    <>
                                        <i className="fa-solid fa-check-circle"></i>
                                        VÁLIDO
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-times-circle"></i>
                                        USADO
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Price */}
                        {evento.precio && (
                            <div className="ticket-price">
                                {evento.precio.toFixed(2)} €
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="ticket-actions">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isGeneratingPdf}
                        className="action-btn download-btn"
                    >
                        {isGeneratingPdf ? (
                            <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : (
                            <i className="fa-solid fa-file-pdf"></i>
                        )}
                        {isGeneratingPdf ? 'Generando...' : 'Descargar PDF'}
                    </button>

                    <button
                        onClick={handleAddToGoogleWallet}
                        className="action-btn wallet-btn google-wallet"
                    >
                        <i className="fa-brands fa-google"></i>
                        Google Wallet
                    </button>

                    <button
                        onClick={handleAddToAppleWallet}
                        className="action-btn wallet-btn apple-wallet"
                    >
                        <i className="fa-brands fa-apple"></i>
                        Apple Wallet
                    </button>
                </div>
            </div>

            {/* Hidden PDF Template (for generation only) */}
            <div className="pdf-generator-container">
                <div ref={pdfTemplateRef} className="ticket-pdf-modern">
                    {/* Header */}
                    <div className="pdf-header">
                        {evento.imagen && (
                            <img src={evento.imagen} alt="Event" className="pdf-header-bg" crossOrigin="anonymous" />
                        )}
                        <div className="pdf-overlay-gradient">
                            <div className="pdf-event-badge">
                                {evento.genero || 'EVENTO'}
                            </div>
                            <h1 className="pdf-event-title-large">{evento.nombre}</h1>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="pdf-body">
                        {/* Grid Info */}
                        <div className="pdf-info-grid">
                            <div className="pdf-info-item">
                                <span className="pdf-label">Fecha y Hora</span>
                                <span className="pdf-value">{formatDate(evento.fechayhora, true)}</span>
                            </div>
                            <div className="pdf-info-item">
                                <span className="pdf-label">Recinto</span>
                                <span className="pdf-value">{evento.recinto}</span>
                            </div>
                            <div className="pdf-info-item">
                                <span className="pdf-label">Asistente</span>
                                <span className="pdf-value">{nombre_asistente || 'Portador'}</span>
                            </div>
                            <div className="pdf-info-item">
                                <span className="pdf-label">Organizador</span>
                                <span className="pdf-value">nJoy Events</span>
                            </div>
                        </div>

                        <div className="pdf-divider"></div>

                        {/* QR Section */}
                        <div className="pdf-qr-section">
                            <div className="pdf-qr-box">
                                <QRCodeCanvas
                                    value={qrData}
                                    size={250}
                                    level="H"
                                    includeMargin={false}
                                    imageSettings={{
                                        src: "/icon-192.png", // Optional branding in QR (assuming exists or fail safely)
                                        height: 30,
                                        width: 30,
                                        excavate: true,
                                    }}
                                />
                            </div>
                            <div className="pdf-ticket-code">{codigo_ticket}</div>
                            <div className={`pdf-ticket-status ${activado ? 'pdf-status-valid' : 'pdf-status-used'}`}>
                                {activado ? 'ENTRADA VÁLIDA' : 'ENTRADA USADA'}
                            </div>
                        </div>

                        {/* Footer Price */}
                        <div className="pdf-footer">
                            <div className="pdf-price-huge">{evento.precio ? `${evento.precio.toFixed(2)} €` : 'Entrada'}</div>
                            <div className="pdf-brand">
                                <span>Generado por nJoy</span>
                                <span>•</span>
                                <span>{new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Code Modal for screen viewing */}
            {showQRModal && (
                <div className="qr-modal-overlay" onClick={() => setShowQRModal(false)}>
                    <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="qr-modal-close" onClick={() => setShowQRModal(false)}>
                            <i className="fa-solid fa-times"></i>
                        </button>
                        <h3>Escanea tu QR</h3>
                        <div className="qr-modal-content">
                            <QRCodeCanvas
                                value={qrData}
                                size={350}
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                        <div className="qr-modal-info">
                            <p className="qr-code-text">{codigo_ticket}</p>
                            <p className="qr-event-name">{evento.nombre}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
