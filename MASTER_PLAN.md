# CentralSpy: Frontend Master Plan

## 1. Executive Summary
This document defines the modular Master Plan for the **CentralSpy Frontend Portal** (`frontend`).

The frontend is a modern, responsive web application serving as both the **Player Management & Stats Portal** and the **Operations / Protocol Inspector Admin Console**.

---

## 2. Technical Stack & UI Architecture
- **Framework**: React 18+ (or React 19) + Vite + TypeScript.
- **Styling**: Tailwind CSS (Dark HUD / Tactical Cyber aesthetic with high contrast & telemetry styling).
- **Icons**: Lucide React.
- **State & Data Fetching**: TanStack React Query (server state & caching) + Zustand (client state).
- **Routing**: React Router v6+.
- **Real-Time Updates**: WebSocket client for live server status and real-time protocol packet debugger.
- **Component Primitives**: Radix UI / Headless UI for accessible modals, dropdowns, tabs, and tooltips.

---

## 3. Frontend Modules

### Module 1: Architecture, Layout & Theme Foundation
- **Design System & HUD Layout**:
  - Top navigation bar with user profile dropdown, notifications, and live status indicator.
  - Sidebar with quick links (Dashboard, Soldiers, Server Browser, Leaderboards, Client Setup, Admin).
  - Responsive layout (desktop, tablet, mobile).
- **Theme & UI Components**:
  - Dark mode gaming palette (slate/carbon backgrounds, emerald/cyan accents, amber warnings).
  - Reusable components: Buttons, Modals, DataTables, Badges, Tooltips, Metric Cards, Toast Notifications.

### Module 2: Authentication & Master Account Center
- **User Authentication**:
  - Registration view with real-time validation (username rules, password complexity, DOB age checks, country selector).
  - Login view with "Remember Me" and auto-redirect to previous route.
  - Password recovery / reset flow.
- **Account Settings**:
  - Master profile overview (Nucleus ID, linked email, country, registration date).
  - Security settings: Update password, update email, view active web and in-game sessions.
- **Game CD Key / Entitlement Center**:
  - Serial key redemption modal.
  - Owned game licenses library with status badges (e.g. *Battlefield 2142: Northern Strike*, *Battlefield Heroes: Beta Access*).

### Module 3: Soldier & Persona Manager
- **Game Selector**:
  - Switch between supported titles (*Battlefield 2142*, *Battlefield Heroes*, *Battlefield Play4Free*, *Bad Company 2*).
- **Soldier Cards & List**:
  - Display all active personas under the master account for the selected game.
  - Rank badge, in-game nickname, total score, K/D ratio, hours played.
- **Persona Creation & Deletion Modal**:
  - Form to create new soldier name (with instant availability checker).
  - Rule enforcement (maximum 4 soldiers per game).
  - Soldier deletion confirmation modal.

### Module 4: Live Server Browser
- **Interactive Server Table**:
  - Columns: Server Name, Map Name, Game Mode, Player Count (e.g., `28/32`), Ping / Region, Status (Ranked / Dedicated / Official).
  - Search bar with instant filtering by name.
  - Filters: Game Title, Map, Game Mode, Region, Non-Empty only, Password Protected.
- **Server Details Modal / Drawer**:
  - Real-time player scoreboard (Player Name, Score, Kills, Ping).
  - Map image preview and next map in rotation.
  - Server rules, tick rate, mod status.
  - "Direct Join / Connect" instructions or launcher link.

### Module 5: Leaderboards & Player Stats
- **Leaderboards**:
  - Global rankings by Score, Kills, Win/Loss Ratio, Time Played.
  - Filter by game title and timeframe (All-time, Monthly, Weekly).
- **Player Dossier / Profile**:
  - In-depth player lookup page (`/stats/player/:personaName`).
  - Stat cards, recent match history, favorite weapons/classes, win rate visual charts.

### Module 6: Admin Dashboard & FESL Protocol Inspector
- **Admin Overview**:
  - Live metric widgets: Total registered users, active FESL TCP connections, active Theater lobbies, active game servers.
- **Real-Time FESL Protocol Inspector**:
  - WebSocket live stream of decoded FESL and Theater packets flowing through `fesl-engine`.
  - Filter by client IP, command type (`fsys`, `acct`, `theater`, `subs`), direction (IN/OUT).
  - Expandable JSON / Key-Value packet viewer with syntax highlighting for rapid debugging.
- **Moderation Console**:
  - User & Persona search with ban/unban tools (Account ban, IP ban, HWID ban).
  - Session manager: View active sessions with one-click "Force Disconnect / Kick" action.
- **Server Management**:
  - Register new dedicated game server keys, toggle ranked status, view server heartbeats.

### Module 7: Game Setup & Client Download Center
- **Setup Guides**:
  - Step-by-step instructions for patching game executables (DNS / hosts file redirect to CentralSpy server IP).
  - Guide for applying TLS certificate bypass / aluigi patch for older EA games.
  - Troubleshooting FAQ for connection errors (`errorCode=122`, `LOCERROR_gamenotregistered`).

---

## 4. Route Map & Component Structure

```
src/
├── app/
│   ├── router.tsx                # React Router definitions
│   └── App.tsx                   # Main app shell & providers
├── components/
│   ├── common/                   # Button, Input, Modal, Table, Badge
│   ├── layout/                   # Header, Sidebar, Footer, UserMenu
│   └── hud/                      # MetricCard, StatusIndicator, TerminalViewer
├── pages/
│   ├── auth/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── ForgotPassword.tsx
│   ├── dashboard/
│   │   └── Dashboard.tsx         # Player home overview
│   ├── soldiers/
│   │   └── SoldierManager.tsx    # Persona manager per game
│   ├── servers/
│   │   ├── ServerBrowser.tsx     # Live server list
│   │   └── ServerDetailModal.tsx # Scoreboard & server details
│   ├── stats/
│   │   ├── Leaderboards.tsx
│   │   └── PlayerProfile.tsx
│   ├── setup/
│   │   └── DownloadGuides.tsx    # Client patch & connection instructions
│   └── admin/
│       ├── AdminDashboard.tsx
│       ├── ProtocolInspector.tsx # Real-time FESL packet debugger
│       ├── Moderation.tsx        # User & Ban management
│       └── ServerManager.tsx     # Server key generator & status
├── services/
│   ├── api.ts                    # Axios / Fetch client with JWT interceptor
│   ├── auth.ts                   # Auth service
│   ├── personas.ts               # Persona CRUD service
│   ├── servers.ts                # Server browser query service
│   └── websocket.ts              # Real-time WebSocket hook for Protocol Inspector
└── types/
    ├── user.ts
    ├── persona.ts
    ├── server.ts
    └── packet.ts                 # FESL / Theater packet structures
```

---

## 5. Development & Verification Plan

### Step-by-Step Milestones
1. **Milestone 1**: Initialize Vite + React + TypeScript + Tailwind CSS project with base routing and HUD layout.
2. **Milestone 2**: Build Player Authentication and Account Center views connected to `api-service`.
3. **Milestone 3**: Build Soldier/Persona Management view with live creation/deletion.
4. **Milestone 4**: Build Live Server Browser with search, multi-filter, and detail modal.
5. **Milestone 5**: Build Admin Console and real-time Protocol Inspector with WebSocket streaming.

### Verification Commands & Tests
- `npm run build`: Type-check and production build validation.
- `npm run lint`: Code quality & formatting checks.
- Component & UI tests with Vitest + React Testing Library.
