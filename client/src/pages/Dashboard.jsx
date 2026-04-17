import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { FileText, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CARD_COLORS = [
  { bg: 'rgba(108,99,255,0.12)', border: 'rgba(108,99,255,0.25)', icon: '#6c63ff', label: 'Total Articles' },
  { bg: 'rgba(255,209,102,0.12)', border: 'rgba(255,209,102,0.25)', icon: '#ffd166', label: 'Pending Review' },
  { bg: 'rgba(6,214,160,0.12)', border: 'rgba(6,214,160,0.25)', icon: '#06d6a0', label: 'Approved' },
  { bg: 'rgba(239,35,60,0.12)', border: 'rgba(239,35,60,0.25)', icon: '#ef233c', label: 'Rejected' },
];

const PIE_COLORS = ['#ffd166', '#06d6a0', '#ef233c'];

const StatCard = ({ label, value, icon: Icon, colors, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: colors.bg, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
    <div style={{ width: 52, height: 52, borderRadius: 14, background: `${colors.icon}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={24} color={colors.icon} />
    </div>
    <div>
      <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{label}</div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, deptBreakdown: [] });
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, articlesRes] = await Promise.all([
          api.get('/articles/stats/summary'),
          api.get('/articles?limit=5'),
        ]);
        setStats(statsRes.data.stats);
        setRecentArticles(articlesRes.data.articles);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  const statCards = [
    { label: 'Total Articles', value: stats.total, icon: FileText, colors: CARD_COLORS[0] },
    { label: 'Pending Review', value: stats.pending, icon: Clock, colors: CARD_COLORS[1] },
    { label: 'Approved', value: stats.approved, icon: CheckCircle, colors: CARD_COLORS[2] },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, colors: CARD_COLORS[3] },
  ];

  const pieData = [
    { name: 'Pending', value: stats.pending },
    { name: 'Approved', value: stats.approved },
    { name: 'Rejected', value: stats.rejected },
  ].filter((d) => d.value > 0);

  const barData = stats.deptBreakdown.map((d) => ({ name: d._id || 'N/A', count: d.count }));

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">
          {user.role === 'student' ? '📚 My Dashboard' : user.role === 'faculty' ? '🎓 Faculty Dashboard' : '🔬 Lab Dashboard'}
        </h1>
        <p className="page-subtitle">
          Welcome back, <strong>{user.name.split(' ')[0]}</strong>! Here's your overview.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {statCards.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.08} />)}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: recentArticles.length ? '1fr 1fr' : '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Pie Chart */}
        {pieData.length > 0 && (
          <motion.div className="glass-card" style={{ padding: '1.5rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <div style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="var(--primary-light)" /> Article Status
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={4}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {pieData.map((d, i) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: PIE_COLORS[i] }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bar Chart (faculty/lab only) */}
        {barData.length > 0 && (
          <motion.div className="glass-card" style={{ padding: '1.5rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <div style={{ fontWeight: 700, marginBottom: '1rem' }}>Articles by Department</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Recent Articles */}
      {recentArticles.length > 0 && (
        <motion.div className="glass-card" style={{ padding: '1.5rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>Recent Submissions</div>
          <div className="table-container">
            <table>
              <thead><tr>
                <th>Title</th><th>Category</th><th>Status</th><th>Date</th>
              </tr></thead>
              <tbody>
                {recentArticles.map((a) => (
                  <tr key={a._id}>
                    <td style={{ fontWeight: 500 }}>{a.title}</td>
                    <td><span className="badge badge-info">{a.category}</span></td>
                    <td><span className={`badge badge-${a.status === 'approved' ? 'approved' : a.status === 'rejected' ? 'rejected' : 'pending'}`}>{a.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {recentArticles.length === 0 && (
        <motion.div className="glass-card empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No articles yet</h3>
          <p style={{ fontSize: '0.9rem' }}>
            {user.role === 'student' ? 'Submit your first article to get started!' : 'No submissions from students yet.'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
