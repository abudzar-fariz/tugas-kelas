import { api } from './client';
import type { Task, PaginatedResponse } from '../types';

export interface TaskListParams {
  search?: string;
  status?: 'completed' | 'pending';
  page?: number;
  limit?: number;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  dueDate: string; // ISO 8601
  className: string;
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export function listTasks(params: TaskListParams = {}): Promise<PaginatedResponse<Task>> {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.status) qs.set('status', params.status);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return api.get<PaginatedResponse<Task>>(`/tasks${query}`);
}

export function getTask(id: string): Promise<{ data: Task }> {
  return api.get<{ data: Task }>(`/tasks/${id}`);
}

export function createTask(payload: CreateTaskPayload): Promise<{ data: Task }> {
  return api.post<{ data: Task }>('/tasks', payload);
}

export function updateTask(id: string, payload: UpdateTaskPayload): Promise<{ data: Task }> {
  return api.patch<{ data: Task }>(`/tasks/${id}`, payload);
}

export function deleteTask(id: string): Promise<void> {
  return api.delete<void>(`/tasks/${id}`);
}
