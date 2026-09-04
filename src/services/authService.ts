import apiClient from './api';
import { AuthResponse, LoginCredentials, MeResponse, RegisterData, UpdateProfileData, User } from '../types/user';

export const authService = {
  /**
   * Log in user with identifier/email/username and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register a new player account
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Get current authenticated user profile along with entitlements and personas
   */
  async getMe(): Promise<MeResponse> {
    const response = await apiClient.get<MeResponse>('/auth/me');
    return response.data;
  },

  /**
   * Update profile details (email, DOB, countryCode, password)
   */
  async updateMe(data: UpdateProfileData): Promise<{ user: User }> {
    const response = await apiClient.put<{ user: User }>('/auth/me', data);
    return response.data;
  },
};
