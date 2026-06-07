package com.tictactoe.service;

import com.tictactoe.dto.request.CreateGameRequest;
import com.tictactoe.dto.request.MakeMoveRequest;
import com.tictactoe.dto.response.GameResponse;
import com.tictactoe.engine.BotEngine;
import com.tictactoe.engine.GameEngine;
import com.tictactoe.exception.GameException;
import com.tictactoe.model.Game;
import com.tictactoe.model.Move;
import com.tictactoe.model.User;
import com.tictactoe.model.enums.BotDifficulty;
import com.tictactoe.model.enums.GameMode;
import com.tictactoe.model.enums.GameStatus;
import com.tictactoe.model.enums.PlayerSymbol;
import com.tictactoe.repository.GameRepository;
import com.tictactoe.repository.MoveRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;

import java.util.ArrayList;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GameService")
class GameServiceTest {

    @Mock private GameRepository gameRepository;
    @Mock private MoveRepository moveRepository;
    @Mock private UserService userService;
    @Mock private GameHistoryService historyService;
    @Mock private BotEngine botEngine;
    @Mock private RedisGameStateService redisGameStateService;
    @Mock private SimpMessagingTemplate messagingTemplate;

    private GameService service;

    @BeforeEach
    void setUp() {
        service = new GameService(
                gameRepository,
                moveRepository,
                userService,
                historyService,
                new GameEngine(),
                botEngine,
                redisGameStateService,
                messagingTemplate);
    }

    @Test
    @DisplayName("createGame requires bot difficulty for bot mode")
    void createBotGameRequiresDifficulty() {
        CreateGameRequest request = new CreateGameRequest();
        request.setMode(GameMode.BOT);

        when(userService.findByUsername("alice")).thenReturn(user(1L, "alice"));

        assertThatThrownBy(() -> service.createGame(request, "alice"))
                .isInstanceOf(GameException.class)
                .hasMessageContaining("botDifficulty");

        verify(gameRepository, never()).save(any());
    }

    @Test
    @DisplayName("createGame creates a waiting multiplayer room")
    void createMultiplayerGame() {
        CreateGameRequest request = new CreateGameRequest();
        request.setMode(GameMode.MULTIPLAYER);

        when(userService.findByUsername("alice")).thenReturn(user(1L, "alice"));

        GameResponse response = service.createGame(request, "alice");

        assertThat(response.getMode()).isEqualTo(GameMode.MULTIPLAYER);
        assertThat(response.getStatus()).isEqualTo(GameStatus.WAITING);
        assertThat(response.getPlayerXUsername()).isEqualTo("alice");
        assertThat(response.getRoomCode()).hasSize(8);

        verify(gameRepository).save(any(Game.class));
        verify(redisGameStateService).save(any(Game.class));
    }

    @Test
    @DisplayName("joinGame attaches player O and starts the room")
    void joinGameStartsMultiplayerRoom() {
        User alice = user(1L, "alice");
        User bob = user(2L, "bob");
        Game game = multiplayerGame(alice, null);
        game.setStatus(GameStatus.WAITING);

        when(gameRepository.findByRoomCode("ROOM1234")).thenReturn(Optional.of(game));
        when(userService.findByUsername("bob")).thenReturn(bob);

        GameResponse response = service.joinGame("ROOM1234", "bob");

        assertThat(response.getStatus()).isEqualTo(GameStatus.IN_PROGRESS);
        assertThat(response.getPlayerOUsername()).isEqualTo("bob");
        assertThat(game.getPlayerO()).isEqualTo(bob);

        verify(gameRepository).save(game);
        verify(messagingTemplate).convertAndSend(eq("/topic/game/ROOM1234"), any(GameResponse.class));
    }

    @Test
    @DisplayName("getGame rejects users who are not participants")
    void getGameRejectsNonParticipant() {
        User alice = user(1L, "alice");
        User bob = user(2L, "bob");
        User mallory = user(3L, "mallory");
        Game game = multiplayerGame(alice, bob);

        when(gameRepository.findByRoomCode("ROOM1234")).thenReturn(Optional.of(game));
        when(userService.findByUsername("mallory")).thenReturn(mallory);

        assertThatThrownBy(() -> service.getGame("ROOM1234", "mallory"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("getGame overlays active board from Redis after authorization")
    void getGameUsesRedisBoardForActiveGame() {
        User alice = user(1L, "alice");
        Game game = multiplayerGame(alice, user(2L, "bob"));
        game.setBoard("_________");

        when(gameRepository.findByRoomCode("ROOM1234")).thenReturn(Optional.of(game));
        when(userService.findByUsername("alice")).thenReturn(alice);
        when(redisGameStateService.getBoard("ROOM1234")).thenReturn(Optional.of("X________"));

        GameResponse response = service.getGame("ROOM1234", "alice");

        assertThat(response.getBoard()).isEqualTo("X________");
    }

    @Test
    @DisplayName("makeMove archives game and updates stats when a player wins")
    void makeWinningMoveArchivesAndUpdatesStats() {
        User alice = user(1L, "alice");
        User bob = user(2L, "bob");
        Game game = multiplayerGame(alice, bob);
        game.setBoard("XX_OO____");
        game.setCurrentTurn(PlayerSymbol.X);

        MakeMoveRequest request = new MakeMoveRequest();
        request.setRoomCode("ROOM1234");
        request.setPosition(2);

        when(gameRepository.findByRoomCode("ROOM1234")).thenReturn(Optional.of(game));
        when(userService.findByUsername("alice")).thenReturn(alice);
        when(moveRepository.countByGameId(game.getId())).thenReturn(4);

        GameResponse response = service.makeMove(request, "alice");

        assertThat(response.getStatus()).isEqualTo(GameStatus.FINISHED);
        assertThat(response.getWinner()).isEqualTo(PlayerSymbol.X);
        assertThat(response.getBoard()).isEqualTo("XXXOO____");

        verify(moveRepository).save(any(Move.class));
        verify(historyService).archiveGame(game);
        verify(userService).updateStats(1L, true, false);
        verify(userService).updateStats(2L, false, false);
    }

    @Test
    @DisplayName("restartGame rejects users who are not participants")
    void restartRejectsNonParticipant() {
        User alice = user(1L, "alice");
        User bob = user(2L, "bob");
        Game game = multiplayerGame(alice, null);
        game.setStatus(GameStatus.WAITING);

        when(gameRepository.findByRoomCode("ROOM1234")).thenReturn(Optional.of(game));
        when(userService.findByUsername("bob")).thenReturn(bob);

        assertThatThrownBy(() -> service.restartGame("ROOM1234", "bob"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("undoMove in bot mode is limited to the owner")
    void botUndoRejectsNonOwner() {
        User alice = user(1L, "alice");
        User bob = user(2L, "bob");
        Game game = botGame(alice);

        when(gameRepository.findByRoomCode("ROOM1234")).thenReturn(Optional.of(game));
        when(userService.findByUsername("bob")).thenReturn(bob);

        assertThatThrownBy(() -> service.undoMove("ROOM1234", "bob"))
                .isInstanceOf(AccessDeniedException.class);

        verify(moveRepository, never()).delete(any());
    }

    private User user(Long id, String username) {
        return User.builder()
                .id(id)
                .username(username)
                .email(username + "@example.com")
                .password("hash")
                .build();
    }

    private Game multiplayerGame(User playerX, User playerO) {
        return Game.builder()
                .id(10L)
                .roomCode("ROOM1234")
                .playerX(playerX)
                .playerO(playerO)
                .mode(GameMode.MULTIPLAYER)
                .status(GameStatus.IN_PROGRESS)
                .board("_________")
                .currentTurn(PlayerSymbol.X)
                .moves(new ArrayList<>())
                .build();
    }

    private Game botGame(User playerX) {
        return Game.builder()
                .id(10L)
                .roomCode("ROOM1234")
                .playerX(playerX)
                .mode(GameMode.BOT)
                .status(GameStatus.IN_PROGRESS)
                .botDifficulty(BotDifficulty.HARD)
                .board("XO_______")
                .currentTurn(PlayerSymbol.X)
                .moves(new ArrayList<>())
                .build();
    }
}
