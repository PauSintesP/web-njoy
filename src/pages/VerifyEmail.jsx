import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyEmailToken, resendVerificationEmail } from '../services/emailVerificationService';
import { CheckCircle, XCircle, Clock, Mail } from 'lucide-react';
import '../index.css';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
    const [message, setMessage] = useState('Verificando tu email...');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (token) {
            handleVerification();
        }
    }, [token]);

    const handleVerification = async () => {
        try {
            const result = await verifyEmailToken(token);

            if (result.success) {
                setStatus('success');
                setMessage(result.message);
                setEmail(result.email);
            }
        } catch (error) {
            if (error.detail?.includes('expirado')) {
                setStatus('expired');
                setMessage('El enlace de verificación ha expirado');
            } else {
                setStatus('error');
                setMessage(error.detail || 'Error al verificar el email');
            }
        }
    };

    const handleResend = async () => {
        if (!email) {
            alert('Email no disponible');
            return;
        }

        try {
            await resendVerificationEmail(email);
            alert('Email de verificación reenviado. Revisa tu bandeja de entrada.');
        } catch (error) {
            alert('Error al reenviar email: ' + (error.detail || 'Intenta de nuevo más tarde'));
        }
    };

    const handleGoToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="verify-email-container">
            <div className="verify-email-card">
                {/* Icon */}
                <div className="verify-icon">
                    {status === 'verifying' && <Clock size={64} className="icon-loading" />}
                    {status === 'success' && <CheckCircle size={64} className="icon-success" />}
                    {(status === 'error' || status === 'expired') && <XCircle size={64} className="icon-error" />}
                </div>

                {/* Title */}
                <h1 className="verify-title">
                    {status === 'verifying' && 'Verificando...'}
                    {status === 'success' && '¡Email Verificado!'}
                    {status === 'expired' && 'Enlace Expirado'}
                    {status === 'error' && 'Error de Verificación'}
                </h1>

                {/* Message */}
                <p className="verify-message">{message}</p>

                {/* Email if available */}
                {email && (
                    <p className="verify-email">
                        <Mail size={16} />
                        {email}
                    </p>
                )}

                {/* Actions */}
                <div className="verify-actions">
                    {status === 'success' && (
                        <button
                            className="btn-primary"
                            onClick={handleGoToLogin}
                        >
                            Ir al Login
                        </button>
                    )}

                    {status === 'expired' && email && (
                        <button
                            className="btn-secondary"
                            onClick={handleResend}
                        >
                            Reenviar Email
                        </button>
                    )}

                    {(status === 'error' || status === 'expired') && (
                        <button
                            className="btn-text"
                            onClick={() => navigate('/register')}
                        >
                            Volver al Registro
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
