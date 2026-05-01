package com.fitness.app.patterns.structural;

import com.fitness.app.patterns.creational.AiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * STRUCTURAL PATTERN — Decorator
 *
 * LoggingAiServiceDecorator wraps any AiService and transparently adds:
 *   • Entry/exit log messages
 *   • Execution time (milliseconds) for each AI call
 *   • Error logging when the wrapped service throws or returns an error string
 *
 * It satisfies the Decorator pattern because:
 *   • It implements the same AiService interface as the wrapped object
 *   • It holds a reference to the wrapped AiService (the "component")
 *   • Every call is forwarded to the wrapped object — behaviour is unchanged
 *   • Cross-cutting concerns (logging) are added WITHOUT touching GrokAiProvider
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  DECORATOR STRUCTURE                                            │
 * │                                                                 │
 * │  AiService  ◄──  LoggingAiServiceDecorator  ──wraps──►  AiService  │
 * │  (interface)        (adds logging / timing)          (real impl)│
 * └─────────────────────────────────────────────────────────────────┘
 *
 * HOW TO EXTEND:
 *   To add caching, create CachingAiServiceDecorator(AiService wrapped).
 *   Stack decorators: new CachingDecorator(new LoggingDecorator(realService))
 *   No existing class needs to change.
 */
@Component
public class LoggingAiServiceDecorator implements AiService {

    private static final Logger log = LoggerFactory.getLogger(LoggingAiServiceDecorator.class);

    /** The real AiService being decorated. Set via build() to allow stacking. */
    private AiService wrapped;

    /** Fluent setter — call AiServiceFactory, then decorate. */
    public LoggingAiServiceDecorator wrap(AiService realService) {
        this.wrapped = realService;
        return this;
    }

    // ── AiService contract — every call measured and logged ──────────────────

    @Override
    public String generateWorkoutPlan(String prompt) {
        log.info("[AI] generateWorkoutPlan() called — prompt length: {} chars", prompt.length());
        long start = System.currentTimeMillis();

        String result = wrapped.generateWorkoutPlan(prompt);

        long elapsed = System.currentTimeMillis() - start;
        if (result != null && result.startsWith("AI service error")) {
            log.error("[AI] generateWorkoutPlan() returned error in {}ms: {}", elapsed, result);
        } else {
            log.info("[AI] generateWorkoutPlan() succeeded in {}ms — response length: {} chars",
                    elapsed, result != null ? result.length() : 0);
        }
        return result;
    }

    @Override
    public String chat(String userMessage, String conversationHistory) {
        log.info("[AI] chat() called — message: '{}...'",
                userMessage.length() > 60 ? userMessage.substring(0, 60) : userMessage);
        long start = System.currentTimeMillis();

        String result = wrapped.chat(userMessage, conversationHistory);

        long elapsed = System.currentTimeMillis() - start;
        if (result != null && result.startsWith("AI service error")) {
            log.error("[AI] chat() returned error in {}ms: {}", elapsed, result);
        } else {
            log.info("[AI] chat() succeeded in {}ms", elapsed);
        }
        return result;
    }
}
