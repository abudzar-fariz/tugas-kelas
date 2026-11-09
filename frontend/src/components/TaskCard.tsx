import type { Task } from '../types';

interface TeacherCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TeacherTaskCard({ task, onEdit, onDelete }: TeacherCardProps) {
  const isOverdue = new Date(task.dueDate) < new Date();

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.cardMeta}>
          <span style={styles.classTag}>{task.className}</span>
          {isOverdue && <span style={styles.overdueTag}>Lewat Tenggat</span>}
        </div>
        <div style={styles.cardActions}>
          <button
            onClick={() => onEdit(task)}
            style={styles.editBtn}
            aria-label={`Edit tugas ${task.title}`}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task)}
            style={styles.deleteBtn}
            aria-label={`Hapus tugas ${task.title}`}
          >
            Hapus
          </button>
        </div>
      </div>

      <h3 style={styles.taskTitle}>{task.title}</h3>
      <p style={styles.taskDesc}>{task.description}</p>

      <div style={styles.cardFooter}>
        <span style={{ color: isOverdue ? '#dc2626' : '#6b7280' }}>
          Tenggat: {formatDate(task.dueDate)}
        </span>
        {task._count !== undefined && (
          <span style={styles.completionCount}>
            {task._count.taskCompletions} selesai
          </span>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  cardMeta: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const },
  classTag: {
    display: 'inline-block',
    padding: '0.125rem 0.5rem',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  overdueTag: {
    display: 'inline-block',
    padding: '0.125rem 0.5rem',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  cardActions: { display: 'flex', gap: '0.5rem', flexShrink: 0 },
  editBtn: {
    padding: '0.25rem 0.625rem',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#374151',
  },
  deleteBtn: {
    padding: '0.25rem 0.625rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#dc2626',
  },
  taskTitle: { margin: 0, fontSize: '1rem', fontWeight: 600, color: '#111827' },
  taskDesc: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#6b7280',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.75rem',
    marginTop: '0.25rem',
  },
  completionCount: {
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    padding: '0.125rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
} as const;
