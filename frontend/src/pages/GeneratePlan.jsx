import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generatePlan } from '../services/api';
import { Check, ChevronLeft, ChevronRight, Zap, AlertCircle } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const GOALS = [
  { value: 'weight_loss', icon: '🔥', label: 'Weight Loss', desc: 'Burn fat & slim down' },
  { value: 'muscle_gain', icon: '💪', label: 'Muscle Gain', desc: 'Build strength & mass' },
  { value: 'endurance', icon: '🏃', label: 'Endurance', desc: 'Boost stamina & cardio' },
  { value: 'general_fitness', icon: '⭐', label: 'General Fitness', desc: 'Stay healthy & active' },
];

const LEVELS = [
  { value: 'beginner', icon: '🌱', label: 'Beginner', desc: 'Just getting started' },
  { value: 'intermediate', icon: '🌿', label: 'Intermediate', desc: '1–2 years of training' },
  { value: 'advanced', icon: '🌳', label: 'Advanced', desc: '3+ years of training' },
];

const LOCATIONS = [
  { v: 'gym', i: '🏋️', l: 'Gym' },
  { v: 'home', i: '🏠', l: 'Home' },
  { v: 'outdoor', i: '🌳', l: 'Outdoor' },
];

const EQUIPMENT = ['Dumbbells', 'Barbell', 'Pull-up Bar', 'Resistance Bands', 'Kettlebell', 'Treadmill', 'Bench', 'Cable Machine'];

const STEPS = ['Goal', 'Level', 'Personal', 'Schedule', 'Equipment', 'Health', 'Review'];

export default function GeneratePlan() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    goal: '', fitnessLevel: '',
    age: '', gender: '', weight: '', height: '',
    workoutDays: [],
    location: 'gym', equipment: [],
    healthNotes: '',
  });

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      workoutDays: f.workoutDays.includes(day)
        ? f.workoutDays.filter(d => d !== day)
        : [...f.workoutDays, day]
    }));
  };

  const toggleEquipment = (eq) => {
    setForm(f => ({
      ...f,
      equipment: f.equipment.includes(eq)
        ? f.equipment.filter(e => e !== eq)
        : [...f.equipment, eq]
    }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        age: parseInt(form.age) || 25,
        weight: parseFloat(form.weight) || 70,
        height: parseFloat(form.height) || 170,
        workoutDays: form.workoutDays.map(d => FULL_DAYS[DAYS.indexOf(d)]),
      };
      await generatePlan(payload);
      navigate('/plans');
    } catch (e) {
      setError('Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 0) return !!form.goal;
    if (step === 1) return !!form.fitnessLevel;
    if (step === 3) return form.workoutDays.length > 0;
    return true;
  };

  const bmi = form.weight && form.height
    ? (form.weight / Math.pow(form.height / 100, 2)).toFixed(1)
    : null;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Generate Workout Plan</h1>
        <p className="page-subtitle">Answer a few questions and we'll create your personalized plan</p>
      </div>

      {/* Step indicator */}
      <div className="step-indicator">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className="step">
              <div className={`step-dot ${i < step ? 'done' : i === step ? 'active' : 'pending'}`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`step-label ${i === step ? 'active' : ''}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'done' : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Progress bar */}
      <div className="progress-bar" style={{ marginBottom: 28 }}>
        <div className="progress-fill" style={{ width: `${((step) / (STEPS.length - 1)) * 100}%` }} />
      </div>

      <div className="card" style={{ maxWidth: 660 }}>

        {/* Step 0: Goal */}
        {step === 0 && (
          <div>
            <h2 style={{ fontWeight: 700, marginBottom: 6, fontSize: 20 }}>What's your primary goal?</h2>
            <p style={{ color: 'var(--text2)', marginBottom: 22, fontSize: 14 }}>Choose your main fitness objective</p>
            <div className="option-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {GOALS.map(g => (
                <div key={g.value}
                  className={`option-card ${form.goal === g.value ? 'selected' : ''}`}
                  onClick={() => setForm({ ...form, goal: g.value })}
                  style={{ padding: '20px 16px', position: 'relative' }}
                >
                  {form.goal === g.value && (
                    <div style={{
                      position: 'absolute', top: 10, right: 10,
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Check size={12} color="white" />
                    </div>
                  )}
                  <div className="icon">{g.icon}</div>
                  <div className="label" style={{ marginBottom: 4 }}>{g.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 400 }}>{g.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Level */}
        {step === 1 && (
          <div>
            <h2 style={{ fontWeight: 700, marginBottom: 6, fontSize: 20 }}>Fitness Level</h2>
            <p style={{ color: 'var(--text2)', marginBottom: 22, fontSize: 14 }}>How would you describe your current fitness level?</p>
            <div className="option-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {LEVELS.map(l => (
                <div key={l.value}
                  className={`option-card ${form.fitnessLevel === l.value ? 'selected' : ''}`}
                  onClick={() => setForm({ ...form, fitnessLevel: l.value })}
                  style={{ position: 'relative', padding: '22px 14px' }}
                >
                  {form.fitnessLevel === l.value && (
                    <div style={{
                      position: 'absolute', top: 10, right: 10,
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Check size={12} color="white" />
                    </div>
                  )}
                  <div className="icon">{l.icon}</div>
                  <div className="label" style={{ marginBottom: 4 }}>{l.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 400 }}>{l.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Personal */}
        {step === 2 && (
          <div>
            <h2 style={{ fontWeight: 700, marginBottom: 6, fontSize: 20 }}>Personal Information</h2>
            <p style={{ color: 'var(--text2)', marginBottom: 22, fontSize: 14 }}>Help us personalize your plan</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input className="form-input" type="number" placeholder="25" value={form.age}
                  onChange={e => setForm({ ...form, age: e.target.value })} min={10} max={100} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-input form-select" value={form.gender}
                  onChange={e => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input className="form-input" type="number" placeholder="70" value={form.weight}
                  onChange={e => setForm({ ...form, weight: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input className="form-input" type="number" placeholder="170" value={form.height}
                  onChange={e => setForm({ ...form, height: e.target.value })} />
              </div>
            </div>
            {bmi && (
              <div className="alert alert-success" style={{ marginTop: 4 }}>
                ✅ BMI: <strong>{bmi}</strong> — will be analyzed by AI for personalized recommendations
              </div>
            )}
          </div>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <div>
            <h2 style={{ fontWeight: 700, marginBottom: 6, fontSize: 20 }}>Training Schedule</h2>
            <p style={{ color: 'var(--text2)', marginBottom: 22, fontSize: 14 }}>Select the days you want to work out</p>
            <div className="day-grid" style={{ marginBottom: 20 }}>
              {DAYS.map(d => (
                <button key={d}
                  className={`day-btn ${form.workoutDays.includes(d) ? 'selected' : ''}`}
                  onClick={() => toggleDay(d)}
                >
                  {form.workoutDays.includes(d) && <Check size={12} style={{ marginBottom: 2 }} />}
                  {d}
                </button>
              ))}
            </div>
            {form.workoutDays.length > 0 && (
              <div className="alert alert-success">
                ✅ <strong>{form.workoutDays.length} days</strong> selected: {form.workoutDays.join(' · ')}
              </div>
            )}
            {form.workoutDays.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text3)' }}>Please select at least one day</p>
            )}
          </div>
        )}

        {/* Step 4: Equipment */}
        {step === 4 && (
          <div>
            <h2 style={{ fontWeight: 700, marginBottom: 6, fontSize: 20 }}>Location & Equipment</h2>
            <p style={{ color: 'var(--text2)', marginBottom: 22, fontSize: 14 }}>Where will you be training?</p>
            <div className="form-group">
              <label className="form-label">Training Location</label>
              <div className="option-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
                {LOCATIONS.map(o => (
                  <div key={o.v}
                    className={`option-card ${form.location === o.v ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, location: o.v })}
                    style={{ position: 'relative' }}
                  >
                    {form.location === o.v && (
                      <div style={{
                        position: 'absolute', top: 8, right: 8,
                        width: 18, height: 18, borderRadius: '50%',
                        background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Check size={11} color="white" />
                      </div>
                    )}
                    <div className="icon">{o.i}</div>
                    <div className="label">{o.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <label className="form-label">Available Equipment <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(optional)</span></label>
            <div className="option-grid">
              {EQUIPMENT.map(eq => (
                <div key={eq}
                  className={`option-card ${form.equipment.includes(eq) ? 'selected' : ''}`}
                  onClick={() => toggleEquipment(eq)}
                  style={{ padding: '14px 10px', position: 'relative' }}
                >
                  {form.equipment.includes(eq) && (
                    <div style={{
                      position: 'absolute', top: 6, right: 6,
                      width: 16, height: 16, borderRadius: '50%',
                      background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Check size={10} color="white" />
                    </div>
                  )}
                  <div className="label" style={{ fontSize: 12 }}>{eq}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Health */}
        {step === 5 && (
          <div>
            <h2 style={{ fontWeight: 700, marginBottom: 6, fontSize: 20 }}>Health & Safety</h2>
            <p style={{ color: 'var(--text2)', marginBottom: 22, fontSize: 14 }}>Any injuries or conditions we should know?</p>
            <div className="form-group">
              <label className="form-label">Health Notes <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(optional)</span></label>
              <textarea className="form-input form-textarea"
                placeholder="e.g. bad knees, lower back pain, heart condition..."
                value={form.healthNotes}
                onChange={e => setForm({ ...form, healthNotes: e.target.value })}
                rows={5}
              />
            </div>
            <div className="alert alert-warning" style={{ display: 'flex', gap: 10 }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>AI will analyze health notes and add safety recommendations to your plan.</span>
            </div>
          </div>
        )}

        {/* Step 6: Review */}
        {step === 6 && (
          <div>
            <h2 style={{ fontWeight: 700, marginBottom: 6, fontSize: 20 }}>Review & Generate</h2>
            <p style={{ color: 'var(--text2)', marginBottom: 22, fontSize: 14 }}>Confirm your details before generating</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[
                { l: 'Goal', v: GOALS.find(g => g.value === form.goal)?.label || form.goal, icon: '🎯' },
                { l: 'Level', v: form.fitnessLevel, icon: '📊' },
                { l: 'Profile', v: `${form.age || '—'} yrs · ${form.gender || '—'} · ${form.weight || '—'} kg · ${form.height || '—'} cm`, icon: '👤' },
                { l: 'Training Days', v: form.workoutDays.join(', '), icon: '📅' },
                { l: 'Location', v: LOCATIONS.find(l => l.v === form.location)?.l || form.location, icon: '📍' },
                { l: 'Equipment', v: form.equipment.length ? form.equipment.join(', ') : 'None specified', icon: '🏋️' },
                { l: 'Health Notes', v: form.healthNotes || 'None mentioned', icon: '🩺' },
              ].map(item => (
                <div key={item.l} style={{
                  display: 'flex', gap: 14, padding: '12px 16px',
                  background: 'var(--bg)', borderRadius: 10, alignItems: 'flex-start'
                }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span style={{ minWidth: 110, color: 'var(--text2)', fontSize: 13 }}>{item.l}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize', flex: 1 }}>{item.v}</span>
                </div>
              ))}
            </div>
            {error && (
              <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 28, paddingTop: 22, borderTop: '1px solid var(--border)'
        }}>
          <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
            <ChevronLeft size={16} /> Back
          </button>
          <span style={{ fontSize: 13, color: 'var(--text3)' }}>Step {step + 1} of {STEPS.length}</span>
          {step < 6 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                  <span>Generating...</span>
                </>
              ) : (
                <><Zap size={16} /> Generate Plan</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
