package com.tictactoe.controller;

import com.tictactoe.dto.response.UserResponse;
import com.tictactoe.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /** GET /api/users/me  – current user profile */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(userService.getProfile(user.getUsername()));
    }

    /** GET /api/users/{username}  – public profile */
    @GetMapping("/{username}")
    public ResponseEntity<UserResponse> getUserProfile(@PathVariable String username) {
        return ResponseEntity.ok(userService.getProfile(username));
    }
}
