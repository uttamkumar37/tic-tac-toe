package com.tictactoe.engine;

import com.tictactoe.model.enums.BotDifficulty;
import com.tictactoe.model.enums.PlayerSymbol;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * AI-driven move selector.
 *
 * EASY  – picks a random empty cell (beatable)
 * HARD  – runs the Minimax algorithm (unbeatable)
 *
 * The BOT always plays as 'O'.
 */
@Component
@RequiredArgsConstructor
public class BotEngine {

    private final GameEngine gameEngine;
    private final Random random = new Random();

    /**
     * Select the best position for the bot given the current board and difficulty.
     */
    public int selectMove(char[] board, BotDifficulty difficulty) {
        return switch (difficulty) {
            case EASY -> easyMove(board);
            case HARD -> hardMove(board);
        };
    }

    // ------------------------------------------------------------------ //
    //  Easy: random free cell                                              //
    // ------------------------------------------------------------------ //

    private int easyMove(char[] board) {
        List<Integer> available = getEmptyPositions(board);
        if (available.isEmpty()) {
            throw new IllegalStateException("No moves available");
        }
        return available.get(random.nextInt(available.size()));
    }

    // ------------------------------------------------------------------ //
    //  Hard: Minimax                                                       //
    // ------------------------------------------------------------------ //

    private int hardMove(char[] board) {
        int bestScore = Integer.MIN_VALUE;
        int bestMove  = -1;

        List<Integer> positions = new ArrayList<>(getEmptyPositions(board));
        // Evaluate center first so it wins score ties (strategically optimal)
        if (positions.remove(Integer.valueOf(4))) {
            positions.add(0, 4);
        }

        for (int pos : positions) {
            char[] next = gameEngine.applyMove(board, pos, PlayerSymbol.O);
            int score = minimax(next, 0, false);
            if (score > bestScore) {
                bestScore = score;
                bestMove  = pos;
            }
        }
        return bestMove;
    }

    /**
     * Minimax recursive evaluation.
     *
     * @param board       current board state
     * @param depth       current recursion depth (used to prefer faster wins)
     * @param isMaximizing true when it's the BOT's (O) turn
     * @return heuristic score: +10−depth for BOT win, −10+depth for human win, 0 for draw
     */
    private int minimax(char[] board, int depth, boolean isMaximizing) {
        PlayerSymbol winner = gameEngine.detectWinner(board);

        if (winner == PlayerSymbol.O) return 10 - depth; // BOT wins sooner = better
        if (winner == PlayerSymbol.X) return depth - 10; // human wins sooner = worse for BOT
        if (gameEngine.isDraw(board))  return 0;

        if (isMaximizing) {
            int best = Integer.MIN_VALUE;
            for (int pos : getEmptyPositions(board)) {
                char[] next = gameEngine.applyMove(board, pos, PlayerSymbol.O);
                best = Math.max(best, minimax(next, depth + 1, false));
            }
            return best;
        } else {
            int best = Integer.MAX_VALUE;
            for (int pos : getEmptyPositions(board)) {
                char[] next = gameEngine.applyMove(board, pos, PlayerSymbol.X);
                best = Math.min(best, minimax(next, depth + 1, true));
            }
            return best;
        }
    }

    private List<Integer> getEmptyPositions(char[] board) {
        List<Integer> positions = new ArrayList<>();
        for (int i = 0; i < board.length; i++) {
            if (board[i] == '_') positions.add(i);
        }
        return positions;
    }
}
