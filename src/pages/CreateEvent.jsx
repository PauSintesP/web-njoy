import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createEvent, getOrganizers, createOrGetGenre, createOrGetLocation } from '../services/api';
import authService from '../services/authService';
import LocationPicker from '../components/LocationPicker';

export default function CreateEvent() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        recinto: '',
        plazas: '',
        fechayhora: '',
        tipo: '',
        precio: '', // Changed from categoria_precio to precio
        organizador_dni: null,
        imagen: ''
    });

    const [locationData, setLocationData] = useState({
        ciudad: '',
        latitud: null,
        longitud: null
    });
    const [genreText, setGenreText] = useState('');

    const [organizers, setOrganizers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkAuth();
        loadOrganizers();
        loadTeams();
    }, []);

    const checkAuth = async () => {
        try {
            const user = await authService.getCurrentUser();
            setCurrentUser(user);

            if (user.role !== 'promotor' && user.role !== 'admin') {
                setError('Solo los promotores y administradores pueden crear eventos');
                setTimeout(() => navigate('/'), 3000);
            }
        } catch (err) {
            setError('Debes iniciar sesión para acceder a esta página');
            setTimeout(() => navigate('/'), 3000);
        }
    };

    const loadOrganizers = async () => {
        try {
            const orgs = await getOrganizers();
            setOrganizers(orgs);
        } catch (err) {
            console.error("Error loading organizers:", err);
        }
    };

    const loadTeams = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://projecte-n-joy.vercel.app'}/teams/my-teams`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setTeams(data);
            }
        } catch (err) {
            console.error("Error loading teams:", err);
        }
    };

    const toggleTeam = (teamId) => {
        setSelectedTeams(prev =>
            prev.includes(teamId)
                ? prev.filter(id => id !== teamId)
                : [...prev, teamId]
        );
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // Crear género automáticamente si se especifica
            let genreId = null;
            if (genreText.trim()) {
                const genre = await createOrGetGenre(genreText.trim());
                genreId = genre.id;
            }

            // Crear localidad automáticamente si se especifica
            let locationId = null;
            if (locationData.ciudad && locationData.ciudad.trim()) {
                const location = await createOrGetLocation(
                    locationData.ciudad,
                    locationData.latitud,
                    locationData.longitud
                );
                locationId = location.id;
            }

            // Format data for API - solo campos con valores
            const eventData = {
                nombre: formData.nombre,
                descripcion: formData.descripcion
            };

            // Agregar campos opcionales solo si tienen valor
            if (locationId) eventData.localidad_id = locationId;
            if (formData.recinto) eventData.recinto = formData.recinto;
            if (formData.plazas) eventData.plazas = parseInt(formData.plazas);
            if (formData.fechayhora) eventData.fechayhora = new Date(formData.fechayhora).toISOString();
            if (formData.tipo) eventData.tipo = formData.tipo;
            if (formData.precio) eventData.precio = parseFloat(formData.precio); // Changed to precio as number
            if (formData.organizador_dni) eventData.organizador_dni = formData.organizador_dni;
            if (genreId) eventData.genero_id = genreId;
            if (formData.imagen) eventData.imagen = formData.imagen;

            // Create event with team assignments
            await createEvent(eventData, selectedTeams);

            setSuccess('¡Evento creado exitosamente!');

            // Clear form
            setFormData({
                nombre: '',
                descripcion: '',
                recinto: '',
                plazas: '',
                fechayhora: '',
                tipo: '',
                precio: '', // Changed from categoria_precio
                organizador_dni: null,
                imagen: ''
            });
            setLocationData({ ciudad: '', latitud: null, longitud: null });
            setGenreText('');


            // Redirect after success
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            console.error('Error creating event:', err);

            // Handle validation errors (422)
            if (err.response?.status === 422 && err.response?.data?.detail) {
                const details = err.response.data.detail;
                if (Array.isArray(details)) {
                    // Format Pydantic validation errors
                    const errorMessages = details.map(error => {
                        const field = error.loc?.slice(1).join('.') || 'Campo';
                        const msg = error.msg || 'Error de validación';
                        return `${field}: ${msg}`;
                    }).join(', ');
                    setError(errorMessages);
                } else if (typeof details === 'string') {
                    setError(details);
                } else {
                    setError('Error de validación. Por favor verifica los datos.');
                }
            } else {
                setError(err.response?.data?.detail || err.message || 'Error al crear el evento');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser || (currentUser.role !== 'promotor' && currentUser.role !== 'admin')) {
        return (
            <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div className="card" style={{ textAlign: 'center', maxWidth: '500px' }}>
                    <i className="fa-solid fa-lock" style={{ fontSize: '3rem', color: 'var(--error)', marginBottom: '1rem' }}></i>
                    <h2 className="card-title" style={{ justifyContent: 'center' }}>Acceso Denegado</h2>
                    <p>{error || 'Solo los promotores y administradores pueden acceder a esta página'}</p>
                    <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="container" style={{ maxWidth: '900px' }}>
                <div className="page-header center">
                    <button onClick={() => navigate('/')} className="btn btn-text back-button-floating">
                        <i className="fa-solid fa-arrow-left"></i> Volver
                    </button>
                    <h1>
                        <i className="fa-solid fa-calendar-plus" style={{ marginRight: '10px' }}></i>
                        Crear Nuevo Evento
                    </h1>
                    <p className="subtitle">Complete los detalles para publicar su evento</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        <i className="fa-solid fa-circle-check"></i>
                        <span>{success}</span>
                    </div>
                )}

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        {/* Básica */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 className="card-title" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                                <i className="fa-solid fa-info-circle" style={{ marginRight: '0.5rem', color: 'var(--primary)' }}></i>
                                Información Básica
                            </h3>

                            <div className="form-group">
                                <label className="form-label">Nombre del Evento *</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    name="nombre"
                                    placeholder="ej. Festival de Verano 2025"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Descripción *</label>
                                <textarea
                                    className="form-input"
                                    name="descripcion"
                                    placeholder="Describe tu evento..."
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    rows="4"
                                    style={{ resize: 'vertical' }}
                                />
                            </div>
                        </div>

                        {/* Ubicación */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 className="card-title" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                                <i className="fa-solid fa-map-marker-alt" style={{ marginRight: '0.5rem', color: 'var(--primary)' }}></i>
                                Ubicación
                            </h3>

                            <div className="form-group">
                                <label className="form-label">Localidad (opcional)</label>
                                <LocationPicker
                                    onLocationChange={(loc) => setLocationData(loc)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Recinto (opcional)</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    name="recinto"
                                    placeholder="ej. Estadio Nacional, Club XYZ..."
                                    value={formData.recinto}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Detalles */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 className="card-title" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                                <i className="fa-solid fa-calendar" style={{ marginRight: '0.5rem', color: 'var(--primary)' }}></i>
                                Detalles del Evento
                            </h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Fecha y Hora (opcional)</label>
                                    <input
                                        className="form-input"
                                        type="datetime-local"
                                        name="fechayhora"
                                        value={formData.fechayhora}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Capacidad (opcional)</label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        name="plazas"
                                        placeholder="1000"
                                        value={formData.plazas}
                                        onChange={handleChange}
                                        min="1"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Tipo de Evento (opcional)</label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        name="tipo"
                                        placeholder="ej. Concierto, Festival..."
                                        value={formData.tipo}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Precio (opcional)</label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        name="precio"
                                        placeholder="25.00"
                                        value={formData.precio}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Género Musical (opcional)</label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        name="genero_text"
                                        placeholder="ej. Rock, Pop, Jazz..."
                                        value={genreText}
                                        onChange={(e) => setGenreText(e.target.value)}
                                        disabled={loading}
                                    />
                                    <small className="form-hint">Escribe para crear uno nuevo si no existe</small>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Organizador (opcional)</label>
                                    <select
                                        className="form-select"
                                        name="organizador_dni"
                                        value={formData.organizador_dni || ''}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        <option value="">Seleccionar organizador</option>
                                        {organizers.map(org => (
                                            <option key={org.dni} value={org.dni}>{org.ncompleto}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">URL de Imagen (opcional)</label>
                                <input
                                    className="form-input"
                                    type="url"
                                    name="imagen"
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    value={formData.imagen}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Teams Section */}
                        {teams.length > 0 && (
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 className="card-title" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                                    <i className="fa-solid fa-user-group" style={{ marginRight: '0.5rem', color: 'var(--primary)' }}></i>
                                    Equipos Autorizados para Escanear
                                </h3>
                                <p className="form-hint" style={{ marginBottom: '1rem' }}>
                                    Selecciona los equipos cuyos miembros podrán escanear entradas de este evento
                                </p>

                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                    {teams.map(team => (
                                        <label
                                            key={team.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '1rem',
                                                background: selectedTeams.includes(team.id) ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-input)',
                                                border: `1px solid ${selectedTeams.includes(team.id) ? 'var(--primary)' : 'var(--border)'}`,
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedTeams.includes(team.id)}
                                                onChange={() => toggleTeam(team.id)}
                                                disabled={loading}
                                                style={{ marginRight: '0.75rem', width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                                                    {team.nombre_equipo}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                    <i className="fa-solid fa-users" style={{ marginRight: '0.25rem' }}></i>
                                                    {team.num_miembros || 0} miembros
                                                </div>
                                            </div>
                                            {selectedTeams.includes(team.id) && (
                                                <i className="fa-solid fa-check-circle" style={{ color: 'var(--primary)', fontSize: '1.2rem' }}></i>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate('/')}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin"></i> Creando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-check"></i> Crear Evento
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
