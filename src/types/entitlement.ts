export interface Entitlement {
  id: string;
  userId: string;
  gameSlug: string;
  cdKey: string;
  isUsed: boolean;
  activatedAt: string | Date | null;
  createdAt?: string | Date;
}

export interface ClaimKeyInput {
  cdKey: string;
  gameSlug?: string;
}

export interface EntitlementsResponse {
  entitlements: Entitlement[];
}
