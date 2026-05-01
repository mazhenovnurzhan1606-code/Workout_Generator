package com.fitness.app.dto;

import lombok.Data;
import java.util.List;

public class WorkoutDto {

    @Data
    public static class GeneratePlanRequest {
        private String goal;
        private String fitnessLevel;
        private Integer age;
        private String gender;
        private Double weight;
        private Double height;
        private List<String> workoutDays;
        private String location;
        private List<String> equipment;
        private String healthNotes;
    }

    @Data
    public static class ChatRequest {
        private String message;
    }

    @Data
    public static class UserProfileRequest {
        private String name;
        private Integer age;
        private String gender;
        private Double weight;
        private Double height;
        private String fitnessLevel;
        private String goal;
    }
}
