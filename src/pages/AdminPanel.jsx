import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import adminService from '../services/adminService';
import UserManagementTable from '../components/UserManagementTable';
import EditUserModal from '../components/EditUserModal';
import CreateUserModal from '../components/CreateUserModal';


const AdminPanel = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        role: '',
        is_active: '',
        is_banned: ''
    });

    // Load statistics and users
    useEffect(() => {
        loadStatistics();
        loadUsers();
    }, []);

    // Reload users when filters change
    useEffect(() => {
        loadUsers();
    }, [filters]);

    const loadStatistics = async () => {
        try {
            const stats = await adminService.getStatistics();
            setStatistics(stats);
        } catch (err) {
            console.error('Error loading statistics:', err);
            setError('Error cargando estadísticas');
        }
    };

    const loadUsers = async () => {
        setLoading(true);
        try {
            const queryFilters = {
                ...filters,
                is_active: filters.is_active === '' ? undefined : filters.is_active === 'true',
                is_banned: filters.is_banned === '' ? undefined : filters.is_banned === 'true'
            };

            const usersData = await adminService.getAllUsers(queryFilters);
            setUsers(usersData);
            setError(null);
        } catch (err) {
            console.error('Error loading users:', err);
            setError('Error cargando usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleSaveEdit = async (updatedUser) => {
        try {
            await adminService.updateUser(selectedUser.id, updatedUser);
            setShowEditModal(false);
            loadUsers();
            loadStatistics();
        } catch (err) {
            console.error('Error updating user:', err);
            alert('Error actualizando usuario');
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            try {
                await adminService.deleteUser(userId);
                loadUsers();
                loadStatistics();
            } catch (err) {
                console.error('Error deleting user:', err);
                alert('Error eliminando usuario');
            }
        }
    };

    const handleBan = async (userId, isBanned) => {
        try {
            if (isBanned) {
                await adminService.unbanUser(userId);
            } else {
                await adminService.banUser(userId);
            }
            loadUsers();
            loadStatistics();
        } catch (err) {
            console.error('Error updating ban status:', err);
            alert('Error actualizando estado de baneo');
        }
    };

    const handlePromoteToOwner = async (userId) => {
        if (window.confirm('¿Promover este usuario a Owner?')) {
            try {
                await adminService.promoteToOwner(userId);
                loadUsers();
                loadStatistics();
            } catch (err) {
                console.error('Error promoting user:', err);
                alert('Error promoviendo usuario');
            }
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateUser = async (newUserData) => {
        try {
            await adminService.createUser(newUserData);
            setShowCreateModal(false);
            loadUsers();
            loadStatistics();
            alert('Usuario creado exitosamente');
        } catch (err) {
            console.error('Error creating user:', err);
            alert('Error creando usuario: ' + (err.response?.data?.detail || err.message));
        }
    };

    return (
        <div className="page-container">
            <div className="container">
                <div className="page-header center">
                    <h1>Panel de Administración</h1>
                    <p className="subtitle">Gestión de usuarios y estadísticas</p>
                </div>

                {/* Statistics Cards */}
                {statistics && (
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">👥</div>
                            <div className="stat-content">
                                <h3>{statistics.total_users}</h3>
                                <p>Usuarios Totales</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">✅</div>
                            <div className="stat-content">
                                <h3>{statistics.active_users}</h3>
                                <p>Activos</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">🚫</div>
                            <div className="stat-content">
                                <h3>{statistics.banned_users}</h3>
                                <p>Baneados</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">👑</div>
                            <div className="stat-content">
                                <h3>{statistics.owner_count}</h3>
                                <p>Owners</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <div className="form-row" style={{ alignItems: 'end', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ flex: 2, minWidth: '200px' }}>
                            <label className="form-label">Buscar</label>
                            <input
                                type="text"
                                name="search"
                                placeholder="Buscar por nombre o email..."
                                value={filters.search}
                                onChange={handleFilterChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                            <label className="form-label">Rol</label>
                            <select name="role" value={filters.role} onChange={handleFilterChange} className="form-select">
                                <option value="">Todos los roles</option>
                                <option value="user">User</option>
                                <option value="promotor">Promotor</option>
                                <option value="owner">Owner</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                            <label className="form-label">Estado</label>
                            <select name="is_active" value={filters.is_active} onChange={handleFilterChange} className="form-select">
                                <option value="">Todos los estados</option>
                                <option value="true">Activos</option>
                                <option value="false">Inactivos</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                            <label className="form-label">Baneo</label>
                            <select name="is_banned" value={filters.is_banned} onChange={handleFilterChange} className="form-select">
                                <option value="">Estado de baneo</option>
                                <option value="false">No baneados</option>
                                <option value="true">Baneados</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ minWidth: '150px' }}>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowCreateModal(true)}
                                style={{ width: '100%', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                ➕ Crear Usuario
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                {/* Users Table */}
                <UserManagementTable
                    users={users}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onBan={handleBan}
                    onPromoteToOwner={handlePromoteToOwner}
                />

                {/* Edit Modal */}
                {showEditModal && selectedUser && (
                    <EditUserModal
                        user={selectedUser}
                        onSave={handleSaveEdit}
                        onClose={() => setShowEditModal(false)}
                    />
                )}

                {/* Create Modal */}
                {showCreateModal && (
                    <CreateUserModal
                        onSave={handleCreateUser}
                        onClose={() => setShowCreateModal(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
