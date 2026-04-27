import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { BookOpen, Save, Plus, Trash2, Eye, Layers, ChevronRight, GripVertical } from 'lucide-react';
import '../styles/ZephyrTheme.css';
import {
  SectionIcon, typeMeta,
  StandardEditor, MessageEditor, TabularEditor, EventsEditor, ArticlesEditor,
} from '../components/MagEditorParts';

// Add Section Modal
const ADD_TYPES = [
  { type: 'standard', label: 'Text / Content', sub: 'Free-form text page' },
  { type: 'tabular',  label: 'Tabular Data',   sub: 'AI-importable table (Excel/Word)' },
  { type: 'articles', label: 'Article Gallery', sub: 'Student article collection' },
  { type: 'events',   label: 'Events List',     sub: 'Events with descriptions' },
];

const AddSectionModal = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('standard');
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ background: '#1a1a20', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '2rem', width: 440 }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '1.1rem' }}>Add New Section</h3>
        <label className="mag-label">Section Name</label>
        <input className="mag-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alumni Spotlight" style={{ marginBottom: '1rem' }} />
        <label className="mag-label" style={{ marginBottom: '0.6rem' }}>Section Type</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {ADD_TYPES.map(t => (
            <div key={t.type} onClick={() => setType(t.type)}
              style={{ padding: '0.8rem 1rem', borderRadius: 8, border: `1px solid ${type === t.type ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`, background: type === t.type ? 'rgba(255,255,255,0.08)' : 'transparent', cursor: 'pointer', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <SectionIcon type={t.type} size={32} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.label}</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.45 }}>{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="mag-btn mag-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="mag-btn mag-btn-primary" onClick={() => { if (!name.trim()) return toast.error('Enter a section name'); onAdd(name.trim(), type); onClose(); }}>
            <Plus size={14} /> Add Section
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Main Smart Editor
const SmartEditor = () => {
  const [magazine, setMagazine] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSec, setActiveSec] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [mRes, aRes] = await Promise.all([api.get('/magazine/config'), api.get('/magazine/preview')]);
      setMagazine(mRes.data.magazine);
      setArticles(aRes.data.articles);
      if (mRes.data.magazine.sections?.length) setActiveSec(mRes.data.magazine.sections[0]._id);
    } catch { toast.error('Failed to load magazine.'); }
    setLoading(false);
  };

  const activeSection = magazine?.sections?.find(s => s._id === activeSec);

  // Update active section locally (no save yet)
  const handleSectionUpdate = useCallback((changes) => {
    setMagazine(prev => ({
      ...prev,
      sections: prev.sections.map(s => s._id === activeSec ? { ...s, ...changes } : s)
    }));
  }, [activeSec]);

  // Save a single section
  const saveSection = async () => {
    if (!activeSection) return;
    setSaving(true);
    try {
      await api.patch(`/magazine/section/${activeSection._id}`, {
        title: activeSection.title,
        content: activeSection.content,
        tableConfig: activeSection.tableConfig,
        articles: activeSection.articles,
        type: activeSection.type,
      });
      toast.success('Section saved!');
    } catch { toast.error('Failed to save.'); }
    setSaving(false);
  };

  // Add a new section
  const addSection = async (title, type) => {
    try {
      const res = await api.post('/magazine/section', { title, type });
      setMagazine(res.data.magazine);
      setActiveSec(res.data.section._id);
      toast.success(`"${title}" added!`);
    } catch { toast.error('Failed to add section.'); }
  };

  // Delete a section
  const deleteSection = async (sectionId) => {
    if (!window.confirm('Delete this custom section?')) return;
    try {
      const res = await api.delete(`/magazine/section/${sectionId}`);
      setMagazine(res.data.magazine);
      const remaining = res.data.magazine.sections;
      setActiveSec(remaining.length ? remaining[0]._id : null);
      toast.success('Section removed.');
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot delete.'); }
  };

  if (loading) return (
    <div className="mag-editor" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  if (!magazine) return (
    <div className="mag-editor" style={{ alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <p style={{ opacity: 0.4 }}>Failed to load magazine configuration.</p>
      <button className="mag-btn mag-btn-ghost" onClick={load}>Retry</button>
    </div>
  );

  return (
    <div className="mag-editor">
      {/* Header */}
      <header className="mag-header">
        <h1>
          <BookOpen size={20} style={{ opacity: 0.6 }} />
          {magazine.title}
          <span className="mag-header-badge">Smart Editor</span>
        </h1>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="mag-btn mag-btn-ghost" onClick={() => window.open('/magazine-print', '_blank')}>
            <BookOpen size={14} /> Download PDF
          </button>
          <button className="mag-btn mag-btn-ghost" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Add Section
          </button>
          <button className="mag-btn mag-btn-primary" onClick={saveSection} disabled={saving || !activeSection}>
            {saving ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <Save size={14} />}
            Save Section
          </button>
        </div>
      </header>

      <div className="mag-body">
        {/* Sidebar */}
        <aside className="mag-sidebar">
          <div className="mag-sidebar-header">
            <span>Sections ({magazine.sections.length})</span>
          </div>
          <div className="mag-sidebar-list">
            {magazine.sections.map(s => {
              const m = typeMeta(s.type);
              const isActive = s._id === activeSec;
              return (
                <div key={s._id} className={`mag-sec-item ${isActive ? 'active' : ''}`} onClick={() => setActiveSec(s._id)}>
                  <SectionIcon type={s.type} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="sec-title">{s.title}</div>
                    <div className="sec-badge">{m.label}{s.isFixed && <span className="mag-sec-fixed-tag"> · fixed</span>}</div>
                  </div>
                  {!s.isFixed && (
                    <button className="del-btn" onClick={e => { e.stopPropagation(); deleteSection(s._id); }}>
                      <Trash2 size={12} />
                    </button>
                  )}
                  <ChevronRight size={12} style={{ opacity: 0.25 }} />
                </div>
              );
            })}
          </div>
          <button className="add-section-btn" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Add Custom Section
          </button>
        </aside>

        {/* Workspace */}
        <main className="mag-workspace">
          <AnimatePresence mode="wait">
            {activeSection ? (
              <motion.div key={activeSection._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="mag-workspace-header">
                  {/* Editable section title */}
                  <input
                    value={activeSection.title}
                    onChange={e => handleSectionUpdate({ title: e.target.value })}
                    style={{ background: 'transparent', border: 'none', color: '#f0f0f5', fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 900, width: '100%', outline: 'none', marginBottom: '0.4rem' }}
                  />
                  <div className="sec-type-pill">
                    <SectionIcon type={activeSection.type} size={16} />
                    {typeMeta(activeSection.type).label} Section
                    {activeSection.isFixed && <span style={{ opacity: 0.5 }}> · Standard (always included)</span>}
                  </div>
                </div>
                <div className="mag-content-area">
                  {activeSection.type === 'standard' && <StandardEditor section={activeSection} onUpdate={handleSectionUpdate} />}
                  {activeSection.type === 'message' && <MessageEditor section={activeSection} onUpdate={handleSectionUpdate} />}
                  {activeSection.type === 'tabular' && <TabularEditor section={activeSection} onUpdate={handleSectionUpdate} />}
                  {activeSection.type === 'events' && <EventsEditor section={activeSection} onUpdate={handleSectionUpdate} />}
                  {activeSection.type === 'articles' && <ArticlesEditor section={activeSection} articles={articles} onUpdate={handleSectionUpdate} />}
                  {activeSection.type === 'cover' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                      <div className="mag-page-preview zephyr-bg-pattern" style={{ flex: 1, minHeight: 450, background: '#0a0a0d', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '1rem', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
                        {/* Subtle background glow */}
                        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%', background: 'radial-gradient(circle at 50% 50%, rgba(139,92,246,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
                        <img src="/logo.png" alt="College Logo" style={{ width: '100px', height: '100px', objectFit: 'contain', marginBottom: '1rem', zIndex: 1 }} onError={(e) => { e.target.style.display = 'none'; }} />
                        <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.4em', opacity: 0.7, zIndex: 1 }}>Fr. C. Rodrigues Institute of Technology</div>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '4rem', fontWeight: 900, letterSpacing: '0.08em', lineHeight: 1, textShadow: '0 4px 24px rgba(0,0,0,0.5)', margin: '0.5rem 0', zIndex: 1, background: 'linear-gradient(to right, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{magazine.title}</h1>
                        <div style={{ width: 80, height: 2, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)', margin: '0.5rem 0', zIndex: 1 }} />
                        <div style={{ fontSize: '0.9rem', opacity: 0.8, letterSpacing: '0.1em', zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{magazine.year} ·</span>
                          <input 
                            value={activeSection.content?.subtitle || 'Department of Computer Engineering'} 
                            onChange={(e) => handleSectionUpdate({ content: { ...(activeSection.content || {}), subtitle: e.target.value } })}
                            style={{ background: 'transparent', border: 'none', color: 'inherit', borderBottom: '1px dashed rgba(255,255,255,0.3)', outline: 'none', textAlign: 'center', width: '250px', fontSize: 'inherit', letterSpacing: 'inherit' }}
                          />
                        </div>
                      </div>
                      <p style={{ fontSize: '0.78rem', opacity: 0.4, textAlign: 'center' }}>Save the provided logo image as "logo.png" in your client/public folder for it to appear.</p>
                    </div>
                  )}
                  {activeSection.type === 'toc' && (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '1rem' }}>Table of Contents is auto-generated from your sections list.</p>
                      <div className="mag-page-preview zephyr-bg-dots" style={{ flex: 1, background: '#0a0a0d', color: '#fff' }}>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', color: '#fff' }}>Contents</h1>
                        <div className="pg-rule" style={{ background: 'linear-gradient(90deg, #a78bfa, transparent)', height: '2px', border: 'none' }} />
                        {magazine.sections.filter(s => s.type !== 'toc' && s.type !== 'cover').map((s, i) => (
                          <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem', color: '#ccc' }}>
                            <span style={{ fontWeight: 500 }}>{s.title}</span>
                            <span style={{ opacity: 0.4, fontSize: '0.8rem', fontFamily: 'monospace' }}>{String(i + 3).padStart(2, '0')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="mag-empty">
                <Layers size={64} />
                <p>Select a section from the sidebar to start editing</p>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {showAdd && <AddSectionModal onAdd={addSection} onClose={() => setShowAdd(false)} />}
    </div>
  );
};

export default SmartEditor;
