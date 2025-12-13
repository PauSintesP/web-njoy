import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { getCurrentUser, updateUser } from '../services/api';
import './Profile.css';

const Profile = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        email: '',
        fecha_nacimiento: '',
        pais: ''
    });

    useEffect(() => {
        // Redirect if not authenticated
        if (!authService.isAuthenticated()) {
            navigate('/');
            return;
        }

        fetchUserData();
    }, [navigate]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            setError(null);
            const userData = await getCurrentUser();
            setUser(userData);

            // Initialize form data
            setFormData({
                nombre: userData.nombre || '',
                apellidos: userData.apellidos || '',
                email: userData.email || '',
                fecha_nacimiento: userData.fecha_nacimiento || '',
                pais: userData.pais || ''
            });
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError(t('profile.errorLoading'));

            if (err.response?.status === 401) {
                authService.logout();
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.nombre.trim() || !formData.apellidos.trim()) {
            setError(t('profile.nameRequired'));
            return;
        }

        if (formData.email && !formData.email.includes('@')) {
            setError(t('profile.invalidEmail'));
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setSuccessMessage(null);

            // Update user data
            const updatedUser = await updateUser(user.id, formData);

            // Update local state and localStorage
            setUser(updatedUser);
            authService.setUser(updatedUser);

            setSuccessMessage(t('profile.updateSuccess'));
            setIsEditing(false);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.detail || t('profile.updateError'));
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form to current user data
        setFormData({
            nombre: user.nombre || '',
            apellidos: user.apellidos || '',
            email: user.email || '',
            fecha_nacimiento: user.fecha_nacimiento || '',
            pais: user.pais || ''
        });
        setIsEditing(false);
        setError(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return t('profile.notProvided');
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="profile-loading">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <p>{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="card profile-card-custom">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            <i className="fa-solid fa-user-circle"></i>
                        </div>
                        <h1 className="profile-name">
                            {user?.nombre} {user?.apellidos}
                        </h1>
                        <p className="profile-email">{user?.email}</p>
                        <p className="profile-member-since">
                            <i className="fa-regular fa-calendar" style={{ marginRight: '8px' }}></i>
                            {t('profile.memberSince')} {formatDate(user?.created_at)}
                        </p>
                    </div>

                    <div className="profile-content">
                        {successMessage && (
                            <div className="alert alert-success">
                                <i className="fa-solid fa-check-circle"></i>
                                {successMessage}
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-error">
                                <i className="fa-solid fa-circle-exclamation"></i>
                                {error}
                            </div>
                        )}

                        <div className="profile-section-header">
                            <h2 className="card-title" style={{ margin: 0 }}>{t('profile.personalInfo')}</h2>
                            {!isEditing && (
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <i className="fa-solid fa-pen"></i>
                                    {t('profile.edit')}
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="profile-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="nombre" className="form-label">
                                            {t('profile.firstName')} *
                                        </label>
                                        <input
                                            type="text"
                                            id="nombre"
                                            name="nombre"
                                            className="form-input"
                                            value={formData.nombre}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="apellidos" className="form-label">
                                            {t('profile.lastName')} *
                                        </label>
                                        <input
                                            type="text"
                                            id="apellidos"
                                            name="apellidos"
                                            className="form-input"
                                            value={formData.apellidos}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">
                                        {t('profile.email')}
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="form-input"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled
                                        style={{ opacity: 0.7, cursor: 'not-allowed' }}
                                    />
                                    <small className="form-hint">
                                        <i className="fa-solid fa-info-circle" style={{ marginRight: '4px' }}></i>
                                        {t('profile.emailNotEditable')}
                                    </small>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="fecha_nacimiento" className="form-label">
                                            {t('profile.birthDate')}
                                        </label>
                                        <input
                                            type="date"
                                            id="fecha_nacimiento"
                                            name="fecha_nacimiento"
                                            className="form-input"
                                            value={formData.fecha_nacimiento}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="pais" className="form-label">
                                            {t('profile.country')}
                                        </label>
                                        <input
                                            type="text"
                                            id="pais"
                                            name="pais"
                                            className="form-input"
                                            value={formData.pais}
                                            onChange={handleInputChange}
                                            placeholder={t('profile.countryPlaceholder')}
                                        />
                                    </div>
                                </div>

                                <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleCancel}
                                        disabled={saving}
                                    >
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <i className="fa-solid fa-spinner fa-spin"></i>
                                                {t('common.saving')}
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-save"></i>
                                                {t('common.save')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="profile-info">
                                <div className="form-row">
                                    <div className="info-item">
                                        <label className="form-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('profile.firstName')}</label>
                                        <p className="info-value">{user?.nombre || t('profile.notProvided')}</p>
                                    </div>
                                    <div className="info-item">
                                        <label className="form-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('profile.lastName')}</label>
                                        <p className="info-value">{user?.apellidos || t('profile.notProvided')}</p>
                                    </div>
                                </div>

                                <div className="info-item" style={{ marginTop: '1rem' }}>
                                    <label className="form-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('profile.email')}</label>
                                    <p className="info-value">{user?.email || t('profile.notProvided')}</p>
                                </div>

                                <div className="form-row" style={{ marginTop: '1rem' }}>
                                    <div className="info-item">
                                        <label className="form-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('profile.birthDate')}</label>
                                        <p className="info-value">{formatDate(user?.fecha_nacimiento)}</p>
                                    </div>
                                    <div className="info-item">
                                        <label className="form-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('profile.country')}</label>
                                        <p className="info-value">{user?.pais || t('profile.notProvided')}</p>
                                    </div>
                                </div>

                                <div className="info-item" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border)' }}>
                                    <label className="form-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('profile.accountStatus')}</label>
                                    <p>
                                        {user?.is_active ? (
                                            <span className="badge badge-success">
                                                <i className="fa-solid fa-check-circle" style={{ marginRight: '5px' }}></i>
                                                {t('profile.active')}
                                            </span>
                                        ) : (
                                            <span className="badge badge-danger">
                                                <i className="fa-solid fa-times-circle" style={{ marginRight: '5px' }}></i>
                                                {t('profile.inactive')}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
