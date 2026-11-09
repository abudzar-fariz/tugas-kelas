export type Role = 'TEACHER' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  className: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  className: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  teacher: { id: string; name: string; email: string };
  // Student-only fields
  isCompleted?: boolean;
  completedAt?: string;
  _count?: { taskCompletions: number };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details: ApiErrorDetail[];
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}
