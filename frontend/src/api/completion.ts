import { api } from './client';

export function markComplete(taskId: string): Promise<void> {
  return api.put<void>(`/tasks/${taskId}/completion`);
}

export function unmarkComplete(taskId: string): Promise<void> {
  return api.delete<void>(`/tasks/${taskId}/completion`);
}
