export type SupportedGameSlug = 'mohpa';

export interface PingSiteConfig {
  name: string;
  addr: string;
  port: number;
  type: number;
}

export interface GameConfig {
  slug: SupportedGameSlug;
  name: string;
  shortName?: string;
  tagline: string;
  domainPartition: string;
  subPartition?: string;
  defaultTheaterPort: number;
  defaultFeslPort: number;
  skus: string[];
  maxPersonasPerUser: number;
  secretSalt?: string;
  icon?: string;
  bannerImage?: string;
  pingSites?: PingSiteConfig[];
  supportedFeatures?: {
    hasGameSpyPreAuth?: boolean;
    hasTelemetry?: boolean;
    hasNuLogin?: boolean;
    hasSubAccounts?: boolean;
    usesDoubleQuotes?: boolean;
  };
}

export const GAMES: GameConfig[] = [
  {
    slug: 'mohpa',
    name: 'Medal of Honor: Pacific Assault',
    shortName: 'MOHPA',
    tagline: 'WWII Pacific Theater Combat & Squad Warfare',
    domainPartition: 'mohpa',
    subPartition: 'mohpa-server',
    defaultTheaterPort: 18275,
    defaultFeslPort: 18020,
    skus: ['MOHPA-PC', 'MOHPA-SERVER', 'MOHPA-DEMO-PC'],
    maxPersonasPerUser: 4,
    supportedFeatures: {
      hasGameSpyPreAuth: true,
      hasTelemetry: true,
      hasNuLogin: false,
      hasSubAccounts: true,
      usesDoubleQuotes: true,
    },
  },
];

export const SUPPORTED_GAMES = GAMES;

