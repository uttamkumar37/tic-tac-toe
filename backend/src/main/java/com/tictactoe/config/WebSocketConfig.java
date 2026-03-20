package com.tictactoe.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

/**
 * STOMP/WebSocket configuration.
 *
 * Flow:
 *  Client connects  →  /ws  (SockJS fallback supported)
 *  Client subscribes →  /topic/game/{roomCode}   (game state broadcasts)
 *                    →  /user/queue/errors        (per-user error messages)
 *  Client sends      →  /app/game.move            (incoming move)
 *                    →  /app/game.undo
 *                    →  /app/game.restart
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // In-memory broker for topics (/topic) and user queues (/user)
        // For scale-out, replace with a full-featured broker relay (RabbitMQ / ActiveMQ)
        registry.enableSimpleBroker("/topic", "/user");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                // Allow the React dev server and production origins
                .setAllowedOriginPatterns("*")
                // SockJS fallback for environments that block native WebSockets
                .withSockJS();
    }
}
