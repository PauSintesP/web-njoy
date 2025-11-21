import React, { useState } from 'react';
import authService from '../services/authService';
import { mapUserToAPI } from '../utils/dataMapper';
import './RegisterModal.css';

const RegisterModal = ({ isOpen, onClose, onRegisterSuccess, onShowLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        country: ''
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

        setLoading(true);

        try {
            // Map frontend data to API format
            const userData = mapUserToAPI({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                dateOfBirth: formData.dateOfBirth,
                country: formData.country
            });

            const response = await authService.register(userData);
            console.log('Registration successful:', response);

            // Clear form
            setFormData({
                email: '',
                password: '',
                confirmPassword: '',
                firstName: '',
                lastName: '',
                dateOfBirth: '',
                country: ''
            });

            // Call success callback
            if (onRegisterSuccess) {
                onRegisterSuccess(response);
            }

            // Close modal
            onClose();

            // Optionally show login modal
            if (onShowLogin) {
                onShowLogin();
            }
        } catch (err) {
            setError(err.message || 'Error al registrarse');
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
            <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={handleClose}>&times;</button>

                <h2 className="modal-title">Join njoy</h2>
                <p className="modal-subtitle">Create your account to start booking</p>

                {error && (
                    <div className="error-message">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email *</label>
                        <input
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
                            <label>Nombre *</label>
                            <input
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
                            <label>Apellidos *</label>
                            <input
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
                            <label>Fecha de Nacimiento *</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>País *</label>
                            <input
                                type="text"
                                name="country"
                                placeholder="España"
                                value={formData.country}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Contraseña *</label>
                        <input
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
                        <label>Confirmar Contraseña *</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary full-width"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin"></i> Registrando...
                            </>
                        ) : (
                            'Crear Cuenta'
                        )}
                    </button>
                </form>

                <div className="modal-footer">
                    <p>¿Ya tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); onShowLogin && onShowLogin(); }}>Iniciar sesión</a></p>
                </div>
            </div>
        </div>
    );
};

export default RegisterModal;
