# Redis Cache Notes

Redis is used as a short-lived live board cache for active games.

Current behavior:

- `GameService` writes the latest board to Redis after create, move, undo, and restart.
- Finished games are removed from Redis.
- `GET /api/games/{roomCode}` validates database ownership first, then overlays the active board from Redis if present.
- MySQL remains the source of truth for game metadata, moves, users, history, and completed boards.

This keeps reconnect reads fast without making Redis authoritative. If Redis is unavailable or a key expires, the API falls back to the persisted game board.
