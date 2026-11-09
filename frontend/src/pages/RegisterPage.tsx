import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ApiError } from '../api/client';
import type { ApiErrorDetail } from '../types';

type Role = 'TEACHER' | 'STUDENT';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');
  const [className, setClassName] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ApiErrorDetail[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function getFieldError(field: string) {
    return fieldErrors.find((e) => e.field === field)?.message;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors([]);
    setIsSubmitting(true);

    try {
      await register({
        name,
        email,
        password,
        role,
        className: role === 'STUDENT' ? className : null,
      });
      navigate('/tasks', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details.length > 0) {
          setFieldErrors(err.details);
        } else {
          setError(err.message);
        }
      } else {
        setError('Terjadi kesalahan. Coba lagi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Daftar</h1>
        <p style={styles.subtitle}>Class Task Tracker</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div style={styles.field}>
            <label htmlFor="name" style={styles.label}>Nama Lengkap</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              disabled={isSubmitting}
            />
            {getFieldError('name') && <p style={styles.fieldError}>{getFieldError('name')}</p>}
          </div>

          {/* Email */}
          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              disabled={isSubmitting}
            />
            {getFieldError('email') && <p style={styles.fieldError}>{getFieldError('email')}</p>}
          </div>

          {/* Password */}
          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              disabled={isSubmitting}
            />
            <p style={styles.hint}>Minimal 8 karakter</p>
            {getFieldError('password') && <p style={styles.fieldError}>{getFieldError('password')}</p>}
          </div>

          {/* Role */}
          <div style={styles.field}>
            <label htmlFor="role" style={styles.label}>Peran</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              style={styles.input}
              disabled={isSubmitting}
            >
              <option value="STUDENT">Siswa</option>
              <option value="TEACHER">Guru</option>
            </select>
          </div>

          {/* className — hanya muncul untuk siswa */}
          {role === 'STUDENT' && (
            <div style={styles.field}>
              <label htmlFor="className" style={styles.label}>Nama Kelas</label>
              <input
                id="className"
                type="text"
                placeholder="Contoh: 10-A"
                required
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                style={styles.input}
                disabled={isSubmitting}
              />
              {getFieldError('className') && (
                <p style={styles.fieldError}>{getFieldError('className')}</p>
              )}
            </div>
          )}

          {/* General error */}
          {error && (
            <p role="alert" style={styles.error}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...styles.button,
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>

        <p style={styles.footer}>
          Sudah punya akun?{' '}
          <Link to="/login" style={styles.link}>
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: '1rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '2rem',
    width: '100%',
    maxWidth: '400px',
  },
  title: { margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700 },
  subtitle: { margin: '0 0 1.5rem', color: '#6b7280', fontSize: '0.875rem' },
  field: { marginBottom: '1rem' },
  label: {
    display: 'block',
    marginBottom: '0.25rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    boxSizing: 'border-box' as const,
    outline: 'none',
    backgroundColor: '#ffffff',
  },
  hint: { margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#9ca3af' },
  error: {
    color: '#dc2626',
    fontSize: '0.875rem',
    marginBottom: '1rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: '#fef2f2',
    borderRadius: '0.375rem',
    border: '1px solid #fecaca',
  },
  fieldError: {
    color: '#dc2626',
    fontSize: '0.75rem',
    margin: '0.25rem 0 0',
  },
  button: {
    width: '100%',
    padding: '0.625rem',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontWeight: 500,
    marginTop: '0.5rem',
  },
  footer: { marginTop: '1.5rem', textAlign: 'center' as const, fontSize: '0.875rem', color: '#6b7280' },
  link: { color: '#2563eb', textDecoration: 'none' },
} as const;
