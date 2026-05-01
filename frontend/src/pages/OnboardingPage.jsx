import React, { useState } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { Dumbbell, ChevronRight, ChevronLeft, Check, Zap, AlertCircle } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
//  ASSESSMENT DATA
// ─────────────────────────────────────────────────────────────
const GOALS = [
  { value: 'weight_loss',     emoji: '🔥', label: 'Lose Weight',     desc: 'Burn fat & get lean' },
  { value: 'muscle_gain',     emoji: '💪', label: 'Build Muscle',    desc: 'Gain strength & mass' },
  { value: 'endurance',       emoji: '🏃', label: 'Boost Endurance', desc: 'Cardio & stamina' },
  { value: 'general_fitness', emoji: '⭐', label: 'Stay Fit',        desc: 'Balanced health' },
];

const LEVELS = [
  { value: 'beginner',     emoji: '🌱', label: 'Beginner',     desc: 'New to training or <6 months' },
  { value: 'intermediate', emoji: '⚡', label: 'Intermediate', desc: '6 months – 2 years of training' },
  { value: 'advanced',     emoji: '🔥', label: 'Advanced',     desc: '2+ years, serious athlete' },
];

const DAYS_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DAYS_FULL  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const LOCATIONS = [
  { value: 'gym',     emoji: '🏋️', label: 'Gym' },
  { value: 'home',    emoji: '🏠', label: 'Home' },
  { value: 'outdoor', emoji: '🌳', label: 'Outdoor' },
];

const EQUIPMENT_LIST = ['Dumbbells','Barbell','Pull-up Bar','Resistance Bands','Kettlebell','Treadmill','Bench','Cable Machine'];

const STEPS = ['Goal','Level','About You','Schedule','Setup','Review'];

// ─────────────────────────────────────────────────────────────
//  TINY HELPERS
// ─────────────────────────────────────────────────────────────
function OptionCard({ selected, onClick, emoji, label, desc, checkSize = 16 }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative', padding: '18px 14px', textAlign: 'center',
        background: selected ? 'var(--primary-soft)' : '#fff',
        border: `2px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: 14, cursor: 'pointer', transition: 'all .18s',
        boxShadow: selected ? '0 0 0 3px rgba(22,163,74,.12)' : 'var(--shadow-sm)',
        fontFamily: 'inherit',
      }}
    >
      {selected && (
        <span style={{
          position: 'absolute', top: 8, right: 8,
          width: 20, height: 20, borderRadius: '50%',
          background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={checkSize} color="#fff" />
        </span>
      )}
      <div style={{ fontSize: 26, marginBottom: 6 }}>{emoji}</div>
      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>{label}</div>
      {desc && <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.4 }}>{desc}</div>}
    </button>
  );
}

function StepDot({ status, num }) {
  const colors = {
    done:    { bg: 'var(--primary)',       color: '#fff' },
    active:  { bg: 'var(--primary)',       color: '#fff', ring: true },
    pending: { bg: '#fff',                 color: 'var(--text3)', border: '2px solid var(--border)' },
  };
  const s = colors[status];
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, flexShrink: 0, transition: 'all .25s',
      background: s.bg, color: s.color, border: s.border || 'none',
      boxShadow: s.ring ? '0 0 0 4px rgba(22,163,74,.18)' : 'none',
    }}>
      {status === 'done' ? <Check size={13} /> : num}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const { completeOnboarding, generating } = useOnboarding();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({
    goal: '', level: '', age: '', gender: '', weight: '', height: '',
    workoutDays: [], location: 'gym', equipment: [], healthNotes: '',
  });

  const set = (k, v) => setAnswers(a => ({ ...a, [k]: v }));
  const toggleDay  = d  => set('workoutDays', answers.workoutDays.includes(d) ? answers.workoutDays.filter(x=>x!==d) : [...answers.workoutDays, d]);
  const toggleEq   = eq => set('equipment',   answers.equipment.includes(eq)  ? answers.equipment.filter(x=>x!==eq)  : [...answers.equipment, eq]);

  const canNext = () => {
    if (step === 0) return !!answers.goal;
    if (step === 1) return !!answers.level;
    if (step === 3) return answers.workoutDays.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    try {
      const payload = {
        ...answers,
        workoutDays: answers.workoutDays.map(d => DAYS_FULL[DAYS_SHORT.indexOf(d)]),
      };
      await completeOnboarding(payload);
    } catch {
      setError('Failed to generate your plan. Please try again.');
    }
  };

  const bmi = answers.weight && answers.height
    ? (answers.weight / Math.pow(answers.height / 100, 2)).toFixed(1)
    : null;

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 60%, #eff6ff 100%)',
      padding: '24px 16px', overflow: 'hidden',
    }}>
      {/* Header brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
        <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(22,163,74,.3)' }}>
          <Dumbbell size={18} color="#fff" />
        </div>
        <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, color: 'var(--text)' }}>
          Fit<span style={{ color: 'var(--primary)' }}>AI</span>
        </span>
      </div>

      {/* CARD */}
      <div style={{
        width: '100%', maxWidth: 580,
        background: '#fff', borderRadius: 24, padding: '36px 40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.10), 0 4px 16px rgba(22,163,74,0.08)',
        border: '1px solid var(--border)',
      }}>
        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, gap: 0 }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <StepDot status={i < step ? 'done' : i === step ? 'active' : 'pending'} num={i+1} />
                <span style={{
                  fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                  color: i === step ? 'var(--primary-dark)' : i < step ? 'var(--text2)' : 'var(--text3)',
                }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < step ? 'var(--primary)' : 'var(--border)', margin: '0 6px', minWidth: 12 }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ height: 5, background: 'var(--bg2)', borderRadius: 99, marginBottom: 28, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(step / (STEPS.length - 1)) * 100}%`, background: 'var(--primary)', borderRadius: 99, transition: 'width .4s ease' }} />
        </div>

        {/* ── STEP 0: Goal ─────────────────────────────────── */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: 'var(--text)', letterSpacing: -.3 }}>What's your goal?</h2>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 22 }}>Choose your primary fitness objective</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {GOALS.map(g => (
                <OptionCard key={g.value} selected={answers.goal===g.value} onClick={()=>set('goal',g.value)} emoji={g.emoji} label={g.label} desc={g.desc} />
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 1: Level ────────────────────────────────── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, letterSpacing: -.3 }}>Your fitness level?</h2>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 22 }}>Be honest — we'll tailor every exercise to your level</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {LEVELS.map(l => (
                <OptionCard key={l.value} selected={answers.level===l.value} onClick={()=>set('level',l.value)} emoji={l.emoji} label={l.label} desc={l.desc} />
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: Personal ─────────────────────────────── */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, letterSpacing: -.3 }}>About you</h2>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 22 }}>Used to personalize intensity and nutrition advice</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { k:'age',    label:'Age',         type:'number', ph:'25' },
                { k:'gender', label:'Gender',      type:'select', opts:['male','female','other'] },
                { k:'weight', label:'Weight (kg)', type:'number', ph:'70' },
                { k:'height', label:'Height (cm)', type:'number', ph:'170' },
              ].map(f => (
                <div className="form-group" key={f.k} style={{ margin: 0 }}>
                  <label className="form-label">{f.label}</label>
                  {f.type === 'select' ? (
                    <select className="form-input form-select" value={answers[f.k]} onChange={e=>set(f.k,e.target.value)}>
                      <option value="">Select</option>
                      {f.opts.map(o=><option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
                    </select>
                  ) : (
                    <input className="form-input" type={f.type} placeholder={f.ph} value={answers[f.k]} onChange={e=>set(f.k,e.target.value)} />
                  )}
                </div>
              ))}
            </div>
            {bmi && (
              <div className="alert alert-success" style={{ marginTop: 12 }}>
                ✅ BMI: <strong>{bmi}</strong> — AI will factor this into your plan
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Schedule ─────────────────────────────── */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, letterSpacing: -.3 }}>Training schedule</h2>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 22 }}>Which days will you work out?</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              {DAYS_SHORT.map(d => (
                <button key={d} onClick={()=>toggleDay(d)} style={{
                  width: 52, height: 52, borderRadius: 12, border: `2px solid ${answers.workoutDays.includes(d) ? 'var(--primary)' : 'var(--border)'}`,
                  background: answers.workoutDays.includes(d) ? 'var(--primary-soft)' : '#fff',
                  color: answers.workoutDays.includes(d) ? 'var(--primary-dark)' : 'var(--text2)',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all .15s',
                  boxShadow: answers.workoutDays.includes(d) ? '0 0 0 3px rgba(22,163,74,.12)' : 'none',
                  fontFamily: 'inherit',
                }}>{d}</button>
              ))}
            </div>
            {answers.workoutDays.length > 0 && (
              <div className="alert alert-success">
                ✅ <strong>{answers.workoutDays.length} days</strong> selected: {answers.workoutDays.join(' · ')}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4: Setup ────────────────────────────────── */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, letterSpacing: -.3 }}>Location & Equipment</h2>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 18 }}>Where will you train?</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 22 }}>
              {LOCATIONS.map(l => (
                <OptionCard key={l.value} selected={answers.location===l.value} onClick={()=>set('location',l.value)} emoji={l.emoji} label={l.label} />
              ))}
            </div>
            <label className="form-label">Available Equipment <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(optional)</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {EQUIPMENT_LIST.map(eq => (
                <button key={eq} onClick={()=>toggleEq(eq)} style={{
                  padding: '10px 6px', textAlign: 'center', fontSize: 11, fontWeight: 600,
                  border: `2px solid ${answers.equipment.includes(eq) ? 'var(--primary)' : 'var(--border)'}`,
                  background: answers.equipment.includes(eq) ? 'var(--primary-soft)' : '#fff',
                  color: answers.equipment.includes(eq) ? 'var(--primary-dark)' : 'var(--text2)',
                  borderRadius: 10, cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit',
                  boxShadow: answers.equipment.includes(eq) ? '0 0 0 2px rgba(22,163,74,.12)' : 'none',
                }}>{eq}</button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 5: Review ───────────────────────────────── */}
        {step === 5 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, letterSpacing: -.3 }}>Ready to launch 🚀</h2>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 22 }}>Review your profile — we'll build your first plan now</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {[
                { icon:'🎯', l:'Goal',     v: GOALS.find(g=>g.value===answers.goal)?.label },
                { icon:'📊', l:'Level',    v: LEVELS.find(l=>l.value===answers.level)?.label },
                { icon:'👤', l:'Profile',  v: `${answers.age||'—'} yrs · ${answers.gender||'—'} · ${answers.weight||'—'}kg · ${answers.height||'—'}cm` },
                { icon:'📅', l:'Days',     v: answers.workoutDays.join(', ') || '—' },
                { icon:'📍', l:'Location', v: answers.location },
                { icon:'🏋️', l:'Equipment',v: answers.equipment.length ? answers.equipment.join(', ') : 'None specified' },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: 'var(--bg)', borderRadius: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 16 }}>{r.icon}</span>
                  <span style={{ minWidth: 80, fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{r.l}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>{r.v}</span>
                </div>
              ))}
            </div>
            {error && (
              <div className="alert alert-error" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
                <AlertCircle size={15} /> {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-secondary" onClick={()=>setStep(s=>s-1)} disabled={step===0} style={{ gap: 6 }}>
            <ChevronLeft size={16} /> Back
          </button>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>{step+1} / {STEPS.length}</span>
          {step < 5 ? (
            <button className="btn btn-primary" onClick={()=>setStep(s=>s+1)} disabled={!canNext()} style={{ gap: 6 }}>
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={generating} style={{ gap: 8 }}>
              {generating ? (
                <><div className="spinner" style={{ width:17,height:17,borderWidth:2,borderColor:'rgba(255,255,255,.3)',borderTopColor:'#fff' }} /> Generating…</>
              ) : (
                <><Zap size={16} /> Build My Plan</>
              )}
            </button>
          )}
        </div>
      </div>

      <p style={{ marginTop: 20, fontSize: 12, color: 'var(--text3)' }}>
        This assessment is done only once. Your plan evolves automatically as you level up.
      </p>
    </div>
  );
}
