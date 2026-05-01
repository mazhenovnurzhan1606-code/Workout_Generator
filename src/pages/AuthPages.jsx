import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

const features = [
  { icon: '⚡', title: 'AI-Powered Plans', desc: 'Groq AI generates your personal workout plan in seconds' },
  { icon: '📊', title: 'Track Progress', desc: 'Monitor your BMI, goals, and weekly workout schedule' },
  { icon: '💬', title: 'AI Trainer Chat', desc: 'Ask anything about fitness, nutrition, and recovery' },
];

export default function AuthPages({ isRegister = false }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(form.name, form.email, form.password);
      } else {
        await login(form.email, form.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        {/* Decorative circles */}
        <div className="auth-circle" style={{ width: 320, height: 320, top: -80, right: -80 }} />
        <div className="auth-circle" style={{ width: 200, height: 200, bottom: 40, left: -60 }} />
        <div className="auth-circle" style={{ width: 100, height: 100, top: '40%', left: '10%', background: 'rgba(255,255,255,0.05)' }} />

        <div className="auth-left-content">
          <div style={{
            width: 64, height: 64, background: 'rgba(255,255,255,0.15)',
            borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', backdropFilter: 'blur(8px)'
          }}>
            <Dumbbell size={32} color="white" />
          </div>

          <h1 style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: 40, color: 'white', marginBottom: 12, lineHeight: 1.15
          }}>
            Your AI-Powered<br />Fitness Journey
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, marginBottom: 48, lineHeight: 1.6 }}>
            Personalized workout plans crafted by AI,<br />designed for your unique goals.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
            {features.map(f => (
              <div key={f.title} style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                background: 'rgba(255,255,255,0.1)', borderRadius: 14,
                padding: '14px 18px', backdropFilter: 'blur(4px)'
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{f.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 1.4 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            <div style={{
              width: 32, height: 32, background: 'var(--primary)', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Dumbbell size={16} color="white" />
            </div>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: 'var(--text)' }}>
              Fit<span style={{ color: 'var(--primary)' }}>AI</span>
            </span>
          </div>

          <h2 className="auth-title">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="auth-subtitle">
            {isRegister
              ? 'Start your fitness journey today'
              : 'Sign in to continue your progress'}
          </p>

          {error && (
            <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                  <input
                    className="form-input"
                    style={{ paddingLeft: 38 }}
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg"
              type="submit"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="divider">or</div>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text2)' }}>
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <Link to={isRegister ? '/login' : '/register'} className="auth-link">
              {isRegister ? 'Sign In' : 'Sign Up'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
