package com.tictactoe.dto.response;

import com.tictactoe.model.enums.GameMode;
import com.tictactoe.model.enums.PlayerSymbol;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameHistoryResponse {
    private Long id;
    private String roomCode;
    private String playerXUsername;
    private String playerOUsername;
    private GameMode mode;
    private PlayerSymbol winner;
    private String winnerUsername;
    private int totalMoves;
    private String finalBoard;
    private LocalDateTime createdAt;
    private LocalDateTime finishedAt;
}
