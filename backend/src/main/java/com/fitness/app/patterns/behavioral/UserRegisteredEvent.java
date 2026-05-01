package com.fitness.app.patterns.behavioral;

/**
 * BEHAVIORAL PATTERN — Observer (Concrete Event: user registered)
 *
 * Fired by AuthController immediately after a new user account is persisted.
 * Observers can react (welcome email, audit log, analytics ping, etc.)
 * without AuthController knowing anything about those downstream actions.
 */
public record UserRegisteredEvent(
        Long   userId,
        String userEmail,
        String userName
) {}
