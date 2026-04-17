import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Star, ArrowRight, Eye, EyeOff, Building } from 'lucide-react';

const DEPARTMENTS = ['Computer Engineering', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'General'];
const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'lab_assistant', label: 'Lab Assistant' },
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', department: 'Computer Engineering', rollNumber: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Account created! Welcome, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {[...Array(3)].map((_, i) => (
          <motion.div key={i}
            style={{
              position: 'absolute', borderRadius: '50%', opacity: 0.07, filter: 'blur(80px)',
              background: ['var(--accent)', 'var(--primary)', 'var(--secondary)'][i],
              width: [350, 400, 300][i], height: [350, 400, 300][i],
              top: ['20%', '50%', '5%'][i], left: ['60%', '5%', '30%'][i],
            }}
            animate={{ x: [0, -20, 0], y: [0, 25, 0] }}
            transition={{ duration: 9 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: 480, padding: '2.5rem', position: 'relative', zIndex: 1 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 1rem', background: 'linear-gradient(135deg, var(--accent), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Star size={24} color="#fff" fill="#fff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Create account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Join the FCRIT Magazine Platform</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Role selector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem' }}>
            {ROLES.map((r) => (
              <button key={r.value} type="button" id={`role-${r.value}`}
                onClick={() => setForm({ ...form, role: r.value })}
                style={{
                  padding: '0.6rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', fontWeight: 600,
                  border: form.role === r.value ? '2px solid var(--primary)' : '2px solid var(--border)',
                  background: form.role === r.value ? 'rgba(108,99,255,0.15)' : 'var(--bg-elevated)',
                  color: form.role === r.value ? 'var(--primary-light)' : 'var(--text-secondary)',
                  transition: 'var(--transition)', cursor: 'pointer',
                }}>
                {r.label}
              </button>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input id="reg-name" type="text" placeholder="Your full name" value={form.name} onChange={set('name')} style={{ paddingLeft: '2.5rem' }} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input id="reg-email" type="email" placeholder="you@fcrit.ac.in" value={form.email} onChange={set('email')} style={{ paddingLeft: '2.5rem' }} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <div style={{ position: 'relative' }}>
                <Building size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                <select id="reg-dept" value={form.department} onChange={set('department')} style={{ paddingLeft: '2.5rem' }}>
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            {form.role === 'student' && (
              <div className="form-group">
                <label className="form-label">Roll Number</label>
                <input id="reg-roll" type="text" placeholder="e.g. 22CE001" value={form.rollNumber} onChange={set('rollNumber')} />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input id="reg-password" type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={set('password')} style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} required />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <motion.button id="reg-submit" type="submit" className="btn btn-primary"
            style={{ justifyContent: 'center', width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
            disabled={loading} whileTap={{ scale: 0.98 }}>
            {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : (<><span>Create Account</span><ArrowRight size={16} /></>)}
          </motion.button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
