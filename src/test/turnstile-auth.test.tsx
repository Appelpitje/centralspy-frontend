import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import apiClient from '../services/api';
import { ToastProvider } from '../components/hud/Toast';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { ForgotPassword } from '../pages/auth/ForgotPassword';

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
  };
});

const SITE_KEY = '1x00000000000000000000AA';
const DUMMY_TOKEN = 'XXXX.DUMMY.TOKEN.XXXX';

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

const mockUser = {
  id: 'user-001',
  username: 'StrikeCommander',
  email: 'commander@mohpa.net',
  countryCode: 'US',
  dob: '1995-05-15',
  isAdmin: false,
  createdAt: new Date().toISOString(),
};

describe('Cloudflare Turnstile on portal auth pages', () => {
  let previousSiteKey: string | undefined;

  beforeEach(() => {
    previousSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    (import.meta.env as any).VITE_TURNSTILE_SITE_KEY = SITE_KEY;
    vi.clearAllMocks();

    (window as any).turnstile = {
      render: (_el: HTMLElement, opts: { callback: (token: string) => void }) => {
        opts.callback(DUMMY_TOKEN);
        return 'widget-1';
      },
      reset: vi.fn(),
      remove: vi.fn(),
    };
  });

  afterEach(() => {
    (import.meta.env as any).VITE_TURNSTILE_SITE_KEY = previousSiteKey;
    delete (window as any).turnstile;
  });

  it('renders the Turnstile widget on Login', () => {
    render(<Login />, { wrapper: createWrapper() });
    expect(screen.getByTestId('cf-turnstile')).toBeInTheDocument();
  });

  it('keeps Sign in disabled until CAPTCHA succeeds', () => {
    (window as any).turnstile.render = vi.fn(() => 'widget-1');
    render(<Login />, { wrapper: createWrapper() });
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeDisabled();
  });

  it('sends the Turnstile token with login credentials', async () => {
    (apiClient.post as any).mockResolvedValueOnce({
      data: { token: 'jwt-token', user: mockUser },
    });

    render(<Login />, { wrapper: createWrapper() });

    fireEvent.change(screen.getByLabelText(/Username or Email/i), {
      target: { value: 'StrikeCommander' },
    });
    fireEvent.change(screen.getByLabelText(/Security Password/i), {
      target: { value: 'SecretPassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        identifier: 'StrikeCommander',
        password: 'SecretPassword123',
        turnstileToken: DUMMY_TOKEN,
      });
    });
  });

  it('renders the Turnstile widget on Register', () => {
    render(<Register />, { wrapper: createWrapper() });
    expect(screen.getByTestId('cf-turnstile')).toBeInTheDocument();
  });

  it('sends the Turnstile token with registration data', async () => {
    (apiClient.post as any).mockResolvedValueOnce({
      data: { token: 'jwt-token', user: mockUser },
    });

    render(<Register />, { wrapper: createWrapper() });

    fireEvent.change(screen.getByLabelText(/Master Username/i), {
      target: { value: 'StrikeCommander' },
    });
    fireEvent.change(screen.getByLabelText(/Contact Email Address/i), {
      target: { value: 'commander@mohpa.net' },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'SecretPassword123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'SecretPassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Enlist Master Account/i }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
        username: 'StrikeCommander',
        email: 'commander@mohpa.net',
        password: 'SecretPassword123',
        countryCode: 'US',
        dob: '2000-01-01',
        turnstileToken: DUMMY_TOKEN,
      });
    });
  });

  it('renders the Turnstile widget on ForgotPassword', () => {
    render(<ForgotPassword />, { wrapper: createWrapper() });
    expect(screen.getByTestId('cf-turnstile')).toBeInTheDocument();
  });

  it('keeps Send Recovery Directives disabled until CAPTCHA succeeds', () => {
    (window as any).turnstile.render = vi.fn(() => 'widget-1');
    render(<ForgotPassword />, { wrapper: createWrapper() });
    expect(screen.getByRole('button', { name: /Send Recovery Directives/i })).toBeDisabled();
  });

  it('sends the Turnstile token with the password reset request', async () => {
    (apiClient.post as any).mockResolvedValueOnce({ data: { ok: true } });

    render(<ForgotPassword />, { wrapper: createWrapper() });

    fireEvent.change(screen.getByLabelText(/Master Operator Email/i), {
      target: { value: 'commander@mohpa.net' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Send Recovery Directives/i }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'commander@mohpa.net',
        turnstileToken: DUMMY_TOKEN,
      });
    });
  });
});
