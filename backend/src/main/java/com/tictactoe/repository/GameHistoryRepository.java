package com.tictactoe.repository;

import com.tictactoe.model.GameHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GameHistoryRepository extends JpaRepository<GameHistory, Long> {

    /** Paginated history for a given user (as either player) */
    @Query("SELECT gh FROM GameHistory gh WHERE gh.playerX.id = :userId OR gh.playerO.id = :userId ORDER BY gh.createdAt DESC")
    Page<GameHistory> findByPlayer(@Param("userId") Long userId, Pageable pageable);
}
