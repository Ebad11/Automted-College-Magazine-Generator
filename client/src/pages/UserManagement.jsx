import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Users, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';

const ROLE_COLORS = { student: '#6c63ff', faculty: '#f72585', lab_assistant: '#4cc9f0' };
const ROLE_LABELS = { student: 'Student', faculty: 'Faculty', lab_assistant: 'Lab Assistant' };

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = roleFilter ? `?role=${roleFilter}` : '';
      const res = await api.get(`/users${params}`);
      setUsers(res.data.users);
    } catch { toast.error('Failed to load users.'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [roleFilter]);

  const toggleActive = async (id, current) => {
    try {
      const res = await api.patch(`/users/${id}/status`, { isActive: !current });
      setUsers((prev) => prev.map((u) => u._id === id ? res.data.user : u));
      toast.success(`User ${!current ? 'activated' : 'deactivated'}.`);
    } catch { toast.error('Failed to update status.'); }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">👥 User Management</h1>
        <p className="page-subtitle">View and manage all registered users on the platform.</p>
      </motion.div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {['', 'student', 'faculty', 'lab_assistant'].map((r) => (
          <button key={r} id={`role-filter-${r || 'all'}`}
            onClick={() => setRoleFilter(r)}
            className={`btn btn-sm ${roleFilter === r ? 'btn-primary' : 'btn-secondary'}`}>
            {r ? ROLE_LABELS[r] : 'All Roles'}
          </button>
        ))}
        <button id="refresh-users" className="btn btn-secondary btn-sm" onClick={load} style={{ marginLeft: 'auto' }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}><div className="spinner" /></div>
      ) : users.length === 0 ? (
        <div className="glass-card empty-state">
          <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3>No users found</h3>
        </div>
      ) : (
        <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User</th><th>Role</th><th>Department</th><th>Roll No.</th><th>Joined</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: `${ROLE_COLORS[u.role] || '#666'}20`,
                          border: `2px solid ${ROLE_COLORS[u.role] || '#666'}40`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.85rem', color: ROLE_COLORS[u.role],
                        }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: ROLE_COLORS[u.role] }}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.department || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{u.rollNumber || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button id={`toggle-${u._id}`}
                        className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleActive(u._id, u.isActive)}>
                        {u.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default UserManagement;
