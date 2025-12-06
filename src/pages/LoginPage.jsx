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

            // Redirect based on user role
            if (response.user.role === 'admin') {
                navigate('/admin');
            } else if (response.user.role === 'promotor') {
                navigate('/create-event');
            } else if (response.user.role === 'scanner') {
                navigate('/scanner');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.detail || t('login.errorMessage') || 'Email o contraseña incorrectos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container glass">
                <div className="login-header">
                    <h1>
                        <span className="logo-n">n</span>joy
                    </h1>
                    <p>{t('login.welcome') || 'Bienvenido de nuevo'}</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="error-message">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">
                            <i className="fa-solid fa-envelope"></i>
                            {t('login.email') || 'Email'}
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="tu@email.com"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            <i className="fa-solid fa-lock"></i>
                            {t('login.password') || 'Contraseña'}
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
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
                        <Link to="/register" className="link-primary">
                            {t('login.registerLink') || 'Regístrate aquí'}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
