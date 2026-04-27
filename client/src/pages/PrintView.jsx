import { useEffect, useState } from 'react';
import api from '../api/axios';
import { typeMeta, SectionIcon } from '../components/MagEditorParts';

const PrintView = () => {
  const [magazine, setMagazine] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, aRes] = await Promise.all([api.get('/magazine/config'), api.get('/magazine/preview')]);
        setMagazine(mRes.data.magazine);
        setArticles(aRes.data.articles);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading print view...</div>;
  if (!magazine) return <div>Error loading magazine.</div>;

  return (
    <div style={{ background: '#fff', color: '#000', fontFamily: "'Times New Roman', serif" }}>
      <style>
        {`
          @media print {
            .no-print { display: none; }
            @page { margin: 20mm; }
            .page-break { page-break-after: always; }
          }
          .print-container { max-width: 800px; margin: 0 auto; padding: 2rem; }
          .print-section { margin-bottom: 4rem; position: relative; }
          .print-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
          .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .print-table th { background-color: #f2f2f2; }
          .print-article { margin-bottom: 2rem; }
          .print-article img { max-width: 100%; height: auto; margin-bottom: 1rem; }
          .print-cover { position: relative; min-height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #0a0a0d !important; color: #fff !important; text-align: center; box-sizing: border-box; padding: 2rem; overflow: hidden; }
          @media print {
            .print-cover { height: 250mm; min-height: auto; margin: -2rem -2rem 0 -2rem; }
          }
          .print-cover::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px) !important; background-size: 20px 20px !important; z-index: 0; }
        `}
      </style>
      
      <div className="no-print" style={{ padding: '1rem', background: '#f0f0f0', textAlign: 'center', marginBottom: '2rem' }}>
        <button onClick={() => window.print()} style={{ padding: '0.5rem 1rem', background: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}>Print / Save as PDF</button>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem' }}>Use your browser's Print dialog to save as PDF. Be sure to enable "Background graphics".</p>
      </div>

      <div className="print-container">
        {magazine.sections.map((section, idx) => (
          <div key={section._id} className="print-section page-break">
            {section.type === 'cover' && (
              <div className="print-cover" style={{ paddingTop: 0 }}>
                <div style={{ zIndex: 1 }}>
                  <img src="/logo.png" alt="College Logo" style={{ display: 'block', margin: '0 auto 2rem auto', width: '150px', height: '150px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.4em', margin: '0 0 1rem 0', opacity: 0.8 }}>Fr. C. Rodrigues Institute of Technology</h3>
                  <h1 style={{ fontSize: '4.5rem', textTransform: 'uppercase', fontFamily: "'Playfair Display', serif", margin: '0 0 1rem 0', WebkitPrintColorAdjust: 'exact', color: '#fff' }}>{magazine.title}</h1>
                  <div style={{ width: '100px', height: '2px', background: '#fff', margin: '0 auto 1rem auto', opacity: 0.5 }}></div>
                  <h2 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0', opacity: 0.9 }}>{magazine.year}</h2>
                  <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 'normal', opacity: 0.8 }}>{section.content?.subtitle || 'Department of Computer Engineering'}</h3>
                </div>
              </div>
            )}

            {section.type === 'toc' && (
              <div>
                <h1 style={{ borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>Table of Contents</h1>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {magazine.sections.filter(s => s.type !== 'cover' && s.type !== 'toc').map((s, i) => (
                    <li key={s._id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #ccc', padding: '0.5rem 0' }}>
                      <span>{s.title}</span>
                      <span>{i + 3}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {section.type === 'message' && (
              <div>
                <h1 style={{ borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>{section.title}</h1>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{section.content?.text}</p>
                <div style={{ marginTop: '2rem', fontWeight: 'bold' }}>
                  <p style={{ margin: 0 }}>{section.content?.name}</p>
                  <p style={{ margin: 0, fontWeight: 'normal' }}>{section.content?.designation}</p>
                </div>
              </div>
            )}

            {section.type === 'standard' && (
              <div>
                <h1 style={{ borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>{section.title}</h1>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{section.content}</p>
              </div>
            )}

            {section.type === 'tabular' && section.tableConfig && (
              <div>
                <h1 style={{ borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>{section.title}</h1>
                <table className="print-table">
                  <thead>
                    <tr>
                      {section.tableConfig.columns.map((c, i) => <th key={i}>{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {section.tableConfig.rows.map((r, ri) => (
                      <tr key={ri}>
                        {section.tableConfig.columns.map((_, ci) => (
                          <td key={ci}>{r[ci] || ''}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {section.type === 'events' && Array.isArray(section.content) && (
              <div>
                <h1 style={{ borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>{section.title}</h1>
                {section.content.map((ev, i) => (
                  <div key={i} style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{ev.title}</h3>
                    <p style={{ margin: '0 0 0.5rem 0', fontStyle: 'italic', color: '#555' }}>{ev.date}</p>
                    <p style={{ margin: 0 }}>{ev.description}</p>
                  </div>
                ))}
              </div>
            )}

            {section.type === 'articles' && (
              <div>
                <h1 style={{ borderBottom: '2px solid #000', paddingBottom: '0.5rem', marginBottom: '2rem' }}>{section.title}</h1>
                {section.articles.map((articleId) => {
                  const article = articles.find(a => a._id === articleId);
                  if (!article) return null;
                  return (
                    <div key={article._id} className="print-article page-break">
                      <h2 style={{ marginBottom: '0.5rem' }}>{article.title}</h2>
                      <p style={{ fontStyle: 'italic', color: '#666', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1.5rem' }}>By {article.author?.name} · {article.department}</p>
                      {article.images && article.images.length > 0 && (
                        <img src={article.images[0].url.startsWith('http') ? article.images[0].url : `http://localhost:5000${article.images[0].url}`} alt="Article" />
                      )}
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: article.content }} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrintView;
