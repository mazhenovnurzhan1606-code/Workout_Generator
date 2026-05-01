import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/api';
import { Check, User, Scale, Ruler, Target, TrendingUp, Shield } from 'lucide-react';

const bmiCategory = (b) => {
  if (!b) return null;
  if (b < 18.5) return { label: 'Underweight', cls: 'badge-warning', color: '#92400e', bg: 'var(--warning-soft)' };
  if (b < 25) return { label: 'Normal', cls: 'badge-success', color: 'var(--primary-dark)', bg: 'var(--primary-soft)' };
  if (b < 30) return { label: 'Overweight', cls: 'badge-warning', color: '#92400e', bg: 'var(--warning-soft)' };
  return { label: 'Obese', cls: 'badge-danger', color: '#b91c1c', bg: 'var(--danger-soft)' };
};

const GOAL_LABELS = {
  weight_loss: '🔥 Weight Loss',
  muscle_gain: '💪 Muscle Gain',
  endurance: '🏃 Endurance',
  general_fitness: '⭐ General Fitness'
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getProfile().then(r => {
      setProfile(r.data);
      setForm(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateProfile(form);
      setProfile(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const bmi = form.weight && form.height
    ? parseFloat((form.weight / Math.pow(form.height / 100, 2)).toFixed(1))
    : null;
  const cat = bmiCategory(bmi);

  const bmiPercent = bmi ? Math.min(Math.max(((bmi - 10) / (45 - 10)) * 100, 0), 100) : 0;

  if (loading) return (
    <div>
      <div className="page-header">
        <div className="skeleton" style={{ height: 28, width: 160, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 16, width: 240 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 8 }} />)}
        </div>
        <div className="card"><div className="skeleton" style={{ height: 200 }} /></div>
      </div>
    </div>
  );

  return (
    <div className="fade-in" style={{ overflowY: "auto", height: "100%", paddingRight: 4 }}>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your personal information and fitness goals</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 20, alignItems: 'start' }}>
        {/* Main form */}
        <div className="card">
          {saved && (
            <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Check size={16} /> Profile saved successfully!
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 20, fontWeight: 700, flexShrink: 0
            }}>
              {profile?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{profile?.name || 'Your Name'}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>{profile?.email}</div>
            </div>
          </div>

          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={16} color="var(--primary)" /> Personal Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name || ''}
                onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Email Address</label>
              <input className="form-input" value={form.email || ''} disabled />
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Email cannot be changed</div>
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input className="form-input" type="number" value={form.age || ''}
                onChange={e => setForm({ ...form, age: e.target.value })} placeholder="25" />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-input form-select" value={form.gender || ''}
                onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input className="form-input" type="number" value={form.weight || ''}
                onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="70" />
            </div>
            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input className="form-input" type="number" value={form.height || ''}
                onChange={e => setForm({ ...form, height: e.target.value })} placeholder="170" />
            </div>
            <div className="form-group">
              <label className="form-label">Fitness Level</label>
              <select className="form-input form-select" value={form.fitnessLevel || ''}
                onChange={e => setForm({ ...form, fitnessLevel: e.target.value })}>
                <option value="">Select</option>
                <option value="beginner">🌱 Beginner</option>
                <option value="intermediate">🌿 Intermediate</option>
                <option value="advanced">🌳 Advanced</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Primary Goal</label>
              <select className="form-input form-select" value={form.goal || ''}
                onChange={e => setForm({ ...form, goal: e.target.value })}>
                <option value="">Select</option>
                <option value="weight_loss">🔥 Weight Loss</option>
                <option value="muscle_gain">💪 Muscle Gain</option>
                <option value="endurance">🏃 Endurance</option>
                <option value="general_fitness">⭐ General Fitness</option>
              </select>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ marginTop: 8 }}
          >
            {saving ? (
              <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Saving...</>
            ) : (
              <><Check size={16} /> Save Profile</>
            )}
          </button>
        </div>

        {/* Sidebar stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* BMI */}
          <div className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
              <Scale size={16} color="var(--primary)" />
              <h3 style={{ fontWeight: 700, fontSize: 14 }}>Body Stats</h3>
            </div>

            {bmi ? (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 38, fontWeight: 800, color: 'var(--text)', letterSpacing: -1 }}>{bmi}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>Body Mass Index</div>
                  {cat && <span className={`badge ${cat.cls}`}>{cat.label}</span>}
                </div>

                {/* BMI bar */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ position: 'relative', height: 8, background: 'var(--bg2)', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: `${bmiPercent}%`,
                      background: 'linear-gradient(90deg, var(--blue), var(--primary), var(--warning), var(--danger))',
                      borderRadius: 100, transition: 'width 0.6s ease'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
                    <span>10</span><span>18.5</span><span>25</span><span>30</span><span>45</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 12px', background: 'var(--bg)', borderRadius: 8 }}>
                    <span style={{ color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 5 }}><Scale size={13} /> Weight</span>
                    <span style={{ fontWeight: 600 }}>{form.weight} kg</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 12px', background: 'var(--bg)', borderRadius: 8 }}>
                    <span style={{ color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 5 }}><Ruler size={13} /> Height</span>
                    <span style={{ fontWeight: 600 }}>{form.height} cm</span>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text2)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                Add weight & height to see your BMI
              </p>
            )}
          </div>

          {/* Goals */}
          <div className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <Target size={16} color="var(--primary)" />
              <h3 style={{ fontWeight: 700, fontSize: 14 }}>Goals & Level</h3>
            </div>

            {form.goal ? (
              <div style={{
                padding: '12px 14px', background: 'var(--primary-soft)',
                border: '1px solid var(--primary-border)', borderRadius: 10,
                fontSize: 13, fontWeight: 600, color: 'var(--primary-dark)', marginBottom: 10
              }}>
                {GOAL_LABELS[form.goal] || form.goal}
              </div>
            ) : <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 10 }}>No goal set</p>}

            {form.fitnessLevel && (
              <span className="badge badge-blue">{form.fitnessLevel}</span>
            )}
          </div>

          {/* Tips */}
          <div className="card" style={{ padding: '16px 18px', background: 'var(--primary-soft)', border: '1px solid var(--primary-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Shield size={14} color="var(--primary)" />
              <h3 style={{ fontWeight: 600, fontSize: 13, color: 'var(--primary-dark)' }}>Health Tip</h3>
            </div>
            <p style={{ fontSize: 12, color: 'var(--primary-dark)', lineHeight: 1.5 }}>
              Keep your profile updated for more accurate AI workout plans tailored to your current stats.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
