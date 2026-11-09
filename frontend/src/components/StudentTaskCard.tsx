import type { Task } from '../types';

interface Props {
  task: Task;
  isToggling: boolean;
  onToggle: (task: Task) => void;
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

export function StudentTaskCard({ task, isToggling, onToggle }: Props) {
  const isCompleted = task.isCompleted === true;
  const isOverdue = !isCompleted && new Date(task.dueDate) < new Date();

  return (
    <div
      style={{
        ...styles.card,
        borderLeft: `4px solid ${isCompleted ? '#16a34a' : isOverdue ? '#dc2626' : '#d1d5db'}`,
        opacity: isToggling ? 0.7 : 1,
      }}
    >
      {/* Header */}
      <div style={styles.cardHeader}>
        <div style={styles.tags}>
          {isCompleted && <span style={styles.completedTag}>Selesai</span>}
          {isOverdue && <span style={styles.overdueTag}>Lewat Tenggat</span>}
          {!isCompleted && !isOverdue && <span style={styles.pendingTag}>Belum Selesai</span>}
        </div>
        <span style={styles.classTag}>{task.className}</span>
      </div>

      {/* Title & description */}
      <h3 style={styles.title}>{task.title}</h3>
      <p style={styles.desc}>{task.description}</p>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.dateBlock}>
          <span style={{ color: isOverdue && !isCompleted ? '#dc2626' : '#6b7280' }}>
            Tenggat: {formatDate(task.dueDate)}
          </span>
          {isCompleted && task.completedAt && (
            <span style={styles.completedAt}>
              Diselesaikan: {formatDate(task.completedAt)}
            </span>
          )}
        </div>

        <button
          onClick={() => onToggle(task)}
          disabled={isToggling}
          aria-label={isCompleted ? `Batalkan selesai ${task.title}` : `Tandai selesai ${task.title}`}
          style={{
            ...styles.toggleBtn,
            backgroundColor: isCompleted ? '#f0fdf4' : '#2563eb',
            color: isCompleted ? '#16a34a' : '#ffffff',
            border: isCompleted ? '1px solid #bbf7d0' : 'none',
            cursor: isToggling ? 'not-allowed' : 'pointer',
          }}
        >
          {isToggling
            ? '...'
            : isCompleted
            ? 'Batalkan'
            : 'Tandai Selesai'}
        </button>
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
    transition: 'opacity 0.15s',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
  },
  tags: { display: 'flex', gap: '0.375rem' },
  completedTag: {
    padding: '0.125rem 0.5rem',
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  overdueTag: {
    padding: '0.125rem 0.5rem',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  pendingTag: {
    padding: '0.125rem 0.5rem',
    backgroundColor: '#fefce8',
    color: '#ca8a04',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  classTag: {
    padding: '0.125rem 0.5rem',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  title: { margin: 0, fontSize: '1rem', fontWeight: 600, color: '#111827' },
  desc: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#6b7280',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: '0.75rem',
    marginTop: '0.25rem',
  },
  dateBlock: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.125rem',
    fontSize: '0.75rem',
  },
  completedAt: { color: '#16a34a' },
  toggleBtn: {
    padding: '0.375rem 0.875rem',
    borderRadius: '0.375rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    flexShrink: 0,
    transition: 'opacity 0.15s',
  },
} as const;
