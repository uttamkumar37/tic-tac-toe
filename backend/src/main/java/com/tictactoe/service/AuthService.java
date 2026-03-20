package com.tictactoe.service;

import com.tictactoe.dto.request.LoginRequest;
import com.tictactoe.dto.request.RegisterRequest;
import com.tictactoe.dto.response.AuthResponse;
import com.tictactoe.exception.ConflictException;
import com.tictactoe.model.User;
import com.tictactoe.repository.UserRepository;
import com.tictactoe.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new ConflictException("Username '" + req.getUsername() + "' is already taken");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("Email '" + req.getEmail() + "' is already registered");
        }

        User user = User.builder()
                .username(req.getUsername())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .build();

        userRepository.save(user);
        log.info("Registered new user: {}", user.getUsername());

        String token = tokenProvider.generateToken(user.getUsername());
        return buildAuthResponse(user, token);
    }

    public AuthResponse login(LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));

        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        String token = tokenProvider.generateToken(username);
        log.info("User logged in: {}", username);
        return buildAuthResponse(user, token);
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .username(user.getUsername())
                .email(user.getEmail())
                .userId(user.getId())
                .build();
    }
}
