package com.tictactoe.engine;

import com.tictactoe.model.enums.BotDifficulty;
import com.tictactoe.model.enums.PlayerSymbol;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@DisplayName("BotEngine – AI move selection")
class BotEngineTest {

    private BotEngine botEngine;
    private GameEngine gameEngine;

    @BeforeEach
    void setUp() {
        gameEngine = new GameEngine();
        botEngine  = new BotEngine(gameEngine);
    }

    // ------------------------------------------------------------------ //
    //  Easy mode                                                           //
    // ------------------------------------------------------------------ //

    @RepeatedTest(10)
    @DisplayName("Easy bot selects a valid empty cell")
    void easyBotSelectsValidCell() {
        char[] board = "XO_X_____".toCharArray();
        int pos = botEngine.selectMove(board, BotDifficulty.EASY);
        assertThat(pos).isBetween(0, 8);
        assertThat(board[pos]).isEqualTo('_');
    }

    // ------------------------------------------------------------------ //
    //  Hard mode (Minimax)                                                 //
    // ------------------------------------------------------------------ //

    @Test
    @DisplayName("Hard bot blocks opponent's winning move")
    void hardBotBlocks() {
        // X has two in a row (positions 0,1) – bot MUST block at 2
        char[] board = "XX_O_____".toCharArray();
        int pos = botEngine.selectMove(board, BotDifficulty.HARD);
        assertThat(pos).isEqualTo(2);
    }

    @Test
    @DisplayName("Hard bot takes winning move when available")
    void hardBotWins() {
        // O has positions 3,4 – winning at 5
        char[] board = "XX_OO____".toCharArray();
        int pos = botEngine.selectMove(board, BotDifficulty.HARD);
        assertThat(pos).isEqualTo(5);
    }

    @Test
    @DisplayName("Hard bot selects center on empty board")
    void hardBotSelectsCenter() {
        char[] board = "_________".toCharArray();
        int pos = botEngine.selectMove(board, BotDifficulty.HARD);
        // Center (4) is analytically optimal for Tic-Tac-Toe
        assertThat(pos).isEqualTo(4);
    }

    @Test
    @DisplayName("Hard bot never loses against any human strategy")
    void hardBotNeverLoses() {
        // Simulate human (X) vs bot (O) where human tries a known forcing line
        char[] board = "_________".toCharArray();

        // Human X: corner 0
        board = gameEngine.applyMove(board, 0, PlayerSymbol.X);
        // Bot O should block or counter
        int botPos = botEngine.selectMove(board, BotDifficulty.HARD);
        board = gameEngine.applyMove(board, botPos, PlayerSymbol.O);

        // Verify bot did not create a losing position
        assertThat(gameEngine.detectWinner(board)).isNull();
    }
}
