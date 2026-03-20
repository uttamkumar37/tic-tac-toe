package com.tictactoe.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private int totalGames;
    private int wins;
    private int losses;
    private int draws;
}
