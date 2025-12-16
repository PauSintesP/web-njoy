import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Shield } from 'lucide-react';
import '../index.css';

/**
 * Password Verification Modal
 * 
 * Secure modal to re-authenticate user before accessing sensitive event statistics
 * Follows nJoy design system with glassmorphism and smooth animations
 */
const PasswordVerificationModal = ({ isOpen, onClose, onVerify, eventName, loading, error }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password.trim()) {
            onVerify(password);
        }
    };

    const handleClose = () => {
        setPassword('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content password-verification-modal" onClick={(e) => e.stopPropagation()}>
                {/* Security Icon */}
                <div className="modal-icon-header">
                    <div className="security-icon-wrapper">
                        <Shield className="security-icon" size={48} />
                    </div>
                </div>

                {/* Header */}
                <div className="modal-header">
                    <h2 className="modal-title">
                        <Lock size={24} />
                        Verificación de Seguridad
                    </h2>
                </div>

                {/* Security Message */}
                <div className="security-message">
                    <p className="security-text">
                        Las estadísticas contienen información confidencial.
                        Por favor, confirma tu contraseña para continuar.
                    </p>
                    {eventName && (
                        <p className="event-name-display">
                            <strong>Evento:</strong> {eventName}
                        </p>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="password-verification-form">
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Contraseña
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                className="form-input password-input"
                                placeholder="Ingresa tu contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                autoFocus
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-error">
                            <i className="fa-solid fa-triangle-exclamation"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || !password.trim()}
                        >
                            {loading ? (
                                <>
                                    <div className="loading-spinner"></div>
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    <Lock size={18} />
                                    Verificar
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Privacy Notice */}
                <div className="privacy-notice">
                    <i className="fa-solid fa-shield-halved"></i>
                    <p>Tus estadísticas son privadas y solo visibles para ti</p>
                </div>
            </div>
        </div>
    );
};

export default PasswordVerificationModal;
