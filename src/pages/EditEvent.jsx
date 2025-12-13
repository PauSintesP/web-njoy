import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEventById } from '../services/api';
import eventService from '../services/eventService';
import { createOrGetGenre, createOrGetLocation, getOrganizers } from '../services/api';
import authService from '../services/authService';
import LocationPicker from '../components/LocationPicker';

export default function EditEvent() {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        recinto: '',
        plazas: '',
        fechayhora: '',
        tipo: '',
        precio: '',
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

    useEffect(() => {
        checkAuth();
        loadEvent();
        loadOrganizers();
    }, [eventId]);

    const checkAuth = async () => {
        try {
            const user = await authService.getCurrentUser();
            setCurrentUser(user);

            if (user.role !== 'promotor' && user.role !== 'admin') {
                setError('Solo los promotores y administradores pueden editar eventos');
                setTimeout(() => navigate('/'), 3000);
            }
        } catch (err) {
            setError('Debes iniciar sesión para acceder a esta página');
            setTimeout(() => navigate('/login'), 3000);
        }
    };

    const loadEvent = async () => {
        try {
            setLoading(true);
            const event = await getEventById(eventId);

            // Format datetime for input
            let formattedDate = '';
            if (event.date) {
                const date = new Date(event.date);
                formattedDate = date.toISOString().slice(0, 16);
            }

            setFormData({
                nombre: event.name || '',
                descripcion: event.description || '',
                recinto: event.venue || '',
                plazas: event.capacity || '',
                fechayhora: formattedDate,
                tipo: event.type || '',
                precio: event.price || '',
                organizador_dni: event.organizador_dni || null,
                imagen: event.image || ''
            });

            if (event.location) {
                setLocationData({
                    ciudad: event.location,
                    latitud: null,
                    longitud: null
                });
            }
        } catch (err) {
            console.error('Error loading event:', err);
            setError('Error cargando el evento');
        } finally {
            setLoading(false);
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
        setSaving(true);

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

            // Format data for API
            const eventData = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                recinto: formData.recinto,
                plazas: parseInt(formData.plazas),
                fechayhora: new Date(formData.fechayhora).toISOString(),
                tipo: formData.tipo
            };

            // Add optional fields
            if (locationId) eventData.localidad_id = locationId;
            if (formData.precio) eventData.precio = parseFloat(formData.precio);
            if (formData.organizador_dni) eventData.organizador_dni = formData.organizador_dni;
            if (genreId) eventData.genero_id = genreId;
            if (formData.imagen) eventData.imagen = formData.imagen;

            await eventService.updateEvent(eventId, eventData);

            setSuccess('¡Evento actualizado exitosamente!');

            // Redirect after success
            setTimeout(() => navigate('/my-events'), 2000);
        } catch (err) {
            console.error('Error updating event:', err);

            // Handle validation errors (422)
            if (err.response?.status === 422 && err.response?.data?.detail) {
                const details = err.response.data.detail;
                if (Array.isArray(details)) {
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
            } else if (err.response?.status === 403) {
                setError('No tienes permiso para editar este evento');
            } else {
                setError(err.response?.data?.detail || err.message || 'Error al actualizar el evento');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="create-event-page">
                <div className="loading-container">
                    <div className="loader"></div>
                    <p>Cargando evento...</p>
                </div>
            </div>
        );
    }

    if (!currentUser || (currentUser.role !== 'promotor' && currentUser.role !== 'admin')) {
        return (
            <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div className="card" style={{ textAlign: 'center', maxWidth: '500px' }}>
                    <i className="fa-solid fa-lock" style={{ fontSize: '3rem', color: 'var(--error)', marginBottom: '1rem' }}></i>
                    <h2 className="card-title" style={{ justifyContent: 'center' }}>Acceso Denegado</h2>
                    <p>{error || 'Solo los promotores y administradores pueden editar eventos'}</p>
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
                    <button onClick={() => navigate('/my-events')} className="btn btn-text back-button-floating">
                        <i className="fa-solid fa-arrow-left"></i> Volver a Mis Eventos
                    </button>
                    <h1>
                        <i className="fa-solid fa-pen" style={{ marginRight: '10px' }}></i>
                        Editar Evento
                    </h1>
                    <p className="subtitle">Modifica los detalles del evento</p>
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
                                    disabled={saving}
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
                                    disabled={saving}
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
                                    initialCity={locationData.ciudad}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Recinto *</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    name="recinto"
                                    placeholder="ej. Estadio Nacional, Club XYZ..."
                                    value={formData.recinto}
                                    onChange={handleChange}
                                    required
                                    disabled={saving}
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
                                    <label className="form-label">Fecha y Hora *</label>
                                    <input
                                        className="form-input"
                                        type="datetime-local"
                                        name="fechayhora"
                                        value={formData.fechayhora}
                                        onChange={handleChange}
                                        required
                                        disabled={saving}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Capacidad *</label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        name="plazas"
                                        placeholder="1000"
                                        value={formData.plazas}
                                        onChange={handleChange}
                                        min="1"
                                        required
                                        disabled={saving}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Tipo de Evento *</label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        name="tipo"
                                        placeholder="ej. Concierto, Festival..."
                                        value={formData.tipo}
                                        onChange={handleChange}
                                        required
                                        disabled={saving}
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
                                        disabled={saving}
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
                                        disabled={saving}
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
                                        disabled={saving}
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
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate('/my-events')}
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin"></i> Guardando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-check"></i> Guardar Cambios
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
