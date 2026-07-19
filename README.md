# Dashboard

React frontend for a self-hosted Docker container dashboard — live CPU/memory/network graphs
per container, backed by [management-api](../management-api) for data and
[auth-api](../auth-api) for login.

## How it works

- Access tokens are held in memory only (never `localStorage`); the refresh token lives in an
  `HttpOnly` cookie set by auth-api, so a page reload silently re-authenticates via
  `POST /auth/refresh` before rendering anything.
- The API client (`src/api/client.js`) wraps `fetch` to attach the bearer token automatically
  and transparently retries a request once after a silent token refresh on `401`, redirecting
  to `/login` only if that refresh also fails.
- Live metrics come from management-api's Server-Sent Events stream rather than polling.

## Running it

```
npm install
npm run dev
```

Expects `management-api` and `auth-api` reachable at `/api` (see `nginx.conf` for the reverse
proxy setup used in production; `Dockerfile` builds a static bundle served by nginx).

## Stack

React 19, React Router, Vite, ESLint.
