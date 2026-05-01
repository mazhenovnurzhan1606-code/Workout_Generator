package com.fitness.app.patterns.creational;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * CREATIONAL PATTERN — Factory Method (Creator)
 *
 * AiServiceFactory is the "Creator" in the Factory Method pattern.
 * It holds one factory method — createAiService() — whose job is to decide
 * which concrete AiService implementation to produce based on the
 * "ai.provider" configuration property.
 *
 * ┌──────────────────────────────────────────────────────────┐
 * │  FACTORY METHOD STRUCTURE                                │
 * │                                                          │
 * │  AiServiceFactory  ──createAiService()──►  AiService    │
 * │         │                                    ▲    ▲     │
 * │         │                           GrokAi   │    │...  │
 * │         │                           Provider─┘         │
 * └──────────────────────────────────────────────────────────┘
 *
 * HOW TO ADD A SECOND PROVIDER (e.g., OpenAI):
 *   1. Create OpenAiProvider implements AiService
 *   2. Set ai.provider=openai in application.properties
 *   3. Add a case in createAiService() — no other class changes
 */
@Component
public class AiServiceFactory {

    @Value("${ai.provider:grok}")
    private String providerName;

    private final GrokAiProvider grokAiProvider;

    @Autowired
    public AiServiceFactory(GrokAiProvider grokAiProvider) {
        this.grokAiProvider = grokAiProvider;
    }

    /**
     * Factory Method — returns the correct AiService for the configured provider.
     * Callers never construct an AiService directly; they always go through here.
     */
    public AiService createAiService() {
        return switch (providerName.toLowerCase()) {
            case "grok" -> grokAiProvider;
            // case "openai" -> openAiProvider;   // drop-in extension point
            default -> throw new IllegalArgumentException(
                    "Unknown AI provider: '" + providerName +
                    "'. Check the 'ai.provider' property in application.properties.");
        };
    }
}
