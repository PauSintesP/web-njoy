import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import authService from '../services/authService';
import { mapUserToAPI } from '../utils/dataMapper';


const RegisterModal = ({ isOpen, onClose, onRegisterSuccess, onShowLogin }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        country: '',
        role: 'user'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        // Validate minimum age (13 years)
        if (formData.dateOfBirth) {
            const birthDate = new Date(formData.dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age < 13) {
                setError('Debes tener al menos 13 años para registrarte');
                return;
            }
        }

        setLoading(true);

        try {
            const userData = mapUserToAPI({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                dateOfBirth: formData.dateOfBirth,
                country: formData.country || undefined, // Make it optional
                role: formData.role || 'user'
            });

            console.log('Sending registration data:', JSON.stringify(userData, null, 2));
            const response = await authService.register(userData);
            console.log('Registration successful:', response);

            // Save credentials before clearing form (needed for auto-login)
            const savedEmail = formData.email;
            const savedPassword = formData.password;

            // Clear form
            setFormData({
                email: '',
                password: '',
                confirmPassword: '',
                firstName: '',
                lastName: '',
                dateOfBirth: '',
                country: '',
                role: 'user'
            });

            // Call success callback
            if (onRegisterSuccess) {
                onRegisterSuccess(response);
            }

            // Auto-login after successful registration
            try {
                await authService.login(savedEmail, savedPassword);
                console.log('Auto-login successful after registration');

                // Reload the page to ensure all components update with user privileges
                window.location.reload();
            } catch (loginError) {
                console.warn('Auto-login failed, user will need to login manually:', loginError);
                // Still close the modal even if auto-login fails
                onClose();
            }

        } catch (err) {
            // Show specific error messages from the API
            const errorMessage = err.message || 'Error al registrarse';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            country: ''
        });
        setError('');
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="card-title">{t('register.title')}</h2>
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                </div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: '-1rem' }}>
                    Join njoy to experience the best events
                </p>

                {error && (
                    <div className="badge badge-danger" style={{ display: 'flex', padding: '0.75rem', width: '100%', marginBottom: '1.5rem', gap: '0.5rem' }}>
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">{t('register.email')} *</label>
                        <input
                            className="form-input"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">{t('register.name')} *</label>
                            <input
                                className="form-input"
                                type="text"
                                name="firstName"
                                placeholder="Juan"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Apellidos *</label>
                            <input
                                className="form-input"
                                type="text"
                                name="lastName"
                                placeholder="García"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Fecha de Nacimiento *</label>
                            <input
                                className="form-input"
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">País</label>
                            <input
                                className="form-input"
                                type="text"
                                name="country"
                                placeholder="España"
                                value={formData.country}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Tipo de Cuenta *</label>
                        <select
                            className="form-select"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        >
                            <option style={{ background: 'var(--bg-card)' }} value="user">Usuario (Asistir a eventos)</option>
                            <option style={{ background: 'var(--bg-card)' }} value="promotor">Promotor (Crear eventos)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('register.password')} *</label>
                        <input
                            className="form-input"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('register.confirmPassword')} *</label>
                        <input
                            className="form-input"
                            type="password"
                            name="confirmPassword"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
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
                                t('register.submit')
                            )}
                        </button>
                    </div>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {t('register.hasAccount')} <a href="#" style={{ color: 'var(--primary)', fontWeight: 'bold' }} onClick={(e) => { e.preventDefault(); onShowLogin && onShowLogin(); }}>{t('register.login')}</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterModal;
