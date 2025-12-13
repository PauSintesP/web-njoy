import React from 'react';

const UserManagementTable = ({ users, loading, onEdit, onDelete, onBan, onPromoteToOwner }) => {
    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'admin': return 'badge badge-danger';
            case 'owner': return 'badge badge-warning';
            case 'promotor': return 'badge badge-info';
            case 'user': return 'badge badge-secondary';
            default: return 'badge badge-secondary';
        }
    };

    if (loading) {
        return (
            <div className="flex-center p-4">
                <i className="fa-solid fa-spinner fa-spin text-2xl text-primary"></i>
                <p className="ml-2">Cargando usuarios...</p>
            </div>
        );
    }

    if (!users || users.length === 0) {
        return (
            <div className="text-center p-4 text-muted">
                <p>No se encontraron usuarios</p>
            </div>
        );
    }

    return (
        <div className="card overflow-x-auto">
            <table className="table">
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
                        <tr key={user.id} className={user.is_banned ? 'bg-error-light' : ''}>
                            <td>{user.id}</td>
                            <td>
                                {user.nombre} {user.apellidos}
                            </td>
                            <td>{user.email}</td>
                            <td>
                                <span className={getRoleBadgeClass(user.role)}>
                                    {user.role}
                                </span>
                            </td>
                            <td>
                                <div className="flex gap-2">
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
                                <div className="flex gap-2">
                                    <button
                                        className="btn btn-icon btn-secondary"
                                        onClick={() => onEdit(user)}
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>

                                    {user.role !== 'admin' && (
                                        <>
                                            <button
                                                className={`btn btn-icon ${user.is_banned ? 'btn-success' : 'btn-warning'}`}
                                                onClick={() => onBan(user.id, user.is_banned)}
                                                title={user.is_banned ? 'Desbanear' : 'Banear'}
                                            >
                                                {user.is_banned ? '✓' : '🚫'}
                                            </button>

                                            {user.role === 'user' && (
                                                <button
                                                    className="btn btn-icon btn-info"
                                                    onClick={() => onPromoteToOwner(user.id)}
                                                    title="Promover a Owner"
                                                >
                                                    👑
                                                </button>
                                            )}

                                            <button
                                                className="btn btn-icon btn-danger"
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
