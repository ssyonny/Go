import type {
  OnlineUsersResponse,
  CreateRoomRequest,
  CreateRoomResponse,
  RoomListResponse,
  JoinRoomResponse,
  AutoMatchRequest,
  AutoMatchResponse,
  RoomStatusResponse,
  LeaderboardResponse,
} from '@baduk/shared';
import apiClient from './client';

export const lobbyApi = {
  async heartbeat(): Promise<void> {
    await apiClient.post('/lobby/heartbeat');
  },

  async getOnlineUsers(): Promise<OnlineUsersResponse> {
    const res = await apiClient.get('/lobby/online-users');
    return res.data.data;
  },

  async createRoom(data: CreateRoomRequest): Promise<CreateRoomResponse> {
    const res = await apiClient.post('/lobby/rooms', data);
    return res.data.data;
  },

  async listRooms(): Promise<RoomListResponse> {
    const res = await apiClient.get('/lobby/rooms');
    return res.data.data;
  },

  async joinRoom(roomId: string): Promise<JoinRoomResponse> {
    const res = await apiClient.post(`/lobby/rooms/${roomId}/join`);
    return res.data.data;
  },

  async autoMatch(data: AutoMatchRequest): Promise<AutoMatchResponse> {
    const res = await apiClient.post('/lobby/auto-match', data);
    return res.data.data;
  },

  async getRoomStatus(roomId: string): Promise<RoomStatusResponse> {
    const res = await apiClient.get(`/lobby/rooms/${roomId}`);
    return res.data.data;
  },

  async leaveRoom(roomId: string): Promise<void> {
    await apiClient.post(`/lobby/rooms/${roomId}/leave`);
  },

  async getLeaderboard(limit?: number, offset?: number): Promise<LeaderboardResponse> {
    const res = await apiClient.get('/leaderboard', { params: { limit, offset } });
    return res.data.data;
  },
};
