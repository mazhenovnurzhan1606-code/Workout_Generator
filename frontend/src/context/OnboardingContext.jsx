import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { generatePlan, getMyPlans } from '../services/api';

// ─────────────────────────────────────────────────────────────
//  LEVEL DEFINITIONS  (3 months = ~90 days per level)
// ─────────────────────────────────────────────────────────────
export const LEVELS = {
  beginner: { label: 'Beginner', next: 'intermediate', daysRequired: 90, xpMax: 100 },
  intermediate: { label: 'Intermediate', next: 'advanced', daysRequired: 90, xpMax: 200 },
  advanced: { label: 'Advanced', next: null, daysRequired: null, xpMax: 300 },
};

// XP per completed exercise
const XP_PER_EXERCISE = 2;

const STORAGE_KEY = 'fitai_onboarding_v2';

function loadState(userId) {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveState(userId, state) {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(state));
  } catch {}
}

// ─────────────────────────────────────────────────────────────
const OnboardingContext = createContext();

export function OnboardingProvider({ children, userId }) {
  const [state, setState] = useState(null);  // null = loading
  const [generating, setGenerating] = useState(false);
  const [levelUpEvent, setLevelUpEvent] = useState(null); // { from, to }

  // Load persisted state on mount / userId change
  useEffect(() => {
    if (!userId) { setState(null); return; }
    const saved = loadState(userId);
    if (saved) {
      setState(saved);
    } else {
      // Brand new user
      setState({
        onboardingComplete: false,
        assessmentAnswers: null,
        currentLevel: null,         // 'beginner' | 'intermediate' | 'advanced'
        currentPlanId: null,
        xp: 0,
        streakDays: 0,
        completedDays: [],          // array of ISO date strings when ≥1 exercise done
        exerciseChecks: {},         // { [planId_day_exerciseIndex]: true }
        levelHistory: [],           // [{ level, completedAt }]
      });
    }
  }, [userId]);

  // Persist whenever state changes
  useEffect(() => {
    if (userId && state) saveState(userId, state);
  }, [userId, state]);

  // ── Helpers ────────────────────────────────────────────────
  const update = useCallback((patch) =>
    setState(prev => ({ ...prev, ...patch })), []);

  // ── Complete onboarding assessment ─────────────────────────
  const completeOnboarding = useCallback(async (answers) => {
    setGenerating(true);
    try {
      const payload = {
        goal: answers.goal,
        fitnessLevel: answers.level,
        age: parseInt(answers.age) || 25,
        gender: answers.gender || 'other',
        weight: parseFloat(answers.weight) || 70,
        height: parseFloat(answers.height) || 170,
        workoutDays: answers.workoutDays,
        location: answers.location || 'gym',
        equipment: answers.equipment || [],
        healthNotes: answers.healthNotes || '',
      };
      const res = await generatePlan(payload);
      const planId = res.data?.id || res.data?.planId || null;

      setState(prev => ({
        ...prev,
        onboardingComplete: true,
        assessmentAnswers: answers,
        currentLevel: answers.level,
        currentPlanId: planId,
        xp: 0,
        streakDays: 0,
        completedDays: [],
        exerciseChecks: {},
        levelHistory: [],
      }));
      return planId;
    } finally {
      setGenerating(false);
    }
  }, []);

  // ── Toggle exercise checkbox ────────────────────────────────
  const toggleExercise = useCallback((planId, dayName, exerciseIdx) => {
    setState(prev => {
      const key = `${planId}_${dayName}_${exerciseIdx}`;
      const wasChecked = !!prev.exerciseChecks[key];
      const newChecks = { ...prev.exerciseChecks, [key]: !wasChecked };

      // XP delta
      const xpDelta = wasChecked ? -XP_PER_EXERCISE : XP_PER_EXERCISE;
      const newXp = Math.max(0, prev.xp + xpDelta);

      // Track completed days (at least 1 check today)
      const today = new Date().toISOString().split('T')[0];
      const completedDays = prev.completedDays.includes(today)
        ? prev.completedDays
        : [...prev.completedDays, today];

      return { ...prev, exerciseChecks: newChecks, xp: newXp, completedDays };
    });
  }, []);

  // ── Progress metrics ────────────────────────────────────────
  const getProgress = useCallback(() => {
    if (!state) return { xp: 0, xpMax: 100, percent: 0, daysCompleted: 0, daysRequired: 90 };
    const levelDef = LEVELS[state.currentLevel] || LEVELS.beginner;
    const xpMax = levelDef.xpMax;
    const percent = Math.min((state.xp / xpMax) * 100, 100);
    const daysRequired = levelDef.daysRequired || 90;
    return {
      xp: state.xp,
      xpMax,
      percent,
      daysCompleted: state.completedDays?.length || 0,
      daysRequired,
      streakDays: state.streakDays || 0,
    };
  }, [state]);

  // ── Check if level-up is due ────────────────────────────────
  const checkLevelUp = useCallback(() => {
    if (!state) return false;
    const levelDef = LEVELS[state.currentLevel];
    if (!levelDef?.next) return false;   // already advanced
    const prog = getProgress();
    return prog.xp >= prog.xpMax;
  }, [state, getProgress]);

  // ── Execute level up + auto-generate next plan ──────────────
  const doLevelUp = useCallback(async () => {
    if (!state) return;
    const levelDef = LEVELS[state.currentLevel];
    if (!levelDef?.next) return;

    setGenerating(true);
    const fromLevel = state.currentLevel;
    const toLevel = levelDef.next;

    try {
      const ans = state.assessmentAnswers || {};
      const payload = {
        goal: ans.goal || 'general_fitness',
        fitnessLevel: toLevel,
        age: parseInt(ans.age) || 25,
        gender: ans.gender || 'other',
        weight: parseFloat(ans.weight) || 70,
        height: parseFloat(ans.height) || 170,
        workoutDays: ans.workoutDays || ['Monday', 'Wednesday', 'Friday'],
        location: ans.location || 'gym',
        equipment: ans.equipment || [],
        healthNotes: ans.healthNotes || '',
      };
      const res = await generatePlan(payload);
      const newPlanId = res.data?.id || res.data?.planId || null;

      setState(prev => ({
        ...prev,
        currentLevel: toLevel,
        currentPlanId: newPlanId,
        xp: 0,
        exerciseChecks: {},
        completedDays: [],
        levelHistory: [
          ...prev.levelHistory,
          { level: fromLevel, completedAt: new Date().toISOString() }
        ],
      }));
      setLevelUpEvent({ from: fromLevel, to: toLevel });
    } finally {
      setGenerating(false);
    }
  }, [state]);

  const dismissLevelUpEvent = () => setLevelUpEvent(null);

  return (
    <OnboardingContext.Provider value={{
      state,
      generating,
      levelUpEvent,
      completeOnboarding,
      toggleExercise,
      getProgress,
      checkLevelUp,
      doLevelUp,
      dismissLevelUpEvent,
      update,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext);
