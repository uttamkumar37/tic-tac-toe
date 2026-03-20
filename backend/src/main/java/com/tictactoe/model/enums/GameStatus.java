package com.tictactoe.model.enums;

/**
 * Represents the current lifecycle state of a game session.
 */
public enum GameStatus {
    WAITING,    // Game created, waiting for 2nd player (multiplayer only)
    IN_PROGRESS, // Active game
    FINISHED,   // Game ended (win or draw)
    ABANDONED   // Player disconnected
}
