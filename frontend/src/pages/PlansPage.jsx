import React, { useEffect, useState } from 'react';
import { getMyPlans, deletePlan } from '../services/api';
import { Trash2, ChevronLeft, X, AlertTriangle, TrendingUp, Salad, ShieldAlert, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react';

const GOAL_LABELS = {
  weight_loss: 'Weight Loss', muscle_gain: 'Muscle Gain',
  endurance: 'Endurance', general_fitness: 'General Fitness'
};

const GOAL_EMOJI = {
  weight_loss: '🔥', muscle_gain: '💪', endurance: '🏃', general_fitness: '⚡'
};

function SkeletonPlan() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="skeleton" style={{ height: 22, width: '50%' }} />
      <div className="skeleton" style={{ height: 14, width: '70%' }} />
      <div className="skeleton" style={{ height: 14, width: '40%' }} />
    </div>
  );
}

function DayCard({ day }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)'
    }}>
      <div
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: expanded ? '1px solid var(--border)' : 'none',
          cursor: 'pointer', background: expanded ? 'var(--primary-soft)' : 'var(--surface)'
        }}
        onClick={() => setExpanded(e => !e)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, color: expanded ? 'var(--primary-dark)' : 'var(--text)' }}>{day.day}</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            {day.focus && <span className="badge badge-primary">{day.focus}</span>}
            {day.duration && <span className="badge badge-blue">{day.duration}</span>}
          </div>
        </div>
        {expanded ? <ChevronUp size={18} color="var(--text3)" /> : <ChevronDown size={18} color="var(--text3)" />}
      </div>

      {expanded && (
        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {day.warmup && (
            <div style={{
              display: 'flex', gap: 10, padding: '12px 14px',
              background: '#fff7ed', border: '1px solid #fed7aa',
              borderRadius: 10, fontSize: 13, color: '#9a3412'
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🔥</span>
              <div><strong>Warm-up:</strong> {day.warmup}</div>
            </div>
          )}

          {day.exercises?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {day.exercises.map((ex, i) => (
                <div key={i} className="exercise-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div className="exercise-name" style={{ margin: 0 }}>{ex.name}</div>
                    {ex.muscleGroup && <span className="badge badge-blue" style={{ flexShrink: 0 }}>{ex.muscleGroup}</span>}
                  </div>
                  <div className="exercise-stats">
                    {ex.sets && (
                      <div className="exercise-stat">
                        <div className="exercise-stat-value">{ex.sets}</div>
                        <div className="exercise-stat-label">Sets</div>
                      </div>
                    )}
                    {ex.reps && (
                      <div className="exercise-stat">
                        <div className="exercise-stat-value">{ex.reps}</div>
                        <div className="exercise-stat-label">Reps</div>
                      </div>
                    )}
                    {ex.rest && (
                      <div className="exercise-stat">
                        <div className="exercise-stat-value">{ex.rest}</div>
                        <div className="exercise-stat-label">Rest</div>
                      </div>
                    )}
                  </div>
                  {ex.coachTip && (
                    <div className="coach-tip">💡 {ex.coachTip}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {day.cooldown && (
            <div style={{
              display: 'flex', gap: 10, padding: '12px 14px',
              background: 'var(--blue-soft)', border: '1px solid #bfdbfe',
              borderRadius: 10, fontSize: 13, color: '#1e40af'
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>❄️</span>
              <div><strong>Cool-down:</strong> {day.cooldown}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlanDetail({ plan, onClose }) {
  let parsed = null;
  try { parsed = JSON.parse(plan.planContent); } catch {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        paddingBottom: 20, borderBottom: '1px solid var(--border)'
      }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.4px' }}>
            {plan.title}
          </h2>
          <div style={{ display: 'flex', gap: 6 }}>
            <span className="badge badge-primary">{GOAL_LABELS[plan.goal] || plan.goal}</span>
            <span className="badge badge-blue">{plan.fitnessLevel}</span>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose}
          style={{ padding: 10, borderRadius: 10, border: '1px solid var(--border)', flexShrink: 0 }}>
          <X size={18} />
        </button>
      </div>

      {parsed ? (
        <>
          {parsed.bmi && (
            <div className="card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                <TrendingUp size={16} color="var(--primary)" />
                <h3 style={{ fontWeight: 700, fontSize: 15 }}>BMI Analysis</h3>
              </div>
              <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'var(--primary-soft)', border: '2px solid var(--primary-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary-dark)' }}>{parsed.bmi.value}</span>
                </div>
                <div>
                  <span className="badge badge-warning" style={{ marginBottom: 8, display: 'inline-block' }}>{parsed.bmi.category}</span>
                  <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{parsed.bmi.advice}</p>
                </div>
              </div>
            </div>
          )}

          {parsed.safetyWarnings?.length > 0 && (
            <div className="card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <ShieldAlert size={16} color="var(--warning)" />
                <h3 style={{ fontWeight: 700, fontSize: 15 }}>Safety Notes</h3>
              </div>
              {parsed.safetyWarnings.map((w, i) => (
                <div key={i} className="alert alert-warning" style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 13 }}>{w}</span>
                </div>
              ))}
            </div>
          )}

          {parsed.weeklyPlan?.map(day => (
            <DayCard key={day.day} day={day} />
          ))}

          {parsed.nutritionTips?.length > 0 && (
            <div className="card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                <Salad size={16} color="var(--primary)" />
                <h3 style={{ fontWeight: 700, fontSize: 15 }}>Nutrition Tips</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {parsed.nutritionTips.map((t, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 10, padding: '10px 14px',
                    background: 'var(--bg)', borderRadius: 8
                  }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>{i + 1}.</span>
                    <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {parsed.progressionAdvice && (
            <div className="card" style={{ padding: '20px 22px', borderColor: 'var(--primary-border)', background: 'var(--primary-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <TrendingUp size={16} color="var(--primary)" />
                <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--primary-dark)' }}>Progression Advice</h3>
              </div>
              <p style={{ fontSize: 13, color: 'var(--primary-dark)', lineHeight: 1.6 }}>{parsed.progressionAdvice}</p>
            </div>
          )}
        </>
      ) : (
        <div className="card">
          <h3 style={{ marginBottom: 12, fontWeight: 700 }}>Plan Content</h3>
          <pre style={{ fontSize: 13, color: 'var(--text2)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {plan.planContent}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyPlans()
      .then(r => { setPlans(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    await deletePlan(id);
    setPlans(p => p.filter(x => x.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  if (loading) return (
    <div>
      <div className="page-header">
        <div className="skeleton" style={{ height: 28, width: 200, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 16, width: 120 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3].map(i => <SkeletonPlan key={i} />)}
      </div>
    </div>
  );

  return (
    <div
      className="fade-in"
      style={{
        display: 'flex',
        margin: '-28px -32px',
        minHeight: 'calc(100vh - 0px)',
      }}
    >
      {/* ── Left Panel: Plan List (full or collapsed to icon rail) ── */}
      <div style={{
        width: selected ? 72 : 360,
        flexShrink: 0,
        borderRight: '1px solid var(--border)',
        background: 'var(--surface)',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Expanded header */}
        {!selected && (
          <div style={{ padding: '28px 20px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px' }}>My Workout Plans</h1>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
              {plans.length} plan{plans.length !== 1 ? 's' : ''} generated
            </p>
          </div>
        )}

        {/* Collapsed header */}
        {selected && (
          <div style={{
            padding: '20px 0 12px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            borderBottom: '1px solid var(--border)', flexShrink: 0
          }}>
            <ChevronLeft size={15} color="var(--text3)" />
            <span style={{
              fontSize: 8, color: 'var(--text4)', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '1px',
              writingMode: 'vertical-rl', transform: 'rotate(180deg)'
            }}>Plans</span>
          </div>
        )}

        {/* Scrollable plan list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: selected ? '10px 0' : '14px' }}>
          {plans.length === 0 && !selected ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{
                width: 56, height: 56, background: 'var(--bg2)', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px', fontSize: 24
              }}>📭</div>
              <p style={{ color: 'var(--text2)', fontSize: 13 }}>No plans yet. Generate your first one!</p>
            </div>
          ) : plans.map(plan => {
            const isActive = selected?.id === plan.id;
            const emoji = GOAL_EMOJI[plan.goal] || '💪';

            /* Collapsed: emoji icon pill */
            if (selected) return (
              <div
                key={plan.id}
                title={plan.title}
                onClick={() => setSelected(plan)}
                style={{
                  width: 46, height: 46, borderRadius: 13, margin: '5px auto',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: 20,
                  background: isActive ? 'var(--primary-soft)' : 'transparent',
                  border: `2px solid ${isActive ? 'var(--primary-border)' : 'transparent'}`,
                  transition: 'all 0.15s',
                  position: 'relative',
                }}
              >
                {emoji}
                {isActive && (
                  <div style={{
                    position: 'absolute', right: -4, top: '50%', transform: 'translateY(-50%)',
                    width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)'
                  }} />
                )}
              </div>
            );

            /* Expanded: full card */
            return (
              <div
                key={plan.id}
                onClick={() => setSelected(plan)}
                style={{
                  background: isActive ? 'var(--primary-soft)' : 'var(--surface)',
                  border: `1.5px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius)',
                  padding: '13px 15px',
                  cursor: 'pointer',
                  marginBottom: 8,
                  transition: 'all 0.15s',
                  boxShadow: isActive ? '0 0 0 3px rgba(22,163,74,0.08)' : 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 5, flexWrap: 'wrap' }}>
                      <span className="badge badge-primary" style={{ fontSize: 10 }}>{GOAL_LABELS[plan.goal] || plan.goal}</span>
                      <span className="badge badge-blue" style={{ fontSize: 10 }}>{plan.fitnessLevel}</span>
                    </div>
                    <h3 style={{
                      fontWeight: 700, fontSize: 13,
                      color: isActive ? 'var(--primary-dark)' : 'var(--text)',
                      lineHeight: 1.4, marginBottom: 3,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {plan.title}
                    </h3>
                    {plan.bmiValue > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>BMI: {plan.bmiValue}</div>
                    )}
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ padding: '5px 8px', flexShrink: 0 }}
                    onClick={e => { e.stopPropagation(); handleDelete(plan.id); }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div style={{
                  fontSize: 10, color: 'var(--text3)',
                  marginTop: 8, paddingTop: 6, borderTop: '1px solid var(--border)'
                }}>
                  {new Date(plan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right Panel: full-page scrollable plan detail ── */}
      {selected ? (
        <div className="fade-in" style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
          <PlanDetail plan={selected} onClose={() => setSelected(null)} />
        </div>
      ) : (
        plans.length > 0 && (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 12, color: 'var(--text3)'
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Dumbbell size={24} color="var(--text4)" />
            </div>
            <p style={{ fontSize: 14 }}>Select a plan to view details</p>
          </div>
        )
      )}
    </div>
  );
}
