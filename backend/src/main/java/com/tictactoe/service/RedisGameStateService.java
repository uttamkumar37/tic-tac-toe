package com.tictactoe.service;

import com.tictactoe.model.Game;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

/**
 * Caches live game state in Redis for low-latency reads during active gameplay.
 *
 * Key format: "game:<roomCode>"
 * TTL: 2 hours (refreshed on every write)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RedisGameStateService {

    private static final String KEY_PREFIX = "game:";
    private static final Duration TTL = Duration.ofHours(2);

    private final RedisTemplate<String, Object> redisTemplate;

    public void save(Game game) {
        String key = key(game.getRoomCode());
        redisTemplate.opsForValue().set(key, game.getBoard(), TTL);
        log.debug("Cached board for room {} : {}", game.getRoomCode(), game.getBoard());
    }

    public Optional<String> getBoard(String roomCode) {
        Object value = redisTemplate.opsForValue().get(key(roomCode));
        return Optional.ofNullable(value).map(Object::toString);
    }

    public void delete(String roomCode) {
        redisTemplate.delete(key(roomCode));
    }

    private String key(String roomCode) {
        return KEY_PREFIX + roomCode;
    }
}
