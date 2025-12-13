import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import teamService from '../services/teamService';
import authService from '../services/authService';
import './Teams.css';

const Teams = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Data
    const [managedTeams, setManagedTeams] = useState([]);
    const [myTeams, setMyTeams] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null); // For details view

    // Forms
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const currentUser = authService.getUser();
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(currentUser);
        loadData(currentUser);
    };

    const loadData = async (currentUser) => {
        setLoading(true);
        setError(null);
        try {
            // Load Member Data
            const [teamsRes, invitesRes] = await Promise.all([
                teamService.getMyTeams(),
                teamService.getMyInvitations()
            ]);
            setMyTeams(teamsRes);
            setInvitations(invitesRes);

            // Load Manager Data if applicable
            if (['promotor', 'admin', 'owner'].includes(currentUser.role)) {
                const managedRes = await teamService.getManagedTeams();
                setManagedTeams(managedRes);
            }
        } catch (err) {
            console.error(err);
            setError("Error cargando datos de equipos");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            await teamService.createTeam(newTeamName);
            setShowCreateModal(false);
            setNewTeamName('');
            loadData(user); // Reload
        } catch (err) {
            alert(err.response?.data?.detail || "Error creando equipo");
        }
    };

    const handleViewDetails = async (teamId) => {
        try {
            const details = await teamService.getTeamDetails(teamId);
            setSelectedTeam(details);
        } catch (err) {
            alert("Error cargando detalles");
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            await teamService.inviteUser(selectedTeam.id, inviteEmail);
            setInviteEmail('');
            alert("Invitación enviada");
            handleViewDetails(selectedTeam.id); // Reload details
        } catch (err) {
            alert(err.response?.data?.detail || "Error enviando invitación");
        }
    };

    const handleRespond = async (inviteId, status) => {
        try {
            await teamService.respondInvitation(inviteId, status);
            loadData(user);
        } catch (err) {
            alert("Error respondiendo invitación");
        }
    };

    if (loading) return <div className="teams-page loading">Cargando...</div>;

    const isManager = ['promotor', 'admin', 'owner'].includes(user?.role);

    return (
        <div className="page-container">
            <div className="container">
                <header className="page-header center">
                    <h1>Gestión de Equipos</h1>
                    <p className="subtitle">Gestiona tus colaboradores y accesos de escaneo</p>
                </header>

                {/* --- SECCIÓN INVITACIONES (VISIBLE PARA TODOS) --- */}
                {invitations.length > 0 && (
                    <section className="section-spacing">
                        <h2>Invitaciones Pendientes</h2>
                        <div className="invitations-grid">
                            {invitations.map(inv => (
                                <div key={inv.id} className="invite-card">
                                    <div className="invite-info">
                                        <p>Te han invitado a unirte al equipo <strong>#{inv.team_id}</strong></p>
                                        <small>{new Date(inv.invited_at).toLocaleDateString()}</small>
                                    </div>
                                    <div className="invite-actions">
                                        <button onClick={() => handleRespond(inv.id, 'accepted')} className="btn btn-success">Aceptar</button>
                                        <button onClick={() => handleRespond(inv.id, 'rejected')} className="btn btn-danger">Rechazar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* --- SECCIÓN MIS EQUIPOS (MIEMBRO) --- */}
                <section className="section-spacing">
                    <h2>Mis Equipos (Escaneo)</h2>
                    {myTeams.length === 0 ? (
                        <p className="text-muted">No perteneces a ningún equipo.</p>
                    ) : (
                        <div className="teams-grid">
                            {myTeams.map(team => (
                                <div key={team.id} className="team-card">
                                    <h3>{team.name}</h3>
                                    <span className="badge badge-success">Miembro Activo</span>
                                    <p style={{ marginTop: '0.5rem' }}>Escanear QR</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <hr className="divider" />

                {/* --- SECCIÓN GESTIÓN (PROMOTOR) --- */}
                {isManager && (
                    <section className="section-spacing">
                        <div className="section-header">
                            <h2>Equipos Gestionados</h2>
                            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>+ Crear Equipo</button>
                        </div>

                        <div className="teams-grid">
                            {managedTeams.map(team => (
                                <div key={team.id} className="team-card">
                                    <div className="team-info">
                                        <h3>{team.name}</h3>
                                        <p>{team.member_count !== undefined ? `${team.member_count} miembros` : 'Gestionar'}</p>
                                    </div>
                                    <button className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%' }} onClick={() => handleViewDetails(team.id)}>Ver Detalles</button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* --- MODAL CREAR EQUIPO --- */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Crear Nuevo Equipo</h2>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreateTeam}>
                            <div className="form-group">
                                <label className="form-label">Nombre del Equipo</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Ej. Staff Wolf"
                                    value={newTeamName}
                                    onChange={e => setNewTeamName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Crear</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL DETALLES EQUIPO --- */}
            {selectedTeam && (
                <div className="modal-overlay" onClick={() => setSelectedTeam(null)}>
                    <div className="modal-content team-details" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedTeam.name}</h2>
                            <button className="modal-close" onClick={() => setSelectedTeam(null)}>×</button>
                        </div>

                        <div className="members-list">
                            <h3>Miembros</h3>
                            {selectedTeam.members.length === 0 ? (
                                <p className="text-muted">No hay miembros aún.</p>
                            ) : (
                                <ul>
                                    {selectedTeam.members.map(member => (
                                        <li key={member.id} className="member-item">
                                            <span>{member.user_email || `Usuario #${member.user_id}`}</span>
                                            <span className={`status-badge ${member.status}`}>{member.status}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="invite-form">
                            <h3>Invitar Miembro</h3>
                            <form onSubmit={handleInvite}>
                                <div className="form-group">
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="Email del usuario"
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>Invitar</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Teams;
