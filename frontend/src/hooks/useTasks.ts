import { useCallback, useEffect, useRef, useState } from 'react';
import * as tasksApi from '../api/tasks';
import type { Task, PaginationMeta } from '../types';
import type { TaskListParams } from '../api/tasks';

interface UseTasksState {
  tasks: Task[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
}

export function useTasks(params: TaskListParams = {}) {
  const [state, setState] = useState<UseTasksState>({
    tasks: [],
    meta: null,
    isLoading: true,
    error: null,
  });

  // Stable ref for params to avoid stale closure issues
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const fetchTasks = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const result = await tasksApi.listTasks(paramsRef.current);
      setState({ tasks: result.data, meta: result.meta, isLoading: false, error: null });
    } catch {
      setState((s) => ({ ...s, isLoading: false, error: 'Gagal memuat tugas. Coba lagi.' }));
    }
  }, []);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks, params.search, params.status, params.page, params.limit]);

  const createTask = useCallback(
    async (payload: tasksApi.CreateTaskPayload) => {
      const { data } = await tasksApi.createTask(payload);
      setState((s) => ({ ...s, tasks: [data, ...s.tasks] }));
      return data;
    },
    [],
  );

  const updateTask = useCallback(
    async (id: string, payload: tasksApi.UpdateTaskPayload) => {
      const { data } = await tasksApi.updateTask(id, payload);
      setState((s) => ({
        ...s,
        tasks: s.tasks.map((t) => (t.id === id ? data : t)),
      }));
      return data;
    },
    [],
  );

  const deleteTask = useCallback(async (id: string) => {
    await tasksApi.deleteTask(id);
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  }, []);

  return { ...state, refetch: fetchTasks, createTask, updateTask, deleteTask };
}
