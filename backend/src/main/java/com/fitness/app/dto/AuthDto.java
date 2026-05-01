package com.fitness.app.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDto {

    @Data
    public static class RegisterRequest {
        @NotBlank private String name;
        @Email @NotBlank private String email;
        @Size(min = 6) @NotBlank private String password;
    }

    @Data
    public static class LoginRequest {
        @Email @NotBlank private String email;
        @NotBlank private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String email;
        private String name;
        private Long userId;

        public AuthResponse(String token, String email, String name, Long userId) {
            this.token = token;
            this.email = email;
            this.name = name;
            this.userId = userId;
        }
    }
}
