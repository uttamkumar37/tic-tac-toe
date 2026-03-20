package com.tictactoe.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a registered user.
 * Passwords are stored as BCrypt hashes – never plain text.
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_username", columnList = "username", unique = true),
    @Index(name = "idx_user_email",    columnList = "email",    unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    /** BCrypt hash – never expose in responses */
    @Column(nullable = false)
    private String password;

    @Column(length = 20)
    @Builder.Default
    private String role = "ROLE_USER";

    @Builder.Default
    private boolean enabled = true;

    // ---- Stats (denormalised for fast leaderboard queries) ----
    @Builder.Default
    private int totalGames = 0;

    @Builder.Default
    private int wins = 0;

    @Builder.Default
    private int losses = 0;

    @Builder.Default
    private int draws = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "playerX", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Game> gamesAsX = new ArrayList<>();

    @OneToMany(mappedBy = "playerO", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Game> gamesAsO = new ArrayList<>();
}
