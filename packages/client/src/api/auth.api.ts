import type { AuthResponse, RegisterRequest, LoginRequest, User } from '@baduk/shared';
import apiClient from './client';

export const authApi = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await apiClient.post('/auth/register', data);
    return res.data.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await apiClient.post('/auth/login', data);
    return res.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getProfile(): Promise<User> {
    const res = await apiClient.get('/auth/profile');
    return res.data.data;
  },

  async checkUsername(username: string): Promise<boolean> {
    const res = await apiClient.get(`/auth/check-username/${username}`);
    return res.data.data.available;
  },

  async checkNickname(nickname: string): Promise<boolean> {
    const res = await apiClient.get(`/auth/check-nickname/${nickname}`);
    return res.data.data.available;
  },
};
