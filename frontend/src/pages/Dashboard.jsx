import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOnboarding, LEVELS } from '../context/OnboardingContext';
import { MessageSquare, ClipboardList, Zap, TrendingUp, Calendar, Flame, ChevronRight } from 'lucide-react';

const timeOfDay = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export default function Dashboard() {
  const { user } = useAuth();
  const { state, getProgress } = useOnboarding();
  const navigate = useNavigate();

  const progress   = getProgress();
  const levelDef   = LEVELS[state?.currentLevel] || LEVELS.beginner;
  const nextLevel  = levelDef.next ? LEVELS[levelDef.next]?.label : null;

  // Fit everything in viewport height, no scroll
  return (
    <div className="fade-in" style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>

      {/* ── GREETING ──────────────────────────────────────── */}
      <div style={{ flexShrink: 0 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', letterSpacing: -.4 }}>
          {timeOfDay()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 3 }}>
          {state?.onboardingComplete ? 'Track your progress and crush today\'s workout.' : 'Complete your assessment to get your personalised plan.'}
        </p>
      </div>

      {/* ── LEVEL BANNER ──────────────────────────────────── */}
      <div style={{
        padding: '18px 22px', borderRadius: 18,
        background: 'linear-gradient(135deg, var(--primary) 0%, #059669 100%)',
        color: '#fff', flexShrink: 0,
        boxShadow: '0 8px 24px rgba(22,163,74,.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: .7, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Current Level</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{levelDef.label}</div>
          {nextLevel && <div style={{ fontSize: 12, opacity: .75, marginTop: 2 }}>→ {nextLevel} after {progress.xpMax} XP</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>{progress.xp}</div>
          <div style={{ fontSize: 11, opacity: .7 }}>XP / {progress.xpMax}</div>
        </div>
      </div>

      {/* ── STATS ROW ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, flexShrink: 0 }}>
        {[
          { icon: <TrendingUp size={18} color="var(--primary)" />, bg: 'var(--primary-soft)', val: `${Math.round(progress.percent)}%`, label: 'Level progress' },
          { icon: <Calendar size={18} color="var(--blue)" />,      bg: 'var(--blue-soft)',    val: `${progress.daysCompleted}d`,        label: 'Days completed' },
          { icon: <Flame size={18} color="#ef4444" />,             bg: '#fef2f2',            val: `${progress.streakDays}🔥`,          label: 'Day streak' },
        ].map((s,i) => (
          <div key={i} style={{ padding: '16px 14px', background: '#fff', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', letterSpacing: -.5 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── XP PROGRESS ───────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 18px', boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>
          <span style={{ fontWeight: 600 }}>XP Progress</span>
          <span>{progress.xp} / {progress.xpMax}</span>
        </div>
        <div style={{ height: 8, background: 'var(--bg2)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress.percent}%`, background: 'linear-gradient(90deg,var(--primary),var(--primary-light))', borderRadius: 99, transition: 'width .5s ease' }} />
        </div>
      </div>

      {/* ── QUICK ACTIONS ─────────────────────────────────── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, overflow: 'hidden' }}>
        <button className="quick-action" style={{ height: '100%' }} onClick={() => navigate('/plan')}>
          <div className="quick-action-icon" style={{ background: 'var(--primary-soft)' }}>
            <ClipboardList size={20} color="var(--primary)" />
          </div>
          <div className="quick-action-title">My Plan</div>
          <div className="quick-action-desc">View & check off your current workout</div>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
            <ChevronRight size={16} color="var(--text3)" />
          </div>
        </button>
        <button className="quick-action" style={{ height: '100%' }} onClick={() => navigate('/chat')}>
          <div className="quick-action-icon" style={{ background: '#fff7ed' }}>
            <MessageSquare size={20} color="var(--accent)" />
          </div>
          <div className="quick-action-title">AI Assistant</div>
          <div className="quick-action-desc">Ask your AI trainer anything</div>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
            <ChevronRight size={16} color="var(--text3)" />
          </div>
        </button>
      </div>
    </div>
  );
}
