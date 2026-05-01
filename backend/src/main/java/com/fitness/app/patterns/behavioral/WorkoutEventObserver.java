package com.fitness.app.patterns.behavioral;

/**
 * BEHAVIORAL PATTERN — Observer (Observer Interface)
 *
 * Any class that wants to react to fitness-app domain events must implement
 * this interface. By programming to the interface the publisher remains
 * completely decoupled from how (or how many) observers react.
 *
 * Both methods have default no-op implementations so that a concrete observer
 * can choose to handle only the events it cares about.
 */
public interface WorkoutEventObserver {

    /** Invoked after a new workout plan is saved to the database. */
    default void onPlanGenerated(PlanGeneratedEvent event) {}

    /** Invoked after a new user account is persisted. */
    default void onUserRegistered(UserRegisteredEvent event) {}
}
