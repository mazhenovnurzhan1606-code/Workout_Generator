package com.fitness.app.controller;

import com.fitness.app.dto.WorkoutDto;
import com.fitness.app.entity.WorkoutPlan;
import com.fitness.app.service.WorkoutPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workouts")
@CrossOrigin(origins = "http://localhost:3000")
public class WorkoutController {

    @Autowired
    private WorkoutPlanService workoutPlanService;

    @PostMapping("/generate")
    public ResponseEntity<?> generatePlan(@RequestBody WorkoutDto.GeneratePlanRequest request,
                                          Authentication auth) {
        try {
            WorkoutPlan plan = workoutPlanService.generatePlan(request, auth.getName());
            return ResponseEntity.ok(plan);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating plan: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<WorkoutPlan>> getMyPlans(Authentication auth) {
        return ResponseEntity.ok(workoutPlanService.getUserPlans(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPlan(@PathVariable Long id, Authentication auth) {
        return workoutPlanService.getPlanById(id, auth.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlan(@PathVariable Long id, Authentication auth) {
        try {
            workoutPlanService.deletePlan(id, auth.getName());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
