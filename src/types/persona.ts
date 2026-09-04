import { SupportedGameSlug } from './game';

export interface PersonaStats {
  personaId: string;
  score: number;
  kills: number;
  deaths: number;
  wins: number;
  losses: number;
  timePlayedSeconds: number;
  customStats?: Record<string, any>;
}

export interface Persona {
  id: string;
  userId: string;
  gameSlug: SupportedGameSlug | string;
  name: string;
  isActive: boolean;
  createdAt: string | Date;
  stats?: PersonaStats;
}

export interface CreatePersonaInput {
  gameSlug: SupportedGameSlug | string;
  name: string;
}

export interface PersonaListResponse {
  personas: Persona[];
}

export interface PersonaDetailResponse {
  persona: Persona;
  stats: PersonaStats;
}
