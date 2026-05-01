import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useOnboarding, LEVELS } from '../context/OnboardingContext';
import { getMyPlans } from '../services/api';
import {
  ChevronDown, ChevronUp, CheckSquare, Square, Zap,
  TrendingUp, Calendar, Target, Trophy, X, Star, ArrowUp,
  Flame, Salad, ShieldCheck,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
//  LEVEL-UP BANNER (overlay)
// ─────────────────────────────────────────────────────────────
function LevelUpBanner({ from, to, onDismiss }) {
  const toLabel = LEVELS[to]?.label || to;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn .3s ease',
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, padding: '48px 52px', textAlign: 'center',
        maxWidth: 420, width: '90%', boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* confetti ring */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(22,163,74,.04),rgba(59,130,246,.04))', borderRadius: 24 }} />
        <button onClick={onDismiss} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--text2)' }}>
          <X size={16} />
        </button>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 12px 32px rgba(22,163,74,.35)' }}>
          <Trophy size={36} color="#fff" />
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Level Complete!</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8, letterSpacing: -.5 }}>
          You've leveled up! <span style={{ color: 'var(--primary)' }}>🎉</span>
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
          You crushed the <strong>{LEVELS[from]?.label}</strong> level.<br />
          Your new <strong style={{ color: 'var(--primary)' }}>{toLabel}</strong> plan is ready!
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', background: 'var(--primary-soft)', border: '1px solid var(--primary-border)', borderRadius: 12, marginBottom: 24 }}>
          <ArrowUp size={16} color="var(--primary)" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary-dark)' }}>
            {LEVELS[from]?.label} → {toLabel}
          </span>
        </div>
        <button className="btn btn-primary btn-lg" onClick={onDismiss} style={{ width: '100%', justifyContent: 'center' }}>
          <Star size={16} /> View My New Plan
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  EXERCISE ROW
// ─────────────────────────────────────────────────────────────
function ExerciseRow({ ex, idx, isChecked, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
        background: isChecked ? 'var(--primary-soft)' : '#fff',
        border: `1.5px solid ${isChecked ? 'var(--primary-border)' : 'var(--border)'}`,
        transition: 'all .18s', userSelect: 'none',
      }}
    >
      <div style={{ marginTop: 1, flexShrink: 0, color: isChecked ? 'var(--primary)' : 'var(--text3)' }}>
        {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 700, fontSize: 13, color: isChecked ? 'var(--primary-dark)' : 'var(--text)',
          textDecoration: isChecked ? 'line-through' : 'none', transition: 'all .18s',
        }}>{ex.name}</div>
        <div style={{ display: 'flex', gap: 12, marginTop: 5, flexWrap: 'wrap' }}>
          {ex.sets && <span style={{ fontSize: 11, color: isChecked ? 'var(--primary)' : 'var(--text2)', fontWeight: 600 }}>{ex.sets} sets</span>}
          {ex.reps && <span style={{ fontSize: 11, color: isChecked ? 'var(--primary)' : 'var(--text2)', fontWeight: 600 }}>{ex.reps} reps</span>}
          {ex.rest && <span style={{ fontSize: 11, color: 'var(--text3)' }}>Rest {ex.rest}</span>}
          {ex.muscleGroup && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: isChecked ? 'rgba(22,163,74,.15)' : 'var(--bg2)', color: isChecked ? 'var(--primary-dark)' : 'var(--text2)', fontWeight: 600 }}>{ex.muscleGroup}</span>}
        </div>
        {ex.coachTip && (
          <div style={{ marginTop: 6, fontSize: 11, color: '#78350f', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: '5px 9px', lineHeight: 1.4 }}>
            💡 {ex.coachTip}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  DAY SECTION (inside expanded plan)
// ─────────────────────────────────────────────────────────────
function DaySection({ day, planId, exerciseChecks, onToggle }) {
  const [open, setOpen] = useState(true);
  const exs = day.exercises || [];
  const doneCount = exs.filter((_, i) => exerciseChecks[`${planId}_${day.day}_${i}`]).length;
  const allDone = exs.length > 0 && doneCount === exs.length;

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', background: '#fff', boxShadow: 'var(--shadow-sm)' }}>
      {/* Header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', cursor: 'pointer', userSelect: 'none',
          background: allDone ? 'var(--primary-soft)' : '#fff',
          borderBottom: open ? '1px solid var(--border)' : 'none',
          transition: 'background .2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {allDone && <CheckSquare size={16} color="var(--primary)" />}
          <span style={{ fontWeight: 700, fontSize: 14, color: allDone ? 'var(--primary-dark)' : 'var(--text)' }}>{day.day}</span>
          {day.focus && <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 99, background: 'var(--primary-soft)', color: 'var(--primary-dark)', fontWeight: 600, border: '1px solid var(--primary-border)' }}>{day.focus}</span>}
          {day.duration && <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 99, background: 'var(--blue-soft)', color: '#1d4ed8', fontWeight: 600 }}>{day.duration}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: allDone ? 'var(--primary)' : 'var(--text3)', fontWeight: 600 }}>
            {doneCount}/{exs.length}
          </span>
          {open ? <ChevronUp size={16} color="var(--text3)" /> : <ChevronDown size={16} color="var(--text3)" />}
        </div>
      </div>

      {open && (
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {day.warmup && (
            <div style={{ padding: '9px 12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, fontSize: 12, color: '#9a3412', display: 'flex', gap: 8 }}>
              <span>🔥</span><span><strong>Warm-up:</strong> {day.warmup}</span>
            </div>
          )}
          {exs.map((ex, i) => (
            <ExerciseRow
              key={i} ex={ex} idx={i}
              isChecked={!!exerciseChecks[`${planId}_${day.day}_${i}`]}
              onToggle={() => onToggle(planId, day.day, i)}
            />
          ))}
          {day.cooldown && (
            <div style={{ padding: '9px 12px', background: 'var(--blue-soft)', border: '1px solid #bfdbfe', borderRadius: 10, fontSize: 12, color: '#1e40af', display: 'flex', gap: 8 }}>
              <span>❄️</span><span><strong>Cool-down:</strong> {day.cooldown}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MAIN PAGE  (single-page, no scroll, expandable panel)
// ─────────────────────────────────────────────────────────────
export default function MyPlanPage() {
  const { state, toggleExercise, getProgress, checkLevelUp, doLevelUp, generating, levelUpEvent, dismissLevelUpEvent } = useOnboarding();
  const [plan, setPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [autoLevelingUp, setAutoLevelingUp] = useState(false);
  const panelRef = useRef(null);

  // Load the current plan from API
  useEffect(() => {
    if (!state?.currentPlanId) { setLoadingPlan(false); return; }
    setLoadingPlan(true);
    getMyPlans()
      .then(r => {
        const found = r.data.find(p => p.id === state.currentPlanId) || r.data[0] || null;
        setPlan(found);
      })
      .catch(() => setPlan(null))
      .finally(() => setLoadingPlan(false));
  }, [state?.currentPlanId]);

  // Auto level-up check
  useEffect(() => {
    if (!autoLevelingUp && state && checkLevelUp()) {
      setAutoLevelingUp(true);
      doLevelUp().finally(() => setAutoLevelingUp(false));
    }
  }, [state?.xp]); // eslint-disable-line

  // Close expanded on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') setExpanded(false); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const progress = getProgress();
  const levelDef = LEVELS[state?.currentLevel] || LEVELS.beginner;

  let parsed = null;
  if (plan?.planContent) {
    try { parsed = JSON.parse(plan.planContent); } catch {}
  }

  const totalExercises = parsed?.weeklyPlan?.reduce((acc, d) => acc + (d.exercises?.length || 0), 0) || 0;
  const doneExercises = parsed?.weeklyPlan?.reduce((acc, d) =>
    acc + (d.exercises || []).filter((_, i) => state?.exerciseChecks?.[`${plan?.id}_${d.day}_${i}`]).length, 0) || 0;
  const weekDonePercent = totalExercises > 0 ? Math.round((doneExercises / totalExercises) * 100) : 0;

  // ── EXPANDED VIEW (full-screen overlay) ───────────────────
  if (expanded) {
    return (
      <>
        {levelUpEvent && <LevelUpBanner from={levelUpEvent.from} to={levelUpEvent.to} onDismiss={dismissLevelUpEvent} />}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: '#fff', display: 'flex', flexDirection: 'column',
          animation: 'slideUp .25s ease',
        }}>
          {/* Top bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 24px', borderBottom: '1px solid var(--border)',
            background: '#fff', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-dark)' }}>{levelDef.label} Plan</span>
              </div>
              <span style={{ color: 'var(--border)', fontSize: 16 }}>|</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{plan?.title || 'My Workout Plan'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>Week progress</span>
                <div style={{ width: 80, height: 6, background: 'var(--bg2)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${weekDonePercent}%`, height: '100%', background: 'var(--primary)', borderRadius: 99, transition: 'width .4s' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-dark)' }}>{weekDonePercent}%</span>
              </div>
              <button
                onClick={() => setExpanded(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 10, background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text2)', fontFamily: 'inherit' }}
              >
                <ChevronDown size={15} /> Collapse
              </button>
            </div>
          </div>

          {/* Scrollable plan content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
            {loadingPlan || generating ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 720, margin: '0 auto' }}>
                {[1,2,3].map(i=><div key={i} className="skeleton" style={{ height: 72, borderRadius: 14 }} />)}
              </div>
            ) : !parsed ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                <p style={{ color: 'var(--text2)' }}>Plan content could not be parsed.</p>
              </div>
            ) : (
              <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Safety + BMI inline row */}
                {(parsed.bmi || parsed.safetyWarnings?.length > 0) && (
                  <div style={{ display: 'grid', gridTemplateColumns: parsed.bmi && parsed.safetyWarnings?.length ? '1fr 1fr' : '1fr', gap: 12, marginBottom: 4 }}>
                    {parsed.bmi && (
                      <div style={{ padding: '14px 18px', background: 'var(--primary-soft)', border: '1px solid var(--primary-border)', borderRadius: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff', border: '2px solid var(--primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary-dark)' }}>{parsed.bmi.value}</span>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 2 }}>BMI</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-dark)' }}>{parsed.bmi.category}</div>
                          <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{parsed.bmi.advice}</div>
                        </div>
                      </div>
                    )}
                    {parsed.safetyWarnings?.length > 0 && (
                      <div style={{ padding: '14px 18px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <ShieldCheck size={14} color="#92400e" />
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>Safety Notes</span>
                        </div>
                        {parsed.safetyWarnings.slice(0,2).map((w,i) => (
                          <div key={i} style={{ fontSize: 11, color: '#78350f', marginBottom: 4 }}>• {w}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Weekly plan days */}
                {parsed.weeklyPlan?.map(day => (
                  <DaySection
                    key={day.day} day={day} planId={plan?.id}
                    exerciseChecks={state?.exerciseChecks || {}}
                    onToggle={toggleExercise}
                  />
                ))}

                {/* Nutrition */}
                {parsed.nutritionTips?.length > 0 && (
                  <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                      <Salad size={15} color="var(--primary)" />
                      <span style={{ fontWeight: 700, fontSize: 13 }}>Nutrition Tips</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {parsed.nutritionTips.map((t,i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
                          <span style={{ color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>{i+1}.</span>{t}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progression */}
                {parsed.progressionAdvice && (
                  <div style={{ background: 'var(--primary-soft)', border: '1px solid var(--primary-border)', borderRadius: 14, padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <TrendingUp size={14} color="var(--primary)" />
                      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary-dark)' }}>Progression Advice</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--primary-dark)', lineHeight: 1.6 }}>{parsed.progressionAdvice}</p>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
          @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        `}</style>
      </>
    );
  }

  // ── COLLAPSED VIEW (no scroll dashboard) ─────────────────
  return (
    <>
      {levelUpEvent && <LevelUpBanner from={levelUpEvent.from} to={levelUpEvent.to} onDismiss={dismissLevelUpEvent} />}

      <div className="fade-in" style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>

        {/* ── TOP ROW: greeting + stats ───────────────────── */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'stretch', flexShrink: 0 }}>

          {/* Greeting card */}
          <div style={{
            flex: 1, padding: '20px 24px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #059669 100%)',
            borderRadius: 20, color: '#fff',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(22,163,74,.25)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, opacity: .7, marginBottom: 6 }}>Your Journey</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -.3, marginBottom: 4 }}>
              {levelDef.label} Level
            </div>
            <div style={{ fontSize: 13, opacity: .8 }}>
              {levelDef.next ? `Advance to ${LEVELS[levelDef.next]?.label} by earning ${progress.xpMax} XP` : '🏆 You\'ve reached the top level!'}
            </div>
          </div>

          {/* Stats — 3 mini tiles */}
          {[
            { icon: <Zap size={17} color="var(--accent)" />, bg: '#fff7ed', val: `${progress.xp}`, label: 'XP Earned', sub: `/ ${progress.xpMax}` },
            { icon: <Calendar size={17} color="var(--blue)" />, bg: 'var(--blue-soft)', val: `${progress.daysCompleted}`, label: 'Days Done', sub: `/ ${progress.daysRequired}` },
            { icon: <Flame size={17} color="#ef4444" />, bg: '#fef2f2', val: `${weekDonePercent}%`, label: 'Week Progress', sub: `${doneExercises}/${totalExercises} ex.` },
          ].map((s, i) => (
            <div key={i} style={{
              width: 120, padding: '16px 14px', background: '#fff',
              border: '1px solid var(--border)', borderRadius: 16,
              boxShadow: 'var(--shadow-sm)', flexShrink: 0,
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                {s.icon}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: -1 }}>
                {s.val}<span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>{s.sub}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── XP PROGRESS BAR ─────────────────────────────── */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 20px', boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={15} color="var(--primary)" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Level Progress</span>
            </div>
            <div style={{ display: 'flex', align: 'center', gap: 6 }}>
              {autoLevelingUp || generating ? (
                <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, display: 'flex', gap: 5, alignItems: 'center' }}>
                  <div className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} />
                  Generating next level…
                </span>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{progress.xp} / {progress.xpMax} XP — {Math.round(progress.percent)}%</span>
              )}
            </div>
          </div>
          <div style={{ height: 10, background: 'var(--bg2)', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
            <div style={{
              height: '100%',
              width: `${progress.percent}%`,
              background: progress.percent >= 100
                ? 'linear-gradient(90deg, var(--primary), #059669)'
                : 'linear-gradient(90deg, var(--primary), var(--primary-light))',
              borderRadius: 99, transition: 'width .5s ease',
            }} />
          </div>
          {/* Level markers */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {['Beginner','Intermediate','Advanced'].map((l,i) => (
              <span key={l} style={{ fontSize: 10, color: i <= ['beginner','intermediate','advanced'].indexOf(state?.currentLevel) ? 'var(--primary-dark)' : 'var(--text3)', fontWeight: 600 }}>{l}</span>
            ))}
          </div>
        </div>

        {/* ── COLLAPSED PLAN CARD (clickable to expand) ───── */}
        <div
          ref={panelRef}
          onClick={() => !loadingPlan && setExpanded(true)}
          style={{
            flex: 1, background: '#fff',
            border: '1.5px solid var(--border)', borderRadius: 20,
            padding: '20px 24px', cursor: loadingPlan ? 'default' : 'pointer',
            boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            transition: 'all .2s',
            position: 'relative',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='var(--primary-border)'; e.currentTarget.style.boxShadow='var(--shadow)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='var(--shadow-sm)'; }}
        >
          {/* Plan header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 2.5s infinite' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: .6 }}>Active Plan</span>
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', letterSpacing: -.2 }}>
                {loadingPlan ? <span className="skeleton" style={{ display:'inline-block', width:200, height:18 }} /> : (plan?.title || 'My Workout Plan')}
              </h2>
            </div>
            {!loadingPlan && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                background: 'var(--primary-soft)', border: '1px solid var(--primary-border)',
                borderRadius: 10, color: 'var(--primary-dark)', fontSize: 13, fontWeight: 700,
              }}>
                <ChevronUp size={15} /> Open Plan
              </div>
            )}
          </div>

          {/* Preview: first 3 exercises of first day */}
          {loadingPlan || generating ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 44, borderRadius: 10 }} />)}
            </div>
          ) : !parsed ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, opacity: .5 }}>
              <Target size={32} color="var(--text3)" />
              <p style={{ fontSize: 13, color: 'var(--text2)' }}>No plan content yet</p>
            </div>
          ) : (
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Day tabs preview row */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                {parsed.weeklyPlan?.map((d, i) => {
                  const dayExs = d.exercises || [];
                  const dayDone = dayExs.filter((_,ei) => state?.exerciseChecks?.[`${plan?.id}_${d.day}_${ei}`]).length;
                  const fullyDone = dayExs.length > 0 && dayDone === dayExs.length;
                  return (
                    <div key={i} style={{
                      padding: '5px 11px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                      background: fullyDone ? 'var(--primary)' : 'var(--bg2)',
                      color: fullyDone ? '#fff' : 'var(--text2)',
                      border: `1.5px solid ${fullyDone ? 'var(--primary)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      {fullyDone && <Check size={10} />}
                      {d.day?.slice(0,3)}
                    </div>
                  );
                })}
              </div>

              {/* First day's exercises preview */}
              {(() => {
                const firstDay = parsed.weeklyPlan?.[0];
                if (!firstDay) return null;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 2 }}>
                      {firstDay.day} preview
                    </div>
                    {firstDay.exercises?.slice(0, 4).map((ex, i) => {
                      const isChecked = !!state?.exerciseChecks?.[`${plan?.id}_${firstDay.day}_${i}`];
                      return (
                        <div
                          key={i}
                          onClick={e => { e.stopPropagation(); toggleExercise(plan?.id, firstDay.day, i); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10,
                            background: isChecked ? 'var(--primary-soft)' : 'var(--bg)',
                            border: `1.5px solid ${isChecked ? 'var(--primary-border)' : 'transparent'}`,
                            cursor: 'pointer', transition: 'all .15s',
                          }}
                        >
                          <div style={{ color: isChecked ? 'var(--primary)' : 'var(--text3)', flexShrink: 0 }}>
                            {isChecked ? <CheckSquare size={15} /> : <Square size={15} />}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: isChecked ? 'var(--primary-dark)' : 'var(--text)', flex: 1, textDecoration: isChecked ? 'line-through' : 'none' }}>
                            {ex.name}
                          </span>
                          {ex.sets && <span style={{ fontSize: 11, color: 'var(--text2)' }}>{ex.sets}×{ex.reps}</span>}
                        </div>
                      );
                    })}
                    {(firstDay.exercises?.length || 0) > 4 && (
                      <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '6px', borderRadius: 8, background: 'var(--bg2)' }}>
                        +{firstDay.exercises.length - 4} more exercises · Click to expand full plan →
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Decorative gradient corner */}
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 120, height: 80, background: 'linear-gradient(135deg,transparent,rgba(22,163,74,.05))', borderRadius: '0 0 20px 0', pointerEvents: 'none' }} />
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        .fade-in { animation: fadeIn .3s ease forwards; }
      `}</style>
    </>
  );
}
