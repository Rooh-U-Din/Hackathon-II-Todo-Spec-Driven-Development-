'use client';

import { useState, useCallback } from 'react';
import { api, ApiError } from '../lib/api';
import type { Task, TaskCreate, TaskUpdate, TaskListResponse, TaskResponse, Priority } from '../lib/types';

// Phase V: Filter options
export interface TaskFilters {
  completed?: boolean;
  priority?: Priority;
  tag_id?: string;
  due_before?: string;
  due_after?: string;
  search?: string;
  sort_by?: 'created_at' | 'due_at' | 'priority';
  sort_order?: 'asc' | 'desc';
}

interface UseTasksReturn {
  tasks: Task[];
  total: number;
  isLoading: boolean;
  error: string | null;
  fetchTasks: (filters?: TaskFilters, limit?: number, offset?: number) => Promise<void>;
  getTask: (id: string) => Promise<Task | null>;
  createTask: (data: TaskCreate) => Promise<Task | null>;
  updateTask: (id: string, data: TaskUpdate) => Promise<Task | null>;
  toggleTask: (id: string) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchTasks = useCallback(async (filters?: TaskFilters, limit = 50, offset = 0) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      // Phase V: Enhanced filtering
      if (filters?.completed !== undefined) params.set('completed', String(filters.completed));
      if (filters?.priority) params.set('priority', filters.priority);
      if (filters?.tag_id) params.set('tag_id', filters.tag_id);
      if (filters?.due_before) params.set('due_before', filters.due_before);
      if (filters?.due_after) params.set('due_after', filters.due_after);
      if (filters?.search) params.set('search', filters.search);
      if (filters?.sort_by) params.set('sort_by', filters.sort_by);
      if (filters?.sort_order) params.set('sort_order', filters.sort_order);

      params.set('limit', String(limit));
      params.set('offset', String(offset));

      const queryString = params.toString();
      const response = await api.get<TaskListResponse>(`/api/tasks?${queryString}`);
      setTasks(response.tasks);
      setTotal(response.total);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else {
        setError('Failed to fetch tasks');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTask = useCallback(async (id: string): Promise<Task | null> => {
    try {
      const task = await api.get<TaskResponse>(`/api/tasks/${id}`);
      return task;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else {
        setError('Failed to fetch task');
      }
      return null;
    }
  }, []);

  const createTask = useCallback(async (data: TaskCreate): Promise<Task | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const task = await api.post<TaskResponse>('/api/tasks', data);
      setTasks((prev) => [task, ...prev]);
      setTotal((prev) => prev + 1);
      return task;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else {
        setError('Failed to create task');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (id: string, data: TaskUpdate): Promise<Task | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const task = await api.put<TaskResponse>(`/api/tasks/${id}`, data);
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
      return task;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else {
        setError('Failed to update task');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleTask = useCallback(async (id: string): Promise<Task | null> => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_completed: !t.is_completed } : t))
    );

    try {
      const task = await api.post<TaskResponse>(`/api/tasks/${id}/toggle`);
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
      return task;
    } catch (err) {
      // Revert optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_completed: !t.is_completed } : t))
      );
      if (err instanceof ApiError) {
        setError(err.detail);
      } else {
        setError('Failed to toggle task');
      }
      return null;
    }
  }, []);

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setTotal((prev) => prev - 1);
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else {
        setError('Failed to delete task');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    tasks,
    total,
    isLoading,
    error,
    fetchTasks,
    getTask,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    clearError,
  };
}
