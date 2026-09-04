import { Persona, PersonaStats } from './persona';

export interface LeaderboardEntry {
  personaId: string;
  name: string;
  userId: string;
  gameSlug: string;
  score: number;
  kills: number;
  deaths: number;
  wins: number;
  losses: number;
  timePlayedSeconds: number;
  rank?: number;
}

export interface LeaderboardResponse {
  gameSlug: string;
  gameName: string;
  sortBy: 'score' | 'kills' | 'wins' | 'playtime' | string;
  limit: number;
  offset: number;
  count: number;
  leaderboard: LeaderboardEntry[];
}

export interface MatchHistory {
  id: string;
  serverId: string | null;
  gameSlug: string;
  mapName: string;
  gameMode: string;
  durationSeconds: number;
  winnerTeam: number | null;
  details?: Record<string, any>;
  createdAt: string | Date;
}

export interface MatchHistoryResponse {
  gameSlug: string;
  count: number;
  matches: MatchHistory[];
}

export interface PlayerProfileData {
  persona: Persona;
  stats: PersonaStats;
}

export interface AuditLog {
  id: string;
  actorId: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  details: Record<string, any>;
  createdAt: string | Date;
}
