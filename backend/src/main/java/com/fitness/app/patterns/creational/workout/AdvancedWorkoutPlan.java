package com.fitness.app.patterns.creational.workout;

import com.fitness.app.domain.UserWorkoutProfile;

/**
 * ABSTRACT FACTORY — Concrete Factory (Advanced)
 *
 * Generates a prompt for users with 2+ years of consistent training who
 * understand periodisation and can handle high volume and specificity.
 *
 * Level-specific rules applied:
 *   • High intensity (RPE 8-10, including AMRAP and near-failure sets)
 *   • Macro-cycle / meso-cycle planning (accumulation → intensification → realisation)
 *   • Auto-regulation cues (reduce load if HRV or sleep is poor)
 *   • Injury management via prehab supersets and load redistribution
 *   • Maximum performance extraction within the available session window
 */
public class AdvancedWorkoutPlan extends WorkoutPlanFactory {

    @Override
    public void buildPrompt(UserWorkoutProfile profile) {
        prompt = String.format("""
                You are an elite strength and conditioning coach with expertise in
                advanced periodisation models (DUP, block periodisation, conjugate).
                
                Design a high-performance workout programme for the following advanced athlete:
                
                %s
                
                === ADVANCED-SPECIFIC GUIDELINES ===
                • Build a 3-phase macro-cycle:
                    Phase 1 – Accumulation (high volume, moderate intensity, RPE 7–8)
                    Phase 2 – Intensification (moderate volume, high intensity, RPE 8–9)
                    Phase 3 – Realisation / Peak (low volume, maximal intensity, RPE 9–10 / AMRAP)
                • Apply Daily Undulating Periodisation (DUP) within each training week
                  across %d training days.
                • Maximise performance within the %d-minute session window:
                  allocate time precisely (warm-up / activation / main work / accessory / cool-down).
                • Include auto-regulation notes: how to adjust load if daily readiness is low.
                • If the user has reported injuries or limitations ("%s"):
                    – Identify which movement patterns are compromised.
                    – Provide prehab supersets to be executed before the main lift.
                    – Redistribute load to unaffected muscle groups to preserve training density.
                    – Add a "Injury Management" section in the output.
                • Specify exact percentages of 1RM or RPE for every set.
                
                === OUTPUT FORMAT ===
                Return a structured JSON programme with:
                  "macroCycle" (3 phases, each with meso-cycle blocks),
                  "weeklySchedule" (DUP split per phase),
                  "exercises" (name, sets, reps, %1RM or RPE, rest, cues),
                  "autoRegulationRules",
                  "injuryManagement" (if applicable),
                  "peakingProtocol".
                """,
                profile.toPromptText(),
                profile.getTrainingDaysPerWeek(),
                profile.getPreferredDurationMinutes() != null
                        ? profile.getPreferredDurationMinutes() : 60,
                profile.getInjuriesOrLimitations() != null ? profile.getInjuriesOrLimitations() : "none"
        );
    }
}
