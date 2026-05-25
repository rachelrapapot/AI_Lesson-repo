import { apiClient } from './api';
import type { User } from '../types';

interface AuthResponse {
  user: User;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  login: async (data: LoginPayload): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/login', data);
    return res.data.data;
  },

  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/register', data);
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me');
    return res.data.data;
  },
};
