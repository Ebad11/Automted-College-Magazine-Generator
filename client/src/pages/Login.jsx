import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, Star, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      {/* Animated orbs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {[...Array(3)].map((_, i) => (
          <motion.div key={i}
            style={{
              position: 'absolute', borderRadius: '50%',
              background: ['var(--primary)', 'var(--secondary)', 'var(--accent)'][i],
              opacity: 0.07, filter: 'blur(80px)',
              width: [400, 300, 350][i], height: [400, 300, 350][i],
              top: ['10%', '60%', '30%'][i], left: ['5%', '60%', '40%'][i],
            }}
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: 440, padding: '2.5rem', position: 'relative', zIndex: 1 }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Star size={24} color="#fff" fill="#fff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Sign in to the FCRIT Magazine Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <motion.button
            id="login-submit"
            type="submit"
            className="btn btn-primary"
            style={{ justifyContent: 'center', width: '100%', padding: '0.85rem' }}
            disabled={loading}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : (
              <><span>Sign In</span><ArrowRight size={16} /></>
            )}
          </motion.button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Create one</Link>
        </div>

        {/* Demo credentials */}
        <div style={{
          marginTop: '1.5rem', padding: '1rem', borderRadius: 'var(--radius-md)',
          background: 'rgba(108,99,255,0.07)', border: '1px solid rgba(108,99,255,0.2)',
          fontSize: '0.8rem', color: 'var(--text-secondary)',
        }}>
          <div style={{ fontWeight: 700, color: 'var(--primary-light)', marginBottom: '0.4rem' }}>Demo Accounts</div>
          <div>student@fcrit.ac.in · faculty@fcrit.ac.in · lab@fcrit.ac.in</div>
          <div style={{ color: 'var(--text-muted)' }}>Password: <strong style={{ color: 'var(--text-secondary)' }}>password123</strong></div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
