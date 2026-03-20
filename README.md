# Tic-Tac-Toe — Full-Stack Production App

A production-ready, real-time Tic-Tac-Toe platform built with **Java 17 + Spring Boot 3** on the backend and **React 18 + TypeScript** on the frontend. Supports multiplayer rooms over WebSocket, an AI bot (Easy / Hard Minimax), JWT authentication, Redis-cached game state, and a full CI/CD pipeline on GitHub Actions.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Quick Start (Docker)](#quick-start-docker)
5. [Local Development](#local-development)
6. [REST API Reference](#rest-api-reference)
7. [WebSocket Events](#websocket-events)
8. [AI Bot](#ai-bot)
9. [Environment Variables](#environment-variables)
10. [CI/CD](#cicd)
11. [Database Schema](#database-schema)

---

## Tech Stack

| Layer      | Technology |
|------------|-----------|
| Backend    | Java 17, Spring Boot 3.2, Spring Security, Spring WebSocket (STOMP/SockJS), Spring Data JPA, Spring Data Redis |
| Auth       | JWT (HMAC-SHA256 via `jjwt` 0.11.5), BCrypt strength 12 |
| Database   | MySQL 8 (prod), H2 (tests) |
| Cache      | Redis 7 (Lettuce client, JSON serialization) |
| Frontend   | React 18, TypeScript, Vite 5, Redux Toolkit, React Router v6, Axios, @stomp/stompjs, Tailwind CSS |
| Infra      | Docker, Docker Compose, GitHub Actions, GHCR |

---

## Architecture

```
Browser
  │
  ├── HTTP (REST)  ──► Nginx ──► /api/*  ──► Spring Boot (port 8080)
  │                                              │
  └── WebSocket    ──► Nginx ──► /ws     ──► Spring WebSocket (STOMP)
                                                 │
                                           ┌─────┴──────┐
                                           │  MySQL     │
                                           │  Redis     │
                                           └────────────┘
```

```
Backend Package Structure:
controller ──► service ──► repository ──► JPA / MySQL
                │
                ├── engine (GameEngine, BotEngine — pure logic)
                ├── security (JWT filter, UserDetailsService)
                └── config  (WebSocket, Redis, Security, CORS)
```

**Board encoding:** a 9-character string `"_________"`, indices 0–8 (row-major).  
`_` = empty, `X` = player X, `O` = player O / bot.

---

## Project Structure

```
tic-tac-toe/
├── backend/
│   ├── src/main/java/com/tictactoe/
│   │   ├── config/           # WebSocket, Redis, Security, CORS
│   │   ├── controller/       # REST + WebSocket controllers
│   │   ├── dto/              # Request / Response DTOs
│   │   ├── engine/           # GameEngine, BotEngine
│   │   ├── exception/        # Custom exceptions + GlobalExceptionHandler
│   │   ├── model/            # JPA entities (User, Game, Move, GameHistory)
│   │   ├── repository/       # Spring Data repositories
│   │   ├── security/         # JwtTokenProvider, JwtAuthFilter, UserDetailsServiceImpl
│   │   └── service/          # AuthService, GameService, UserService, ...
│   ├── src/test/             # JUnit 5 unit tests (GameEngine, BotEngine)
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Cell, Board, PlayerInfo, GameControls, GameResult, Navbar
│   │   ├── hooks/            # useAuth, useWebSocket
│   │   ├── pages/            # Login, Register, Lobby, Game, BotGame, History, Profile
│   │   ├── services/         # api.ts (Axios), websocketService.ts (STOMP)
│   │   ├── store/            # Redux slices (auth, game) + store config
│   │   ├── types/            # TypeScript interfaces mirroring Java DTOs
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docs/
│   └── db-schema.sql
│
├── .github/workflows/ci-cd.yml
├── docker-compose.yml
└── README.md
```

---

## Quick Start (Docker)

### Prerequisites

- Docker ≥ 24 and Docker Compose v2

```bash
# Clone
git clone https://github.com/<your-org>/tic-tac-toe.git
cd tic-tac-toe

# (Optional) Set a strong JWT secret
export JWT_SECRET=your_super_secret_at_least_32_chars_long

# Build and run all services
docker compose up --build
```

Open [http://localhost](http://localhost) in your browser.

---

## GitHub Deployment

This repository is now set up for a GitHub Actions based deployment flow:

1. Push to `main`
2. GitHub Actions builds and pushes Docker images to GHCR
3. The deploy job copies `docker-compose.prod.yml` to your server
4. The deploy job writes a `.env` file on the server from GitHub secrets
5. The server pulls the latest images and restarts the stack

### Files used for deployment

- `docker-compose.prod.yml` — production stack using GHCR images
- `.github/workflows/ci-cd.yml` — build, publish, and deploy workflow
- `.env.example` — template for required runtime variables

### Required GitHub secrets

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_PATH`
- `GHCR_USERNAME`
- `GHCR_TOKEN`
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION_MS`
- `CORS_ALLOWED_ORIGINS`

### Server requirements

- Docker Engine with Docker Compose v2
- SSH access for the deploy user
- Permission for the deploy user to run `docker compose`

### First-time deployment flow

```bash
# 1. Create a new GitHub repository and push this project
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

After that, every push to `main` will rebuild and redeploy the application.

---

## Local Development

### Backend

```bash
cd backend

# Requires: Java 17+, Maven 3.9+, MySQL 8, Redis 7
# Create the database first:
#   mysql -u root -p -e "CREATE DATABASE tictactoe;"

mvn spring-boot:run
# Starts on http://localhost:8080
```

### Frontend

```bash
cd frontend

npm install
npm run dev
# Starts on http://localhost:5173
# Proxies /api and /ws to http://localhost:8080
```

### Run backend tests only

```bash
cd backend && mvn test
```

---

## REST API Reference

All endpoints (except `/api/auth/**`, `/actuator/health`) require:

```
Authorization: Bearer <jwt_token>
```

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT |

**Register body:**
```json
{ "username": "alice", "email": "alice@example.com", "password": "secret123" }
```

**Login body:**
```json
{ "username": "alice", "password": "secret123" }
```

**Auth response:**
```json
{ "token": "eyJ...", "tokenType": "Bearer", "username": "alice", "email": "...", "userId": 1 }
```

---

### Games

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/games` | Create a game |
| GET | `/api/games/open` | List open multiplayer rooms |
| GET | `/api/games/{roomCode}` | Get game state |
| POST | `/api/games/{roomCode}/join` | Join a multiplayer room |
| POST | `/api/games/move` | Make a move (REST fallback) |
| POST | `/api/games/{roomCode}/undo` | Undo last move (BOT mode) |
| POST | `/api/games/{roomCode}/restart` | Restart game |

**Create game body:**
```json
// Multiplayer
{ "mode": "MULTIPLAYER" }

// vs BOT
{ "mode": "BOT", "botDifficulty": "HARD" }
```

---

### Users

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/me` | Current user profile + stats |
| GET | `/api/users/{username}` | Public profile |

---

### History

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/history?page=0&size=10` | Paginated match history |

---

## WebSocket Events

Connect to `ws://localhost:8080/ws` using SockJS + STOMP.

Pass JWT in connect headers:
```js
client.connectHeaders = { Authorization: `Bearer ${token}` };
```

### Subscribe

| Destination | Description |
|------------|-------------|
| `/topic/game/{roomCode}` | Game state updates (broadcast) |
| `/user/queue/errors` | Per-user error messages |

### Send

| Destination | Body | Description |
|------------|------|-------------|
| `/app/game.move` | `{ roomCode, position }` | Make a move |
| `/app/game.undo` | `{ roomCode }` | Undo last move |
| `/app/game.restart` | `{ roomCode }` | Restart game |

Game state broadcast (`GameResponse`):
```json
{
  "id": 1,
  "roomCode": "AB12CD34",
  "playerXUsername": "alice",
  "playerOUsername": "bob",
  "mode": "MULTIPLAYER",
  "status": "IN_PROGRESS",
  "board": "XO_______",
  "currentTurn": "O",
  "winner": null,
  "isDraw": false
}
```

---

## AI Bot

| Difficulty | Algorithm | Description |
|------------|-----------|-------------|
| EASY | Random | Picks a random empty cell |
| HARD | Minimax (depth-limited) | Plays optimally — never loses |

The Minimax implementation in `BotEngine.java` assigns:
- **+10 − depth** for O wins (bot wants to win fast)
- **depth − 10** for X wins (bot wants to delay its loss)
- **0** for draws

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_DATASOURCE_URL` | (required) | MySQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | (required) | DB username |
| `SPRING_DATASOURCE_PASSWORD` | (required) | DB password |
| `SPRING_DATA_REDIS_HOST` | `localhost` | Redis host |
| `SPRING_DATA_REDIS_PORT` | `6379` | Redis port |
| `JWT_SECRET` | (required) | ≥32-char secret for HMAC-SHA256 |
| `JWT_EXPIRATION_MS` | `86400000` | Token lifetime (ms) |
| `APP_CORS_ALLOWED_ORIGINS` | `http://localhost` | Comma-separated CORS origins |

---

## CI/CD

`.github/workflows/ci-cd.yml` runs on every push/PR to `main`:

1. **Backend job** — Maven build + unit tests (MySQL service container)
2. **Frontend job** — `npm ci`, TypeScript check, `npm run build`
3. **Docker** — builds and pushes `backend` + `frontend` images to GHCR on merge to `main`
4. **Deploy job** — SSH into production server, `docker compose pull && docker compose up -d`

Required GitHub secrets for deployment:
- `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_PATH`

---

## Database Schema

See [docs/db-schema.sql](docs/db-schema.sql) for full DDL.

**Tables:** `users`, `games`, `moves`, `game_history`

---

## License

MIT
