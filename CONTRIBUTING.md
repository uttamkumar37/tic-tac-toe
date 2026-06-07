# Contributing

Thanks for improving this project.

## Run Locally

Backend:

```bash
cd backend
mvn clean test
mvn spring-boot:run
```

Frontend:

```bash
cd frontend
npm ci
npm run build
npm run dev
```

Docker:

```bash
cp .env.example .env
docker compose --env-file .env up --build
```

## Branch Naming

Use clear branch names:

- `feature/<short-name>`
- `fix/<short-name>`
- `docs/<short-name>`
- `security/<short-name>`

## Pull Request Checklist

- Tests or build checks pass.
- No secrets are committed.
- README or docs are updated when behavior changes.
- Security-sensitive changes mention authorization and validation impact.
- UI changes are checked on mobile and desktop.
