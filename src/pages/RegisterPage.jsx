import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService from '../services/authService';
import './RegisterPage.css';

const RegisterPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        email: '',
        fecha_nacimiento: '',
        pais: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Redirect if already logged in
    useEffect(() => {
        const user = authService.getUser();
        if (user) {
            navigate('/');
        }
    }, [navigate]);

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;
        return Math.min(strength, 4);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Calculate password strength
        if (name === 'password') {
            setPasswordStrength(calculatePasswordStrength(value));
        }

        // Clear error when user starts typing
        if (error) setError('');
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

        const age = new Date().getFullYear() - new Date(formData.fecha_nacimiento).getFullYear();
        if (age < 13) {
            setError('Debes tener al menos 13 años para registrarte');
            return;
        }

        setLoading(true);

        try {
            // Prepare data for API
            const registerData = {
                nombre: formData.nombre,
                apellidos: formData.apellidos,
                email: formData.email,
                fecha_nacimiento: formData.fecha_nacimiento,
                pais: formData.pais || null,
                contrasena: formData.password
            };

            await authService.register(registerData);

            // Auto-login after successful registration
            const response = await authService.login(formData.email, formData.password);

            // Emit login event
            window.dispatchEvent(new CustomEvent('auth-login', { detail: response.user }));

            // Redirect to home
            navigate('/');
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.detail || 'Error al crear la cuenta. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrengthLabel = () => {
        const labels = ['Muy débil', 'Débil', 'Media', 'Fuerte', 'Muy fuerte'];
        return labels[passwordStrength];
    };

    const getPasswordStrengthColor = () => {
        const colors = ['#ef4444', '#f59e0b', '#eab308', '#10b981', '#059669'];
        return colors[passwordStrength];
    };

    return (
        <div className="register-page">
            <div className="register-container glass">
                <div className="register-header">
                    <h1>
                        <span className="logo-n">n</span>joy
                    </h1>
                    <p>{t('register.createAccount') || 'Crea tu cuenta'}</p>
                </div>

                <form onSubmit={handleSubmit} className="register-form">
                    {error && (
                        <div className="error-message">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            {error}
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="nombre">
                                <i className="fa-solid fa-user"></i>
                                {t('register.firstName') || 'Nombre'}
                            </label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="apellidos">
                                <i className="fa-solid fa-user"></i>
                                {t('register.lastName') || 'Apellidos'}
                            </label>
                            <input
                                type="text"
                                id="apellidos"
                                name="apellidos"
                                value={formData.apellidos}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">
                            <i className="fa-solid fa-envelope"></i>
                            {t('register.email') || 'Email'}
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="fecha_nacimiento">
                                <i className="fa-solid fa-calendar"></i>
                                {t('register.birthDate') || 'Fecha de Nacimiento'}
                            </label>
                            <input
                                type="date"
                                id="fecha_nacimiento"
                                name="fecha_nacimiento"
                                value={formData.fecha_nacimiento}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="pais">
                                <i className="fa-solid fa-globe"></i>
                                {t('register.country') || 'País'} (opcional)
                            </label>
                            <input
                                type="text"
                                id="pais"
                                name="pais"
                                value={formData.pais}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            <i className="fa-solid fa-lock"></i>
                            {t('register.password') || 'Contraseña'}
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                        {formData.password && (
                            <div className="password-strength">
                                <div
                                    className="strength-bar"
                                    style={{
                                        width: `${(passwordStrength + 1) * 20}%`,
                                        backgroundColor: getPasswordStrengthColor()
                                    }}
                                ></div>
                                <span style={{ color: getPasswordStrengthColor() }}>
                                    {getPasswordStrengthLabel()}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">
                            <i className="fa-solid fa-lock"></i>
                            {t('register.confirmPassword') || 'Confirmar Contraseña'}
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                {t('register.creating') || 'Creando cuenta...'}
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-user-plus"></i>
                                {t('register.submit') || 'Crear Cuenta'}
                            </>
                        )}
                    </button>
                </form>

                <div className="register-footer">
                    <p>
                        {t('register.hasAccount') || '¿Ya tienes cuenta?'}
                        {' '}
                        <Link to="/login" className="link-primary">
                            {t('register.loginLink') || 'Inicia sesión aquí'}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
