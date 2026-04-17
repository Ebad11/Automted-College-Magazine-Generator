import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Send, X, Plus, Tag } from 'lucide-react';

const CATEGORIES = ['article', 'poem', 'achievement', 'announcement', 'event', 'other'];
const DEPARTMENTS = ['Computer Engineering', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'General'];

const ArticleSubmit = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', content: '', department: user?.department || 'Computer Engineering',
    category: 'article', tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t) && form.tags.length < 8) {
      setForm({ ...form, tags: [...form.tags, t] });
      setTagInput('');
    }
  };
  const removeTag = (t) => setForm({ ...form, tags: form.tags.filter((x) => x !== t) });

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files).slice(0, 5);
    setFiles(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      return toast.error('Title and content are required.');
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('content', form.content);
      data.append('department', form.department);
      data.append('category', form.category);
      data.append('tags', JSON.stringify(form.tags));
      files.forEach((f) => data.append('images', f));

      await api.post('/articles', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Article submitted successfully! Awaiting review.');
      setForm({ title: '', content: '', department: user?.department || 'Computer Engineering', category: 'article', tags: [] });
      setFiles([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">✍️ Submit Article</h1>
        <p className="page-subtitle">Share your work with the college magazine. Our faculty will review it shortly.</p>
      </motion.div>

      <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Title */}
        <div className="form-group">
          <label className="form-label">Article Title *</label>
          <input id="article-title" type="text" placeholder="Enter a compelling title..." value={form.title} onChange={set('title')} required />
        </div>

        {/* Category + Department */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select id="article-category" value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <select id="article-dept" value={form.department} onChange={set('department')}>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="form-group">
          <label className="form-label">Content *</label>
          <textarea
            id="article-content"
            placeholder="Write your article here..."
            value={form.content}
            onChange={set('content')}
            rows={10}
            style={{ resize: 'vertical', lineHeight: '1.8' }}
            required
          />
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {form.content.length} characters
          </div>
        </div>

        {/* Tags */}
        <div className="form-group">
          <label className="form-label">Tags (optional)</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            {form.tags.map((t) => (
              <span key={t} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.25rem 0.7rem', borderRadius: '100px', fontSize: '0.8rem',
                background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', color: 'var(--primary-light)',
              }}>
                <Tag size={11} />{t}
                <button type="button" onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1, display: 'flex' }}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input id="tag-input" type="text" placeholder="Add tag..." value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
            <button type="button" id="add-tag-btn" className="btn btn-secondary" onClick={addTag} style={{ whiteSpace: 'nowrap' }}>
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        {/* Images */}
        <div className="form-group">
          <label className="form-label">Images (optional — max 5, JPG/PNG/WEBP, 5MB each)</label>
          <input id="article-images" type="file" accept="image/jpeg,image/png,image/webp"
            multiple onChange={handleFileChange}
            style={{ background: 'var(--bg-elevated)', border: '2px dashed var(--border)', padding: '1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer' }} />
          {files.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {files.map((f) => (
                <span key={f.name} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '0.25rem 0.6rem', borderRadius: 6 }}>
                  {f.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <motion.button id="submit-article-btn" type="submit" className="btn btn-primary"
          style={{ alignSelf: 'flex-start', padding: '0.85rem 2rem' }}
          disabled={loading} whileTap={{ scale: 0.97 }}>
          {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <><Send size={16} /> Submit Article</>}
        </motion.button>
      </motion.form>
    </div>
  );
};

export default ArticleSubmit;
