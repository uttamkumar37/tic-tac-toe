package com.tictactoe.engine;

import com.tictactoe.model.enums.PlayerSymbol;
import org.springframework.stereotype.Component;

/**
 * Pure game logic – no Spring dependencies except @Component.
 * Operates on a char[9] board where '_' = empty.
 *
 * Win conditions (index pairs):
 *  Rows:    0-1-2 | 3-4-5 | 6-7-8
 *  Cols:    0-3-6 | 1-4-7 | 2-5-8
 *  Diags:   0-4-8 | 2-4-6
 */
@Component
public class GameEngine {

    private static final int[][] WIN_CONDITIONS = {
        {0, 1, 2}, {3, 4, 5}, {6, 7, 8}, // rows
        {0, 3, 6}, {1, 4, 7}, {2, 5, 8}, // columns
        {0, 4, 8}, {2, 4, 6}             // diagonals
    };

    // ------------------------------------------------------------------ //
    //  Board conversion                                                    //
    // ------------------------------------------------------------------ //

    /** "XO_______" -> char[9] */
    public char[] toCharArray(String board) {
        return board.toCharArray();
    }

    /** char[9] -> "XO_______" */
    public String toString(char[] board) {
        return new String(board);
    }

    // ------------------------------------------------------------------ //
    //  Move application                                                    //
    // ------------------------------------------------------------------ //

    /**
     * Applies a move.
     *
     * @throws IllegalArgumentException if position is out of range or already taken
     */
    public char[] applyMove(char[] board, int position, PlayerSymbol symbol) {
        if (position < 0 || position > 8) {
            throw new IllegalArgumentException("Position must be 0-8, got " + position);
        }
        if (board[position] != '_') {
            throw new IllegalArgumentException("Position " + position + " is already occupied");
        }
        char[] newBoard = board.clone();
        newBoard[position] = symbol.name().charAt(0); // 'X' or 'O'
        return newBoard;
    }

    /**
     * Undoes the last move by clearing the given position.
     */
    public char[] undoMove(char[] board, int position) {
        char[] newBoard = board.clone();
        newBoard[position] = '_';
        return newBoard;
    }

    // ------------------------------------------------------------------ //
    //  Win / draw detection                                                //
    // ------------------------------------------------------------------ //

    /**
     * Returns the winning symbol, or null if no winner yet.
     */
    public PlayerSymbol detectWinner(char[] board) {
        for (int[] combo : WIN_CONDITIONS) {
            char a = board[combo[0]], b = board[combo[1]], c = board[combo[2]];
            if (a != '_' && a == b && b == c) {
                return a == 'X' ? PlayerSymbol.X : PlayerSymbol.O;
            }
        }
        return null;
    }

    /**
     * True when all 9 cells are filled (and there is no winner → draw).
     */
    public boolean isDraw(char[] board) {
        for (char c : board) {
            if (c == '_') return false;
        }
        return detectWinner(board) == null;
    }

    /**
     * True when the position is free.
     */
    public boolean isValidMove(char[] board, int position) {
        return position >= 0 && position <= 8 && board[position] == '_';
    }

    /**
     * Returns true if the game is over (win or draw).
     */
    public boolean isGameOver(char[] board) {
        return detectWinner(board) != null || isDraw(board);
    }

    /**
     * Toggle turn: X -> O, O -> X
     */
    public PlayerSymbol nextTurn(PlayerSymbol current) {
        return current == PlayerSymbol.X ? PlayerSymbol.O : PlayerSymbol.X;
    }
}
