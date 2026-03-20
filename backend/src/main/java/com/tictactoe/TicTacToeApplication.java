package com.tictactoe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Application entry point.
 *
 * @EnableCaching  – activates Spring's Redis cache abstraction
 * @EnableAsync    – enables @Async for non-blocking bot move computation
 */
@SpringBootApplication
@EnableCaching
@EnableAsync
public class TicTacToeApplication {

    public static void main(String[] args) {
        SpringApplication.run(TicTacToeApplication.class, args);
    }
}
