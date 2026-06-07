# Deployment

## Public Frontend Demo

The public site is deployed as a static Vite build on GitHub Pages:

```text
https://tictactoe.mycloudcampus.in
```

GitHub Pages hosts only static files. It does not run the Spring Boot backend, MySQL, Redis, JWT server, or WebSocket server.

The Pages workflow builds only `frontend/` with:

```text
VITE_APP_MODE=demo
VITE_API_BASE_URL=
VITE_WS_BASE_URL=
VITE_BASE_PATH=/
```

In this mode the app automatically uses localStorage-backed demo services.

## GitHub Pages Setup

1. Push the repository to GitHub.
2. Open repository Settings.
3. Open Pages.
4. Select GitHub Actions as the source.
5. Run the `GitHub Pages` workflow or push to `main`.

The workflow deploys `frontend/dist`.

## Custom Domain

The frontend includes:

```text
frontend/public/CNAME
```

with:

```text
tictactoe.mycloudcampus.in
```

Create this DNS record:

| Type | Host/Name | Value/Target |
| --- | --- | --- |
| CNAME | `tictactoe` | `YOUR_GITHUB_USERNAME.github.io` |

After DNS propagates, configure the custom domain in GitHub Pages settings and enable HTTPS.

## Optional Backend Deployment

The backend remains in this repository for local development and future live deployment.

Deploy the backend separately on Render, Railway, Fly.io, or a Docker VPS.

Required backend services:

- MySQL 8
- Redis 7
- HTTPS-capable backend host

Required backend environment variables:

```text
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=jdbc:mysql://...
DB_USERNAME=...
DB_PASSWORD=...
REDIS_HOST=...
REDIS_PORT=6379
REDIS_PASSWORD=...
JWT_SECRET=replace-with-at-least-32-random-bytes
CORS_ALLOWED_ORIGINS=https://tictactoe.mycloudcampus.in
```

When a backend is deployed, build the frontend in live mode:

```text
VITE_APP_MODE=live
VITE_API_BASE_URL=https://YOUR_BACKEND_HOST/api
VITE_WS_BASE_URL=https://YOUR_BACKEND_HOST/ws
```

## Docker VPS Option

```bash
cp .env.example .env
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

Use real secrets, configure TLS, and do not publish `.env`.
