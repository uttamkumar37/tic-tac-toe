package com.tictactoe.engine;

import com.tictactoe.model.enums.PlayerSymbol;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.*;

@DisplayName("GameEngine – pure game logic")
class GameEngineTest {

    private GameEngine engine;

    @BeforeEach
    void setUp() {
        engine = new GameEngine();
    }

    // ------------------------------------------------------------------ //
    //  Win detection                                                       //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("X wins by filling top row")
    void detectRowWin() {
        char[] board = "XXX______".toCharArray();
        assertThat(engine.detectWinner(board)).isEqualTo(PlayerSymbol.X);
    }

    @Test
    @DisplayName("O wins by filling left column")
    void detectColumnWin() {
        char[] board = "O__O__O__".toCharArray();
        assertThat(engine.detectWinner(board)).isEqualTo(PlayerSymbol.O);
    }

    @ParameterizedTest
    @CsvSource({"X____X___X", "___X___X_X"})
    @DisplayName("Diagonal wins detected")
    void detectDiagonalWin(String boardStr) {
        // Manually craft diagonal wins
        char[] board1 = "X___X___X".toCharArray(); // main diagonal
        assertThat(engine.detectWinner(board1)).isEqualTo(PlayerSymbol.X);

        char[] board2 = "__X_X_X__".toCharArray(); // anti diagonal
        assertThat(engine.detectWinner(board2)).isEqualTo(PlayerSymbol.X);
    }

    @Test
    @DisplayName("No winner on empty board")
    void noWinnerEmpty() {
        assertThat(engine.detectWinner("_________".toCharArray())).isNull();
    }

    // ------------------------------------------------------------------ //
    //  Draw detection                                                      //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("Full board with no winner is a draw")
    void drawDetected() {
        // X O X
        // X X O
        // O X O
        char[] board = "XOXXXOOXO".toCharArray();
        assertThat(engine.detectWinner(board)).isNull();
        assertThat(engine.isDraw(board)).isTrue();
    }

    @Test
    @DisplayName("Partial board is not a draw")
    void notDrawWhenBoardPartial() {
        assertThat(engine.isDraw("XO_______".toCharArray())).isFalse();
    }

    // ------------------------------------------------------------------ //
    //  Move application & validation                                       //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("Applying a valid move updates the board")
    void applyValidMove() {
        char[] board = "_________".toCharArray();
        char[] after = engine.applyMove(board, 4, PlayerSymbol.X);
        assertThat(after[4]).isEqualTo('X');
    }

    @Test
    @DisplayName("Applying a move to an occupied cell throws")
    void applyOccupiedThrows() {
        char[] board = "X________".toCharArray();
        assertThatThrownBy(() -> engine.applyMove(board, 0, PlayerSymbol.O))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Out-of-range position throws")
    void applyOutOfRangeThrows() {
        char[] board = "_________".toCharArray();
        assertThatThrownBy(() -> engine.applyMove(board, 9, PlayerSymbol.X))
                .isInstanceOf(IllegalArgumentException.class);
    }

    // ------------------------------------------------------------------ //
    //  Undo                                                                //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("Undo clears the position")
    void undoClearsPosition() {
        char[] board = "X________".toCharArray();
        char[] after = engine.undoMove(board, 0);
        assertThat(after[0]).isEqualTo('_');
    }

    // ------------------------------------------------------------------ //
    //  Turn switching                                                      //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("nextTurn alternates correctly")
    void nextTurnAlternates() {
        assertThat(engine.nextTurn(PlayerSymbol.X)).isEqualTo(PlayerSymbol.O);
        assertThat(engine.nextTurn(PlayerSymbol.O)).isEqualTo(PlayerSymbol.X);
    }
}
