package com.fitness.app.patterns.creational.workout;

import com.fitness.app.domain.UserWorkoutProfile;

/**
 * ABSTRACT FACTORY — Concrete Factory (Beginner)
 *
 * Generates a prompt tailored for users with little or no training history.
 * Safety and form education take priority over volume or intensity.
 *
 * Level-specific rules applied:
 *   • Low-to-moderate intensity (RPE 4-6)
 *   • Compound bodyweight / machine movements to learn movement patterns
 *   • Mandatory warm-up and cool-down guidance
 *   • Injury notes receive extra conservative modifications
 *   • Session length respected to prevent burnout or over-training
 */
public class BeginnerWorkoutPlan extends WorkoutPlanFactory {

    @Override
    public void buildPrompt(UserWorkoutProfile profile) {
        prompt = String.format("""
                You are an expert personal trainer specialising in beginner fitness programs.
                
                Create a safe, encouraging, and structured workout plan for the following beginner user:
                
                %s
                
                === BEGINNER-SPECIFIC GUIDELINES ===
                • Prioritise correct form and movement education above all else.
                • Keep intensity low-to-moderate (RPE 4–6 out of 10).
                • Include a 5-minute warm-up and a 5-minute cool-down in every session,
                  fitting within the user's preferred session duration.
                • Choose compound bodyweight or machine-based movements that are joint-friendly.
                • Progress slowly: do NOT add weight or complexity until form is solid.
                • If the user has reported injuries or physical limitations ("%s"),
                  substitute any exercise that loads that area with a pain-free alternative
                  and add a clear safety note at the top of the plan.
                • Limit total weekly volume to avoid DOMS-induced dropout.
                
                === OUTPUT FORMAT ===
                Return a structured JSON workout plan with:
                  "weeklySchedule" (one entry per training day),
                  "exercises" (name, sets, reps/duration, rest, form cues),
                  "safetyNotes",
                  "progressionTips" (what to adjust after 2 weeks).
                """,
                profile.toPromptText(),
                profile.getInjuriesOrLimitations() != null ? profile.getInjuriesOrLimitations() : "none"
        );
    }
}
