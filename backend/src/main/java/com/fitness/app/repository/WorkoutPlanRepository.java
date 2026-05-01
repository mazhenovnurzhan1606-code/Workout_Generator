package com.fitness.app.repository;

import com.fitness.app.entity.WorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, Long> {
    List<WorkoutPlan> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<WorkoutPlan> findByUserIdAndIsActiveTrue(Long userId);
}
