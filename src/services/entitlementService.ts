import apiClient from './api';
import {
  Entitlement,
  ClaimKeyInput,
  EntitlementsResponse,
} from '../types/entitlement';

export const entitlementService = {
  /**
   * Fetch all game licenses and entitlements owned by the authenticated user
   */
  async getEntitlements(): Promise<Entitlement[]> {
    const response = await apiClient.get<EntitlementsResponse>('/entitlements');
    return response.data.entitlements;
  },

  /**
   * Claim an EA game CD key or serial license
   */
  async claimCdKey(data: ClaimKeyInput): Promise<{ success: boolean; entitlement: Entitlement }> {
    const response = await apiClient.post<{ success: boolean; entitlement: Entitlement }>(
      '/entitlements/claim',
      data
    );
    return response.data;
  },

  /**
   * Grant a game license directly to the user (dev / ease-of-use)
   */
  async grantSelfGame(gameSlug: string): Promise<{ success: boolean; entitlement: Entitlement }> {
    const response = await apiClient.post<{ success: boolean; entitlement: Entitlement }>(
      '/entitlements/grant',
      { gameSlug }
    );
    return response.data;
  },
};

export default entitlementService;
