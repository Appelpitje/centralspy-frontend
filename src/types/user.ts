import { Entitlement } from './entitlement';
import { Persona } from './persona';

export interface User {
  id: string;
  username: string;
  email: string;
  countryCode: string;
  dob: string; // YYYY-MM-DD
  isAdmin: boolean;
  isBanned?: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface UserDemographics {
  countryCode?: string;
  dob?: string;
  email?: string;
  zipCode?: string;
  language?: string;
}

export interface LoginCredentials {
  identifier?: string;
  username?: string;
  email?: string;
  password?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password?: string;
  countryCode?: string;
  dob?: string;
}

export interface UpdateProfileData {
  email?: string;
  countryCode?: string;
  dob?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface MeResponse {
  user: User;
  entitlements: Entitlement[];
  personas: Persona[];
}
