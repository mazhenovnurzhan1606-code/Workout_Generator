package com.fitness.app.patterns.creational.workout;

import com.fitness.app.domain.UserWorkoutProfile;
import org.springframework.stereotype.Component;

/**
 * Selects and executes the appropriate {@link WorkoutPlanFactory} based on
 * the fitness level stored in a {@link UserWorkoutProfile}.
 *
 * Responsibilities:
 *   1. Map fitness-level string → concrete factory (single responsibility).
 *   2. Call {@link WorkoutPlanFactory#buildPrompt(UserWorkoutProfile)}.
 *   3. Return the finished prompt via {@link WorkoutPlanFactory#getPrompt()}.
 *
 * Why a selector and not a switch inside the service?
 *   • Keeps {@code WorkoutPlanService} free from factory-selection logic
 *     (Single Responsibility Principle).
 *   • Adding a new level (e.g. "elite") only requires a new concrete factory
 *     and one additional case here — nothing else changes
 *     (Open/Closed Principle).
 *   • The service depends on this component via its interface, not on any
 *     concrete factory (Dependency Inversion Principle).
 */
@Component
public class WorkoutPlanFactorySelector {

    /**
     * Selects the factory matching the profile's fitness level, builds the
     * prompt, and returns it.
     *
     * @param profile the fully-populated user workout profile
     * @return the AI prompt string ready to be sent to the AI provider
     * @throws IllegalArgumentException if the fitness level is unrecognised
     */
    public String selectAndBuild(UserWorkoutProfile profile) {
        WorkoutPlanFactory factory = resolveFactory(profile.getFitnessLevel());
        factory.buildPrompt(profile);
        return factory.getPrompt();
    }

    // ── Private ──────────────────────────────────────────────────────────────

    private WorkoutPlanFactory resolveFactory(String fitnessLevel) {
        if (fitnessLevel == null) {
            throw new IllegalArgumentException("Fitness level must not be null.");
        }
        return switch (fitnessLevel.toLowerCase().trim()) {
            case "beginner"     -> new BeginnerWorkoutPlan();
            case "intermediate" -> new IntermediateWorkoutPlan();
            case "advanced"     -> new AdvancedWorkoutPlan();
            default -> throw new IllegalArgumentException(
                    "Unsupported fitness level: '" + fitnessLevel +
                    "'. Expected: beginner | intermediate | advanced.");
        };
    }
}
