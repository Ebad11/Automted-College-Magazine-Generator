import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FileText, CheckSquare, BookOpen,
  Activity, Users, Info, LogOut, BookMarked, Star
} from 'lucide-react';

const NAV_BY_ROLE = {
  student: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/submit', icon: FileText, label: 'Submit Article' },
    { to: '/my-articles', icon: BookMarked, label: 'My Articles' },
    { to: '/about', icon: Info, label: 'About Team' },
  ],
  faculty: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/review', icon: CheckSquare, label: 'Review Articles' },
    { to: '/activity', icon: Activity, label: 'Activity Log' },
    { to: '/about', icon: Info, label: 'About Team' },
  ],
  lab_assistant: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/magazine', icon: BookOpen, label: 'Magazine Builder' },
    { to: '/review', icon: CheckSquare, label: 'All Articles' },
    { to: '/activity', icon: Activity, label: 'Activity Log' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/about', icon: Info, label: 'About Team' },
  ],
};

const ROLE_COLORS = {
  student: '#6c63ff',
  faculty: '#f72585',
  lab_assistant: '#4cc9f0',
};
const ROLE_LABELS = { student: 'Student', faculty: 'Faculty', lab_assistant: 'Lab Assistant' };

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const navItems = NAV_BY_ROLE[user.role] || [];
  const roleColor = ROLE_COLORS[user.role];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, var(--primary), var(--secondary))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Star size={18} color="#fff" fill="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em' }}>
              FCRIT Magazine
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Generator Platform</div>
          </div>
        </div>
      </div>

      {/* User Badge */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.75rem', borderRadius: 'var(--radius-md)',
          background: 'var(--bg-elevated)',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: `linear-gradient(135deg, ${roleColor}40, ${roleColor}20)`,
            border: `2px solid ${roleColor}60`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem', fontWeight: 700, color: roleColor,
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: roleColor, fontWeight: 600 }}>
              {ROLE_LABELS[user.role]}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--border)' }}>
        <button className="nav-item" onClick={handleLogout} style={{ width: '100%', color: 'var(--danger)' }}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
