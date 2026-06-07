# Security Policy

## Reporting Vulnerabilities

Please do not open public issues for security vulnerabilities.

Send a private report to:

- Email: `your-security-email@example.com`
- GitHub: `https://github.com/uttamkumar37/tic-tac-toe`

Include:

- Affected endpoint or component
- Reproduction steps
- Expected impact
- Suggested fix, if known

## Security Rules

- Do not commit `.env` files or real secrets.
- Use a JWT secret with at least 32 random bytes.
- Keep `CORS_ALLOWED_ORIGINS` limited to trusted frontend origins.
- Keep actuator exposure limited to `/actuator/health` in production.
- Rotate secrets immediately if they are exposed.
