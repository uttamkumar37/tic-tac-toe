package com.tictactoe.model;

import com.tictactoe.model.enums.GameMode;
import com.tictactoe.model.enums.GameStatus;
import com.tictactoe.model.enums.BotDifficulty;
import com.tictactoe.model.enums.PlayerSymbol;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a single Tic-Tac-Toe game session.
 *
 * board is serialized as a 9-char string: "XO_______"
 * where '_' means empty, 'X' / 'O' are taken cells.
 * Index mapping: 0-2 row-0, 3-5 row-1, 6-8 row-2.
 */
@Entity
@Table(name = "games", indexes = {
    @Index(name = "idx_game_status", columnList = "status"),
    @Index(name = "idx_game_player_x", columnList = "player_x_id"),
    @Index(name = "idx_game_player_o", columnList = "player_o_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Unique room code used by WebSocket topics and share links */
    @Column(nullable = false, unique = true, length = 12)
    private String roomCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_x_id", nullable = false)
    private User playerX;

    /** Null for BOT mode */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_o_id")
    private User playerO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GameMode mode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private GameStatus status = GameStatus.WAITING;

    /** 9-char board snapshot stored in DB for quick resume */
    @Column(nullable = false, length = 9)
    @Builder.Default
    private String board = "_________";

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PlayerSymbol currentTurn = PlayerSymbol.X;

    /** Winner symbol; null when draw or game not finished */
    @Enumerated(EnumType.STRING)
    private PlayerSymbol winner;

    /** Only relevant when mode == BOT */
    @Enumerated(EnumType.STRING)
    private BotDifficulty botDifficulty;

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("moveNumber ASC")
    @Builder.Default
    private List<Move> moves = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime finishedAt;
}
