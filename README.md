# mohPA Portal

Player portal and operator console for the Medal of Honor: Pacific Assault master-server revival. Players register, create soldiers, browse live Theater servers, and download the client patch. Operators moderate accounts and inspect FESL/Theater traffic.

Live site: [https://portal.mohpa.net](https://portal.mohpa.net)  
API: [https://backend.mohpa.net](https://backend.mohpa.net) · [mohPA-backend](https://github.com/Appelpitje/mohPA-backend)

This project is unofficial and is not affiliated with, endorsed by, or connected to Electronic Arts, Dice, or Medal of Honor.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- React Router
- TanStack Query + Zustand
- Cloudflare Pages (static assets) with a Worker that proxies `/api` and `/ws`

## Prerequisites

- Node.js 22
- npm 10+
- A running [mohPA-backend](https://github.com/Appelpitje/mohPA-backend) on `http://127.0.0.1:3000` for local development

## Quick start

```bash
git clone https://github.com/Appelpitje/mohPA-frontend.git
cd mohPA-frontend
cp .env.example .env.local
npm install
npm run dev
```

Vite serves the app at http://127.0.0.1:5173 and proxies `/api` and `/ws` to the local API.

Leave `VITE_API_URL` and `VITE_WS_URL` empty in local `.env` files so the proxy is used. Pointing them at production from a laptop will send auth traffic to the live API.

## Environment

This repository is **public**. Copy [`.env.example`](./.env.example). Never commit real keys.

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API origin. Empty in local dev (Vite proxy). Production uses the portal origin so the Worker can proxy. |
| `VITE_WS_URL` | WebSocket origin for the admin protocol inspector. |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile **sitekey** (public by design; it ships in the JS bundle). |
| `VITE_MASTERSERVER_HOST` | Optional override for the hostname shown in client-setup guides. |
| `VITE_MASTERSERVER_IP` | Optional override for the IPv4 game clients should use. |

Vite only inlines `VITE_*` variables at **build** time. For Cloudflare Pages, set `VITE_TURNSTILE_SITE_KEY` in the Pages **build** environment, not only as a runtime secret.

Local Turnstile: [`.env.development`](./.env.development) uses Cloudflare's [dummy always-pass sitekey](https://developers.cloudflare.com/turnstile/troubleshooting/testing/). Pair it with the matching dummy **secret** on the backend. Do not put a production sitekey in git — `.env.production` is committed and must stay free of real keys.

The Turnstile **secret** lives only on the API host (`TURNSTILE_SECRET_KEY` in the backend `.env`). It does not belong in this repo.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on port 5173 |
| `npm run build` | `tsc` + production bundle in `dist/` |
| `npm run preview` | Preview the production build |
| `npm test` | Vitest (jsdom) |
| `npm run test:watch` | Vitest watch mode |

## What the portal covers

| Area | Routes |
| --- | --- |
| Auth | `/login`, `/register`, `/forgot-password` |
| Home | `/`, `/dashboard` |
| Soldiers | `/soldiers` (max 4 personas per account) |
| Servers | `/servers` |
| Stats | `/leaderboards`, `/stats/player/:name` |
| Client setup | `/setup` (patcher, dedicated server, hosts, FAQ) |
| Account | `/profile` |
| Admin | `/admin`, `/admin/inspector`, `/admin/moderation`, `/admin/servers` |

Login, register, and forgot-password require a Turnstile token when a sitekey is present. Admin routes require a JWT whose user is flagged as admin on the API.

## Deployment

The production build is a static `dist/` plus `worker/origin-proxy.js`. Cloudflare Pages serves the SPA and the Worker forwards `/api/*` and `/ws/*` to the backend origin.

Typical Pages setup:

1. Build command: `npm run build`
2. Output directory: `dist`
3. Build env: `VITE_API_URL`, `VITE_WS_URL`, `VITE_TURNSTILE_SITE_KEY`
4. Turnstile widget hostnames should match the portal hostname only

Do not commit production sitekeys, API tokens, or Wrangler credentials. `.env`, `.env.local`, `*.local`, and `.wrangler` are gitignored.

## Security

- Never commit `.env.local`, `.env.production.local`, or any file with a real Turnstile key.
- Sitekeys are public; Turnstile **secrets** are not. Keep the secret on the backend.
- Do not paste production values into issues or pull requests.

## Related

- [mohPA-backend](https://github.com/Appelpitje/mohPA-backend) — FESL, Theater, GameSpy, and REST API
- [mohpa.net](https://mohpa.net) — marketing site
