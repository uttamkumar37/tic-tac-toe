package com.tictactoe.dto.response;

import com.tictactoe.model.enums.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameResponse {

    private Long id;
    private String roomCode;
    private String playerXUsername;
    private String playerOUsername;   // null for BOT mode
    private GameMode mode;
    private GameStatus status;
    private String board;             // 9-char string
    private PlayerSymbol currentTurn;
    private PlayerSymbol winner;      // null if no winner yet
    private BotDifficulty botDifficulty;
    private int totalMoves;
    private LocalDateTime createdAt;
    private LocalDateTime finishedAt;

    /** Convenience flag – true when game is over (win or draw) */
    private boolean isDraw;
}
