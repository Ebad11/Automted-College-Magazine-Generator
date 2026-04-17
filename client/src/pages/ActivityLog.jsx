import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { Activity, RefreshCw, Shield, LogIn, FileCheck, FileX, BookOpen, Trash2, UserPlus } from 'lucide-react';

const ACTION_META = {
  USER_REGISTERED: { icon: UserPlus, color: '#06d6a0', label: 'Registered' },
  USER_LOGIN: { icon: LogIn, color: '#6c63ff', label: 'Login' },
  USER_LOGOUT: { icon: LogIn, color: '#9090b0', label: 'Logout' },
  ARTICLE_SUBMITTED: { icon: FileCheck, color: '#4cc9f0', label: 'Submitted' },
  ARTICLE_APPROVED: { icon: FileCheck, color: '#06d6a0', label: 'Approved' },
  ARTICLE_REJECTED: { icon: FileX, color: '#ef233c', label: 'Rejected' },
  ARTICLE_DELETED: { icon: Trash2, color: '#ffd166', label: 'Deleted' },
  MAGAZINE_GENERATED: { icon: BookOpen, color: '#f72585', label: 'Generated' },
  MAGAZINE_PUBLISHED: { icon: BookOpen, color: '#f72585', label: 'Published' },
  FILE_UPLOADED: { icon: Activity, color: '#4cc9f0', label: 'Upload' },
  PROFILE_UPDATED: { icon: Activity, color: '#9090b0', label: 'Profile' },
};

const SEVERITY_BADGE = {
  success: 'badge-success',
  info: 'badge-info',
  warning: 'badge-warning',
  error: 'badge-error',
};

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [severityFilter, setSeverityFilter] = useState('');
  const LIMIT = 20;

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: LIMIT });
      if (severityFilter) params.append('severity', severityFilter);
      const res = await api.get(`/activity?${params}`);
      setLogs(res.data.logs);
      setTotal(res.data.total);
      setPage(p);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(1); }, [severityFilter]);

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">🔐 Activity Log</h1>
        <p className="page-subtitle">Real-time audit trail of all platform actions — {total} events recorded.</p>
      </motion.div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {['', 'success', 'info', 'warning', 'error'].map((s) => (
          <button key={s} id={`sev-${s || 'all'}`}
            onClick={() => setSeverityFilter(s)}
            className={`btn btn-sm ${severityFilter === s ? 'btn-primary' : 'btn-secondary'}`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
        <button id="refresh-logs" className="btn btn-secondary btn-sm" onClick={() => load(1)} style={{ marginLeft: 'auto' }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}><div className="spinner" /></div>
      ) : logs.length === 0 ? (
        <div className="glass-card empty-state">
          <Shield size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3>No activity logs yet</h3>
        </div>
      ) : (
        <motion.div className="glass-card" style={{ padding: '1.5rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="timeline">
            {logs.map((log, i) => {
              const meta = ACTION_META[log.action] || { icon: Activity, color: '#9090b0', label: log.action };
              const Icon = meta.icon;
              return (
                <motion.div key={log._id} className="timeline-item"
                  initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                  <div className="timeline-dot" style={{ background: `${meta.color}18`, border: `2px solid ${meta.color}40` }}>
                    <Icon size={16} color={meta.color} />
                  </div>
                  <div className="timeline-content">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{log.userName}</span>
                          <span className={`badge ${SEVERITY_BADGE[log.severity] || 'badge-info'}`}>{meta.label}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{log.userRole?.replace('_', ' ')}</span>
                        </div>
                        {log.details && (
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{log.details}</div>
                        )}
                        {log.ipAddress && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            IP: {log.ipAddress}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {formatTime(log.createdAt)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => load(page - 1)} disabled={page === 1}>◀ Prev</button>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => load(page + 1)} disabled={page === totalPages}>Next ▶</button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ActivityLog;
