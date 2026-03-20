package com.tictactoe.repository;

import com.tictactoe.model.Game;
import com.tictactoe.model.enums.GameStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {

    Optional<Game> findByRoomCode(String roomCode);

    /** Active games waiting for a second player */
    List<Game> findByStatus(GameStatus status);

    /** All games for a specific player (either side) */
    @Query("SELECT g FROM Game g WHERE g.playerX.id = :userId OR g.playerO.id = :userId ORDER BY g.createdAt DESC")
    List<Game> findAllByPlayer(@Param("userId") Long userId);
}
