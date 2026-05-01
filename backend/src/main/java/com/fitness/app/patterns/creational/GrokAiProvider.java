package com.fitness.app.patterns.creational;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * CREATIONAL PATTERN — Factory Method (Concrete Product: Grok / xAI)
 *
 * This class is the exact logic that was inside GrokAiService, extracted into
 * a concrete AiService implementation. Nothing in the AI call logic changed —
 * only the class hierarchy changed to fit the Factory Method pattern.
 *
 * The original GrokAiService is kept as a thin Spring @Service that delegates
 * to this class so that the rest of the app compiles without modification.
 */
@Component("grokAiProvider")
public class GrokAiProvider implements AiService {

    @Value("${grok.api.key}")
    private String apiKey;

    @Value("${grok.api.url}")
    private String apiUrl;

    @Value("${grok.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    // ── Public AiService contract ────────────────────────────────────────────

    @Override
    public String generateWorkoutPlan(String userPrompt) {
        return callGrok(buildWorkoutSystemPrompt(), userPrompt);
    }

    @Override
    public String chat(String userMessage, String conversationHistory) {
        String systemPrompt = """
            You are FitAI — an expert personal trainer and sports nutrition coach.
            You help users with workout plans, exercise techniques, nutrition, recovery, and fitness goals.
            Be encouraging, specific, and safety-conscious. Always recommend consulting a doctor for medical issues.
            Respond in the language the user writes in (Kazakh, Russian, or English).
            """;
        String fullMessage = conversationHistory.isEmpty()
                ? userMessage
                : conversationHistory + "\n\nUser: " + userMessage;
        return callGrok(systemPrompt, fullMessage);
    }

    // ── Internal helpers (unchanged from original GrokAiService) ─────────────

    private String callGrok(String systemPrompt, String userMessage) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        messages.add(Map.of("role", "user",   "content", userMessage));

        Map<String, Object> body = new HashMap<>();
        body.put("model",      model);
        body.put("max_tokens", 4096);
        body.put("messages",   messages);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> choices =
                        (List<Map<String, Object>>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
        } catch (Exception e) {
            return "AI service error: " + e.getMessage();
        }
        return "No response from AI";
    }

    private String buildWorkoutSystemPrompt() {
        return """
            You are FitAI, an expert personal trainer. Generate a detailed weekly workout plan in JSON format.
            The JSON structure must be exactly:
            {
              "planTitle": "string",
              "bmi": { "value": number, "category": "string", "advice": "string" },
              "safetyWarnings": ["string"],
              "weeklyPlan": [
                {
                  "day": "Monday",
                  "focus": "string",
                  "warmup": "string",
                  "exercises": [
                    {
                      "name": "string",
                      "sets": number,
                      "reps": "string",
                      "rest": "string",
                      "coachTip": "string",
                      "muscleGroup": "string"
                    }
                  ],
                  "cooldown": "string",
                  "duration": "string"
                }
              ],
              "nutritionTips": ["string"],
              "progressionAdvice": "string"
            }
            Respond ONLY with valid JSON, no markdown, no extra text.
            """;
    }
}
