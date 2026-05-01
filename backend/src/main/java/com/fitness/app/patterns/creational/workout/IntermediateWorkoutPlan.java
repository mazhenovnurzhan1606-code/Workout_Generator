package com.fitness.app.patterns.creational.workout;

import com.fitness.app.domain.UserWorkoutProfile;

/**
 * ABSTRACT FACTORY — Concrete Factory (Intermediate)
 *
 * Generates a prompt for users who have 6–24 months of consistent training
 * experience and can tolerate higher volume and structured periodisation.
 *
 * Level-specific rules applied:
 *   • Moderate-to-high intensity (RPE 6-8)
 *   • Progressive overload via weekly load/rep adjustments
 *   • Split programming (push/pull/legs or upper/lower)
 *   • Deload week recommendation every 4 weeks
 *   • Injury history drives exercise substitution with a regression ladder
 *   • Session time budget explicitly allocated across warm-up / work / cool-down
 */
public class IntermediateWorkoutPlan extends WorkoutPlanFactory {

    @Override
    public void buildPrompt(UserWorkoutProfile profile) {
        prompt = String.format("""
                You are an expert personal trainer specialising in intermediate hypertrophy
                and strength programming.
                
                Create a structured, periodised workout plan for the following intermediate user:
                
                %s
                
                === INTERMEDIATE-SPECIFIC GUIDELINES ===
                • Design a split programme (push/pull/legs or upper/lower) that fits
                  exactly %d training days per week.
                • Apply progressive overload: specify when and how to increase weight
                  or reps each week (e.g. +2.5 kg once all reps are completed with
                  good form for two consecutive sessions).
                • Use moderate-to-high intensity (RPE 6–8).
                • Allocate session time: 5 min warm-up → %d min main work → 5 min cool-down.
                • Schedule a deload week after every 4 weeks of training.
                • If the user reported injuries or limitations ("%s"),
                  provide a regression ladder (primary → regression → no-load alternative)
                  for each affected movement pattern, and flag it in "safetyNotes".
                
                === OUTPUT FORMAT ===
                Return a structured JSON workout plan with:
                  "weeklySchedule" (split name + day label),
                  "exercises" (name, sets, reps, load guidance, rest, RPE target),
                  "progressionScheme",
                  "deloadProtocol",
                  "safetyNotes".
                """,
                profile.toPromptText(),
                profile.getTrainingDaysPerWeek(),
                profile.getPreferredDurationMinutes() != null
                        ? profile.getPreferredDurationMinutes() - 10 : 35,
                profile.getInjuriesOrLimitations() != null ? profile.getInjuriesOrLimitations() : "none"
        );
    }
}
