import React, { useState } from 'react';

const CreateUserModal = ({ onSave, onClose }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        email: '',
        password: '',
        fecha_nacimiento: '',
        pais: '',
        role: 'user',
        is_active: true,
        is_banned: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Crear Nuevo Usuario</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                    <div className="form-group mb-4">
                        <label className="form-label">Nombre *</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">Apellidos *</label>
                        <input
                            type="text"
                            name="apellidos"
                            value={formData.apellidos}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">Contraseña *</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="6"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">Fecha de Nacimiento *</label>
                        <input
                            type="date"
                            name="fecha_nacimiento"
                            value={formData.fecha_nacimiento}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">País</label>
                        <input
                            type="text"
                            name="pais"
                            value={formData.pais}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">Rol *</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            className="form-select"
                        >
                            <option value="user">User</option>
                            <option value="promotor">Promotor</option>
                            <option value="scanner">Scanner</option>
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="flex gap-4 mb-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                            />
                            <span>Usuario Activo</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_banned"
                                checked={formData.is_banned}
                                onChange={handleChange}
                            />
                            <span>Usuario Baneado</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Crear Usuario
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUserModal;
