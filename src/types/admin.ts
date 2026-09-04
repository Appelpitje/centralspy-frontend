import { GameServer } from './server';
import { AuditLog } from './stats';

export interface AdminSessionsResponse {
  inspector: {
    connectedClients: number;
    totalBufferedPackets?: number;
    totalPacketsObserved?: number;
  };
  onlineServersCount: number;
  onlineServers: GameServer[];
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  count: number;
}

export interface BanUserPayload {
  userId: string;
  reason?: string;
}

export interface BanUserResponse {
  success: boolean;
  message: string;
  userId: string;
}

export interface KickPlayerPayload {
  userId?: string;
  personaId?: string;
  reason?: string;
}

export interface KickPlayerResponse {
  success: boolean;
  message: string;
}

export interface CreateServerKeyPayload {
  serverName: string;
  gameSlug: string;
  ipAddress: string;
  port: number;
  isRanked?: boolean;
  maxPlayers?: number;
}

export interface CreateServerKeyResponse {
  server: GameServer;
  secretKey: string;
}
