import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createEvent, getLocations, getGenres, getOrganizers } from '../services/api';
import './CreateEventModal.css';

const CreateEventModal = ({ isOpen, onClose, onEventCreated }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        localidad_id: '',
        recinto: '',
        plazas: '',
        fechayhora: '',
        tipo: '',
        categoria_precio: '',
        organizador_dni: '',
        genero_id: '',
        imagen: ''
    });

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
            // Format data for API
            const eventData = {
                ...formData,
                localidad_id: parseInt(formData.localidad_id),
                plazas: parseInt(formData.plazas),
                genero_id: parseInt(formData.genero_id),
                // Ensure date is in ISO format
                fechayhora: new Date(formData.fechayhora).toISOString()
            };

            const response = await createEvent(eventData);
            console.log('Event created:', response);

            // Clear form
            setFormData({
                nombre: '',
                descripcion: '',
                localidad_id: '',
                recinto: '',
                plazas: '',
                fechayhora: '',
                tipo: '',
                categoria_precio: '',
                organizador_dni: '',
                genero_id: '',
                imagen: ''
            });

            if (onEventCreated) {
                onEventCreated(response);
            }

            onClose();
        } catch (err) {
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

                        <div className="form-row">
                            <div className="form-group">
                                <label>Location *</label>
                                <select
                                    name="localidad_id"
                                    value={formData.localidad_id}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">Select Location</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.ciudad}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Venue *</label>
                                <input
                                    type="text"
                                    name="recinto"
                                    placeholder="Stadium, Club, etc."
                                    value={formData.recinto}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Date & Time *</label>
                                <input
                                    type="datetime-local"
                                    name="fechayhora"
                                    value={formData.fechayhora}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label>Capacity *</label>
                                <input
                                    type="number"
                                    name="plazas"
                                    placeholder="1000"
                                    value={formData.plazas}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Type *</label>
                                <input
                                    type="text"
                                    name="tipo"
                                    placeholder="Concert, Festival, etc."
                                    value={formData.tipo}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label>Price Category *</label>
                                <input
                                    type="text"
                                    name="categoria_precio"
                                    placeholder="General, VIP, etc."
                                    value={formData.categoria_precio}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Genre *</label>
                                <select
                                    name="genero_id"
                                    value={formData.genero_id}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">Select Genre</option>
                                    {genres.map(gen => (
                                        <option key={gen.id} value={gen.id}>{gen.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Organizer *</label>
                                <select
                                    name="organizador_dni"
                                    value={formData.organizador_dni}
                                    onChange={handleChange}
                                    required
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
