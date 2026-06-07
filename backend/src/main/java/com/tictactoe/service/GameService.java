package com.tictactoe.service;

import com.tictactoe.dto.request.CreateGameRequest;
import com.tictactoe.dto.request.MakeMoveRequest;
import com.tictactoe.dto.response.GameResponse;
import com.tictactoe.engine.BotEngine;
import com.tictactoe.engine.GameEngine;
import com.tictactoe.exception.GameException;
import com.tictactoe.exception.ResourceNotFoundException;
import com.tictactoe.model.*;
import com.tictactoe.model.enums.*;
import com.tictactoe.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Central game orchestrator.
 *
 * Responsibilities:
 *  1. Session management (create / join / restart)
 *  2. Move validation and application
 *  3. Win / draw detection and stat updates
 *  4. Undo support (remove last move from DB, rewind board)
 *  5. BOT integration (triggers bot move after human move)
 *  6. WebSocket broadcast of updated game state
 *  7. Redis write-through for fast board reads
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GameService {

    private final GameRepository         gameRepository;
    private final MoveRepository         moveRepository;
    private final UserService            userService;
    private final GameHistoryService     historyService;
    private final GameEngine             gameEngine;
    private final BotEngine              botEngine;
    private final RedisGameStateService  redisGameStateService;
    private final SimpMessagingTemplate  messagingTemplate;

    // ------------------------------------------------------------------ //
    //  Session management                                                  //
    // ------------------------------------------------------------------ //

    @Transactional
    public GameResponse createGame(CreateGameRequest req, String username) {
        User creator = userService.findByUsername(username);

        if (req.getMode() == GameMode.BOT && req.getBotDifficulty() == null) {
            throw new GameException("botDifficulty is required for BOT mode");
        }

        Game game = Game.builder()
                .roomCode(generateRoomCode())
                .playerX(creator)
                .mode(req.getMode())
                .status(req.getMode() == GameMode.MULTIPLAYER
                        ? GameStatus.WAITING : GameStatus.IN_PROGRESS)
                .botDifficulty(req.getBotDifficulty())
                .build();

        gameRepository.save(game);
        redisGameStateService.save(game);
        log.info("Game created: {} by {}", game.getRoomCode(), username);
        return toResponse(game);
    }

    @Transactional
    public GameResponse joinGame(String roomCode, String username) {
        Game game = findGame(roomCode);
        User joiner = userService.findByUsername(username);

        if (game.getStatus() != GameStatus.WAITING) {
            throw new GameException("Game " + roomCode + " is not open for joining");
        }
        if (game.getPlayerX().getUsername().equals(username)) {
            throw new GameException("You cannot join your own game");
        }

        game.setPlayerO(joiner);
        game.setStatus(GameStatus.IN_PROGRESS);
        gameRepository.save(game);

        GameResponse response = toResponse(game);
        broadcast(roomCode, response);
        log.info("{} joined game {}", username, roomCode);
        return response;
    }

    // ------------------------------------------------------------------ //
    //  Move                                                                //
    // ------------------------------------------------------------------ //

    @Transactional
    public GameResponse makeMove(MakeMoveRequest req, String username) {
        Game game = findGame(req.getRoomCode());
        User user = userService.findByUsername(username);

        validateParticipant(game, user);
        validateGameActive(game);
        validateTurn(game, user);

        char[] board = gameEngine.toCharArray(game.getBoard());

        if (!gameEngine.isValidMove(board, req.getPosition())) {
            throw new GameException("Position " + req.getPosition() + " is not a valid move");
        }

        // Apply human move
        board = gameEngine.applyMove(board, req.getPosition(), game.getCurrentTurn());
        int moveNumber = moveRepository.countByGameId(game.getId()) + 1;

        Move move = Move.builder()
                .game(game)
                .user(user)
                .symbol(game.getCurrentTurn())
                .position(req.getPosition())
                .moveNumber(moveNumber)
                .boardSnapshot(gameEngine.toString(board))
                .build();
        moveRepository.save(move);

        game.setBoard(gameEngine.toString(board));
        game.setCurrentTurn(gameEngine.nextTurn(game.getCurrentTurn()));

        PlayerSymbol winner = gameEngine.detectWinner(board);
        if (winner != null || gameEngine.isDraw(board)) {
            finishGame(game, winner);
        }

        gameRepository.save(game);
        redisGameStateService.save(game);

        GameResponse response = toResponse(game);
        broadcast(req.getRoomCode(), response);

        // BOT response (only when game is still active)
        if (game.getMode() == GameMode.BOT && game.getStatus() == GameStatus.IN_PROGRESS) {
            return botMove(game);
        }

        return response;
    }

    private GameResponse botMove(Game game) {
        char[] board = gameEngine.toCharArray(game.getBoard());
        int botPosition = botEngine.selectMove(board, game.getBotDifficulty());

        board = gameEngine.applyMove(board, botPosition, PlayerSymbol.O);
        int moveNumber = moveRepository.countByGameId(game.getId()) + 1;

        Move botMoveEntity = Move.builder()
                .game(game)
                .user(null)  // no user for BOT
                .symbol(PlayerSymbol.O)
                .position(botPosition)
                .moveNumber(moveNumber)
                .boardSnapshot(gameEngine.toString(board))
                .build();
        moveRepository.save(botMoveEntity);

        game.setBoard(gameEngine.toString(board));
        game.setCurrentTurn(gameEngine.nextTurn(game.getCurrentTurn()));

        PlayerSymbol winner = gameEngine.detectWinner(board);
        if (winner != null || gameEngine.isDraw(board)) {
            finishGame(game, winner);
        }

        gameRepository.save(game);
        redisGameStateService.save(game);

        GameResponse response = toResponse(game);
        broadcast(game.getRoomCode(), response);
        return response;
    }

    // ------------------------------------------------------------------ //
    //  Undo                                                                //
    // ------------------------------------------------------------------ //

    @Transactional
    public GameResponse undoMove(String roomCode, String username) {
        Game game = findGame(roomCode);
        User user = userService.findByUsername(username);

        validateParticipant(game, user);
        validateGameActive(game);

        Move lastMove = moveRepository.findTopByGameIdOrderByMoveNumberDesc(game.getId())
                .orElseThrow(() -> new GameException("No moves to undo"));

        // In BOT mode, undo both the bot's last move and the human's last move
        if (game.getMode() == GameMode.BOT) {
            moveRepository.delete(lastMove);
            moveRepository.findTopByGameIdOrderByMoveNumberDesc(game.getId())
                    .ifPresent(moveRepository::delete);
            // Recompute board from remaining moves
            game.setBoard(recomputeBoard(game.getId()));
            game.setCurrentTurn(PlayerSymbol.X); // human always plays X
        } else {
            // Multiplayer: only the player who made the last move can undo it
            if (lastMove.getUser() == null || !lastMove.getUser().getUsername().equals(username)) {
                throw new GameException("You can only undo your own last move");
            }
            char[] board = gameEngine.undoMove(
                    gameEngine.toCharArray(game.getBoard()), lastMove.getPosition());
            game.setBoard(gameEngine.toString(board));
            game.setCurrentTurn(lastMove.getSymbol()); // revert turn
            moveRepository.delete(lastMove);
        }

        gameRepository.save(game);
        redisGameStateService.save(game);
        GameResponse response = toResponse(game);
        broadcast(roomCode, response);
        return response;
    }

    // ------------------------------------------------------------------ //
    //  Restart                                                             //
    // ------------------------------------------------------------------ //

    @Transactional
    public GameResponse restartGame(String roomCode, String username) {
        Game game = findGame(roomCode);
        User user = userService.findByUsername(username);

        validateParticipant(game, user);

        // Remove all moves
        List<Move> moves = moveRepository.findByGameIdOrderByMoveNumberAsc(game.getId());
        moveRepository.deleteAll(moves);

        game.setBoard("_________");
        game.setCurrentTurn(PlayerSymbol.X);
        game.setStatus(GameStatus.IN_PROGRESS);
        game.setWinner(null);
        game.setFinishedAt(null);

        gameRepository.save(game);
        redisGameStateService.save(game);
        GameResponse response = toResponse(game);
        broadcast(roomCode, response);
        return response;
    }

    // ------------------------------------------------------------------ //
    //  Queries                                                             //
    // ------------------------------------------------------------------ //

    @Transactional(readOnly = true)
    public GameResponse getGame(String roomCode, String username) {
        Game game = findGame(roomCode);
        User user = userService.findByUsername(username);
        validateParticipant(game, user);
        GameResponse response = toResponse(game);
        if (game.getStatus() == GameStatus.IN_PROGRESS) {
            redisGameStateService.getBoard(roomCode).ifPresent(response::setBoard);
        }
        return response;
    }

    @Transactional(readOnly = true)
    public List<GameResponse> getOpenGames() {
        return gameRepository.findByStatus(GameStatus.WAITING)
                .stream()
                .filter(g -> g.getMode() == GameMode.MULTIPLAYER)
                .map(this::toResponse)
                .toList();
    }

    // ------------------------------------------------------------------ //
    //  Helper utilities                                                    //
    // ------------------------------------------------------------------ //

    private void finishGame(Game game, PlayerSymbol winner) {
        game.setStatus(GameStatus.FINISHED);
        game.setWinner(winner);
        game.setFinishedAt(LocalDateTime.now());
        redisGameStateService.delete(game.getRoomCode()); // evict from cache

        // Persist to history and update player stats
        historyService.archiveGame(game);
        updatePlayerStats(game, winner);
        log.info("Game {} finished – winner: {}", game.getRoomCode(), winner);
    }

    private void updatePlayerStats(Game game, PlayerSymbol winner) {
        boolean draw = (winner == null);
        if (game.getPlayerX() != null) {
            userService.updateStats(game.getPlayerX().getId(),
                    !draw && winner == PlayerSymbol.X, draw);
        }
        if (game.getPlayerO() != null && game.getMode() == GameMode.MULTIPLAYER) {
            userService.updateStats(game.getPlayerO().getId(),
                    !draw && winner == PlayerSymbol.O, draw);
        }
    }

    private void validateGameActive(Game game) {
        if (game.getStatus() != GameStatus.IN_PROGRESS) {
            throw new GameException("Game " + game.getRoomCode() + " is not active");
        }
    }

    private void validateParticipant(Game game, User user) {
        boolean isPlayerX = game.getPlayerX() != null
                && game.getPlayerX().getId().equals(user.getId());
        boolean isPlayerO = game.getPlayerO() != null
                && game.getPlayerO().getId().equals(user.getId());

        if (game.getMode() == GameMode.BOT) {
            if (!isPlayerX) {
                throw new AccessDeniedException("You are not allowed to access this game");
            }
            return;
        }

        if (!isPlayerX && !isPlayerO) {
            throw new AccessDeniedException("You are not allowed to access this game");
        }
    }

    private void validateTurn(Game game, User user) {
        PlayerSymbol symbol = game.getCurrentTurn();
        User expectedPlayer = symbol == PlayerSymbol.X ? game.getPlayerX() : game.getPlayerO();

        // In BOT mode, playerO is null; only human (X) can make moves
        if (game.getMode() == GameMode.BOT && symbol == PlayerSymbol.O) {
            throw new GameException("It is the bot's turn");
        }
        if (expectedPlayer != null && !expectedPlayer.getId().equals(user.getId())) {
            throw new GameException("It is not your turn");
        }
    }

    private String recomputeBoard(Long gameId) {
        char[] board = "_________".toCharArray();
        List<Move> remaining = moveRepository.findByGameIdOrderByMoveNumberAsc(gameId);
        for (Move m : remaining) {
            board[m.getPosition()] = m.getSymbol().name().charAt(0);
        }
        return new String(board);
    }

    private Game findGame(String roomCode) {
        return gameRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found: " + roomCode));
    }

    private void broadcast(String roomCode, GameResponse response) {
        messagingTemplate.convertAndSend("/topic/game/" + roomCode, response);
    }

    private String generateRoomCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public GameResponse toResponse(Game game) {
        int totalMoves = game.getMoves() != null ? game.getMoves().size() : 0;
        return GameResponse.builder()
                .id(game.getId())
                .roomCode(game.getRoomCode())
                .playerXUsername(game.getPlayerX().getUsername())
                .playerOUsername(game.getPlayerO() != null ? game.getPlayerO().getUsername() : null)
                .mode(game.getMode())
                .status(game.getStatus())
                .board(game.getBoard())
                .currentTurn(game.getCurrentTurn())
                .winner(game.getWinner())
                .botDifficulty(game.getBotDifficulty())
                .totalMoves(totalMoves)
                .createdAt(game.getCreatedAt())
                .finishedAt(game.getFinishedAt())
                .isDraw(game.getStatus() == GameStatus.FINISHED && game.getWinner() == null)
                .build();
    }
}
