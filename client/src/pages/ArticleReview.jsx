import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Eye, Filter, RefreshCw } from 'lucide-react';

const ArticleReview = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [reviewing, setReviewing] = useState(null); // { article, action }
  const [reviewNote, setReviewNote] = useState('');
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/articles?status=${filter}&limit=50`);
      setArticles(res.data.articles);
    } catch { toast.error('Failed to load articles.'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const handleReview = async () => {
    if (!reviewing) return;
    setSubmitting(true);
    try {
      const res = await api.patch(`/articles/${reviewing.article._id}/review`, {
        status: reviewing.action, reviewNote,
      });
      toast.success(`Article ${reviewing.action}!`);
      setArticles((prev) => prev.filter((a) => a._id !== reviewing.article._id));
      setReviewing(null);
      setReviewNote('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed.');
    }
    setSubmitting(false);
  };

  const STATUS_TABS = ['pending', 'approved', 'rejected'];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">📋 Article Review</h1>
        <p className="page-subtitle">Review, approve, or reject student submissions.</p>
      </motion.div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        {STATUS_TABS.map((s) => (
          <button key={s} id={`filter-${s}`}
            onClick={() => setFilter(s)}
            className={`btn ${filter === s ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ textTransform: 'capitalize' }}>
            {s}
          </button>
        ))}
        <button id="refresh-review" className="btn btn-secondary btn-sm" onClick={load} style={{ marginLeft: 'auto' }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}><div className="spinner" /></div>
      ) : articles.length === 0 ? (
        <div className="glass-card empty-state">
          <CheckCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3>No {filter} articles</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>All caught up!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {articles.map((a, i) => (
            <motion.div key={a._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{a.title}</h3>
                    <span className={`badge badge-${a.status === 'approved' ? 'approved' : a.status === 'rejected' ? 'rejected' : 'pending'}`}>{a.status}</span>
                    <span className="badge badge-info">{a.category}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: '0.75rem' }}>
                    {a.content}
                  </p>
                  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>👤 {a.author?.name}</span>
                    <span>🏛 {a.department}</span>
                    {a.author?.rollNumber && <span>🆔 {a.author.rollNumber}</span>}
                    <span>📅 {new Date(a.createdAt).toLocaleDateString('en-IN')}</span>
                    {a.images?.length > 0 && <span>🖼 {a.images.length} image(s)</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <button id={`preview-${a._id}`} className="btn btn-secondary btn-sm" onClick={() => setPreview(a)}><Eye size={14} /> Preview</button>
                  {filter === 'pending' && (
                    <>
                      <button id={`approve-${a._id}`} className="btn btn-success btn-sm"
                        onClick={() => { setReviewing({ article: a, action: 'approved' }); setReviewNote(''); }}>
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button id={`reject-${a._id}`} className="btn btn-danger btn-sm"
                        onClick={() => { setReviewing({ article: a, action: 'rejected' }); setReviewNote(''); }}>
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {reviewing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass-card" style={{ maxWidth: 500, width: '100%', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {reviewing.action === 'approved' ? '✅ Approve Article' : '❌ Reject Article'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                "{reviewing.article.title}"
              </p>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Review Note (optional)</label>
                <textarea id="review-note" value={reviewNote} onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={reviewing.action === 'rejected' ? 'Please explain why the article is rejected...' : 'Add feedback for the student...'}
                  rows={4} style={{ resize: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button id="cancel-review" className="btn btn-secondary" onClick={() => setReviewing(null)}>Cancel</button>
                <button id="confirm-review" className={`btn ${reviewing.action === 'approved' ? 'btn-success' : 'btn-danger'}`}
                  onClick={handleReview} disabled={submitting}>
                  {submitting ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : `Confirm ${reviewing.action === 'approved' ? 'Approval' : 'Rejection'}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card" style={{ maxWidth: 700, width: '100%', maxHeight: '80vh', overflow: 'auto', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>{preview.title}</h2>
                  <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    <span>By {preview.author?.name}</span>
                    <span>·</span>
                    <span>{preview.department}</span>
                    <span>·</span>
                    <span>{new Date(preview.createdAt).toLocaleDateString('en-IN')}</span>
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

export default ArticleReview;
