package com.fitness.app.patterns.behavioral;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * BEHAVIORAL PATTERN — Observer (Subject / Observable)
 *
 * WorkoutEventPublisher is the central Subject in the Observer pattern.
 * It maintains a list of WorkoutEventObserver instances and notifies all of
 * them whenever a domain event occurs (plan generated, user registered, etc.).
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  OBSERVER STRUCTURE                                                  │
 * │                                                                      │
 * │  WorkoutPlanService ──publishes──► WorkoutEventPublisher             │
 * │  AuthController     ──publishes──► (Subject)                        │
 * │                                        │                            │
 * │                              notifyAll()│                            │
 * │                                   ┌────▼──────────────────┐         │
 * │                                   │  WorkoutEventObserver │         │
 * │                                   │  (interface)          │         │
 * │                                   └──┬────────────────────┘         │
 * │                          ┌───────────┘                              │
 * │                  WorkoutEventListener (concrete observer)           │
 * │                      • onPlanGenerated()  → audit log              │
 * │                      • onUserRegistered() → welcome log            │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * Adding a NEW observer (e.g., EmailNotificationObserver):
 *   1. Implement WorkoutEventObserver
 *   2. Annotate with @Component — Spring auto-registers it via constructor injection
 *   3. Zero changes to publisher, service classes, or any existing observer
 */
@Component
public class WorkoutEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(WorkoutEventPublisher.class);

    private final List<WorkoutEventObserver> observers;

    /** Spring injects all WorkoutEventObserver beans automatically. */
    public WorkoutEventPublisher(List<WorkoutEventObserver> observers) {
        this.observers = new ArrayList<>(observers);
        log.info("[Observer] WorkoutEventPublisher initialized with {} observer(s): {}",
                observers.size(),
                observers.stream().map(o -> o.getClass().getSimpleName()).toList());
    }

    // ── Publish methods — one per event type ─────────────────────────────────

    /**
     * Called by WorkoutPlanService after a plan is persisted.
     * Notifies every registered observer synchronously.
     */
    public void publishPlanGenerated(PlanGeneratedEvent event) {
        log.debug("[Observer] Publishing PlanGeneratedEvent for user '{}', planId={}",
                event.userEmail(), event.planId());
        for (WorkoutEventObserver observer : observers) {
            try {
                observer.onPlanGenerated(event);
            } catch (Exception ex) {
                // One failing observer must never block the others
                log.error("[Observer] {} threw an exception on PlanGeneratedEvent: {}",
                        observer.getClass().getSimpleName(), ex.getMessage());
            }
        }
    }

    /**
     * Called by AuthController after a user account is persisted.
     */
    public void publishUserRegistered(UserRegisteredEvent event) {
        log.debug("[Observer] Publishing UserRegisteredEvent for '{}'", event.userEmail());
        for (WorkoutEventObserver observer : observers) {
            try {
                observer.onUserRegistered(event);
            } catch (Exception ex) {
                log.error("[Observer] {} threw an exception on UserRegisteredEvent: {}",
                        observer.getClass().getSimpleName(), ex.getMessage());
            }
        }
    }
}
