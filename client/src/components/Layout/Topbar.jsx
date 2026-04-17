import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROLE_LABELS = { student: 'Student', faculty: 'Faculty', lab_assistant: 'Lab Assistant' };
const ROLE_COLORS = { student: '#6c63ff', faculty: '#f72585', lab_assistant: '#4cc9f0' };

const Topbar = ({ title = '' }) => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          padding: '0.35rem 0.9rem',
          borderRadius: '100px',
          background: `${ROLE_COLORS[user.role]}18`,
          border: `1px solid ${ROLE_COLORS[user.role]}40`,
          color: ROLE_COLORS[user.role],
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {ROLE_LABELS[user.role]}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontSize: '0.875rem', color: 'var(--text-secondary)',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: `${ROLE_COLORS[user.role]}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.85rem', color: ROLE_COLORS[user.role],
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontWeight: 500 }}>{user.name.split(' ')[0]}</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
