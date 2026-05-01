package com.fitness.app.patterns.creational;

/**
 * CREATIONAL PATTERN — Factory Method (Product Interface)
 *
 * This is the common "product" interface that every AI provider must implement.
 * The factory produces objects of this type, so callers never depend on a
 * concrete class (GrokAiService, OpenAiService, etc.) — only on this contract.
 *
 * Why Factory Method here?
 *   Before: WorkoutPlanService and UserController had a hard @Autowired
 *           GrokAiService field — switching providers required editing multiple
 *           service classes and recompiling them.
 *   After:  They depend solely on AiService. The factory decides which
 *           concrete implementation to wire up, driven by configuration alone.
 */
public interface AiService {

    /**
     * Generate a structured JSON workout plan from the given prompt.
     *
     * @param prompt  the fully-built user + profile prompt
     * @return        raw JSON string produced by the AI provider
     */
    String generateWorkoutPlan(String prompt);

    /**
     * Hold a free-form fitness coaching conversation.
     *
     * @param userMessage         the latest message from the user
     * @param conversationHistory previous turns formatted as plain text
     * @return                    the AI reply
     */
    String chat(String userMessage, String conversationHistory);
}
