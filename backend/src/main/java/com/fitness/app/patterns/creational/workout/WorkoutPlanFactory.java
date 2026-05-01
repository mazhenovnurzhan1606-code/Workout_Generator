package com.fitness.app.patterns.creational.workout;

import com.fitness.app.domain.UserWorkoutProfile;

/**
 * ABSTRACT FACTORY — Abstract Creator
 *
 * Defines the contract for every concrete workout-plan factory.
 * Concrete sub-classes are responsible for translating a UserWorkoutProfile
 * into a rich, level-specific AI prompt.
 *
 * The {@code prompt} attribute is protected so sub-classes can write to it
 * directly inside {@link #buildPrompt(UserWorkoutProfile)} before the caller
 * retrieves it via {@link #getPrompt()}.
 *
 * Why Abstract Factory and not a plain utility method?
 *   • Each fitness level requires different safety rules, volume targets,
 *     and coaching tone — behaviour that belongs in its own class.
 *   • New levels (e.g. "elite-athlete") are added by creating a new sub-class
 *     without touching any existing code (Open/Closed Principle).
 *   • {@link WorkoutPlanFactorySelector} depends only on this abstraction,
 *     keeping the selection logic fully decoupled from prompt construction
 *     (Dependency Inversion Principle).
 */
public abstract class WorkoutPlanFactory {

    /** The AI prompt built by {@link #buildPrompt}. */
    protected String prompt;

    /**
     * Constructs the AI prompt for the given user profile.
     * Concrete factories must populate {@link #prompt} here.
     *
     * @param profile fully-populated user workout profile
     */
    public abstract void buildPrompt(UserWorkoutProfile profile);

    /**
     * Returns the prompt that was assembled by {@link #buildPrompt}.
     *
     * @return the ready-to-send AI prompt string
     */
    public String getPrompt() {
        return prompt;
    }
}
