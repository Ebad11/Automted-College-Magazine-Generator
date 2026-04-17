import { motion } from 'framer-motion';
import { Mail, Star, Users, Code2, BookOpen } from 'lucide-react';

// ─── TEAM DATA ─────────────────────────────────────────────────────────────────
// Update this data with your actual team info
const TEAM = {
  collegeName: 'Fr. Conceicao Rodrigues Institute of Technology (FCRIT), Vashi',
  projectName: 'Automated College Magazine Generator',
  projectVersion: '1.0.0',
  academic_year: '2025–2026',
  mentor: 'Prof. [Mentor Name]', // ← Update with actual mentor name
  members: [
    { name: '[Team Member 1]', rollNo: '[Roll No]', role: 'Full Stack Developer', dept: 'Computer Engineering', email: 'member1@fcrit.ac.in', initials: 'M1', color: '#6c63ff' },
    { name: '[Team Member 2]', rollNo: '[Roll No]', role: 'Backend Developer', dept: 'Computer Engineering', email: 'member2@fcrit.ac.in', initials: 'M2', color: '#f72585' },
    { name: '[Team Member 3]', rollNo: '[Roll No]', role: 'Frontend Developer', dept: 'Computer Engineering', email: 'member3@fcrit.ac.in', initials: 'M3', color: '#4cc9f0' },
    { name: '[Team Member 4]', rollNo: '[Roll No]', role: 'UI/UX Designer', dept: 'Computer Engineering', email: 'member4@fcrit.ac.in', initials: 'M4', color: '#06d6a0' },
  ],
  techStack: [
    { name: 'MongoDB', description: 'NoSQL database for flexible data storage', icon: '🍃' },
    { name: 'Express.js', description: 'Secure REST API backend framework', icon: '⚡' },
    { name: 'React.js', description: 'Dynamic, component-based frontend', icon: '⚛️' },
    { name: 'Node.js', description: 'Server-side JavaScript runtime', icon: '🟢' },
    { name: 'JWT + bcrypt', description: 'Authentication & password security', icon: '🔐' },
    { name: 'Framer Motion', description: 'Premium micro-animations & transitions', icon: '🎞️' },
    { name: 'Recharts', description: 'Dashboard analytics & data visualization', icon: '📊' },
    { name: 'react-pageflip', description: '3D interactive magazine flipbook', icon: '📖' },
  ],
  features: [
    'Role-Based Access Control (Student / Faculty / Lab Assistant)',
    'Secure JWT Authentication with bcrypt password hashing',
    'Article Submission with file upload (strict MIME filtering)',
    'Faculty Review Workflow (Approve / Reject with notes)',
    'Interactive 3D Magazine Flipbook Preview',
    'PDF Magazine Export via Print API',
    'Real-Time Activity Audit Log with IP tracking',
    'Rate limiting, XSS protection, NoSQL injection prevention',
    'Premium Dark UI with glassmorphism & Framer Motion animations',
    'Visual Analytics Dashboard with Recharts',
  ],
};

const MemberCard = ({ member, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card"
    style={{ padding: '1.75rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
  >
    {/* Glow accent */}
    <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: `${member.color}12`, filter: 'blur(30px)', pointerEvents: 'none' }} />
    {/* Avatar */}
    <div style={{
      width: 72, height: 72, borderRadius: '50%', margin: '0 auto 1rem',
      background: `linear-gradient(135deg, ${member.color}40, ${member.color}15)`,
      border: `3px solid ${member.color}60`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.5rem', fontWeight: 800, color: member.color,
    }}>
      {member.initials}
    </div>
    <h3 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.25rem' }}>{member.name}</h3>
    <div style={{ fontSize: '0.78rem', color: member.color, fontWeight: 700, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
      {member.role}
    </div>
    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>{member.dept}</div>
    <div style={{
      display: 'inline-block', marginTop: '0.5rem', padding: '0.2rem 0.7rem', borderRadius: '100px',
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace',
    }}>
      {member.rollNo}
    </div>
    <div style={{ marginTop: '1rem' }}>
      <a href={`mailto:${member.email}`} style={{ fontSize: '0.78rem', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
        <Mail size={13} /> {member.email}
      </a>
    </div>
  </motion.div>
);

const AboutTeam = () => (
  <div style={{ maxWidth: 1100 }}>
    {/* Hero */}
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '3rem', padding: '3rem 2rem', borderRadius: 'var(--radius-xl)', background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(247,37,133,0.05))', border: '1px solid rgba(108,99,255,0.15)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>⭐</div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--primary-light), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.75rem' }}>
        {TEAM.projectName}
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 600, margin: '0 auto 1.5rem' }}>
        {TEAM.collegeName}
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <span className="badge badge-info">Version {TEAM.projectVersion}</span>
        <span className="badge badge-success">Academic Year {TEAM.academic_year}</span>
        <span className="badge badge-pending">MERN Stack</span>
      </div>
    </motion.div>

    {/* Mentor */}
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card"
      style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'rgba(255,209,102,0.06)', borderColor: 'rgba(255,209,102,0.2)' }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,209,102,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Star size={24} color="var(--warning)" fill="var(--warning)" />
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>Project Mentor / Faculty Guide</div>
        <div style={{ color: 'var(--warning)', fontWeight: 600 }}>{TEAM.mentor}</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{TEAM.collegeName}</div>
      </div>
    </motion.div>

    {/* Team Members */}
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <Users size={20} color="var(--primary-light)" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Development Team</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {TEAM.members.map((m, i) => <MemberCard key={m.rollNo} member={m} delay={0.1 + i * 0.08} />)}
      </div>
    </motion.div>

    {/* Features */}
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <BookOpen size={20} color="var(--success)" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Key Features</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
        {TEAM.features.map((f, i) => (
          <motion.div key={f} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.04 }}
            style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(6,214,160,0.05)', border: '1px solid rgba(6,214,160,0.15)' }}>
            <span style={{ color: 'var(--success)', flexShrink: 0, marginTop: '0.1rem' }}>✓</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{f}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>

    {/* Tech Stack */}
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Code2 size={20} color="var(--accent)" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Technology Stack</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {TEAM.techStack.map((t, i) => (
          <motion.div key={t.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.55 + i * 0.05 }}
            style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{t.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.2rem' }}>{t.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.description}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>

    {/* Footer note */}
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
      style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
      Built with ❤️ for FCRIT Vashi · {TEAM.academic_year} · {TEAM.projectName} v{TEAM.projectVersion}
    </motion.div>
  </div>
);

export default AboutTeam;
