package com.tictactoe.service;

import com.tictactoe.dto.response.UserResponse;
import com.tictactoe.exception.ResourceNotFoundException;
import com.tictactoe.model.User;
import com.tictactoe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserResponse getProfile(String username) {
        User user = findByUsername(username);
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    /** Update win/loss/draw stats after a finished game */
    @Transactional
    public void updateStats(Long userId, boolean won, boolean draw) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setTotalGames(user.getTotalGames() + 1);
        if (draw)      user.setDraws(user.getDraws() + 1);
        else if (won)  user.setWins(user.getWins() + 1);
        else           user.setLosses(user.getLosses() + 1);
        userRepository.save(user);
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .totalGames(user.getTotalGames())
                .wins(user.getWins())
                .losses(user.getLosses())
                .draws(user.getDraws())
                .build();
    }
}
