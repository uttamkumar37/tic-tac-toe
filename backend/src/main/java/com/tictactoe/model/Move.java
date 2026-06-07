package com.tictactoe.model;

import com.tictactoe.model.enums.PlayerSymbol;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Represents a single move in a game. Stored for full game replay and undo support.
 */
@Entity
@Table(name = "moves", indexes = {
    @Index(name = "idx_move_game", columnList = "game_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Move {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    /** The player who made this move */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // null for BOT moves

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 1)
    private PlayerSymbol symbol;

    /** Board position 0-8 */
    @Column(nullable = false)
    private int position;

    /** Sequential move number within the game (1-based) */
    @Column(nullable = false)
    private int moveNumber;

    /** Board snapshot AFTER this move was applied */
    @Column(nullable = false, length = 9)
    private String boardSnapshot;

    @CreationTimestamp
    private LocalDateTime playedAt;
}
