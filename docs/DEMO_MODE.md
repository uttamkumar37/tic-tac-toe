# Demo Mode

The GitHub Pages build runs in frontend-only demo mode.

Demo mode is enabled when:

- `VITE_API_BASE_URL` is missing or empty, or
- `VITE_APP_MODE=demo`

Live mode is enabled only when:

- `VITE_APP_MODE=live`, and
- `VITE_API_BASE_URL` is configured

## What Works Without Backend

- Landing page
- Demo home
- Play vs Bot
- Local 2 Player
- Demo lobby
- Demo history
- Demo profile and statistics
- About page
- Tech stack page

## Local Storage

Demo mode stores browser-only data in localStorage:

```text
ttt_demo_active_games
ttt_demo_history
```

Clearing browser storage resets demo games, history, and stats.

## Demo User

```text
username: demo_player
displayName: Demo Player
```

## Backend Isolation

In demo mode:

- REST API methods return local demo data.
- WebSocket/STOMP methods are no-ops.
- No Spring Boot backend is required.
- No MySQL or Redis connection is required.
- No JWT server is required.

The real backend integration remains available for future live deployments through environment variables.
