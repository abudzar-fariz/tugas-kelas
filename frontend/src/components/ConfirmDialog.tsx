interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Konfirmasi',
  isDestructive = false,
  isSubmitting = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div style={styles.overlay}>
      <div style={styles.dialog}>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.message}>{message}</p>

        <div style={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            style={styles.cancelBtn}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            style={{
              ...styles.confirmBtn,
              backgroundColor: isDestructive ? '#dc2626' : '#2563eb',
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 60,
    padding: '1rem',
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '380px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
  },
  title: { margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 700 },
  message: { margin: '0 0 1.5rem', color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.5 },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' },
  cancelBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  confirmBtn: {
    padding: '0.5rem 1rem',
    color: '#fff',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
} as const;
