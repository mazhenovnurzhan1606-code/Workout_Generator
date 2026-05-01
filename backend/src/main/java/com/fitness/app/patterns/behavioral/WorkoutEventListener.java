package com.fitness.app.patterns.behavioral;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * BEHAVIORAL PATTERN — Observer (Concrete Observer: Audit / Activity Log)
 *
 * WorkoutEventListener is the concrete Observer. It reacts to domain events
 * by writing structured audit-log entries. Because it implements
 * WorkoutEventObserver, the publisher knows nothing about it — it is simply
 * discovered and injected by Spring.
 *
 * This is exactly where you would:
 *   • Send a welcome email on registration
 *   • Push a Slack/SMS notification when a plan is generated
 *   • Increment a metrics counter (Micrometer / Prometheus)
 *   • Persist an AuditLog entity
 *
 * All of that can be added here (or in additional observers) without touching
 * WorkoutPlanService, AuthController, or any other class.
 */
@Component
public class WorkoutEventListener implements WorkoutEventObserver {

    private static final Logger log = LoggerFactory.getLogger(WorkoutEventListener.class);

    @Override
    public void onPlanGenerated(PlanGeneratedEvent event) {
        log.info("[AUDIT] New workout plan created | planId={} | user='{}' | goal='{}' | level='{}' | bmi={}",
                event.planId(),
                event.userEmail(),
                event.goal(),
                event.fitnessLevel(),
                event.bmiValue());

        // ── Extension point ───────────────────────────────────────────────
        // Example: emailService.sendPlanReadyEmail(event.userEmail(), event.planId());
        // Example: metricsService.incrementPlansGenerated(event.goal());
    }

    @Override
    public void onUserRegistered(UserRegisteredEvent event) {
        log.info("[AUDIT] New user registered | userId={} | email='{}' | name='{}'",
                event.userId(),
                event.userEmail(),
                event.userName());

        // ── Extension point ───────────────────────────────────────────────
        // Example: emailService.sendWelcomeEmail(event.userEmail(), event.userName());
        // Example: analyticsService.trackSignUp(event.userId());
    }
}
