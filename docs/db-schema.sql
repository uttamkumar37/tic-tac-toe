-- ============================================================
-- Tic-Tac-Toe Database Schema
-- MySQL 8.x
--
-- This DDL is aligned with the current JPA entities and the
-- production profile's `spring.jpa.hibernate.ddl-auto=validate`.
--
-- Existing installations that used the older denormalized
-- `game_history.player_x_username` / `player_o_username` columns
-- should migrate to `player_x_id` / `player_o_id` foreign keys before
-- enabling production schema validation.
-- ============================================================

-- ---- Users ----
CREATE TABLE users (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    username     VARCHAR(50)  NOT NULL,
    email        VARCHAR(100) NOT NULL,
    password     VARCHAR(255) NOT NULL,      -- BCrypt hash
    role         VARCHAR(20)  NOT NULL DEFAULT 'ROLE_USER',
    enabled      TINYINT(1)   NOT NULL DEFAULT 1,
    total_games  INT          NOT NULL DEFAULT 0,
    wins         INT          NOT NULL DEFAULT 0,
    losses       INT          NOT NULL DEFAULT 0,
    draws        INT          NOT NULL DEFAULT 0,
    created_at   DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_username (username),
    UNIQUE KEY uk_users_email    (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- Games ----
CREATE TABLE games (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    version        BIGINT       NULL,
    room_code      VARCHAR(12)  NOT NULL,
    player_x_id    BIGINT       NOT NULL,
    player_o_id    BIGINT       NULL,        -- NULL while waiting, or BOT
    mode           VARCHAR(20)  NOT NULL,    -- MULTIPLAYER | BOT
    status         VARCHAR(20)  NOT NULL DEFAULT 'WAITING',
    board          VARCHAR(9)   NOT NULL DEFAULT '_________',
    current_turn   VARCHAR(1)   NOT NULL DEFAULT 'X',
    winner         VARCHAR(1)   NULL,        -- 'X', 'O', or NULL (draw/ongoing)
    bot_difficulty VARCHAR(10)  NULL,        -- EASY | HARD
    created_at     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    finished_at    DATETIME(6)  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_games_room_code (room_code),
    KEY idx_games_status          (status),
    KEY idx_games_player_x        (player_x_id),
    KEY idx_games_player_o        (player_o_id),
    CONSTRAINT fk_games_player_x FOREIGN KEY (player_x_id) REFERENCES users (id),
    CONSTRAINT fk_games_player_o FOREIGN KEY (player_o_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- Moves ----
CREATE TABLE moves (
    id             BIGINT      NOT NULL AUTO_INCREMENT,
    game_id        BIGINT      NOT NULL,
    user_id        BIGINT      NULL,         -- NULL for BOT moves
    symbol         VARCHAR(1)  NOT NULL,     -- 'X' | 'O'
    position       INT         NOT NULL,     -- 0-8 (row-major)
    move_number    INT         NOT NULL,
    board_snapshot VARCHAR(9)  NOT NULL,     -- board state AFTER this move
    played_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_moves_game        (game_id),
    KEY idx_moves_game_number (game_id, move_number),
    CONSTRAINT fk_moves_game FOREIGN KEY (game_id) REFERENCES games (id) ON DELETE CASCADE,
    CONSTRAINT fk_moves_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- Game History (denormalised archive) ----
CREATE TABLE game_history (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    game_id         BIGINT       NOT NULL,
    room_code       VARCHAR(255) NOT NULL,
    player_x_id     BIGINT       NOT NULL,
    player_o_id     BIGINT       NULL,        -- NULL for BOT games
    mode            VARCHAR(20)  NOT NULL,
    winner          VARCHAR(1)   NULL,        -- 'X', 'O', or NULL (draw)
    winner_username VARCHAR(255) NULL,        -- "BOT" when bot wins
    total_moves     INT          NOT NULL DEFAULT 0,
    final_board     VARCHAR(9)   NOT NULL,
    created_at      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    finished_at     DATETIME(6)  NULL,
    PRIMARY KEY (id),
    KEY idx_history_player_x (player_x_id),
    KEY idx_history_player_o (player_o_id),
    KEY idx_history_created  (created_at),
    KEY idx_history_finished (finished_at),
    CONSTRAINT fk_history_player_x FOREIGN KEY (player_x_id) REFERENCES users (id),
    CONSTRAINT fk_history_player_o FOREIGN KEY (player_o_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration sketch for older game_history tables:
-- 1. Add nullable player_x_id and player_o_id columns.
-- 2. Backfill by joining users.username to the old username columns.
-- 3. Make player_x_id NOT NULL after verifying every row has a match.
-- 4. Add indexes and foreign keys.
-- 5. Drop player_x_username and player_o_username after application rollout.
