package com.tictactoe.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MakeMoveRequest {

    @NotNull
    private String roomCode;

    /** Board position 0-8 */
    @Min(0) @Max(8)
    private int position;
}
