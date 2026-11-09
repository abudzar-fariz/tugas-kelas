import { api } from './client';
import type { AuthResponse, User } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'TEACHER' | 'STUDENT';
  className?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function register(payload: RegisterPayload): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/register', payload);
}

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/login', payload);
}

export function getMe(): Promise<{ user: User }> {
  return api.get<{ user: User }>('/auth/me');
}
