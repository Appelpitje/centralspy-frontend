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

export const REGIONS: Record<string, { name: string; flag: string; countryCode?: string; estimatedPing: number }> = {
  // Cloud / Airport codes
  fra: { name: 'EU Central (Frankfurt, DE)', flag: '🇩🇪', countryCode: 'DE', estimatedPing: 24 },
  ams: { name: 'EU West (Amsterdam, NL)', flag: '🇳🇱', countryCode: 'NL', estimatedPing: 22 },
  lon: { name: 'EU West (London, UK)', flag: '🇬🇧', countryCode: 'GB', estimatedPing: 32 },
  cdg: { name: 'EU West (Paris, FR)', flag: '🇫🇷', countryCode: 'FR', estimatedPing: 25 },
  bru: { name: 'EU West (Brussels, BE)', flag: '🇧🇪', countryCode: 'BE', estimatedPing: 20 },
  iad: { name: 'US East (Virginia, US)', flag: '🇺🇸', countryCode: 'US', estimatedPing: 28 },
  sjc: { name: 'US West (California, US)', flag: '🇺🇸', countryCode: 'US', estimatedPing: 65 },
  ord: { name: 'US Central (Chicago, US)', flag: '🇺🇸', countryCode: 'US', estimatedPing: 38 },
  yvr: { name: 'North America (Vancouver, CA)', flag: '🇨🇦', countryCode: 'CA', estimatedPing: 48 },
  tyo: { name: 'Asia East (Tokyo, JP)', flag: '🇯🇵', countryCode: 'JP', estimatedPing: 135 },
  sin: { name: 'Asia SE (Singapore, SG)', flag: '🇸🇬', countryCode: 'SG', estimatedPing: 155 },
  syd: { name: 'Oceania (Sydney, AU)', flag: '🇦🇺', countryCode: 'AU', estimatedPing: 190 },
  gru: { name: 'SA East (São Paulo, BR)', flag: '🇧🇷', countryCode: 'BR', estimatedPing: 140 },
  lan: { name: 'Local Node (LAN)', flag: '🏠', countryCode: 'LOCAL', estimatedPing: 5 },

  // ISO country code aliases
  de: { name: 'Germany (Frankfurt / FSN)', flag: '🇩🇪', countryCode: 'DE', estimatedPing: 24 },
  nl: { name: 'Netherlands (Amsterdam)', flag: '🇳🇱', countryCode: 'NL', estimatedPing: 22 },
  gb: { name: 'United Kingdom (London)', flag: '🇬🇧', countryCode: 'GB', estimatedPing: 32 },
  uk: { name: 'United Kingdom (London)', flag: '🇬🇧', countryCode: 'GB', estimatedPing: 32 },
  fr: { name: 'France (Paris)', flag: '🇫🇷', countryCode: 'FR', estimatedPing: 25 },
  be: { name: 'Belgium (Brussels)', flag: '🇧🇪', countryCode: 'BE', estimatedPing: 20 },
  us: { name: 'United States', flag: '🇺🇸', countryCode: 'US', estimatedPing: 35 },
  ca: { name: 'Canada', flag: '🇨🇦', countryCode: 'CA', estimatedPing: 45 },
  pl: { name: 'Poland (Warsaw)', flag: '🇵🇱', countryCode: 'PL', estimatedPing: 35 },
  se: { name: 'Sweden (Stockholm)', flag: '🇸🇪', countryCode: 'SE', estimatedPing: 30 },
  jp: { name: 'Japan (Tokyo)', flag: '🇯🇵', countryCode: 'JP', estimatedPing: 135 },
  sg: { name: 'Singapore', flag: '🇸🇬', countryCode: 'SG', estimatedPing: 155 },
  au: { name: 'Australia (Sydney)', flag: '🇦🇺', countryCode: 'AU', estimatedPing: 190 },
  br: { name: 'Brazil (São Paulo)', flag: '🇧🇷', countryCode: 'BR', estimatedPing: 140 },
};

/**
 * Converts a 2-letter ISO country code into its Unicode flag emoji.
 */
export function countryCodeToFlag(countryCode?: string): string {
  if (!countryCode) return '🌐';
  const clean = countryCode.trim().toUpperCase();
  if (clean === 'LAN' || clean === 'LOCAL') return '🏠';
  if (clean === 'GLOBAL' || clean.length !== 2) return '🌐';
  const codePoints = clean.split('').map((c) => 127397 + c.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🌐';
  }
}

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

export function getRegionInfo(regionOrCountryCode?: string, ipAddress?: string) {
  const code = regionOrCountryCode?.toLowerCase().trim();
  const hasSpecificCode = code && code !== 'global' && code !== 'unknown';

  // If no specific region code is available, attempt resolution by IP address
  if (!hasSpecificCode && ipAddress) {
    const cleanIp = ipAddress.trim().toLowerCase();
    if (
      cleanIp === 'localhost' ||
      cleanIp === '127.0.0.1' ||
      cleanIp === '::1' ||
      cleanIp.startsWith('192.168.') ||
      cleanIp.startsWith('10.') ||
      cleanIp.startsWith('172.16.') ||
      cleanIp.startsWith('172.17.') ||
      cleanIp.startsWith('172.18.')
    ) {
      return { code: 'lan', countryCode: 'LOCAL', name: 'Local Node (LAN)', flag: '🏠', estimatedPing: 5 };
    }

    // Hetzner Germany nodes (including default CentralSpy server 178.105.150.25)
    if (
      cleanIp.startsWith('178.105.') ||
      cleanIp.startsWith('188.40.') ||
      cleanIp.startsWith('144.76.') ||
      cleanIp.startsWith('116.203.') ||
      cleanIp.startsWith('159.69.')
    ) {
      return { code: 'fra', countryCode: 'DE', name: 'EU Central (Frankfurt, DE)', flag: '🇩🇪', estimatedPing: 24 };
    }
  }

  if (!code || code === 'global') {
    return { code: 'global', countryCode: 'GLOBAL', name: 'Global Theater', flag: '🌐', estimatedPing: 45 };
  }

  const found = REGIONS[code];
  if (found) {
    return { code, countryCode: found.countryCode || code.toUpperCase(), ...found };
  }

  // 2-letter ISO country code check
  if (/^[a-z]{2}$/.test(code)) {
    const upper = code.toUpperCase();
    return {
      code,
      countryCode: upper,
      name: `Theater [${upper}]`,
      flag: countryCodeToFlag(upper),
      estimatedPing: 45,
    };
  }

  return {
    code,
    countryCode: code.toUpperCase(),
    name: regionOrCountryCode ? regionOrCountryCode.toUpperCase() : 'Global Theater',
    flag: '🌐',
    estimatedPing: 50,
  };
}

export const MOHPA_MAP_NAMES: Record<string, string> = {
  mp_airfield_inv: 'Henderson Airfield (Invader)',
  mp_airfield: 'Henderson Airfield',
  mp_airfield_obj: 'Henderson Airfield (Objective)',
  mp_airfield_ffa: 'Henderson Airfield (FFA)',
  mp_airfield_tdm: 'Henderson Airfield (TDM)',
  mp_airfield_rbm: 'Henderson Airfield (RBM)',
  mp_guadalcanal: 'Guadalcanal',
  mp_guadalcanal_inv: 'Guadalcanal (Invader)',
  mp_guadalcanal_obj: 'Guadalcanal (Objective)',
  mp_makin: 'Makin Atoll',
  mp_makin_inv: 'Makin Atoll (Invader)',
  mp_tarawa: 'Tarawa',
  mp_tarawa_inv: 'Tarawa (Invader)',
  mp_pearl_harbor: 'Pearl Harbor',
  mp_pearl_harbor_obj: 'Pearl Harbor (Objective)',
  mp_matanikau: 'Matanikau River',
  mp_matanikau_inv: 'Matanikau River (Invader)',
  mp_edsons_ridge: "Edson's Ridge",
  mp_bloody_ridge: 'Bloody Ridge',
  mp_lunga_river: 'Lunga River',
  mp_alligator_creek: 'Alligator Creek',
  mp_alligator_creek_inv: 'Alligator Creek (Invader)',
};

export function formatMapName(mapIdentifier?: string, gameSlug = 'mohpa'): string {
  if (!mapIdentifier || !mapIdentifier.trim()) {
    return gameSlug === 'mohpa' ? 'Henderson Airfield' : 'Active Theater';
  }
  const clean = mapIdentifier.trim();
  const lower = clean.toLowerCase();
  if (MOHPA_MAP_NAMES[lower]) {
    return MOHPA_MAP_NAMES[lower];
  }

  // If already a human-friendly name (e.g. contains spaces or doesn't start with mp_)
  if (!lower.startsWith('mp_')) {
    return clean;
  }

  const stripped = clean.replace(/^mp_/i, '');
  const words = stripped.split('_').map((w) => {
    if (w.toLowerCase() === 'inv') return '(Invader)';
    if (w.toLowerCase() === 'obj') return '(Objective)';
    if (w.toLowerCase() === 'ffa') return '(FFA)';
    if (w.toLowerCase() === 'tdm') return '(TDM)';
    if (w.toLowerCase() === 'rbm') return '(Round-Based)';
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  });
  return words.join(' ');
}

export function formatGameMode(mode?: string, gameSlug = 'mohpa'): string {
  if (!mode || !mode.trim()) {
    return gameSlug === 'mohpa' ? 'Invader / Objective' : 'Multiplayer';
  }
  const clean = mode.trim();
  const lower = clean.toLowerCase();
  if (lower === 'openplaying') return 'Invader / Open';
  if (lower === 'invader') return 'Invader';
  if (lower === 'tdm' || lower === 'team deathmatch') return 'Team Deathmatch';
  if (lower === 'ffa' || lower === 'deathmatch') return 'Free-For-All';
  if (lower === 'obj' || lower === 'objective') return 'Objective';
  if (lower === 'rbm' || lower === 'round-based') return 'Round-Based Match';
  return clean;
}
