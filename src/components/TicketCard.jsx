import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import './TicketCard.css';

export default function TicketCard({ ticket }) {
    const { t, i18n } = useTranslation();
    const ticketRef = useRef(null);
    const qrCanvasRef = useRef(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const { ticket_id, codigo_ticket, activado, nombre_asistente, propietario, evento } = ticket;

    // CRITICAL FIX: Ensure we have a valid code for QR generation
    // If codigo_ticket is missing (old tickets or API error), use ticket_id as fallback
    const safeCodigoTicket = codigo_ticket || `NJOY-TICKET-${ticket_id}`;

    console.log('DEBUG TicketCard:', { ticket_id, codigo_ticket, safeCodigoTicket });

    // OPTIMIZED: QR code contains ONLY the ticket code (not JSON)
    // This makes the QR much simpler and easier to scan
    const qrData = safeCodigoTicket;

    const formatDate = (dateString, includeWeekDay = false) => {
        if (!dateString) return t('eventCard.dateToConfirm') || 'TBC';
        const date = new Date(dateString);
        const locale = i18n.language || 'en';
        return date.toLocaleDateString(locale, {
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
            const qrCanvas = qrCanvasRef.current?.querySelector('canvas');
            if (!qrCanvas) {
                throw new Error('QR Canvas not found');
            }

            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Ticket card dimensions (centered)
            const ticketWidth = 180;
            const ticketHeight = 260;
            const ticketX = (pageWidth - ticketWidth) / 2;
            const ticketY = 20;

            // Colors
            const purple = [102, 126, 234];
            const darkPurple = [55, 48, 107];
            const pink = [236, 72, 153];
            const green = [16, 185, 129];
            const red = [239, 68, 68];

            // Page background gradient
            for (let i = 0; i < pageHeight; i++) {
                const ratio = i / pageHeight;
                pdf.setFillColor(248 - ratio * 10, 249 - ratio * 10, 252 - ratio * 5);
                pdf.rect(0, i, pageWidth, 1.5, 'F');
            }



            // Card background (square borders)
            pdf.setFillColor(255, 255, 255);
            pdf.rect(ticketX, ticketY, ticketWidth, ticketHeight, 'F');

            // Header gradient (70mm height)
            const headerH = 70;
            for (let i = 0; i < headerH; i++) {
                const ratio = i / headerH;
                const r = Math.round(darkPurple[0] + (purple[0] - darkPurple[0]) * ratio * 0.6);
                const g = Math.round(darkPurple[1] + (purple[1] - darkPurple[1]) * ratio * 0.6);
                const b = Math.round(darkPurple[2] + (purple[2] - darkPurple[2]) * ratio * 0.6);
                pdf.setFillColor(r, g, b);
                pdf.rect(ticketX, ticketY + i, ticketWidth, 1.2, 'F');
            }

            // nJoy branding
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('nJoy', ticketX + 12, ticketY + 16);
            pdf.setLineWidth(0.5);
            pdf.setDrawColor(255, 255, 255);
            pdf.line(ticketX + 12, ticketY + 19, ticketX + 35, ticketY + 19);

            // Genre badge (square)
            const genre = (evento.genero || 'EVENTO').toUpperCase();
            pdf.setFillColor(pink[0], pink[1], pink[2]);
            pdf.rect(ticketX + ticketWidth - 45, ticketY + 10, 35, 10, 'F');
            pdf.setFontSize(8);
            pdf.text(genre, ticketX + ticketWidth - 27.5, ticketY + 17, { align: 'center' });

            // Event name (centered)
            pdf.setFontSize(20);
            const eventName = evento.nombre.length > 24 ? evento.nombre.substring(0, 24) + '...' : evento.nombre;
            pdf.text(eventName, ticketX + ticketWidth / 2, ticketY + 45, { align: 'center' });

            // Date
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.text(formatDate(evento.fechayhora, false), ticketX + ticketWidth / 2, ticketY + 56, { align: 'center' });

            // Tear line with cutouts
            const tearY = ticketY + headerH + 8;
            pdf.setDrawColor(200, 200, 210);
            pdf.setLineDashPattern([3, 2], 0);
            pdf.line(ticketX + 12, tearY, ticketX + ticketWidth - 12, tearY);
            pdf.setLineDashPattern([], 0);

            // Semicircle cutouts
            pdf.setFillColor(248, 249, 252);
            pdf.circle(ticketX, tearY, 6, 'F');
            pdf.circle(ticketX + ticketWidth, tearY, 6, 'F');

            // Info section
            const infoY = tearY + 18;
            pdf.setTextColor(120, 120, 130);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.text('RECINTO', ticketX + 15, infoY);
            pdf.setTextColor(40, 40, 50);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            const venue = (evento.recinto || 'Por confirmar').substring(0, 22);
            pdf.text(venue, ticketX + 15, infoY + 7);

            pdf.setTextColor(120, 120, 130);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.text('PRECIO', ticketX + ticketWidth - 45, infoY);
            pdf.setTextColor(purple[0], purple[1], purple[2]);
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text(evento.precio ? `${evento.precio.toFixed(2)}€` : 'Gratis', ticketX + ticketWidth - 45, infoY + 8);

            // Attendee
            const attY = infoY + 22;
            pdf.setTextColor(120, 120, 130);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.text('ASISTENTE', ticketX + 15, attY);
            pdf.setTextColor(40, 40, 50);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text(nombre_asistente || 'Portador de la entrada', ticketX + 15, attY + 7);

            // Owner (propietario)
            const ownerY = attY + 20;
            pdf.setTextColor(120, 120, 130);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.text('PROPIETARIO', ticketX + 15, ownerY);
            pdf.setTextColor(40, 40, 50);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.text(propietario || 'Usuario nJoy', ticketX + 15, ownerY + 7);

            // QR Section background (square)
            const qrY = ownerY + 20;
            pdf.setFillColor(245, 246, 250);
            pdf.rect(ticketX + 20, qrY, ticketWidth - 40, 100, 'F');

            // QR Code
            const qrImageData = qrCanvas.toDataURL('image/png');
            const qrSize = 58;
            pdf.addImage(qrImageData, 'PNG', ticketX + (ticketWidth - qrSize) / 2, qrY + 8, qrSize, qrSize);

            // Ticket code
            pdf.setTextColor(40, 40, 50);
            pdf.setFontSize(12);
            pdf.setFont('courier', 'bold');
            pdf.text(safeCodigoTicket, ticketX + ticketWidth / 2, qrY + 75, { align: 'center' });



            // Footer
            const footY = ticketY + ticketHeight - 18;
            pdf.setTextColor(140, 140, 150);
            pdf.setFontSize(7);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Presenta este QR en la entrada del evento', ticketX + ticketWidth / 2, footY, { align: 'center' });
            pdf.text('web-njoy.vercel.app', ticketX + ticketWidth / 2, footY + 5, { align: 'center' });



            const safeEventName = evento.nombre.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-').substring(0, 25);
            pdf.save(`Entrada-${safeCodigoTicket}-${safeEventName}.pdf`);

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
                                    <span>{t('myTickets.viewQr')}</span>
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
                                        {t('myTickets.valid')}
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-times-circle"></i>
                                        {t('myTickets.used')}
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
                        {isGeneratingPdf ? t('common.generating') || 'Generating...' : t('myTickets.downloadPdf')}
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

            {/* Hidden QR Canvas for PDF generation (off-screen but rendered) */}
            <div ref={qrCanvasRef} style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <QRCodeCanvas
                    value={qrData}
                    size={400}
                    level="H"
                    includeMargin={false}
                />
            </div>

            {/* QR Code Modal for screen viewing */}
            {showQRModal && (
                <div className="qr-modal-overlay" onClick={() => setShowQRModal(false)}>
                    <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="qr-modal-close" onClick={() => setShowQRModal(false)}>
                            <i className="fa-solid fa-times"></i>
                        </button>
                        <h3>{t('myTickets.scanQr') || 'Scan your QR'}</h3>
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
