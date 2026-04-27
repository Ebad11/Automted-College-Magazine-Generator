import { useState, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Upload, Plus, Trash2, RefreshCw } from 'lucide-react';

// ── Section type icon + color helper ──────────────────────
const TYPE_META = {
  cover:    { label: 'Cover',    emoji: '🎨', cls: 'type-cover' },
  toc:      { label: 'TOC',     emoji: '📋', cls: 'type-toc' },
  message:  { label: 'Message', emoji: '✉️',  cls: 'type-message' },
  standard: { label: 'Text',    emoji: '📄', cls: 'type-standard' },
  tabular:  { label: 'Table',   emoji: '📊', cls: 'type-tabular' },
  articles: { label: 'Articles',emoji: '📰', cls: 'type-articles' },
  events:   { label: 'Events',  emoji: '🗓️', cls: 'type-events' },
  gallery:  { label: 'Gallery', emoji: '🖼️', cls: 'type-standard' },
};

export const SectionIcon = ({ type, size = 28 }) => {
  const m = TYPE_META[type] || TYPE_META.standard;
  return (
    <div className={`sec-icon ${m.cls}`} style={{ width: size, height: size, fontSize: size * 0.5 }}>
      {m.emoji}
    </div>
  );
};

export const typeMeta = (type) => TYPE_META[type] || TYPE_META.standard;

// ── Standard (text) editor ─────────────────────────────────
export const StandardEditor = ({ section, onUpdate }) => (
  <div>
    <label className="mag-label">Page Content</label>
    <textarea
      className="mag-textarea"
      value={section.content || ''}
      onChange={e => onUpdate({ content: e.target.value })}
      placeholder="Enter content for this section..."
      rows={14}
    />
    <p style={{ fontSize: '0.72rem', opacity: 0.4, marginTop: '0.5rem' }}>Tip: Use blank lines to separate paragraphs. Use ALL CAPS for sub-headings.</p>
  </div>
);

// ── Message editor (HoD / Director) ──────────────────────
export const MessageEditor = ({ section, onUpdate }) => {
  const c = section.content || {};
  const set = (k, v) => onUpdate({ content: { ...c, [k]: v } });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label className="mag-label">Author Name</label>
          <input className="mag-input" value={c.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Dr. M. Kiruthika" />
        </div>
        <div>
          <label className="mag-label">Designation</label>
          <input className="mag-input" value={c.designation || ''} onChange={e => set('designation', e.target.value)} placeholder="e.g. Head of Department" />
        </div>
      </div>
      <div>
        <label className="mag-label">Message Text</label>
        <textarea className="mag-textarea" value={c.text || ''} onChange={e => set('text', e.target.value)} placeholder="Enter the full message here..." rows={12} />
      </div>
    </div>
  );
};

// ── Tabular editor (AI-powered) ────────────────────────────
export const TabularEditor = ({ section, onUpdate }) => {
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef();
  const tc = section.tableConfig || { columns: [], rows: [] };
  const rows = Array.isArray(tc.rows) ? tc.rows : [];
  const cols = tc.columns || [];

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sectionType', section.title);
    formData.append('columns', JSON.stringify(cols));
    setProcessing(true);
    try {
      const res = await api.post('/magazine/process-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        const newRows = res.data.data.map(r => cols.map(c => r[c] ?? Object.values(r)[cols.indexOf(c)] ?? ''));
        onUpdate({ tableConfig: { ...tc, rows: newRows } });
        toast.success(`AI imported ${newRows.length} rows!`);
      }
    } catch { toast.error('AI processing failed.'); }
    setProcessing(false);
    e.target.value = '';
  };

  const addRow = () => onUpdate({ tableConfig: { ...tc, rows: [...rows, cols.map(() => '')] } });
  const delRow = (i) => onUpdate({ tableConfig: { ...tc, rows: rows.filter((_, ri) => ri !== i) } });
  const editCell = (ri, ci, val) => {
    const updated = rows.map((r, i) => i === ri ? r.map((c, j) => j === ci ? val : c) : r);
    onUpdate({ tableConfig: { ...tc, rows: updated } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="mag-upload-zone" onClick={() => fileRef.current?.click()} style={{ cursor: processing ? 'wait' : 'pointer' }}>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.docx" className="hidden" onChange={handleFile} />
        <div className="mag-upload-icon">{processing ? '⏳' : '📂'}</div>
        <div className="mag-upload-title">{processing ? 'Processing with AI…' : 'Upload Excel or Word'}</div>
        <div className="mag-upload-sub">.xlsx / .xls / .docx — AI will map data to table columns</div>
      </div>

      {rows.length > 0 && (
        <div className="mag-table-wrap">
          <table className="mag-table">
            <thead>
              <tr>
                {cols.map((c, i) => <th key={i}>{c}</th>)}
                <th style={{ width: 32 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {cols.map((_, ci) => (
                    <td key={ci}>
                      <input value={row[ci] || ''} onChange={e => editCell(ri, ci, e.target.value)} />
                    </td>
                  ))}
                  <td>
                    <button onClick={() => delRow(ri)} className="mag-btn-icon" style={{ color: '#ff6b6b', background: 'transparent', border: 'none' }}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button className="mag-btn mag-btn-ghost" onClick={addRow} style={{ alignSelf: 'flex-start' }}>
        <Plus size={14} /> Add Row Manually
      </button>
    </div>
  );
};

// ── Events editor ─────────────────────────────────────────
export const EventsEditor = ({ section, onUpdate }) => {
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef();
  const events = Array.isArray(section.content) ? section.content : [];
  
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sectionType', section.title);
    formData.append('columns', JSON.stringify(['title', 'date', 'description']));
    setProcessing(true);
    try {
      const res = await api.post('/magazine/process-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        // AI returns an array of objects mapping to the expected columns
        const newEvents = res.data.data.map(r => ({
          title: r.title || r['Event Name'] || '',
          date: r.date || r['Date'] || '',
          description: r.description || r['Description'] || ''
        }));
        onUpdate({ content: [...events, ...newEvents] });
        toast.success(`AI imported ${newEvents.length} events!`);
      }
    } catch { toast.error('AI processing failed.'); }
    setProcessing(false);
    e.target.value = '';
  };

  const add = () => onUpdate({ content: [...events, { title: '', description: '', date: '' }] });
  const del = (i) => onUpdate({ content: events.filter((_, idx) => idx !== i) });
  const edit = (i, k, v) => onUpdate({ content: events.map((e, idx) => idx === i ? { ...e, [k]: v } : e) });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="mag-upload-zone" onClick={() => fileRef.current?.click()} style={{ cursor: processing ? 'wait' : 'pointer', padding: '1.5rem', marginBottom: '0.5rem' }}>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.docx" className="hidden" onChange={handleFile} />
        <div className="mag-upload-icon" style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>{processing ? '⏳' : '📂'}</div>
        <div className="mag-upload-title">{processing ? 'Processing with AI…' : 'Upload Event Report (Excel/Word)'}</div>
        <div className="mag-upload-sub">AI will extract Event Name, Date, and Description</div>
      </div>

      {events.map((ev, i) => (
        <div key={i} style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <label className="mag-label">Event {i + 1}</label>
            <button onClick={() => del(i)} className="mag-btn-icon"><Trash2 size={13} /></button>
          </div>
          <input className="mag-input" value={ev.title || ''} onChange={e => edit(i, 'title', e.target.value)} placeholder="Event Name (e.g. CRYPTEX 2024)" />
          <input className="mag-input" value={ev.date || ''} onChange={e => edit(i, 'date', e.target.value)} placeholder="Date (e.g. August 17, 2024)" />
          <textarea className="mag-textarea" value={ev.description || ''} onChange={e => edit(i, 'description', e.target.value)} placeholder="Event description..." rows={4} style={{ minHeight: '80px' }} />
        </div>
      ))}
      <button className="mag-btn mag-btn-ghost" onClick={add} style={{ alignSelf: 'flex-start' }}>
        <Plus size={14} /> Add Event Manually
      </button>
    </div>
  );
};

// ── Articles picker ───────────────────────────────────────
export const ArticlesEditor = ({ section, articles, onUpdate }) => {
  const selected = section.articles || [];
  const toggle = (id) => {
    const next = selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id];
    onUpdate({ articles: next });
  };
  return (
    <div>
      <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '1rem' }}>Select approved student articles to include in this section.</p>
      {articles.length === 0 ? (
        <div style={{ opacity: 0.35, textAlign: 'center', padding: '2rem' }}>No approved articles yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {articles.map(a => {
            const isSelected = selected.includes(a._id);
            const snippet = a.content ? a.content.substring(0, 100) + '...' : 'No content preview available.';
            const imageUrl = a.images && a.images.length > 0 ? (a.images[0].url.startsWith('http') ? a.images[0].url : `http://localhost:5000${a.images[0].url}`) : null;
            return (
              <div 
                key={a._id} 
                onClick={() => toggle(a._id)} 
                style={{ 
                  cursor: 'pointer', 
                  background: isSelected ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)', 
                  border: `1px solid ${isSelected ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`, 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {imageUrl && (
                  <div style={{ height: '120px', width: '100%', overflow: 'hidden' }}>
                    <img src={imageUrl} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', lineHeight: 1.3, color: isSelected ? '#a5b4fc' : '#fff' }}>{a.title}</h4>
                    <input type="checkbox" readOnly checked={isSelected} style={{ accentColor: '#6366f1', transform: 'scale(1.2)' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.75rem' }}>
                    {a.author?.name} · {a.department}
                  </div>
                  <p style={{ fontSize: '0.8rem', opacity: 0.7, lineHeight: 1.5, flex: 1, margin: 0 }}>
                    {snippet}
                  </p>
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {a.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
