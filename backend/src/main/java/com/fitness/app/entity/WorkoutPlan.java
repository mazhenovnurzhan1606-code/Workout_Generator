package com.fitness.app.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workout_plans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String title;
    private String goal;
    private String fitnessLevel;
    private String location;
    private String equipment;
    private String healthNotes;
    private String workoutDays;

    @Column(columnDefinition = "TEXT")
    private String planContent; // AI-generated JSON plan

    @Column(columnDefinition = "TEXT")
    private String bmiInfo;

    private Double bmiValue;
    private Boolean isActive = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
