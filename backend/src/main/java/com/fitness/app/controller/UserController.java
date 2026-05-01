package com.fitness.app.controller;

import com.fitness.app.dto.WorkoutDto;
import com.fitness.app.entity.ChatMessage;
import com.fitness.app.entity.User;
import com.fitness.app.repository.ChatMessageRepository;
import com.fitness.app.repository.UserRepository;
import com.fitness.app.service.GrokAiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired private UserRepository userRepository;
    @Autowired private ChatMessageRepository chatMessageRepository;
    @Autowired private GrokAiService grokAiService;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody WorkoutDto.UserProfileRequest request,
                                           Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getAge() != null) user.setAge(request.getAge());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getWeight() != null) user.setWeight(request.getWeight());
        if (request.getHeight() != null) user.setHeight(request.getHeight());
        if (request.getFitnessLevel() != null) user.setFitnessLevel(request.getFitnessLevel());
        if (request.getGoal() != null) user.setGoal(request.getGoal());

        return ResponseEntity.ok(userRepository.save(user));
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody WorkoutDto.ChatRequest request, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Build conversation history
        List<ChatMessage> history = chatMessageRepository.findTop50ByUserIdOrderByCreatedAtDesc(user.getId());
        StringBuilder historyStr = new StringBuilder();
        for (int i = history.size() - 1; i >= 0; i--) {
            ChatMessage msg = history.get(i);
            historyStr.append("User: ").append(msg.getMessage()).append("\n");
            historyStr.append("Assistant: ").append(msg.getResponse()).append("\n");
        }

        String aiResponse = grokAiService.chat(request.getMessage(), historyStr.toString());

        // Save to DB
        ChatMessage chatMessage = ChatMessage.builder()
                .user(user)
                .message(request.getMessage())
                .response(aiResponse)
                .role("user")
                .build();
        chatMessageRepository.save(chatMessage);

        return ResponseEntity.ok(Map.of(
                "message", request.getMessage(),
                "response", aiResponse
        ));
    }

    @GetMapping("/chat/history")
    public ResponseEntity<List<ChatMessage>> getChatHistory(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(chatMessageRepository.findByUserIdOrderByCreatedAtAsc(user.getId()));
    }
}
