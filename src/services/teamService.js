import api from './api';

const teamService = {
    createTeam: async (name) => {
        const response = await api.post('/teams/', { name });
        return response.data;
    },
    getManagedTeams: async () => {
        const response = await api.get('/teams/managed');
        return response.data;
    },
    getTeamDetails: async (id) => {
        const response = await api.get(`/teams/${id}`);
        return response.data;
    },
    inviteUser: async (teamId, email) => {
        const response = await api.post(`/teams/${teamId}/invite`, { email });
        return response.data;
    },
    getMyInvitations: async () => {
        const response = await api.get('/teams/my-invitations');
        return response.data;
    },
    respondInvitation: async (memberId, status) => {
        const response = await api.post(`/teams/invitations/${memberId}/respond`, null, {
            params: { status_update: status }
        });
        return response.data;
    },
    getMyTeams: async () => {
        const response = await api.get('/teams/my-teams');
        return response.data;
    }
};

export default teamService;
