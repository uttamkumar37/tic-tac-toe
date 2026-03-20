package com.tictactoe.repository;

import com.tictactoe.model.Move;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MoveRepository extends JpaRepository<Move, Long> {

    List<Move> findByGameIdOrderByMoveNumberAsc(Long gameId);

    /** Fetch the last move for undo support */
    Optional<Move> findTopByGameIdOrderByMoveNumberDesc(Long gameId);

    /** Count moves in a game (determines move number for next move) */
    int countByGameId(Long gameId);
}
