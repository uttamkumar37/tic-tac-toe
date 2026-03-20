package com.tictactoe.controller;

import com.tictactoe.dto.request.CreateGameRequest;
import com.tictactoe.dto.request.MakeMoveRequest;
import com.tictactoe.dto.response.GameResponse;
import com.tictactoe.service.GameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    /** GET /api/games/open  – list multiplayer games waiting for players */
    @GetMapping("/open")
    public ResponseEntity<List<GameResponse>> getOpenGames() {
        return ResponseEntity.ok(gameService.getOpenGames());
    }

    /** GET /api/games/{roomCode}  – get current state */
    @GetMapping("/{roomCode}")
    public ResponseEntity<GameResponse> getGame(@PathVariable String roomCode) {
        return ResponseEntity.ok(gameService.getGame(roomCode));
    }

    /** POST /api/games  – create a new game session */
    @PostMapping
    public ResponseEntity<GameResponse> createGame(
            @Valid @RequestBody CreateGameRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(gameService.createGame(req, user.getUsername()));
    }

    /** POST /api/games/{roomCode}/join  – join an open multiplayer game */
    @PostMapping("/{roomCode}/join")
    public ResponseEntity<GameResponse> joinGame(
            @PathVariable String roomCode,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(gameService.joinGame(roomCode, user.getUsername()));
    }

    /** POST /api/games/move  – make a move */
    @PostMapping("/move")
    public ResponseEntity<GameResponse> makeMove(
            @Valid @RequestBody MakeMoveRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(gameService.makeMove(req, user.getUsername()));
    }

    /** POST /api/games/{roomCode}/undo  – undo last move */
    @PostMapping("/{roomCode}/undo")
    public ResponseEntity<GameResponse> undoMove(
            @PathVariable String roomCode,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(gameService.undoMove(roomCode, user.getUsername()));
    }

    /** POST /api/games/{roomCode}/restart  – restart the game */
    @PostMapping("/{roomCode}/restart")
    public ResponseEntity<GameResponse> restartGame(@PathVariable String roomCode) {
        return ResponseEntity.ok(gameService.restartGame(roomCode));
    }
}
