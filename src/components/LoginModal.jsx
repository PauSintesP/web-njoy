import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import authService from '../services/authService';


const LoginModal = ({ isOpen, onClose, onLoginSuccess, onShowRegister }) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.login(email, password);
            console.log('Login successful:', response);

            // Clear form
            setEmail('');
            setPassword('');

            // Call success callback
            if (onLoginSuccess) {
                onLoginSuccess(response);
            }

            // Reload the page to ensure all components update with user privileges
            window.location.reload();
        } catch (err) {
            // Show specific error messages from the API
            const errorMessage = err.message || 'Error al iniciar sesión';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail('');
        setPassword('');
        setError('');
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="card-title">{t('login.title')}</h2>
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                </div>

                {error && (
                    <div className="badge badge-danger" style={{ display: 'flex', padding: '0.75rem', width: '100%', marginBottom: '1.5rem', gap: '0.5rem' }}>
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">{t('login.email')}</label>
                        <input
                            className="form-input"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('login.password')}</label>
                        <input
                            className="form-input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i> {t('common.loading')}
                                </>
                            ) : (
                                t('login.submit')
                            )}
                        </button>
                    </div>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {t('login.noAccount')} <a href="/register" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{t('login.register')}</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
