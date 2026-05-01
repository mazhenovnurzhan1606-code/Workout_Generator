package com.fitness.app.repository;

import com.fitness.app.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByUserIdOrderByCreatedAtAsc(Long userId);
    List<ChatMessage> findTop50ByUserIdOrderByCreatedAtDesc(Long userId);
}
