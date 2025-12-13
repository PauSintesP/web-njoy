import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService from '../services/authService';
import './LoginPage.css';

const LoginPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        const user = authService.getUser();
        if (user) {
            navigate('/');
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.login(formData.email, formData.password);

            // Emit login event for navbar to update
            window.dispatchEvent(new CustomEvent('auth-login', { detail: response.user }));

            // Reload the page to ensure all components update with user privileges
            window.location.reload();
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.detail || t('login.errorMessage') || 'Email o contraseña incorrectos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container card">
                <div className="login-header">
                    <h1>
                        <span className="text-gradient-primary">njoy</span>
                    </h1>
                    <p>{t('login.welcome') || 'Bienvenido de nuevo'}</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="badge badge-danger" style={{ padding: '1rem', width: '100%', marginBottom: '1rem', justifyContent: 'center' }}>
                            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '0.5rem' }}></i>
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            {t('login.email') || 'Email'}
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="tu@email.com"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            {t('login.password') || 'Contraseña'}
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                {t('login.loggingIn') || 'Iniciando sesión...'}
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-right-to-bracket"></i>
                                {t('login.submit') || 'Iniciar Sesión'}
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        {t('login.noAccount') || '¿No tienes cuenta?'}
                        {' '}
                        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                            {t('login.registerLink') || 'Regístrate aquí'}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
