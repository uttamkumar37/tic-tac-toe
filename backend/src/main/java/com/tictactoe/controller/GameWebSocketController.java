package com.tictactoe.controller;

import com.tictactoe.dto.request.MakeMoveRequest;
import com.tictactoe.dto.response.GameResponse;
import com.tictactoe.service.GameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * Handles STOMP messages from WebSocket clients.
 *
 * Clients send to  /app/game.move  etc.
 * Updates are broadcast to  /topic/game/{roomCode}
 * Errors are routed to  /user/queue/errors  (private per-user queue)
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class GameWebSocketController {

    private final GameService gameService;

    /** Client sends: SEND /app/game.move  with MakeMoveRequest payload */
    @MessageMapping("/game.move")
    public void makeMove(@Valid @Payload MakeMoveRequest req, Principal principal) {
        String username = requireUsername(principal);
        log.debug("WS move: {} by {}", req.getPosition(), username);
        gameService.makeMove(req, username);
        // broadcast is handled inside GameService via SimpMessagingTemplate
    }

    /** Client sends: SEND /app/game.undo  with { roomCode } */
    @MessageMapping("/game.undo")
    public void undoMove(@Payload MakeMoveRequest req, Principal principal) {
        gameService.undoMove(req.getRoomCode(), requireUsername(principal));
    }

    /** Client sends: SEND /app/game.restart  with { roomCode } */
    @MessageMapping("/game.restart")
    public void restartGame(@Payload MakeMoveRequest req, Principal principal) {
        gameService.restartGame(req.getRoomCode(), requireUsername(principal));
    }

    /** Used by the WebSocket error handler to route errors back to the sender */
    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public String handleException(Exception e) {
        log.warn("WebSocket error: {}", e.getMessage());
        return e.getMessage();
    }

    private String requireUsername(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new AccessDeniedException("Authenticated WebSocket user is required");
        }
        return principal.getName();
    }
}
