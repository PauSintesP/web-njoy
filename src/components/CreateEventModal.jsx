import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createEvent, getLocations, getGenres, getOrganizers } from '../services/api';
import LocationPicker from './LocationPicker';
import './CreateEventModal.css';

const CreateEventModal = ({ isOpen, onClose, onEventCreated }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        localidad_id: null,
        recinto: '',
        plazas: '',
        fechayhora: '',
        tipo: '',
        categoria_precio: '',
        organizador_dni: null,
        genero_id: null,
        imagen: ''
    });

    const [locationData, setLocationData] = useState({
        ciudad: '',
        latitud: null,
        longitud: null
    });
    const [genreText, setGenreText] = useState('');
    
    const [locations, setLocations] = useState([]);
    const [genres, setGenres] = useState([]);
    const [organizers, setOrganizers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadDependencies();
        }
    }, [isOpen]);

    const loadDependencies = async () => {
        setLoadingData(true);
        try {
            const [locs, gens, orgs] = await Promise.all([
                getLocations(),
                getGenres(),
                getOrganizers()
            ]);
            setLocations(locs);
            setGenres(gens);
            setOrganizers(orgs);
        } catch (err) {
            console.error("Error loading dependencies", err);
            setError("Error loading form data");
        } finally {
            setLoadingData(false);
        }
    };

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
        setLoading(true);

        try {
            // Crear género automáticamente si se especifica
            let genreId = null;
            if (genreText.trim()) {
                const { createOrGetGenre } = await import('../services/api');
                const genre = await createOrGetGenre(genreText.trim());
                genreId = genre.id;
            }

            // Crear localidad automáticamente si se especifica
            let locationId = null;
            if (locationData.ciudad && locationData.ciudad.trim()) {
                const { createOrGetLocation } = await import('../services/api');
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

            const response = await createEvent(eventData);
            console.log('Event created:', response);

            // Clear form
            setFormData({
                nombre: '',
                descripcion: '',
                localidad_id: null,
                recinto: '',
                plazas: '',
                fechayhora: '',
                tipo: '',
                categoria_precio: '',
                organizador_dni: null,
                genero_id: null,
                imagen: ''
            });
            setLocationData({ ciudad: '', latitud: null, longitud: null });
            setGenreText('');

            if (onEventCreated) {
                onEventCreated(response);
            }

            onClose();
        } catch (err) {
            console.error('Error creating event:', err);
            setError(err.response?.data?.detail || err.message || 'Error creating event');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError('');
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={handleClose}>&times;</button>

                <h2 className="modal-title">Create New Event</h2>

                {error && (
                    <div className="error-message">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                {loadingData ? (
                    <div className="loading-state">
                        <i className="fa-solid fa-spinner fa-spin"></i> Loading form data...
                    </div>
                ) : (
                    <form className="register-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Event Name *</label>
                            <input
                                type="text"
                                name="nombre"
                                placeholder="Summer Festival 2025"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Description *</label>
                            <textarea
                                name="descripcion"
                                placeholder="Describe your event..."
                                value={formData.descripcion}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Location (optional - write or select on map)</label>
                            <LocationPicker 
                                onLocationChange={(loc) => setLocationData(loc)}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Venue (optional)</label>
                                <input
                                    type="text"
                                    name="recinto"
                                    placeholder="Stadium, Club, etc."
                                    value={formData.recinto}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Date & Time (optional)</label>
                                <input
                                    type="datetime-local"
                                    name="fechayhora"
                                    value={formData.fechayhora}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label>Capacity (optional)</label>
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
                                <label>Type (optional)</label>
                                <input
                                    type="text"
                                    name="tipo"
                                    placeholder="Concert, Festival, etc."
                                    value={formData.tipo}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label>Price Category (optional)</label>
                                <input
                                    type="text"
                                    name="categoria_precio"
                                    placeholder="General, VIP, etc."
                                    value={formData.categoria_precio}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Genre (optional - write to create new)</label>
                                <input
                                    type="text"
                                    name="genero_text"
                                    placeholder="Rock, Pop, Jazz..."
                                    value={genreText}
                                    onChange={(e) => setGenreText(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label>Organizer (optional)</label>
                                <select
                                    name="organizador_dni"
                                    value={formData.organizador_dni || ''}
                                    onChange={handleChange}
                                    disabled={loading}
                                >
                                    <option value="">Select Organizer</option>
                                    {organizers.map(org => (
                                        <option key={org.dni} value={org.dni}>{org.ncompleto}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Image URL</label>
                            <input
                                type="text"
                                name="imagen"
                                placeholder="http://example.com/image.jpg"
                                value={formData.imagen}
                                onChange={handleChange}
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
                                    <i className="fa-solid fa-spinner fa-spin"></i> Creating...
                                </>
                            ) : (
                                'Create Event'
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CreateEventModal;
