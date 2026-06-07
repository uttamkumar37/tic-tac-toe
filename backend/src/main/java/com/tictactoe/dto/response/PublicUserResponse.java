package com.tictactoe.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicUserResponse {
    private Long id;
    private String username;
    private int totalGames;
    private int wins;
    private int losses;
    private int draws;
}
