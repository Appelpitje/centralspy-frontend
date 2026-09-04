import apiClient from './api';
import {
  AdminSessionsResponse,
  AuditLogsResponse,
  BanUserPayload,
  BanUserResponse,
  KickPlayerPayload,
  KickPlayerResponse,
  CreateServerKeyPayload,
  CreateServerKeyResponse,
} from '../types';

export const adminService = {
  /**
   * Fetch active FESL/Theater session telemetry and online game server counts.
   */
  async getAdminSessions(): Promise<AdminSessionsResponse> {
    const response = await apiClient.get<AdminSessionsResponse>('/admin/sessions');
    return response.data;
  },

  /**
   * Fetch paginated administrator audit logs.
   */
  async getAuditLogs(limit = 50, offset = 0): Promise<AuditLogsResponse> {
    const response = await apiClient.get<AuditLogsResponse>('/admin/audit-logs', {
      params: { limit, offset },
    });
    return response.data;
  },

  /**
   * Issue an administrative account ban for a user.
   */
  async banUser(payload: BanUserPayload): Promise<BanUserResponse> {
    const response = await apiClient.post<BanUserResponse>('/admin/bans', payload);
    return response.data;
  },

  /**
   * Revoke an active ban for a user.
   */
  async unbanUser(userId: string): Promise<BanUserResponse> {
    const response = await apiClient.delete<BanUserResponse>(`/admin/bans/${userId}`);
    return response.data;
  },

  /**
   * Disconnect/kick an active player by userId or personaId.
   */
  async kickPlayer(payload: KickPlayerPayload): Promise<KickPlayerResponse> {
    const response = await apiClient.post<KickPlayerResponse>('/admin/kick', payload);
    return response.data;
  },

  /**
   * Generate an authorized server key and register dedicated server credentials.
   */
  async createServerKey(payload: CreateServerKeyPayload): Promise<CreateServerKeyResponse> {
    const response = await apiClient.post<CreateServerKeyResponse>('/admin/server-keys', payload);
    return response.data;
  },
};

export default adminService;
