# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: Medal of Honor: Pacific Assault players who want to get back into multiplayer. They arrive to authenticate, create or pick a soldier, find a live server, and complete client setup so the v1.2 game actually connects.

Secondary: operators who run the private FESL/Theater revival. They use protocol inspection, moderation, and dedicated-server keys. Same product, not the primary job.

## Product Purpose

mohPA is the web portal for a private Medal of Honor: Pacific Assault master-server revival. It stands in for the retired EA FESL account and Theater browser so a 2004 PC client can still find games.

Success for a player: signed in, at least one soldier, a live server they can join, and the client patch/setup completed. Success for an operator: they can see traffic, moderate accounts, and register servers without leaving the portal.

## Positioning

This is not a generic game launcher or a modern EA account site. It is a revival-specific FESL + Theater web console for one locked title (MOHPA), including soldier personas, live server browser, client patching, and a protocol inspector for the private network.

## Operating Context

Players typically: register or log in → create a soldier (max 4 per account) → download/apply the client patcher (or optional hosts/TLS steps) → browse live Theater servers → join. Stats and leaderboards are supporting, not the entry job.

Game traffic (FESL port 18020, Theater port 18275) goes to the VPS, not the Cloudflare-hosted portal. The portal currently knows `mohpa.net` / `178.105.150.25` as the production master. Localhost is the dev override.

Operators use the same shell for live packet inspection, bans/kicks, and server-key registration.

## Capabilities and Constraints

Confirmed in the existing app and kept:

- Auth: register, login, remember-me, password recovery, account profile
- Entitlements / CD-key redemption
- Soldier/persona CRUD, availability check, max 4 per account
- Live server browser with filters, scoreboard detail, direct-connect copy
- Leaderboards and player profile lookup
- Client setup: automated patcher, dedicated-server guide, FAQ, optional hosts generator
- Admin: dashboard metrics, FESL/Theater protocol inspector (WebSocket), moderation, server keys

Constraints:

- Title lock is MOHPA only (`mohpa`). Multi-game switching is retired.
- Existing React 18 + Vite + TypeScript + Tailwind + React Router + TanStack Query + Zustand stack is the implementation, not a greenfield choice.
- Routes, API contracts, and real-time inspector behavior stay. This work is a visual and naming replacement, not a new product.
- Former product name CentralSpy is retired. Package names, storage keys, and user-facing copy use mohPA.

Undecided: legal/licensing posture of the revival, public player counts, testimonials, and any official EA relationship. Do not invent them.

## Brand Commitments

- Product name is **mohPA** (user-confirmed). Not CentralSpy.
- Game identity is Medal of Honor: Pacific Assault (MOHPA).
- Binding visual constraint, recorded not expanded: WWII tactical military field dossier and dispatch console inspired by Medal of Honor: Pacific Assault. Olive drab, aged khaki, stamped stencil typography, typewriter monospace, sharp rectangular containers, dossier tab layouts. Completely strip futuristic neon, glassmorphism, and dark-mode tech aesthetic.
- Standing preference (user, direction re-roll 1): a conventional modern website. WWII identity lives in color, type, and button/control chrome only. Do not costume the layout as a radio, map table, physical folder, or other artifact. No irony, no smuggled period theater around the page structure.
- Voice may shift into field-dossier / dispatch terminology. Do not invent new product claims, official endorsements, or fake combat records.

## Evidence on Hand

- Implemented portal: dashboard, auth, soldiers, servers, stats, setup, admin.
- Client patch artifact: `public/downloads/mohPA-Client-Patch.zip`.
- Master-server facts in `src/utils/masterServer.ts` and game config in `src/types/game.ts`.
- No real testimonials, press, official EA assets, or licensed Medal of Honor art are in the repo. Future work must not fabricate them or scrape copyrighted game art as if it were owned.

## Product Principles

- Get the player in-game first: auth, soldier, live server, client setup outrank telemetry theater.
- One title, one revival: every surface is MOHPA, not a multi-game network.
- Tell only facts the product can keep: ports, patch steps, live server data, account state.
- Admin is a second register of the same product, never a different brand.
- Do not pretend this is EA, official, or a new game.
