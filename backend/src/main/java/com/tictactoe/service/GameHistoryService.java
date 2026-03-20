package com.tictactoe.service;

import com.tictactoe.dto.response.GameHistoryResponse;
import com.tictactoe.model.Game;
import com.tictactoe.model.GameHistory;
import com.tictactoe.model.enums.PlayerSymbol;
import com.tictactoe.repository.GameHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameHistoryService {

    private final GameHistoryRepository historyRepository;
    private final UserService userService;

    @Transactional
    public void archiveGame(Game game) {
        String winnerUsername = null;
        if (game.getWinner() != null) {
            winnerUsername = game.getWinner() == PlayerSymbol.X
                    ? game.getPlayerX().getUsername()
                    : (game.getPlayerO() != null ? game.getPlayerO().getUsername() : "BOT");
        }

        GameHistory history = GameHistory.builder()
                .gameId(game.getId())
                .roomCode(game.getRoomCode())
                .playerX(game.getPlayerX())
                .playerO(game.getPlayerO())
                .mode(game.getMode())
                .winner(game.getWinner())
                .winnerUsername(winnerUsername)
                .totalMoves(game.getMoves() != null ? game.getMoves().size() : 0)
                .finalBoard(game.getBoard())
                .finishedAt(game.getFinishedAt())
                .build();

        historyRepository.save(history);
        log.debug("Archived game {} to history", game.getRoomCode());
    }

    @Transactional(readOnly = true)
    public Page<GameHistoryResponse> getHistory(String username, int page, int size) {
        Long userId = userService.findByUsername(username).getId();
        Pageable pageable = PageRequest.of(page, size);
        return historyRepository.findByPlayer(userId, pageable)
                .map(this::toResponse);
    }

    private GameHistoryResponse toResponse(GameHistory h) {
        return GameHistoryResponse.builder()
                .id(h.getId())
                .roomCode(h.getRoomCode())
                .playerXUsername(h.getPlayerX().getUsername())
                .playerOUsername(h.getPlayerO() != null ? h.getPlayerO().getUsername() : "BOT")
                .mode(h.getMode())
                .winner(h.getWinner())
                .winnerUsername(h.getWinnerUsername())
                .totalMoves(h.getTotalMoves())
                .finalBoard(h.getFinalBoard())
                .createdAt(h.getCreatedAt())
                .finishedAt(h.getFinishedAt())
                .build();
    }
}
