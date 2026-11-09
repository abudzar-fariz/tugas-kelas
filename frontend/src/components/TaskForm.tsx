import { useEffect, useState, type FormEvent } from 'react';
import type { Task } from '../types';
import { ApiError } from '../api/client';

export interface TaskFormValues {
  title: string;
  description: string;
  dueDate: string; // datetime-local value (YYYY-MM-DDTHH:mm)
  className: string;
}

interface Props {
  initial?: Task;
  isSubmitting: boolean;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onCancel: () => void;
}

function toLocalDatetime(iso: string): string {
  // Convert ISO string to value accepted by datetime-local input
  return iso.slice(0, 16);
}

export function TaskForm({ initial, isSubmitting, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<TaskFormValues>({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    dueDate: initial ? toLocalDatetime(initial.dueDate) : '',
    className: initial?.className ?? '',
  });
  const [errors, setErrors] = useState<Partial<TaskFormValues>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setValues({
        title: initial.title,
        description: initial.description,
        dueDate: toLocalDatetime(initial.dueDate),
        className: initial.className,
      });
    }
  }, [initial]);

  function validate(): boolean {
    const e: Partial<TaskFormValues> = {};
    if (!values.title.trim()) e.title = 'Judul wajib diisi';
    else if (values.title.length > 150) e.title = 'Judul maksimal 150 karakter';
    if (!values.description.trim()) e.description = 'Deskripsi wajib diisi';
    if (!values.dueDate) e.dueDate = 'Tenggat waktu wajib diisi';
    if (!values.className.trim()) e.className = 'Nama kelas wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;

    try {
      await onSubmit({
        ...values,
        dueDate: new Date(values.dueDate).toISOString(),
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError('Terjadi kesalahan. Coba lagi.');
      }
    }
  }

  function handleChange(field: keyof TaskFormValues) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
      setErrors((err) => ({ ...err, [field]: undefined }));
    };
  }

  const isEdit = !!initial;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>{isEdit ? 'Edit Tugas' : 'Tambah Tugas'}</h2>

        <form onSubmit={handleSubmit} noValidate>
          <Field label="Judul" error={errors.title}>
            <input
              type="text"
              value={values.title}
              onChange={handleChange('title')}
              style={inputStyle(!!errors.title)}
              disabled={isSubmitting}
              maxLength={150}
            />
          </Field>

          <Field label="Deskripsi" error={errors.description}>
            <textarea
              value={values.description}
              onChange={handleChange('description')}
              rows={3}
              style={{ ...inputStyle(!!errors.description), resize: 'vertical' }}
              disabled={isSubmitting}
            />
          </Field>

          <Field label="Tenggat Waktu" error={errors.dueDate}>
            <input
              type="datetime-local"
              value={values.dueDate}
              onChange={handleChange('dueDate')}
              style={inputStyle(!!errors.dueDate)}
              disabled={isSubmitting}
            />
          </Field>

          <Field label="Nama Kelas" error={errors.className}>
            <input
              type="text"
              placeholder="Contoh: 10-A"
              value={values.className}
              onChange={handleChange('className')}
              style={inputStyle(!!errors.className)}
              disabled={isSubmitting}
              maxLength={100}
            />
          </Field>

          {apiError && <p style={styles.apiError}>{apiError}</p>}

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
              type="submit"
              disabled={isSubmitting}
              style={{ ...styles.submitBtn, opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={styles.label}>{label}</label>
      {children}
      {error && <p style={styles.fieldError}>{error}</p>}
    </div>
  );
}

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: `1px solid ${hasError ? '#ef4444' : '#d1d5db'}`,
    borderRadius: '0.375rem',
    fontSize: '1rem',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#fff',
  };
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: '1rem',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '480px',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
  },
  title: { margin: '0 0 1.25rem', fontSize: '1.25rem', fontWeight: 700 },
  label: {
    display: 'block',
    marginBottom: '0.25rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
  },
  fieldError: { color: '#dc2626', fontSize: '0.75rem', margin: '0.25rem 0 0' },
  apiError: {
    color: '#dc2626',
    fontSize: '0.875rem',
    marginBottom: '1rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: '#fef2f2',
    borderRadius: '0.375rem',
    border: '1px solid #fecaca',
  },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' },
  cancelBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  submitBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
} as const;
