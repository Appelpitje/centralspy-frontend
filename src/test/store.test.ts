import { describe, it, expect } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';

describe('Game Store', () => {
  it('should initialize with mohpa as default active game', () => {
    const state = useGameStore.getState();
    expect(state.activeGame).toBe('mohpa');
    expect(state.games.length).toBe(1);
    expect(state.games[0].slug).toBe('mohpa');
  });

  it('should retrieve mohpa game config correctly', () => {
    useGameStore.getState().setActiveGame('mohpa');
    expect(useGameStore.getState().activeGame).toBe('mohpa');
    const config = useGameStore.getState().getActiveGameConfig();
    expect(config.name).toBe('Medal of Honor: Pacific Assault');
    expect(config.defaultFeslPort).toBe(18020);
    expect(config.defaultTheaterPort).toBe(18275);
  });
});

describe('Auth Store', () => {
  it('should handle authentication state and logout', () => {
    const user = {
      id: 'test-user-1',
      username: 'Operative42',
      email: 'op42@centralspy.net',
      countryCode: 'US',
      dob: '1995-05-15',
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };

    useAuthStore.getState().setAuth(user, 'mock-jwt-token');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.username).toBe('Operative42');
    expect(useAuthStore.getState().token).toBe('mock-jwt-token');

    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
  });
});
