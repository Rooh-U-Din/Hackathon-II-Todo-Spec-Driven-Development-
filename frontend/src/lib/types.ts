/**
 * TypeScript types matching the API schemas.
 */

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
}

export type TaskResponse = Task;

export interface TaskCreate {
  title: string;
  description?: string | null;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  is_completed?: boolean;
}

export interface UserCreate {
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface ErrorResponse {
  detail: string;
}
