import { SupportedGameSlug } from './game';

export interface ScoreboardPlayer {
  name: string;
  score: number;
  kills: number;
  deaths?: number;
  ping: number;
  team?: number;
  rank?: number | string;
  role?: string;
  pingMs?: number;
}

export interface GameServer {
  id: string;
  name: string;
  gameSlug: SupportedGameSlug | string;
  ipAddress: string;
  port: number;
  queryPort?: number;
  isRanked: boolean;
  isOnline: boolean;
  isOfficial?: boolean;
  lastHeartbeat: string | Date;
  maxPlayers?: number;
  currentPlayers?: number;
  mapName?: string;
  gameMode?: string;
  subState?: string;
  region?: string;
  ping?: number;
  tickRate?: number;
  details?: {
    players?: ScoreboardPlayer[];
    rules?: Record<string, any>;
    tickRate?: number;
    subState?: string;
    region?: string;
    isOfficial?: boolean;
    [key: string]: any;
  };
}

export interface ServerFilter {
  gameSlug?: string;
  isOnline?: boolean;
  isRanked?: boolean;
  mapName?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ServerListResponse {
  servers: GameServer[];
  count: number;
  limit: number;
  offset: number;
}

export interface ServerDetails {
  server: GameServer;
  scoreboard: ScoreboardPlayer[];
  rules: Record<string, any>;
}

export interface RegisterServerData {
  name: string;
  gameSlug: string;
  ipAddress: string;
  port: number;
  queryPort?: number;
  isRanked?: boolean;
  maxPlayers?: number;
}

export interface RegisterServerResponse {
  server: GameServer;
  secretKey: string;
}

