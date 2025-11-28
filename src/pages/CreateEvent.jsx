import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createEvent, getOrganizers, createOrGetGenre, createOrGetLocation } from '../services/api';
import authService from '../services/authService';
import LocationPicker from '../components/LocationPicker';
import './CreateEvent.css';

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
        categoria_precio: '',
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
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkAuth();
        loadOrganizers();
    }, []);

    const checkAuth = async () => {
        try {
            const user = await authService.getCurrentUser();
            setCurrentUser(user);
            
            if (user.role !== 'promotor') {
                setError('Solo los promotores pueden crear eventos');
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
            if (formData.categoria_precio) eventData.categoria_precio = formData.categoria_precio;
            if (formData.organizador_dni) eventData.organizador_dni = formData.organizador_dni;
            if (genreId) eventData.genero_id = genreId;
            if (formData.imagen) eventData.imagen = formData.imagen;

            await createEvent(eventData);
            
            setSuccess('¡Evento creado exitosamente!');
            
            // Clear form
            setFormData({
                nombre: '',
                descripcion: '',
                recinto: '',
                plazas: '',
                fechayhora: '',
                tipo: '',
                categoria_precio: '',
                organizador_dni: null,
                imagen: ''
            });
            setLocationData({ ciudad: '', latitud: null, longitud: null });
            setGenreText('');

            // Redirect after success
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            console.error('Error creating event:', err);
            setError(err.response?.data?.detail || err.message || 'Error al crear el evento');
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser || currentUser.role !== 'promotor') {
        return (
            <div className="create-event-page">
                <div className="access-denied">
                    <i className="fa-solid fa-lock"></i>
                    <h2>Acceso Denegado</h2>
                    <p>{error || 'Solo los promotores pueden acceder a esta página'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="create-event-page">
            <div className="create-event-container">
                <div className="page-header">
                    <button className="back-btn" onClick={() => navigate('/')}>
                        <i className="fa-solid fa-arrow-left"></i> Volver
                    </button>
                    <h1>
                        <i className="fa-solid fa-calendar-plus"></i>
                        Crear Nuevo Evento
                    </h1>
                    <p className="subtitle">Complete los detalles del evento</p>
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

                <form className="event-form" onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h3><i className="fa-solid fa-info-circle"></i> Información Básica</h3>
                        
                        <div className="form-group">
                            <label>Nombre del Evento *</label>
                            <input
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
                            <label>Descripción *</label>
                            <textarea
                                name="descripcion"
                                placeholder="Describe tu evento..."
                                value={formData.descripcion}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                rows="4"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3><i className="fa-solid fa-map-marker-alt"></i> Ubicación</h3>
                        
                        <div className="form-group">
                            <label>Localidad (opcional)</label>
                            <LocationPicker 
                                onLocationChange={(loc) => setLocationData(loc)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Recinto (opcional)</label>
                            <input
                                type="text"
                                name="recinto"
                                placeholder="ej. Estadio Nacional, Club XYZ..."
                                value={formData.recinto}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3><i className="fa-solid fa-calendar"></i> Detalles del Evento</h3>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Fecha y Hora (opcional)</label>
                                <input
                                    type="datetime-local"
                                    name="fechayhora"
                                    value={formData.fechayhora}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label>Capacidad (opcional)</label>
                                <input
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
                                <label>Tipo de Evento (opcional)</label>
                                <input
                                    type="text"
                                    name="tipo"
                                    placeholder="ej. Concierto, Festival, Conferencia..."
                                    value={formData.tipo}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label>Categoría de Precio (opcional)</label>
                                <input
                                    type="text"
                                    name="categoria_precio"
                                    placeholder="ej. General, VIP, Premium..."
                                    value={formData.categoria_precio}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Género Musical (opcional - escribe para crear nuevo)</label>
                                <input
                                    type="text"
                                    name="genero_text"
                                    placeholder="ej. Rock, Pop, Jazz, Electrónica..."
                                    value={genreText}
                                    onChange={(e) => setGenreText(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label>Organizador (opcional)</label>
                                <select
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
                            <label>URL de Imagen (opcional)</label>
                            <input
                                type="url"
                                name="imagen"
                                placeholder="https://ejemplo.com/imagen.jpg"
                                value={formData.imagen}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-actions">
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
    );
}
