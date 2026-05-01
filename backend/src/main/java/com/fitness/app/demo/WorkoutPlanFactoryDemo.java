package com.fitness.app.demo;

import com.fitness.app.domain.UserWorkoutProfile;
import com.fitness.app.patterns.creational.workout.WorkoutPlanFactorySelector;

/**
 * Standalone demo — shows the full questionnaire-to-prompt flow without
 * needing a running Spring context.
 *
 * Run with: java -cp <classpath> com.fitness.app.demo.WorkoutPlanFactoryDemo
 *
 * Flow demonstrated:
 *   1. User completes the questionnaire (including the two new end-questions).
 *   2. A UserWorkoutProfile is assembled from the answers.
 *   3. WorkoutPlanFactorySelector picks the concrete factory.
 *   4. The concrete factory builds a rich, level-specific AI prompt.
 *   5. The prompt is printed — this is what gets sent to the AI provider.
 */
public class WorkoutPlanFactoryDemo {

    public static void main(String[] args) {

        WorkoutPlanFactorySelector selector = new WorkoutPlanFactorySelector();

        // ── Scenario 1: Beginner ─────────────────────────────────────────────
        System.out.println("=".repeat(70));
        System.out.println("SCENARIO 1 — BEGINNER");
        System.out.println("=".repeat(70));

        UserWorkoutProfile beginnerProfile = UserWorkoutProfile.builder()
                .fitnessLevel("beginner")
                .mainGoal("lose weight")
                .age(28)
                .gender("female")
                .heightCm(165.0)
                .weightKg(72.0)
                .trainingDaysPerWeek(3)
                .availableEquipment("dumbbells, resistance bands, yoga mat")
                .location("home")
                // ── End-of-questionnaire required questions ──────────────────
                .injuriesOrLimitations("mild lower-back pain")
                .preferredDurationMinutes(40)
                .build();

        String beginnerPrompt = selector.selectAndBuild(beginnerProfile);
        System.out.println(beginnerPrompt);

        // ── Scenario 2: Intermediate ─────────────────────────────────────────
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 2 — INTERMEDIATE");
        System.out.println("=".repeat(70));

        UserWorkoutProfile intermediateProfile = UserWorkoutProfile.builder()
                .fitnessLevel("intermediate")
                .mainGoal("build muscle")
                .age(32)
                .gender("male")
                .heightCm(178.0)
                .weightKg(82.0)
                .trainingDaysPerWeek(4)
                .availableEquipment("full gym (barbells, cables, machines)")
                .location("gym")
                // ── End-of-questionnaire required questions ──────────────────
                .injuriesOrLimitations("right shoulder impingement")
                .preferredDurationMinutes(60)
                .build();

        String intermediatePrompt = selector.selectAndBuild(intermediateProfile);
        System.out.println(intermediatePrompt);

        // ── Scenario 3: Advanced ─────────────────────────────────────────────
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 3 — ADVANCED");
        System.out.println("=".repeat(70));

        UserWorkoutProfile advancedProfile = UserWorkoutProfile.builder()
                .fitnessLevel("advanced")
                .mainGoal("increase strength and power")
                .age(27)
                .gender("male")
                .heightCm(182.0)
                .weightKg(90.0)
                .trainingDaysPerWeek(5)
                .availableEquipment("full powerlifting gym (squat rack, bench, deadlift platform)")
                .location("gym")
                // ── End-of-questionnaire required questions ──────────────────
                .injuriesOrLimitations("none")
                .preferredDurationMinutes(90)
                .build();

        String advancedPrompt = selector.selectAndBuild(advancedProfile);
        System.out.println(advancedPrompt);
    }
}
