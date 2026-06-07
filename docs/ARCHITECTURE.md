# Architecture

## Public GitHub Pages Architecture

```mermaid
flowchart LR
  Visitor[Visitor Browser] --> Pages[GitHub Pages Static Site]
  Pages --> React[React + TypeScript + Vite]
  React --> DemoServices[Demo Services]
  DemoServices --> LocalStorage[(Browser localStorage)]
```

The public site at `https://tictactoe.mycloudcampus.in` is a static frontend. It does not call a backend unless live API environment variables are configured.

## Optional Live Architecture

```mermaid
flowchart LR
  Browser[React Frontend] -->|REST /api| Backend[Spring Boot API]
  Browser -->|STOMP /ws| WebSocket[Spring WebSocket]
  Backend --> Auth[Spring Security + JWT]
  Backend --> Game[Game Service]
  Game --> MySQL[(MySQL)]
  Game --> Redis[(Redis)]
```

## Mode Selection

The frontend reads `frontend/src/config/appConfig.ts`.

```text
VITE_APP_MODE=demo
```

forces browser-only demo mode.

```text
VITE_APP_MODE=live
VITE_API_BASE_URL=https://...
VITE_WS_BASE_URL=https://...
```

uses the real backend integration.

## Why This Split Exists

GitHub Pages cannot host Java, MySQL, Redis, or WebSocket server processes. Hosting only the frontend makes the public portfolio demo reliable and inexpensive while preserving the full-stack backend for local development or separate production deployment.
