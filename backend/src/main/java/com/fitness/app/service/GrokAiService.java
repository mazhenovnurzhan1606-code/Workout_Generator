package com.fitness.app.service;

import com.fitness.app.patterns.creational.GrokAiProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * GrokAiService — kept as a thin compatibility shim.
 *
 * All real logic now lives in GrokAiProvider (the concrete Factory Method product).
 * This class delegates every call to that provider so that any code still
 * @Autowiring GrokAiService continues to compile and run without changes.
 *
 * New code should prefer injecting AiService (via AiServiceFactory) instead.
 */
@Service
public class GrokAiService {

    @Autowired
    private GrokAiProvider grokAiProvider;

    public String generateWorkoutPlan(String userPrompt) {
        return grokAiProvider.generateWorkoutPlan(userPrompt);
    }

    public String chat(String userMessage, String conversationHistory) {
        return grokAiProvider.chat(userMessage, conversationHistory);
    }
}
