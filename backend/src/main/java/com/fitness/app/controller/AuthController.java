package com.fitness.app.controller;

import com.fitness.app.dto.AuthDto;
import com.fitness.app.entity.User;
import com.fitness.app.patterns.behavioral.UserRegisteredEvent;
import com.fitness.app.patterns.behavioral.WorkoutEventPublisher;
import com.fitness.app.repository.UserRepository;
import com.fitness.app.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController — updated with Observer pattern.
 *
 * ONLY CHANGE vs original: after saving a new user, publishUserRegistered()
 * is called on the WorkoutEventPublisher. All auth logic is unchanged.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired private AuthenticationManager authManager;
    @Autowired private UserRepository        userRepository;
    @Autowired private PasswordEncoder       passwordEncoder;
    @Autowired private JwtUtil               jwtUtil;
    @Autowired private UserDetailsService    userDetailsService;

    // BEHAVIORAL: publisher injected to fire UserRegisteredEvent
    @Autowired private WorkoutEventPublisher eventPublisher;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already in use");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role("USER")
                .build();

        userRepository.save(user);

        // BEHAVIORAL: notify all observers — new user registered
        eventPublisher.publishUserRegistered(
                new UserRegisteredEvent(user.getId(), user.getEmail(), user.getName()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(
                new AuthDto.AuthResponse(token, user.getEmail(), user.getName(), user.getId()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthDto.LoginRequest request) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(
                new AuthDto.AuthResponse(token, user.getEmail(), user.getName(), user.getId()));
    }
}
