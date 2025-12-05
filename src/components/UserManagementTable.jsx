import React from 'react';
import './UserManagementTable.css';

const UserManagementTable = ({ users, loading, onEdit, onDelete, onBan, onPromoteToOwner }) => {
    const getRoleColor = (role) => {
        const colors = {
            admin: '#dc3545',
            owner: '#ffc107',
            promotor: '#17a2b8',
            user: '#6c757d'
        };
        return colors[role] || '#6c757d';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando usuarios...</p>
            </div>
        );
    }

    if (!users || users.length === 0) {
        return (
            <div className="no-users">
                <p>No se encontraron usuarios</p>
            </div>
        );
    }

    return (
        <div className="table-container">
            <table className="users-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Creado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className={user.is_banned ? 'banned-row' : ''}>
                            <td>{user.id}</td>
                            <td>
                                {user.nombre} {user.apellidos}
                            </td>
                            <td>{user.email}</td>
                            <td>
                                <span
                                    className="role-badge"
                                    style={{ backgroundColor: getRoleColor(user.role) }}
                                >
                                    {user.role}
                                </span>
                            </td>
                            <td>
                                <div className="status-badges">
                                    {user.is_active ? (
                                        <span className="badge badge-success">Activo</span>
                                    ) : (
                                        <span className="badge badge-secondary">Inactivo</span>
                                    )}
                                    {user.is_banned && (
                                        <span className="badge badge-danger">Baneado</span>
                                    )}
                                </div>
                            </td>
                            <td>{new Date(user.created_at).toLocaleDateString()}</td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => onEdit(user)}
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>

                                    {user.role !== 'admin' && (
                                        <>
                                            <button
                                                className={`btn btn-sm ${user.is_banned ? 'btn-success' : 'btn-warning'}`}
                                                onClick={() => onBan(user.id, user.is_banned)}
                                                title={user.is_banned ? 'Desbanear' : 'Banear'}
                                            >
                                                {user.is_banned ? '✓' : '🚫'}
                                            </button>

                                            {user.role === 'user' && (
                                                <button
                                                    className="btn btn-sm btn-info"
                                                    onClick={() => onPromoteToOwner(user.id)}
                                                    title="Promover a Owner"
                                                >
                                                    👑
                                                </button>
                                            )}

                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => onDelete(user.id)}
                                                title="Eliminar"
                                            >
                                                🗑️
                                            </button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagementTable;
