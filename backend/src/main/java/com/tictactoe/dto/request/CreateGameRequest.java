package com.tictactoe.dto.request;

import com.tictactoe.model.enums.BotDifficulty;
import com.tictactoe.model.enums.GameMode;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateGameRequest {

    @NotNull
    private GameMode mode;

    /** Required when mode == BOT; ignored otherwise */
    private BotDifficulty botDifficulty;
}
