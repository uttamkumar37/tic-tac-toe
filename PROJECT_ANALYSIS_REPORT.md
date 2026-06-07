# Project Analysis Report

Generated: 2026-06-07  
Project: `tic-tac-toe`  
Scope: Static code review, build/test verification, configuration review, and dependency audit.

## Executive Summary

This is a full-stack Tic-Tac-Toe application with a Spring Boot backend and a React/TypeScript frontend. The codebase has a clear structure, a working game engine, bot support, JWT authentication, REST APIs, WebSocket intent, Docker packaging, and GitHub Actions CI/CD.

The project is a strong feature-complete demo or portfolio application. It is not yet production-hardened. The main blockers are WebSocket authentication, game-level authorization, production schema drift, frontend dependency vulnerabilities, and limited test coverage outside pure game logic.

## Technology Stack

| Area | Technology |
| --- | --- |
| Backend | Java 17, Spring Boot 3.2.3, Spring Web, Spring Security, Spring WebSocket, Spring Data JPA, Spring Data Redis |
| Auth | JWT with `jjwt`, BCrypt password hashing |
| Database | MySQL for runtime, H2 for tests |
| Cache | Redis via Lettuce |
| Frontend | React 18, TypeScript, Vite 5, Redux Toolkit, React Router, Axios, STOMP/SockJS, Tailwind CSS |
| Infrastructure | Docker, Docker Compose, Nginx, GitHub Actions, GHCR |

## Repository Snapshot

| Metric | Value |
| --- | --- |
| Source/test files reviewed | 73 |
| Approximate source/test lines | 4,218 |
| Backend Java source files compiled by Maven | 45 |
| Backend test classes | 2 |
| Frontend test files found | 0 |

Key directories:

```text
backend/src/main/java/com/tictactoe
frontend/src
docs
.github/workflows
```

## Application Architecture

The project follows a conventional full-stack structure:

```text
React frontend
  -> REST over /api
  -> STOMP/SockJS over /ws
  -> Nginx reverse proxy in production
  -> Spring Boot backend
  -> JPA/MySQL for persistence
  -> Redis for live board cache
```

Backend layering is clear:

```text
controller -> service -> repository -> JPA/MySQL
                 |
                 -> engine
                 -> security
                 -> Redis cache
```

The game board is stored as a 9-character string such as `XO_______`, where `_` means an empty cell.

## Build and Test Verification

Commands run:

```bash
cd backend && mvn test
cd frontend && npm ci
cd frontend && npm run build
cd frontend && npm audit --audit-level=moderate
```

Results:

| Check | Result | Notes |
| --- | --- | --- |
| Backend tests | Passed | 26 tests, 0 failures, 0 errors |
| Backend compile | Passed | Maven emitted one Lombok builder warning for `AuthResponse.tokenType` |
| Frontend dependency install | Passed | Installed 351 packages from lockfile |
| Frontend production build | Passed | Vite built successfully in about 937 ms |
| Frontend dependency audit | Failed audit | 11 vulnerabilities: 8 moderate, 2 high, 1 critical |

Initial frontend build failed because dependencies were not installed and `tsc` was unavailable. After `npm ci`, the build passed.

Not verified:

- Full Docker Compose startup
- Browser end-to-end gameplay
- MySQL-backed integration behavior
- Redis-backed integration behavior
- WebSocket authentication at runtime

## Strengths

1. Clear backend separation of concerns.

   Controllers, services, repositories, models, security, config, and game engines are separated cleanly.

2. Good pure game logic isolation.

   `GameEngine` and `BotEngine` are independent enough to test directly. This is the right shape for game rules and AI logic.

3. Useful backend validation and error handling.

   Request DTOs use Jakarta validation, and `GlobalExceptionHandler` gives consistent error responses.

4. Complete primary user flow.

   The app includes register, login, lobby, multiplayer room creation/joining, bot play, game board, undo, restart, history, and profile views.

5. Deployment scaffolding exists.

   Dockerfiles, Docker Compose files, Nginx config, and GitHub Actions are present.

6. CI runs both backend and frontend checks.

   Maven verification and frontend TypeScript/build checks are wired into `.github/workflows/ci-cd.yml`.

## High Priority Findings

### 1. Production database schema does not match the JPA model

Severity: High  
Files:

- `docs/db-schema.sql`
- `backend/src/main/java/com/tictactoe/model/GameHistory.java`
- `backend/src/main/resources/application-prod.yml`

`application-prod.yml` uses `spring.jpa.hibernate.ddl-auto: validate`, which means production startup expects the database schema to match the JPA entities.

However, `docs/db-schema.sql` defines `game_history` with username columns:

```text
player_x_username
player_o_username
```

The JPA entity expects user foreign key columns:

```text
player_x_id
player_o_id
```

Impact:

- A production database initialized from `docs/db-schema.sql` is likely to fail Hibernate validation.
- History queries and archive writes may fail or behave differently than the documented schema suggests.

Recommendation:

- Decide whether history should store user FKs, denormalized usernames, or both.
- Align `docs/db-schema.sql`, `GameHistory`, `GameHistoryRepository`, and `GameHistoryService`.
- Add a schema validation/integration test that boots with the production DDL.

### 2. WebSocket authentication is incomplete

Severity: High  
Files:

- `backend/src/main/java/com/tictactoe/config/SecurityConfig.java`
- `backend/src/main/java/com/tictactoe/config/WebSocketConfig.java`
- `backend/src/main/java/com/tictactoe/controller/GameWebSocketController.java`
- `frontend/src/services/websocketService.ts`

The frontend sends the JWT in STOMP connect headers:

```ts
connectHeaders: { Authorization: `Bearer ${token}` }
```

The backend permits `/ws/**` at HTTP security level and does not define a STOMP inbound `ChannelInterceptor` to read that header, validate the JWT, and set the WebSocket user principal.

Impact:

- `Principal principal` in `GameWebSocketController` may be null.
- WebSocket moves can fail with null principal errors.
- Message-level authorization is not enforced.

Recommendation:

- Add a `configureClientInboundChannel` interceptor.
- On STOMP `CONNECT`, extract `Authorization`, validate the JWT, load the user, and set the accessor user.
- Reject unauthenticated WebSocket messages.
- Add WebSocket integration tests for connect, move, undo, restart, and invalid token paths.

### 3. Game ownership authorization is too weak

Severity: High  
Files:

- `backend/src/main/java/com/tictactoe/controller/GameController.java`
- `backend/src/main/java/com/tictactoe/controller/GameWebSocketController.java`
- `backend/src/main/java/com/tictactoe/service/GameService.java`

Some operations only require a valid login and room code:

- `GET /api/games/{roomCode}`
- `POST /api/games/{roomCode}/restart`
- BOT-mode undo
- WebSocket restart

`restartGame` does not receive the authenticated user, and `undoMove` does not verify BOT-game ownership.

Impact:

- Any authenticated user who knows or guesses a room code can inspect or mutate a game they do not own.

Recommendation:

- Add participant checks for game read, undo, restart, and WebSocket actions.
- Pass the authenticated username into `restartGame`.
- For BOT games, allow only `playerX`.
- For multiplayer games, allow only `playerX` or `playerO`.

### 4. Frontend dependencies have known vulnerabilities

Severity: High  
Files:

- `frontend/package.json`
- `frontend/package-lock.json`

`npm audit --audit-level=moderate` reports:

```text
11 vulnerabilities
8 moderate
2 high
1 critical
```

Affected packages include:

- `axios`
- `react-router` / `react-router-dom`
- `vite` / `esbuild` / `vitest`
- `postcss`
- `picomatch`
- `follow-redirects`
- `brace-expansion`

Recommendation:

- Run `npm audit fix` and review the lockfile diff.
- For the Vite/esbuild chain, plan a controlled Vite major upgrade if required.
- Re-run `npm run build` and any frontend tests after upgrades.

## Medium Priority Findings

### 5. Actuator exposure is broad for a user-facing app

Severity: Medium  
File: `backend/src/main/resources/application.yml`

The base config exposes:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,env
```

Only `/actuator/health` is public, but the other actuator endpoints are available to any authenticated user unless additional authorization is added.

Recommendation:

- In production, expose only `health` unless there is a clear operational need.
- Restrict actuator endpoints by role or network boundary.

### 6. Local config includes hardcoded default secrets

Severity: Medium  
File: `backend/src/main/resources/application.yml`

The default datasource password and JWT secret are embedded in local config. This is convenient for development but risky if copied or deployed accidentally.

Recommendation:

- Keep examples in `.env.example`.
- Prefer environment-only secrets.
- Add startup validation for minimum JWT secret length.

### 7. Move handling has race-condition risk

Severity: Medium  
File: `backend/src/main/java/com/tictactoe/service/GameService.java`

Move validation and persistence are transactional, but there is no optimistic or pessimistic lock on the game row. `moveNumber` is calculated using `countByGameId`.

Impact:

- Two near-simultaneous requests may both validate the same board and write conflicting moves.

Recommendation:

- Add `@Version` to `Game` for optimistic locking, or use a repository query with a row lock for active game mutation.
- Add concurrency tests for simultaneous moves.

### 8. Frontend WebSocket lifecycle has correctness issues

Severity: Medium  
Files:

- `frontend/src/hooks/useWebSocket.ts`
- `frontend/src/services/websocketService.ts`

Issues:

- `isConnected` is returned as a non-reactive snapshot, so the UI can show stale connection state.
- `connect()` returns early when an existing client is active, which prevents subscription setup when navigating to another room.
- Error subscriptions are not tracked or unsubscribed, so duplicate error handlers can accumulate.

Recommendation:

- Track connection state with React state.
- Separate connect and subscribe operations.
- Always subscribe to the requested room even if the STOMP client is already active.
- Track and clean up the error subscription.

### 9. Public user profile exposes email addresses

Severity: Medium  
Files:

- `backend/src/main/java/com/tictactoe/controller/UserController.java`
- `backend/src/main/java/com/tictactoe/dto/response/UserResponse.java`

`GET /api/users/{username}` returns `UserResponse`, which includes `email`.

Recommendation:

- Split private profile DTO and public profile DTO.
- Return email only from `/api/users/me`.

### 10. Test coverage is narrow

Severity: Medium  
Files:

- `backend/src/test/java/com/tictactoe/engine/GameEngineTest.java`
- `backend/src/test/java/com/tictactoe/engine/BotEngineTest.java`

Current backend tests cover only engine logic. There are no service, repository, controller, security, WebSocket, or integration tests. The frontend has Vitest configured but no test files.

Recommendation:

- Add `GameService` tests for create, join, move, bot move, undo, restart, finish, history, and stats.
- Add controller/security tests for authenticated and unauthorized requests.
- Add WebSocket tests for authenticated STOMP flows.
- Add frontend component tests for board interaction, auth redirects, lobby flow, and API error states.

### 11. CI does not currently validate MySQL or Redis behavior

Severity: Medium  
File: `.github/workflows/ci-cd.yml`

The backend CI job starts a MySQL service, but the test profile uses H2 and excludes Redis auto-configuration.

Impact:

- CI can pass while production MySQL schema validation or Redis configuration is broken.

Recommendation:

- Add integration tests using Testcontainers for MySQL and Redis.
- Alternatively, run a Spring Boot smoke test against the same MySQL service already defined in CI.

### 12. Documentation and runtime config have drift

Severity: Medium  
Files:

- `README.md`
- `docs/db-schema.sql`
- `docker-compose.yml`
- `docker-compose.prod.yml`
- `backend/src/main/resources/application-prod.yml`

Examples:

- README environment variable names do not fully match the Compose/profile variables.
- README references the DDL as production-ready, but the DDL does not match JPA for `game_history`.

Recommendation:

- Align README, `.env.example`, Compose files, Spring config, and DDL.
- Add a short "verified setup" section with exact commands.

## Lower Priority Findings

### 13. Redis cache is write-heavy but not used for reads

Severity: Low  
Files:

- `backend/src/main/java/com/tictactoe/service/RedisGameStateService.java`
- `backend/src/main/java/com/tictactoe/service/GameService.java`

The app writes board state to Redis and deletes it on finish, but `getBoard()` is not used anywhere.

Recommendation:

- Either use Redis in `getGame` or live read paths, or simplify the cache until it has a clear purpose.
- If full game state is needed, cache a richer DTO instead of only the board string.

### 14. JWT is stored in localStorage

Severity: Low to Medium  
File: `frontend/src/store/authSlice.ts`

Using localStorage is common for demos, but it increases token exposure if an XSS issue exists.

Recommendation:

- For production, consider HttpOnly secure cookies, CSRF protection, and a strict CSP.
- If localStorage remains, keep token lifetime short and improve XSS hardening.

### 15. In-memory WebSocket broker limits horizontal scaling

Severity: Low  
File: `backend/src/main/java/com/tictactoe/config/WebSocketConfig.java`

The simple broker is fine for one backend instance. It will not coordinate WebSocket topics across multiple backend replicas.

Recommendation:

- For multi-instance deployment, use a broker relay such as RabbitMQ or ActiveMQ.

### 16. Some dependencies appear unused or optional

Severity: Low  
File: `backend/pom.xml`

`MapStruct` and the PostgreSQL driver are present but no mapper classes or PostgreSQL runtime config were found.

Recommendation:

- Remove unused dependencies or document why they are intentionally included.

### 17. Maven emits a Lombok builder warning

Severity: Low  
File: `backend/src/main/java/com/tictactoe/dto/response/AuthResponse.java`

Maven reports that the `tokenType` initializer is ignored by Lombok builder unless `@Builder.Default` is used. Current service code explicitly sets `tokenType`, so this is not breaking today.

Recommendation:

- Add `@Builder.Default`, remove the initializer, or keep setting it explicitly and remove the default field value.

## Recommended Roadmap

### P0: Correctness and Security

1. Align production DDL with JPA entities.
2. Implement STOMP JWT authentication and message authorization.
3. Add participant/owner checks for game read, undo, restart, and WebSocket actions.
4. Update vulnerable frontend dependencies.

### P1: Reliability

1. Add optimistic locking or row locking for move mutations.
2. Add integration tests for MySQL and Redis.
3. Add controller/security tests.
4. Add WebSocket flow tests.
5. Fix frontend WebSocket lifecycle state and room subscription behavior.

### P2: Maintainability

1. Clean up unused dependencies.
2. Align README, `.env.example`, Compose files, and Spring config.
3. Decide whether Redis is required for reads and implement that path.
4. Split public and private user profile DTOs.
5. Restrict actuator endpoints.

## Final Assessment

The project has a solid foundation and a clear feature set. The core game rules and bot logic are already test-backed and working. The frontend and backend both build successfully after dependencies are installed.

The biggest gap is the difference between "feature complete" and "production ready." To make the app production-ready, focus first on schema correctness, WebSocket authentication, game-level authorization, dependency updates, and integration test coverage.
