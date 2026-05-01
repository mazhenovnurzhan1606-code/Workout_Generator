package com.fitness.app.patterns.behavioral;

import com.fitness.app.entity.WorkoutPlan;

/**
 * BEHAVIORAL PATTERN — Observer (Concrete Event: plan generated)
 *
 * This immutable value object is the "notification" the Subject (WorkoutPlanService)
 * sends to all registered Observers when a new plan is persisted.
 *
 * Keeping it as a plain Java record (rather than a Spring ApplicationEvent subclass)
 * makes it trivially testable and completely decoupled from the framework.
 */
public record PlanGeneratedEvent(
        Long   planId,
        String userEmail,
        String goal,
        String fitnessLevel,
        double bmiValue
) {
    /** Convenience factory — pulls the fields the observers care about. */
    public static PlanGeneratedEvent from(WorkoutPlan plan) {
        return new PlanGeneratedEvent(
                plan.getId(),
                plan.getUser().getEmail(),
                plan.getGoal(),
                plan.getFitnessLevel(),
                plan.getBmiValue() != null ? plan.getBmiValue() : 0.0
        );
    }
}
