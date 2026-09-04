import apiClient from './api';
import {
  Persona,
  PersonaStats,
  CreatePersonaInput,
  PersonaListResponse,
  PersonaDetailResponse,
} from '../types/persona';

export const personaService = {
  /**
   * Fetch all personas owned by the authenticated user, optionally filtered by gameSlug
   */
  async getPersonas(gameSlug?: string): Promise<Persona[]> {
    const params = gameSlug ? { game_slug: gameSlug } : {};
    const response = await apiClient.get<PersonaListResponse>('/personas', { params });
    return response.data.personas;
  },

  /**
   * Enlist a new soldier / persona under the master account
   */
  async createPersona(data: CreatePersonaInput): Promise<Persona> {
    const response = await apiClient.post<{ persona: Persona }>('/personas', data);
    return response.data.persona;
  },

  /**
   * Delete / discharge a persona by ID
   */
  async deletePersona(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/personas/${id}`);
    return response.data;
  },

  /**
   * Get in-depth combat telemetry & stats for a specific persona
   */
  async getPersonaStats(id: string): Promise<PersonaStats> {
    const response = await apiClient.get<PersonaDetailResponse>(`/personas/${id}/stats`);
    return response.data.stats;
  },
};

export default personaService;
