import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { BookMarked, RefreshCw, Eye, Trash2, FileText } from 'lucide-react';

const MyArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/articles?limit=50');
      setArticles(res.data.articles);
    } catch { toast.error('Failed to load articles.'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await api.delete(`/articles/${id}`);
      toast.success('Article deleted.');
      setArticles((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">📚 My Articles</h1>
        <p className="page-subtitle">Track all your submitted articles and their review status.</p>
      </motion.div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button id="refresh-articles" className="btn btn-secondary" onClick={load}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}><div className="spinner" /></div>
      ) : articles.length === 0 ? (
        <div className="glass-card empty-state">
          <BookMarked size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3>No articles yet</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Head over to Submit Article to share your work!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {articles.map((a, i) => (
            <motion.div key={a._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={20} color="var(--primary-light)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>{a.title}</h3>
                  <span className={`badge badge-${a.status === 'approved' ? 'approved' : a.status === 'rejected' ? 'rejected' : 'pending'}`}>
                    {a.status}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.75rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {a.content}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-info">{a.category}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.department}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  {a.tags?.length > 0 && <span style={{ fontSize: '0.78rem', color: 'var(--primary-light)' }}>#{a.tags.join(' #')}</span>}
                </div>
                {a.status === 'rejected' && a.reviewNote && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: 8, background: 'rgba(239,35,60,0.08)', border: '1px solid rgba(239,35,60,0.2)', fontSize: '0.82rem', color: 'var(--danger)' }}>
                    <strong>Review note:</strong> {a.reviewNote}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button id={`view-${a._id}`} className="btn btn-secondary btn-sm" onClick={() => setPreview(a)}><Eye size={14} /></button>
                <button id={`delete-${a._id}`} className="btn btn-danger btn-sm" onClick={() => handleDelete(a._id, a.title)}><Trash2 size={14} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card" style={{ maxWidth: 700, width: '100%', maxHeight: '80vh', overflow: 'auto', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>{preview.title}</h2>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span className={`badge badge-${preview.status === 'approved' ? 'approved' : preview.status === 'rejected' ? 'rejected' : 'pending'}`}>{preview.status}</span>
                    <span className="badge badge-info">{preview.category}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{preview.department}</span>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setPreview(null)}>✕</button>
              </div>
              <p style={{ lineHeight: '1.9', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{preview.content}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyArticles;
