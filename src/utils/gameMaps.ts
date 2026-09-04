import { SupportedGameSlug } from '../types/game';

export interface GameFaction {
  teamId: number;
  name: string;
  shortName: string;
  color: 'cyan' | 'amber' | 'crimson' | 'emerald';
}

export interface GameThemeMetadata {
  slug: SupportedGameSlug;
  shortTitle: string;
  factions: {
    team1: GameFaction;
    team2: GameFaction;
  };
  maps: string[];
}

export const GAME_METADATA: Record<string, GameThemeMetadata> = {
  mohpa: {
    slug: 'mohpa',
    shortTitle: 'MOHPA',
    factions: {
      team1: { teamId: 1, name: 'United States Marine Corps (USMC)', shortName: 'USMC', color: 'cyan' },
      team2: { teamId: 2, name: 'Imperial Japanese Army (IJA)', shortName: 'IJA', color: 'crimson' },
    },
    maps: [
      'Henderson Airfield',
      'Guadalcanal',
      'Makin Atoll',
      'Tarawa',
      'Pearl Harbor',
      'Matanikau River',
      "Edson's Ridge",
      'Bloody Ridge',
      'Lunga River',
      'Alligator Creek',
    ],
  },
};

export const REGIONS: Record<string, { name: string; flag: string; estimatedPing: number }> = {
  iad: { name: 'US East (Virginia)', flag: '🇺🇸', estimatedPing: 28 },
  sjc: { name: 'US West (California)', flag: '🇺🇸', estimatedPing: 65 },
  ord: { name: 'US Central (Chicago)', flag: '🇺🇸', estimatedPing: 38 },
  fra: { name: 'EU Central (Frankfurt)', flag: '🇩🇪', estimatedPing: 24 },
  lon: { name: 'EU West (London)', flag: '🇬🇧', estimatedPing: 32 },
  ams: { name: 'EU West (Amsterdam)', flag: '🇳🇱', estimatedPing: 22 },
  tyo: { name: 'Asia East (Tokyo)', flag: '🇯🇵', estimatedPing: 135 },
  sin: { name: 'Asia SE (Singapore)', flag: '🇸🇬', estimatedPing: 155 },
  syd: { name: 'Oceania (Sydney)', flag: '🇦🇺', estimatedPing: 190 },
  gru: { name: 'SA East (São Paulo)', flag: '🇧🇷', estimatedPing: 140 },
};

export function getGameMetadata(slug: string): GameThemeMetadata | undefined {
  return GAME_METADATA[slug];
}

export function getFaction(gameSlug: string, teamNumber: number = 1): GameFaction {
  const meta = GAME_METADATA[gameSlug];
  if (!meta) {
    return {
      teamId: teamNumber,
      name: teamNumber === 1 ? 'Team 1 (Alpha)' : 'Team 2 (Bravo)',
      shortName: teamNumber === 1 ? 'Alpha' : 'Bravo',
      color: teamNumber === 1 ? 'cyan' : 'crimson',
    };
  }
  return teamNumber === 2 ? meta.factions.team2 : meta.factions.team1;
}

export function getRegionInfo(regionCode?: string) {
  if (!regionCode) {
    return { code: 'global', name: 'Global Theater', flag: '🌐', estimatedPing: 45 };
  }
  const cleanCode = regionCode.toLowerCase().trim();
  const found = REGIONS[cleanCode];
  if (found) {
    return { code: cleanCode, ...found };
  }
  return {
    code: cleanCode,
    name: regionCode.toUpperCase(),
    flag: '🌐',
    estimatedPing: 50,
  };
}
