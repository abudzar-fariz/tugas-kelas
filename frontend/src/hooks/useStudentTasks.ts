import { useCallback, useEffect, useRef, useState } from 'react';
import * as tasksApi from '../api/tasks';
import * as completionApi from '../api/completion';
import type { Task, PaginationMeta } from '../types';

interface Params {
  search: string;
  status: '' | 'completed' | 'pending';
  page: number;
}

interface State {
  tasks: Task[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  togglingId: string | null;
}

const PAGE_LIMIT = 10;

export function useStudentTasks(params: Params) {
  const [state, setState] = useState<State>({
    tasks: [],
    meta: null,
    isLoading: true,
    error: null,
    togglingId: null,
  });

  const paramsRef = useRef(params);
  paramsRef.current = params;

  const fetchTasks = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const p = paramsRef.current;
      const result = await tasksApi.listTasks({
        search: p.search || undefined,
        status: p.status || undefined,
        page: p.page,
        limit: PAGE_LIMIT,
      });
      setState((s) => ({
        ...s,
        tasks: result.data,
        meta: result.meta,
        isLoading: false,
      }));
    } catch {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: 'Gagal memuat tugas. Coba lagi.',
      }));
    }
  }, []);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks, params.search, params.status, params.page]);

  const toggleCompletion = useCallback(async (task: Task) => {
    setState((s) => ({ ...s, togglingId: task.id }));
    try {
      if (task.isCompleted) {
        await completionApi.unmarkComplete(task.id);
      } else {
        await completionApi.markComplete(task.id);
      }
      // Update locally for instant feedback
      setState((s) => ({
        ...s,
        togglingId: null,
        tasks: s.tasks.map((t) =>
          t.id === task.id
            ? {
                ...t,
                isCompleted: !task.isCompleted,
                completedAt: !task.isCompleted ? new Date().toISOString() : undefined,
              }
            : t,
        ),
      }));

      // If filtering by status, re-fetch so the task disappears from filtered view
      if (paramsRef.current.status) {
        void fetchTasks();
      }
    } catch {
      setState((s) => ({ ...s, togglingId: null }));
    }
  }, [fetchTasks]);

  return { ...state, refetch: fetchTasks, toggleCompletion, pageLimit: PAGE_LIMIT };
}
