import { useAuth } from '../hooks/useAuth';

export function TasksPage() {
  const { user, logout } = useAuth();

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Class Task Tracker</h1>
        <div style={styles.headerRight}>
          <span style={styles.userInfo}>
            {user?.name} ({user?.role === 'TEACHER' ? 'Guru' : `Siswa — ${user?.className}`})
          </span>
          <button onClick={logout} style={styles.logoutBtn}>
            Keluar
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {/* Task list akan diimplementasi di commit 10 dan 11 */}
        <p style={styles.placeholder}>Memuat daftar tugas...</p>
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f3f4f6' },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '1rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { margin: 0, fontSize: '1.25rem', fontWeight: 700 },
  headerRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  userInfo: { fontSize: '0.875rem', color: '#6b7280' },
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
  main: { maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' },
  placeholder: { color: '#9ca3af', textAlign: 'center' as const },
} as const;
