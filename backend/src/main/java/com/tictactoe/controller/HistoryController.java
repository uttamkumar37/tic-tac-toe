package com.tictactoe.controller;

import com.tictactoe.dto.response.GameHistoryResponse;
import com.tictactoe.service.GameHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

    private final GameHistoryService historyService;

    /**
     * GET /api/history?page=0&size=10
     * Returns paginated match history for the authenticated user.
     */
    @GetMapping
    public ResponseEntity<Page<GameHistoryResponse>> getHistory(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(historyService.getHistory(user.getUsername(), page, size));
    }
}
