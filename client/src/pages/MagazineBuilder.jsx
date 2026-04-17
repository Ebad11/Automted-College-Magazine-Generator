import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import HTMLFlipBook from 'react-pageflip';
import { BookOpen, Download, RefreshCw, Layers, Eye, Star } from 'lucide-react';

const TEMPLATES = [
  { id: 'classic', name: 'Classic Elegance', accent: '#6c63ff', bg: '#0a0a18' },
  { id: 'vibrant', name: 'Vibrant Modern', accent: '#f72585', bg: '#0f0a14' },
  { id: 'minimal', name: 'Minimal Clean', accent: '#4cc9f0', bg: '#080d14' },
];

// A single flipbook page
const MagazinePage = ({ article, index, template, isCover }) => {
  const pageStyle = {
    background: isCover
      ? `linear-gradient(135deg, ${template.bg}, ${template.accent}30)`
      : '#fefefe',
    color: isCover ? '#fff' : '#1a1a2e',
    padding: '2rem',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Inter, sans-serif',
    boxShadow: 'inset -4px 0 12px rgba(0,0,0,0.1)',
    borderRight: `4px solid ${template.accent}40`,
    overflow: 'hidden',
  };

  if (isCover) {
    return (
      <div style={pageStyle}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⭐</div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.6, marginBottom: '1rem' }}>FCRIT Vashi</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'serif', lineHeight: 1.2, marginBottom: '0.5rem' }}>Annual College<br />Magazine</h1>
          <div style={{ width: 40, height: 3, background: template.accent, borderRadius: 2, margin: '1rem auto' }} />
          <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>{new Date().getFullYear()}</div>
        </div>
        <div style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.7rem' }}>FCRIT Magazine Generator Platform</div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={{ borderBottom: `2px solid ${template.accent}`, paddingBottom: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: template.accent, fontWeight: 700, marginBottom: '0.3rem' }}>
          {article?.category} · {article?.department}
        </div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.3, color: '#1a1a2e' }}>{article?.title}</h2>
        <div style={{ fontSize: '0.72rem', color: '#666', marginTop: '0.3rem' }}>
          By {article?.author?.name} · {new Date(article?.createdAt).toLocaleDateString('en-IN')}
        </div>
      </div>
      <p style={{ fontSize: '0.82rem', lineHeight: '1.75', color: '#333', flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 18, WebkitBoxOrient: 'vertical' }}>
        {article?.content}
      </p>
      <div style={{ marginTop: '1rem', fontSize: '0.65rem', color: '#999', textAlign: 'right' }}>
        Page {index + 2} · {template.name}
      </div>
    </div>
  );
};

const MagazineBuilder = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [view, setView] = useState('builder'); // builder | flipbook
  const [generating, setGenerating] = useState(false);
  const flipRef = useRef();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/magazine/preview');
        setArticles(res.data.articles);
      } catch { toast.error('Failed to load articles.'); }
      setLoading(false);
    };
    load();
  }, []);

  const handleFeature = async (articleId, isFeatured) => {
    try {
      await api.patch(`/articles/${articleId}/feature`, { isFeatured: !isFeatured });
      setArticles((prev) => prev.map((a) => a._id === articleId ? { ...a, isFeatured: !isFeatured } : a));
      toast.success(isFeatured ? 'Removed from featured.' : 'Marked as featured!');
    } catch { toast.error('Failed to update.'); }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/magazine/generate', { templateName: template.name, articleCount: articles.length });
      toast.success('Magazine generated! Switching to Flipbook view...');
      setView('flipbook');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed.');
    }
    setGenerating(false);
  };

  const handleDownload = async () => {
    // Use print to PDF as html2canvas fallback
    const printContent = `
      <html>
      <head><title>FCRIT Magazine ${new Date().getFullYear()}</title>
      <style>
        body { font-family: Georgia, serif; margin: 0; padding: 0; background: white; }
        .cover { page-break-after: always; display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; background: linear-gradient(135deg, #6c63ff22, #fff); }
        .article { page-break-after: always; padding: 3rem; min-height: 100vh; }
        h1 { font-size: 2.5rem; color: #1a1a2e; } h2 { font-size: 1.5rem; color: #1a1a2e; }
        .meta { color: #888; font-size: 0.85rem; margin-bottom: 1.5rem; }
        .category { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: ${template.accent}; font-weight: bold; }
        p { line-height: 1.9; color: #333; font-size: 1rem; }
        .divider { width: 40px; height: 3px; background: ${template.accent}; margin: 1rem 0; border-radius: 2px; }
      </style></head><body>
      <div class="cover"><div>
        <div style="font-size:4rem">⭐</div>
        <h1>Annual College Magazine</h1>
        <div class="divider" style="margin:1rem auto"></div>
        <p>FCRIT Vashi · ${new Date().getFullYear()}</p>
      </div></div>
      ${articles.map((a) => `
        <div class="article">
          <div class="category">${a.category} · ${a.department}</div>
          <h2>${a.title}</h2>
          <div class="meta">By ${a.author?.name} · ${new Date(a.createdAt).toLocaleDateString('en-IN')}</div>
          <div class="divider"></div>
          <p>${a.content.replace(/\n/g, '<br/>')}</p>
        </div>
      `).join('')}
      </body></html>
    `;
    const w = window.open('', '_blank');
    w.document.write(printContent);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 500);
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">📖 Magazine Builder</h1>
        <p className="page-subtitle">Select a template, feature articles, and generate the college magazine.</p>
      </motion.div>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button id="view-builder" className={`btn ${view === 'builder' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('builder')}>
          <Layers size={16} /> Builder
        </button>
        <button id="view-flipbook" className={`btn ${view === 'flipbook' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('flipbook')} disabled={articles.length === 0}>
          <Eye size={16} /> Flipbook Preview
        </button>
        {articles.length > 0 && (
          <>
            <button id="generate-btn" className="btn btn-success" onClick={handleGenerate} disabled={generating} style={{ marginLeft: 'auto' }}>
              {generating ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><BookOpen size={16} /> Generate Magazine</>}
            </button>
            <button id="download-btn" className="btn btn-secondary" onClick={handleDownload}>
              <Download size={16} /> Print / PDF
            </button>
          </>
        )}
      </div>

      {view === 'builder' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
          {/* Template selector */}
          <div>
            <motion.div className="glass-card" style={{ padding: '1.5rem' }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Choose Template</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {TEMPLATES.map((t) => (
                  <button key={t.id} id={`template-${t.id}`}
                    onClick={() => setTemplate(t)}
                    style={{
                      padding: '1rem', borderRadius: 'var(--radius-md)', border: `2px solid ${template.id === t.id ? t.accent : 'var(--border)'}`,
                      background: template.id === t.id ? `${t.accent}15` : 'var(--bg-elevated)',
                      cursor: 'pointer', textAlign: 'left', transition: 'var(--transition)',
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                    }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${t.accent}, ${t.bg})`, border: `2px solid ${t.accent}60`, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: template.id === t.id ? t.accent : 'var(--text-primary)' }}>{t.name}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(6,214,160,0.08)', border: '1px solid rgba(6,214,160,0.2)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600, marginBottom: '0.4rem' }}>✅ {articles.length} approved articles</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {articles.filter((a) => a.isFeatured).length} featured articles
                </div>
              </div>
            </motion.div>
          </div>

          {/* Article list */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}><div className="spinner" /></div>
            ) : articles.length === 0 ? (
              <div className="glass-card empty-state">
                <BookOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <h3>No approved articles</h3>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Approve student articles first to build the magazine.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {articles.map((a, i) => (
                  <div key={a._id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${template.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, color: template.accent, fontSize: '0.8rem' }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{a.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.author?.name} · {a.department} · {a.category}</div>
                    </div>
                    <button id={`feature-${a._id}`}
                      className={`btn btn-sm ${a.isFeatured ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => handleFeature(a._id, a.isFeatured)}
                      title="Toggle featured">
                      <Star size={14} fill={a.isFeatured ? 'currentColor' : 'none'} />
                      {a.isFeatured ? 'Featured' : 'Feature'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      ) : (
        /* Flipbook view */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flipbook-container"
          style={{ flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>
            🖱️ Click the pages or use arrows to flip
          </div>
          {articles.length > 0 ? (
            <HTMLFlipBook
              ref={flipRef}
              width={380} height={520}
              size="fixed"
              minWidth={250} maxWidth={500}
              minHeight={350} maxHeight={700}
              showCover={true}
              mobileScrollSupport={true}
              style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}
            >
              {/* Cover */}
              <div><MagazinePage isCover template={template} index={0} /></div>
              {/* Article pages */}
              {articles.map((article, i) => (
                <div key={article._id}>
                  <MagazinePage article={article} index={i} template={template} />
                </div>
              ))}
            </HTMLFlipBook>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No articles to display.</p>
          )}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={() => flipRef.current?.pageFlip().flipPrev()}>◀ Prev</button>
            <button className="btn btn-secondary" onClick={() => flipRef.current?.pageFlip().flipNext()}>Next ▶</button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MagazineBuilder;
