import apiClient from './api';
import { LeaderboardResponse, MatchHistoryResponse, PlayerProfileData } from '../types/stats';

export type LeaderboardSortOption = 'score' | 'kills' | 'wins' | 'playtime';

export const statsService = {
  /**
   * Fetch game leaderboard ranked entries
   * GET /api/v1/stats/leaderboard/:game_slug
   */
  getLeaderboard: async (
    gameSlug: string,
    sort: LeaderboardSortOption = 'score',
    limit: number = 50,
    offset: number = 0
  ): Promise<LeaderboardResponse> => {
    const res = await apiClient.get<LeaderboardResponse>(`/stats/leaderboard/${gameSlug}`, {
      params: {
        sort,
        limit,
        offset,
      },
    });
    return res.data;
  },

  /**
   * Fetch player dossier & stats profile
   * GET /api/v1/stats/players/:name
   */
  getPlayerProfile: async (
    name: string,
    gameSlug?: string
  ): Promise<PlayerProfileData> => {
    const res = await apiClient.get<PlayerProfileData>(
      `/stats/players/${encodeURIComponent(name)}`,
      {
        params: gameSlug ? { game_slug: gameSlug, gameSlug } : undefined,
      }
    );
    return res.data;
  },

  /**
   * Fetch recent match telemetry records
   * GET /api/v1/stats/matches/:game_slug
   */
  getMatchHistory: async (
    gameSlug: string,
    limit: number = 20
  ): Promise<MatchHistoryResponse> => {
    const res = await apiClient.get<MatchHistoryResponse>(`/stats/matches/${gameSlug}`, {
      params: { limit },
    });
    return res.data;
  },
};

export const { getLeaderboard, getPlayerProfile, getMatchHistory } = statsService;
export default statsService;
