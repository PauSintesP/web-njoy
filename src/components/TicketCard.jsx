import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import './TicketCard.css';

export default function TicketCard({ ticket }) {
    const ticketRef = useRef(null);
    const qrCanvasRef = useRef(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const { ticket_id, codigo_ticket, activado, nombre_asistente, evento } = ticket;

    // CRITICAL FIX: Ensure we have a valid code for QR generation
    // If codigo_ticket is missing (old tickets or API error), use ticket_id as fallback
    const safeCodigoTicket = codigo_ticket || `NJOY-TICKET-${ticket_id}`;

    console.log('DEBUG TicketCard:', { ticket_id, codigo_ticket, safeCodigoTicket });

    // OPTIMIZED: QR code contains ONLY the ticket code (not JSON)
    // This makes the QR much simpler and easier to scan
    const qrData = safeCodigoTicket;

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
            // Get QR canvas element to extract image data
            const qrCanvas = qrCanvasRef.current?.querySelector('canvas');
            if (!qrCanvas) {
                throw new Error('QR Canvas not found');
            }

            // Create PDF in A4 portrait
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pageWidth - (margin * 2);

            // Colors
            const primaryColor = [102, 126, 234]; // #667eea
            const accentColor = [236, 72, 153];   // #ec4899
            const darkColor = [30, 30, 50];
            const grayColor = [100, 100, 100];
            const lightGray = [240, 240, 240];

            // ================== HEADER WITH GRADIENT ====================
            // Draw gradient header background
            const headerHeight = 60;
            for (let i = 0; i < headerHeight; i++) {
                const ratio = i / headerHeight;
                const r = Math.round(primaryColor[0] + (accentColor[0] - primaryColor[0]) * ratio);
                const g = Math.round(primaryColor[1] + (accentColor[1] - primaryColor[1]) * ratio);
                const b = Math.round(primaryColor[2] + (accentColor[2] - primaryColor[2]) * ratio);
                pdf.setFillColor(r, g, b);
                pdf.rect(0, i * (headerHeight / headerHeight), pageWidth, 1.5, 'F');
            }

            // Event genre badge
            pdf.setFillColor(255, 255, 255);
            pdf.roundedRect(margin, 15, 50, 10, 5, 5, 'F');
            pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            const genre = evento.genero || 'EVENTO';
            pdf.text(genre.toUpperCase(), margin + 25, 22, { align: 'center' });

            // Event name
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(24);
            pdf.setFont('helvetica', 'bold');
            const eventName = evento.nombre.length > 35
                ? evento.nombre.substring(0, 35) + '...'
                : evento.nombre;
            pdf.text(eventName, margin, 48);

            // ================== EVENT INFO SECTION ====================
            let yPos = headerHeight + 20;

            // Info box background
            pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
            pdf.roundedRect(margin, yPos - 5, contentWidth, 55, 3, 3, 'F');

            // Date and Time
            pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.text('FECHA Y HORA', margin + 5, yPos + 5);
            pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.text(formatDate(evento.fechayhora, true), margin + 5, yPos + 13);

            // Venue
            pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.text('RECINTO', margin + contentWidth / 2, yPos + 5);
            pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            const recintoText = evento.recinto?.length > 30
                ? evento.recinto.substring(0, 30) + '...'
                : (evento.recinto || 'Por confirmar');
            pdf.text(recintoText, margin + contentWidth / 2, yPos + 13);

            // Attendee
            pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.text('ASISTENTE', margin + 5, yPos + 28);
            pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.text(nombre_asistente || 'Portador de la entrada', margin + 5, yPos + 36);

            // Price
            pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.text('PRECIO', margin + contentWidth / 2, yPos + 28);
            pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text(evento.precio ? `${evento.precio.toFixed(2)} €` : 'Gratis', margin + contentWidth / 2, yPos + 37);

            // ================== QR CODE SECTION ====================
            yPos += 70;

            // QR section background
            pdf.setDrawColor(200, 200, 200);
            pdf.setLineDashPattern([3, 3], 0);
            pdf.roundedRect(margin, yPos, contentWidth, 120, 3, 3, 'S');
            pdf.setLineDashPattern([], 0);

            // QR Code - get from canvas
            const qrImageData = qrCanvas.toDataURL('image/png');
            const qrSize = 70;
            const qrX = (pageWidth - qrSize) / 2;
            pdf.addImage(qrImageData, 'PNG', qrX, yPos + 10, qrSize, qrSize);

            // Ticket code
            pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
            pdf.setFontSize(16);
            pdf.setFont('courier', 'bold');
            pdf.text(safeCodigoTicket, pageWidth / 2, yPos + 90, { align: 'center' });

            // Status badge
            const statusY = yPos + 102;
            if (activado) {
                pdf.setFillColor(16, 185, 129);
                pdf.roundedRect((pageWidth - 60) / 2, statusY - 5, 60, 12, 3, 3, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold');
                pdf.text('✓ ENTRADA VÁLIDA', pageWidth / 2, statusY + 3, { align: 'center' });
            } else {
                pdf.setFillColor(239, 68, 68);
                pdf.roundedRect((pageWidth - 55) / 2, statusY - 5, 55, 12, 3, 3, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold');
                pdf.text('✗ ENTRADA USADA', pageWidth / 2, statusY + 3, { align: 'center' });
            }

            // ================== FOOTER ====================
            yPos += 135;

            // Separator line
            pdf.setDrawColor(200, 200, 200);
            pdf.setLineDashPattern([2, 2], 0);
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            pdf.setLineDashPattern([], 0);

            // Branding
            pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            const today = new Date().toLocaleDateString('es-ES');
            pdf.text(`Generado por nJoy • ${today} • web-njoy.vercel.app`, pageWidth / 2, yPos + 10, { align: 'center' });

            // Important note
            pdf.setFontSize(8);
            pdf.text('Presenta este código QR en la entrada del evento para acceder.', pageWidth / 2, yPos + 18, { align: 'center' });
            pdf.text('Esta entrada es personal e intransferible.', pageWidth / 2, yPos + 24, { align: 'center' });

            // Generate safe filename
            const safeEventName = evento.nombre.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-').substring(0, 30);
            const fileName = `Entrada-${safeCodigoTicket}-${safeEventName}.pdf`;

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
