import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { TeacherTaskCard } from '../components/TaskCard';
import { TaskForm, type TaskFormValues } from '../components/TaskForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { Task } from '../types';

// Teacher-specific task management view
function TeacherView() {
  const { tasks, meta, isLoading, error, refetch, createTask, updateTask, deleteTask } =
    useTasks();

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // Debounced search — update search state on Enter or button click
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  async function handleFormSubmit(values: TaskFormValues) {
    setIsSubmitting(true);
    setMutationError(null);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, values);
      } else {
        await createTask(values);
      }
      setShowForm(false);
      setEditingTask(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingTask) return;
    setIsSubmitting(true);
    try {
      await deleteTask(deletingTask.id);
      setDeletingTask(null);
    } catch {
      setMutationError('Gagal menghapus tugas. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Filter tasks by current search locally for instant feedback
  // (server-side search already applied via useTasks params)
  const displayedTasks = search
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase()),
      )
    : tasks;

  return (
    <>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="search"
            placeholder="Cari tugas..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={styles.searchInput}
            aria-label="Cari tugas"
          />
          <button type="submit" style={styles.searchBtn}>Cari</button>
        </form>
        <button
          onClick={() => { setEditingTask(null); setShowForm(true); }}
          style={styles.addBtn}
        >
          + Tambah Tugas
        </button>
      </div>

      {/* Error banner */}
      {(error || mutationError) && (
        <div style={styles.errorBanner} role="alert">
          <p style={{ margin: 0 }}>{error ?? mutationError}</p>
          <button onClick={refetch} style={styles.retryBtn}>Coba Lagi</button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div style={styles.stateBox}>
          <p style={styles.stateText}>Memuat tugas...</p>
        </div>
      ) : displayedTasks.length === 0 ? (
        <div style={styles.stateBox}>
          <p style={styles.stateText}>
            {search ? `Tidak ada tugas yang cocok dengan "${search}".` : 'Belum ada tugas. Klik "+ Tambah Tugas" untuk mulai.'}
          </p>
        </div>
      ) : (
        <>
          <div style={styles.grid}>
            {displayedTasks.map((task) => (
              <TeacherTaskCard
                key={task.id}
                task={task}
                onEdit={(t) => { setEditingTask(t); setShowForm(true); }}
                onDelete={(t) => setDeletingTask(t)}
              />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <p style={styles.paginationHint}>
              Menampilkan {tasks.length} dari {meta.total} tugas
            </p>
          )}
        </>
      )}

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          initial={editingTask ?? undefined}
          isSubmitting={isSubmitting}
          onSubmit={handleFormSubmit}
          onCancel={() => { setShowForm(false); setEditingTask(null); }}
        />
      )}

      {/* Delete Confirm Dialog */}
      {deletingTask && (
        <ConfirmDialog
          title="Hapus Tugas"
          message={`Yakin ingin menghapus tugas "${deletingTask.title}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmLabel="Hapus"
          isDestructive
          isSubmitting={isSubmitting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingTask(null)}
        />
      )}
    </>
  );
}

export function TasksPage() {
  const { user, logout } = useAuth();
  const isTeacher = user?.role === 'TEACHER';

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Class Task Tracker</h1>
        <div style={styles.headerRight}>
          <span style={styles.userInfo}>
            {user?.name}
            <span style={styles.roleBadge}>
              {isTeacher ? 'Guru' : `Siswa — ${user?.className}`}
            </span>
          </span>
          <button onClick={logout} style={styles.logoutBtn}>Keluar</button>
        </div>
      </header>

      <main style={styles.main}>
        {isTeacher ? (
          <TeacherView />
        ) : (
          // Student view akan diimplementasi di commit 11
          <div style={styles.stateBox}>
            <p style={styles.stateText}>Tampilan siswa akan tersedia segera.</p>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f3f4f6' },
  header: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb',
    padding: '0.875rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky' as const,
    top: 0,
    zIndex: 40,
  },
  headerTitle: { margin: 0, fontSize: '1.125rem', fontWeight: 700 },
  headerRight: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  userInfo: { fontSize: '0.875rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  roleBadge: {
    display: 'inline-block',
    padding: '0.125rem 0.5rem',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  logoutBtn: {
    padding: '0.375rem 0.75rem',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  main: { maxWidth: '900px', margin: '0 auto', padding: '1.5rem 1rem' },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.25rem',
    flexWrap: 'wrap' as const,
  },
  searchForm: { display: 'flex', gap: '0.5rem', flex: 1, minWidth: '200px' },
  searchInput: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    outline: 'none',
  },
  searchBtn: {
    padding: '0.5rem 0.875rem',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
  },
  addBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    whiteSpace: 'nowrap' as const,
  },
  errorBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    color: '#dc2626',
    fontSize: '0.875rem',
  },
  retryBtn: {
    padding: '0.25rem 0.625rem',
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.75rem',
    flexShrink: 0,
  },
  stateBox: {
    padding: '3rem',
    textAlign: 'center' as const,
    backgroundColor: '#fff',
    borderRadius: '0.5rem',
    border: '1px solid #e5e7eb',
  },
  stateText: { color: '#9ca3af', margin: 0 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
  },
  paginationHint: {
    textAlign: 'center' as const,
    color: '#9ca3af',
    fontSize: '0.875rem',
    marginTop: '1rem',
  },
} as const;
