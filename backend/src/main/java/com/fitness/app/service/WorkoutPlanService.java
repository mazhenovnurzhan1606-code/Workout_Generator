package com.fitness.app.service;

import com.fitness.app.dto.WorkoutDto;
import com.fitness.app.entity.User;
import com.fitness.app.entity.WorkoutPlan;
import com.fitness.app.patterns.behavioral.PlanGeneratedEvent;
import com.fitness.app.patterns.behavioral.WorkoutEventPublisher;
import com.fitness.app.patterns.creational.AiService;
import com.fitness.app.patterns.creational.AiServiceFactory;
import com.fitness.app.patterns.structural.LoggingAiServiceDecorator;
import com.fitness.app.repository.UserRepository;
import com.fitness.app.repository.WorkoutPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * WorkoutPlanService — updated to use the three design patterns.
 *
 * CHANGES (logic is identical to the original):
 *   1. CREATIONAL  — AiServiceFactory.createAiService() replaces the direct
 *                    @Autowired GrokAiService field.
 *   2. STRUCTURAL  — The produced AiService is wrapped in a
 *                    LoggingAiServiceDecorator before being used.
 *   3. BEHAVIORAL  — WorkoutEventPublisher.publishPlanGenerated() is called
 *                    after every successful plan save.
 *
 * All business logic (BMI calculation, prompt construction, plan building)
 * is completely unchanged.
 */
@Service
public class WorkoutPlanService {

    @Autowired private WorkoutPlanRepository planRepository;
    @Autowired private UserRepository        userRepository;

    // Pattern wiring
    @Autowired private AiServiceFactory          aiServiceFactory;    // Creational
    @Autowired private LoggingAiServiceDecorator loggingDecorator;    // Structural
    @Autowired private WorkoutEventPublisher     eventPublisher;      // Behavioral

    /** Returns an AiService wrapped with the logging decorator. */
    private AiService aiService() {
        return loggingDecorator.wrap(aiServiceFactory.createAiService());
    }

    public WorkoutPlan generatePlan(WorkoutDto.GeneratePlanRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        double bmi = calculateBMI(request.getWeight(), request.getHeight());

        String prompt     = buildPrompt(request, bmi);
        String aiResponse = aiService().generateWorkoutPlan(prompt);

        WorkoutPlan plan = WorkoutPlan.builder()
                .user(user)
                .title("Workout Plan - " + request.getGoal())
                .goal(request.getGoal())
                .fitnessLevel(request.getFitnessLevel())
                .location(request.getLocation())
                .equipment(String.join(", ", request.getEquipment() != null ? request.getEquipment() : List.of()))
                .healthNotes(request.getHealthNotes())
                .workoutDays(String.join(", ", request.getWorkoutDays() != null ? request.getWorkoutDays() : List.of()))
                .planContent(aiResponse)
                .bmiValue(bmi)
                .isActive(true)
                .build();

        WorkoutPlan saved = planRepository.save(plan);

        // BEHAVIORAL: notify all observers that a plan was generated
        eventPublisher.publishPlanGenerated(PlanGeneratedEvent.from(saved));

        return saved;
    }

    public List<WorkoutPlan> getUserPlans(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return planRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public Optional<WorkoutPlan> getPlanById(Long id, String userEmail) {
        return planRepository.findById(id)
                .filter(plan -> plan.getUser().getEmail().equals(userEmail));
    }

    public void deletePlan(Long id, String userEmail) {
        WorkoutPlan plan = planRepository.findById(id)
                .filter(p -> p.getUser().getEmail().equals(userEmail))
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        planRepository.delete(plan);
    }

    private double calculateBMI(Double weight, Double height) {
        if (weight == null || height == null || height == 0) return 0;
        double heightInMeters = height / 100.0;
        return Math.round((weight / (heightInMeters * heightInMeters)) * 10.0) / 10.0;
    }

    private String buildPrompt(WorkoutDto.GeneratePlanRequest req, double bmi) {
        return String.format("""
            Create a personalized workout plan for:
            - Goal: %s
            - Fitness Level: %s
            - Age: %d, Gender: %s
            - Weight: %.1f kg, Height: %.1f cm, BMI: %.1f
            - Available days: %s
            - Location: %s
            - Equipment: %s
            - Health notes/injuries: %s
            
            Make the plan safe, progressive, and appropriate for the fitness level.
            Include BMI analysis and safety warnings if health issues mentioned.
            """,
                req.getGoal(), req.getFitnessLevel(),
                req.getAge()    != null ? req.getAge()    : 25,
                req.getGender() != null ? req.getGender() : "not specified",
                req.getWeight() != null ? req.getWeight() : 70.0,
                req.getHeight() != null ? req.getHeight() : 170.0,
                bmi,
                String.join(", ", req.getWorkoutDays() != null ? req.getWorkoutDays() : List.of()),
                req.getLocation(),
                String.join(", ", req.getEquipment() != null ? req.getEquipment() : List.of()),
                req.getHealthNotes() != null ? req.getHealthNotes() : "none"
        );
    }
}
