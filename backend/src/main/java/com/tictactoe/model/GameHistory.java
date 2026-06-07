package com.tictactoe.model;

import com.tictactoe.model.enums.GameMode;
import com.tictactoe.model.enums.PlayerSymbol;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Immutable record of a completed game – used for match history queries.
 * Separated from Game to support archival and fast history retrieval.
 */
@Entity
@Table(name = "game_history", indexes = {
    @Index(name = "idx_history_player_x", columnList = "player_x_id"),
    @Index(name = "idx_history_player_o", columnList = "player_o_id"),
    @Index(name = "idx_history_created",  columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long gameId;

    @Column(nullable = false)
    private String roomCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_x_id", nullable = false)
    private User playerX;

    /** Null for BOT mode games */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_o_id")
    private User playerO;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 20)
    private GameMode mode;

    /** Winner symbol; null means draw */
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(length = 1)
    private PlayerSymbol winner;

    /** Username of winner for denormalized fast display */
    private String winnerUsername;

    @Column(nullable = false)
    private int totalMoves;

    /** Final board state */
    @Column(nullable = false, length = 9)
    private String finalBoard;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime finishedAt;
}
