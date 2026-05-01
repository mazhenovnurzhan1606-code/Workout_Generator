package com.fitness.app.domain;

import lombok.Builder;
import lombok.Getter;

/**
 * Domain object that encapsulates all information collected during the
 * user questionnaire, including the two new required fields:
 *   - injuries or physical limitations
 *   - preferred workout duration per session
 *
 * Using @Builder so callers assemble the profile fluently without
 * a telescoping constructor. All fields are read-only after construction.
 */
@Getter
@Builder
public class UserWorkoutProfile {

    // ── Core questionnaire fields ────────────────────────────────────────────
    private final String  fitnessLevel;          // beginner | intermediate | advanced
    private final String  mainGoal;              // e.g. "lose weight", "build muscle"
    private final Integer age;
    private final String  gender;
    private final Double  heightCm;
    private final Double  weightKg;
    private final int     trainingDaysPerWeek;
    private final String  availableEquipment;    // comma-separated list
    private final String  location;              // gym | home | outdoor

    // ── Required end-of-questionnaire fields ────────────────────────────────
    /** Any injuries or physical limitations the user reported. */
    private final String  injuriesOrLimitations; // e.g. "lower-back pain, bad knees"

    /** Preferred session length in minutes, e.g. 45. */
    private final Integer preferredDurationMinutes;

    // ── Derived ─────────────────────────────────────────────────────────────

    /** Body-Mass Index, rounded to one decimal place. */
    public double getBmi() {
        if (heightCm == null || weightKg == null || heightCm == 0) return 0.0;
        double h = heightCm / 100.0;
        return Math.round((weightKg / (h * h)) * 10.0) / 10.0;
    }

    /**
     * Formats every collected field into a clean, readable block suitable
     * for embedding directly inside an AI prompt.
     *
     * Example output:
     *   - Fitness Level: Beginner
     *   - Main Goal: Lose weight
     *   - Age: 28 | Gender: Female
     *   - Height: 165 cm | Weight: 68 kg | BMI: 24.98
     *   - Training Days Per Week: 3
     *   - Available Equipment: dumbbells, resistance bands
     *   - Location: home
     *   - Injuries / Physical Limitations: mild lower-back pain
     *   - Preferred Session Duration: 40 minutes
     */
    public String toPromptText() {
        return String.format("""
                - Fitness Level: %s
                - Main Goal: %s
                - Age: %d | Gender: %s
                - Height: %.0f cm | Weight: %.1f kg | BMI: %.1f
                - Training Days Per Week: %d
                - Available Equipment: %s
                - Location: %s
                - Injuries / Physical Limitations: %s
                - Preferred Session Duration: %d minutes""",
                capitalise(fitnessLevel),
                mainGoal,
                age        != null ? age    : 25,
                gender     != null ? gender : "not specified",
                heightCm   != null ? heightCm : 170.0,
                weightKg   != null ? weightKg :  70.0,
                getBmi(),
                trainingDaysPerWeek,
                availableEquipment  != null ? availableEquipment  : "none",
                location            != null ? location            : "not specified",
                injuriesOrLimitations   != null && !injuriesOrLimitations.isBlank()
                        ? injuriesOrLimitations : "none",
                preferredDurationMinutes != null ? preferredDurationMinutes : 45
        );
    }

    private static String capitalise(String s) {
        if (s == null || s.isBlank()) return "Not specified";
        return Character.toUpperCase(s.charAt(0)) + s.substring(1).toLowerCase();
    }
}
