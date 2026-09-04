import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAuthStore } from '../store/authStore';
import { personaService } from '../services/personaService';
import { entitlementService } from '../services/entitlementService';
import apiClient from '../services/api';
import { ToastProvider } from '../components/hud/Toast';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { ForgotPassword } from '../pages/auth/ForgotPassword';

// Mock axios / apiClient
vi.mock('../services/api', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    },
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    },
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('Module 2: Auth Store (useAuthStore)', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('initializes with unauthenticated default state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isAdmin).toBe(false);
  });

  it('updates state upon successful setAuth for regular player', () => {
    const mockUser = {
      id: 'user-001',
      username: 'Striker2142',
      email: 'striker@centralspy.net',
      countryCode: 'US',
      dob: '1995-05-15',
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };
    const mockToken = 'jwt-token-xyz';

    useAuthStore.getState().setAuth(mockUser, mockToken);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isAdmin).toBe(false);
    expect(state.token).toBe(mockToken);
    expect(state.user?.username).toBe('Striker2142');
  });

  it('sets isAdmin=true when user has admin privileges', () => {
    const mockAdmin = {
      id: 'admin-001',
      username: 'SysAdmin',
      email: 'admin@centralspy.net',
      countryCode: 'BE',
      dob: '1990-01-01',
      isAdmin: true,
      createdAt: new Date().toISOString(),
    };

    useAuthStore.getState().setAuth(mockAdmin, 'admin-token-123');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isAdmin).toBe(true);
  });

  it('updates partial user profile data with updateUser', () => {
    const mockUser = {
      id: 'user-002',
      username: 'TitanCommander',
      email: 'old@centralspy.net',
      countryCode: 'US',
      dob: '1998-02-10',
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };

    useAuthStore.getState().setAuth(mockUser, 'token-456');
    useAuthStore.getState().updateUser({ email: 'new@centralspy.net', countryCode: 'NL' });

    const state = useAuthStore.getState();
    expect(state.user?.email).toBe('new@centralspy.net');
    expect(state.user?.countryCode).toBe('NL');
    expect(state.user?.username).toBe('TitanCommander');
  });

  it('clears credentials completely on logout', () => {
    const mockUser = {
      id: 'user-003',
      username: 'Viper',
      email: 'viper@centralspy.net',
      countryCode: 'DE',
      dob: '2000-01-01',
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };

    useAuthStore.getState().setAuth(mockUser, 'token-789');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isAdmin).toBe(false);
  });
});

describe('Module 3: Persona Service (personaService)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls getPersonas without gameSlug filter', async () => {
    const mockPersonas = [
      { id: 'p1', userId: 'u1', gameSlug: 'mohpa', name: 'Ghost', isActive: true, createdAt: '2026-01-01' },
    ];
    (apiClient.get as any).mockResolvedValueOnce({ data: { personas: mockPersonas } });

    const result = await personaService.getPersonas();
    expect(apiClient.get).toHaveBeenCalledWith('/personas', { params: {} });
    expect(result).toEqual(mockPersonas);
  });

  it('calls getPersonas with gameSlug query param', async () => {
    const mockPersonas = [
      { id: 'p2', userId: 'u1', gameSlug: 'mohpa', name: 'ReconOne', isActive: true, createdAt: '2026-01-01' },
    ];
    (apiClient.get as any).mockResolvedValueOnce({ data: { personas: mockPersonas } });

    const result = await personaService.getPersonas('mohpa');
    expect(apiClient.get).toHaveBeenCalledWith('/personas', { params: { game_slug: 'mohpa' } });
    expect(result).toEqual(mockPersonas);
  });

  it('creates new persona via createPersona', async () => {
    const newPersona = {
      id: 'p3',
      userId: 'u1',
      gameSlug: 'mohpa',
      name: 'TitanAssault',
      isActive: true,
      createdAt: '2026-01-01',
    };
    (apiClient.post as any).mockResolvedValueOnce({ data: { persona: newPersona } });

    const result = await personaService.createPersona({
      gameSlug: 'mohpa',
      name: 'TitanAssault',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/personas', {
      gameSlug: 'mohpa',
      name: 'TitanAssault',
    });
    expect(result).toEqual(newPersona);
  });

  it('deletes persona by ID', async () => {
    (apiClient.delete as any).mockResolvedValueOnce({
      data: { success: true, message: 'Persona deleted successfully' },
    });

    const result = await personaService.deletePersona('p-delete-123');
    expect(apiClient.delete).toHaveBeenCalledWith('/personas/p-delete-123');
    expect(result.success).toBe(true);
  });

  it('retrieves detailed persona stats by ID', async () => {
    const mockStats = {
      personaId: 'p4',
      score: 145000,
      kills: 1200,
      deaths: 800,
      wins: 45,
      losses: 20,
      timePlayedSeconds: 72000,
    };
    (apiClient.get as any).mockResolvedValueOnce({
      data: {
        persona: { id: 'p4', name: 'Leader' },
        stats: mockStats,
      },
    });

    const result = await personaService.getPersonaStats('p4');
    expect(apiClient.get).toHaveBeenCalledWith('/personas/p4/stats');
    expect(result).toEqual(mockStats);
  });
});

describe('Module 2: Entitlement Service (entitlementService)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches all entitlements', async () => {
    const mockEntitlements = [
      { id: 'e1', userId: 'u1', gameSlug: 'mohpa', cdKey: 'MOHPA-TEST-KEY-01', isUsed: true, activatedAt: '2026-01-01' },
    ];
    (apiClient.get as any).mockResolvedValueOnce({ data: { entitlements: mockEntitlements } });

    const result = await entitlementService.getEntitlements();
    expect(apiClient.get).toHaveBeenCalledWith('/entitlements');
    expect(result).toEqual(mockEntitlements);
  });

  it('claims CD key successfully', async () => {
    const mockRes = {
      success: true,
      entitlement: {
        id: 'e2',
        userId: 'u1',
        gameSlug: 'bfheroes',
        cdKey: 'HEROES-DEV-KEY',
        isUsed: true,
        activatedAt: '2026-01-01',
      },
    };
    (apiClient.post as any).mockResolvedValueOnce({ data: mockRes });

    const result = await entitlementService.claimCdKey({
      cdKey: 'HEROES-DEV-KEY',
      gameSlug: 'bfheroes',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/entitlements/claim', {
      cdKey: 'HEROES-DEV-KEY',
      gameSlug: 'bfheroes',
    });
    expect(result).toEqual(mockRes);
  });

  it('grants self game license for dev ease-of-use', async () => {
    const mockRes = {
      success: true,
      entitlement: {
        id: 'e3',
        userId: 'u1',
        gameSlug: 'bfp4f',
        cdKey: 'P4F-AUTO-GRANT',
        isUsed: true,
        activatedAt: '2026-01-01',
      },
    };
    (apiClient.post as any).mockResolvedValueOnce({ data: mockRes });

    const result = await entitlementService.grantSelfGame('bfp4f');
    expect(apiClient.post).toHaveBeenCalledWith('/entitlements/grant', { gameSlug: 'bfp4f' });
    expect(result).toEqual(mockRes);
  });
});

describe('Module 2 UI: Auth Pages Rendering', () => {
  it('renders Login view with identifier and password inputs', () => {
    render(<Login />, { wrapper: createWrapper() });

    expect(screen.getByText(/OPERATOR AUTHENTICATION/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username or Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Security Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Authenticate Session/i })).toBeInTheDocument();
  });

  it('renders Register view with full registration fields', () => {
    render(<Register />, { wrapper: createWrapper() });

    expect(screen.getByText(/OPERATOR ENLISTMENT/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Master Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contact Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Country \/ Region/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date of Birth/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enlist Master Account/i })).toBeInTheDocument();
  });

  it('renders ForgotPassword view with recovery form', () => {
    render(<ForgotPassword />, { wrapper: createWrapper() });

    expect(screen.getByText(/PASSWORD RECOVERY/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Master Operator Email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Recovery Directives/i })).toBeInTheDocument();
  });
});
