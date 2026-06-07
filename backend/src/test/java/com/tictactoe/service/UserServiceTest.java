package com.tictactoe.service;

import com.tictactoe.dto.response.PublicUserResponse;
import com.tictactoe.dto.response.UserResponse;
import com.tictactoe.model.User;
import com.tictactoe.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@DisplayName("UserService")
class UserServiceTest {

    @Test
    @DisplayName("private profile includes email, public profile does not")
    void publicProfileDoesNotExposeEmail() {
        UserRepository repository = mock(UserRepository.class);
        UserService service = new UserService(repository);
        User user = User.builder()
                .id(1L)
                .username("alice")
                .email("alice@example.com")
                .password("hash")
                .totalGames(5)
                .wins(3)
                .losses(1)
                .draws(1)
                .build();

        when(repository.findByUsername("alice")).thenReturn(Optional.of(user));

        UserResponse privateProfile = service.getProfile("alice");
        PublicUserResponse publicProfile = service.getPublicProfile("alice");

        assertThat(privateProfile.getEmail()).isEqualTo("alice@example.com");
        assertThat(publicProfile.getUsername()).isEqualTo("alice");
        assertThat(publicProfile.getWins()).isEqualTo(3);
    }
}
