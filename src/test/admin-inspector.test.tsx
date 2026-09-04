import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act } from '@testing-library/react';

import apiClient from '../services/api';
import { adminService } from '../services/adminService';
import { InspectorWebSocketService } from '../services/websocketService';
import { useProtocolInspector } from '../hooks/useProtocolInspector';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { ProtocolInspector } from '../pages/admin/ProtocolInspector';
import { PacketDetailsDrawer } from '../pages/admin/PacketDetailsDrawer';
import { Moderation } from '../pages/admin/Moderation';
import { ServerManager } from '../pages/admin/ServerManager';
import { BanUserModal } from '../pages/admin/BanUserModal';
import { KickPlayerModal } from '../pages/admin/KickPlayerModal';
import { CreateServerKeyModal } from '../pages/admin/CreateServerKeyModal';
import { PacketInspectorEvent } from '../types';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Admin Service Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls getAdminSessions correctly', async () => {
    const mockData = {
      inspector: { connectedClients: 3, totalBufferedPackets: 42 },
      onlineServersCount: 5,
      onlineServers: [],
    };
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockData });

    const res = await adminService.getAdminSessions();
    expect(apiClient.get).toHaveBeenCalledWith('/admin/sessions');
    expect(res).toEqual(mockData);
  });

  it('calls getAuditLogs with pagination parameters', async () => {
    const mockLogs = {
      logs: [
        {
          id: 'log-1',
          actorId: 'admin-1',
          action: 'BAN_USER',
          targetType: 'USER',
          targetId: 'user-123',
          details: { reason: 'Tampering' },
          createdAt: new Date().toISOString(),
        },
      ],
      count: 1,
    };
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockLogs });

    const res = await adminService.getAuditLogs(25, 50);
    expect(apiClient.get).toHaveBeenCalledWith('/admin/audit-logs', {
      params: { limit: 25, offset: 50 },
    });
    expect(res.logs.length).toBe(1);
    expect(res.logs[0].action).toBe('BAN_USER');
  });

  it('calls banUser with payload', async () => {
    const mockResponse = { success: true, message: 'User banned', userId: 'usr-99' };
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockResponse });

    const res = await adminService.banUser({ userId: 'usr-99', reason: 'Cheating' });
    expect(apiClient.post).toHaveBeenCalledWith('/admin/bans', {
      userId: 'usr-99',
      reason: 'Cheating',
    });
    expect(res.success).toBe(true);
  });

  it('calls unbanUser with user ID', async () => {
    const mockResponse = { success: true, message: 'User unbanned', userId: 'usr-99' };
    vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({ data: mockResponse });

    const res = await adminService.unbanUser('usr-99');
    expect(apiClient.delete).toHaveBeenCalledWith('/admin/bans/usr-99');
    expect(res.success).toBe(true);
  });

  it('calls kickPlayer with payload', async () => {
    const mockResponse = { success: true, message: 'Kick command dispatched' };
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockResponse });

    const res = await adminService.kickPlayer({ userId: 'usr-12', reason: 'Admin intervention' });
    expect(apiClient.post).toHaveBeenCalledWith('/admin/kick', {
      userId: 'usr-12',
      reason: 'Admin intervention',
    });
    expect(res.success).toBe(true);
  });

  it('calls createServerKey with payload', async () => {
    const mockResponse = {
      server: {
        id: 'srv-1',
        name: 'Test Server',
        gameSlug: 'mohpa',
        ipAddress: '127.0.0.1',
        port: 13200,
        isRanked: true,
        isOnline: false,
        lastHeartbeat: new Date().toISOString(),
      },
      secretKey: 'CS-SRV-ABCDEF123456',
    };
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockResponse });

    const payload = {
      serverName: 'Test Server',
      gameSlug: 'mohpa',
      ipAddress: '127.0.0.1',
      port: 13200,
      isRanked: true,
      maxPlayers: 64,
    };
    const res = await adminService.createServerKey(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/admin/server-keys', payload);
    expect(res.secretKey).toBe('CS-SRV-ABCDEF123456');
  });
});

describe('WebSocket Service & Protocol Inspector Hook Tests', () => {
  it('manages listeners and handles packet stream via useProtocolInspector', () => {
    const customWsService = new InspectorWebSocketService('ws://localhost:9999/ws/inspector');

    const { result } = renderHook(() =>
      useProtocolInspector({
        autoConnect: false,
        service: customWsService,
        maxBufferSize: 5,
      })
    );

    expect(result.current.packets).toEqual([]);
    expect(result.current.totalBufferedPackets).toBe(0);
    expect(result.current.isPaused).toBe(false);

    // Mock incoming packet
    const mockPacket: PacketInspectorEvent = {
      id: 'pkt-1',
      timestamp: Date.now(),
      protocol: 'FESL',
      direction: 'INCOMING',
      clientIp: '192.168.1.50',
      clientPort: 18000,
      subsystemOrCommand: 'fsys.memcheck',
      subtypeOrTxn: 'TXN 1',
      length: 120,
      payload: { salt: '12345', result: '0' },
    };

    act(() => {
      (customWsService as any).notifyPacket(mockPacket);
    });

    expect(result.current.packets.length).toBe(1);
    expect(result.current.packets[0].id).toBe('pkt-1');

    // Test pause toggle
    act(() => {
      result.current.togglePause();
    });
    expect(result.current.isPaused).toBe(true);

    // Incoming packet while paused should be ignored from buffer
    const mockPacket2: PacketInspectorEvent = {
      id: 'pkt-2',
      timestamp: Date.now(),
      protocol: 'THEATER',
      direction: 'OUTGOING',
      clientIp: '192.168.1.50',
      clientPort: 18000,
      subsystemOrCommand: 'CONN',
      subtypeOrTxn: '1',
      length: 64,
      payload: 'CONN=1\nTIME=100',
    };

    act(() => {
      (customWsService as any).notifyPacket(mockPacket2);
    });
    expect(result.current.packets.length).toBe(1);

    // Resume
    act(() => {
      result.current.togglePause();
    });
    expect(result.current.isPaused).toBe(false);

    // Test buffer limit
    act(() => {
      for (let i = 2; i <= 8; i++) {
        (customWsService as any).notifyPacket({
          ...mockPacket,
          id: `pkt-${i}`,
        });
      }
    });
    expect(result.current.packets.length).toBe(5);

    // Test clearBuffer
    act(() => {
      result.current.clearBuffer();
    });
    expect(result.current.packets.length).toBe(0);
  });

  it('filters packets based on protocol, direction, and subsystem', () => {
    const customWsService = new InspectorWebSocketService('ws://localhost:9999/ws/inspector');

    const { result } = renderHook(() =>
      useProtocolInspector({
        autoConnect: false,
        service: customWsService,
      })
    );

    act(() => {
      (customWsService as any).notifyPacket({
        id: 'pkt-fesl-in',
        timestamp: Date.now(),
        protocol: 'FESL',
        direction: 'INCOMING',
        clientIp: '10.0.0.1',
        clientPort: 18000,
        subsystemOrCommand: 'acct.login',
        subtypeOrTxn: '1',
        length: 80,
        payload: { name: 'PlayerOne' },
      });

      (customWsService as any).notifyPacket({
        id: 'pkt-theater-out',
        timestamp: Date.now(),
        protocol: 'THEATER',
        direction: 'OUTGOING',
        clientIp: '10.0.0.2',
        clientPort: 18000,
        subsystemOrCommand: 'EGAM',
        subtypeOrTxn: '2',
        length: 90,
        payload: { gameId: 100 },
      });
    });

    expect(result.current.packets.length).toBe(2);

    // Filter by FESL
    act(() => {
      result.current.setFilter({ protocol: 'FESL' });
    });
    expect(result.current.packets.length).toBe(1);
    expect(result.current.packets[0].id).toBe('pkt-fesl-in');

    // Filter by OUTGOING
    act(() => {
      result.current.setFilter({ protocol: 'ALL', direction: 'OUTGOING' });
    });
    expect(result.current.packets.length).toBe(1);
    expect(result.current.packets[0].id).toBe('pkt-theater-out');
  });
});

describe('Admin UI Components Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders AdminDashboard with metrics and quick navigation', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation(async (url: string) => {
      if (url.includes('/admin/sessions')) {
        return {
          data: {
            inspector: { connectedClients: 4, totalBufferedPackets: 120 },
            onlineServersCount: 8,
            onlineServers: [],
          },
        };
      }
      if (url.includes('/admin/audit-logs')) {
        return {
          data: {
            logs: [],
            count: 14,
          },
        };
      }
      return { data: {} };
    });

    renderWithProviders(<AdminDashboard />);

    expect(screen.getByText(/CENTRALSPY ADMIN & PROTOCOL OPS CONSOLE/i)).toBeInTheDocument();
    expect(screen.getByText('Active FESL Sockets')).toBeInTheDocument();
    expect(screen.getByText('Online Dedicated Servers')).toBeInTheDocument();
    expect(screen.getByText('Launch Protocol Inspector')).toBeInTheDocument();
    expect(screen.getByText('Open Moderation Center')).toBeInTheDocument();
  });

  it('renders ProtocolInspector with toolbar controls and empty state', () => {
    renderWithProviders(<ProtocolInspector />);

    expect(screen.getByText(/REAL-TIME FESL & THEATER PROTOCOL INSPECTOR/i)).toBeInTheDocument();
    expect(screen.getByText('Pause Stream')).toBeInTheDocument();
    expect(screen.getByText('Clear Buffer')).toBeInTheDocument();
    expect(screen.getByText(/Auto-Scroll:/i)).toBeInTheDocument();
    expect(screen.getByText('LISTENING FOR PROTOCOL TELEMETRY...')).toBeInTheDocument();
  });

  it('renders PacketDetailsDrawer with tabs and Key-Value tree', () => {
    const mockPacket: PacketInspectorEvent = {
      id: 'pkt-inspect-1',
      timestamp: 1690000000000,
      protocol: 'FESL',
      direction: 'INCOMING',
      clientIp: '192.168.1.10',
      clientPort: 18270,
      subsystemOrCommand: 'acct.login',
      subtypeOrTxn: 'TXN-001',
      length: 154,
      payload: {
        nump: '1',
        macToken: 'AABBCCDDEEFF',
        returnCode: 0,
      },
      rawHex: '4645534c00000001',
    };

    const onClose = vi.fn();
    render(<PacketDetailsDrawer packet={mockPacket} onClose={onClose} />);

    expect(screen.getByText('acct.login')).toBeInTheDocument();
    expect(screen.getAllByText(/TXN-001/).length).toBeGreaterThan(0);
    expect(screen.getByText('192.168.1.10:18270')).toBeInTheDocument();
    expect(screen.getByText('Key-Value / Tree (3)')).toBeInTheDocument();
    expect(screen.getByText('nump')).toBeInTheDocument();
    expect(screen.getByText('macToken')).toBeInTheDocument();

    // Switch to JSON viewer
    fireEvent.click(screen.getByText('JSON Viewer'));
    expect(screen.getAllByText(/TXN-001/).length).toBeGreaterThan(0);

    // Switch to Hex dump
    fireEvent.click(screen.getByText('Raw Hex / String'));
    expect(screen.getByText(/46 45 53 4c/)).toBeInTheDocument();
  });

  it('renders Moderation page with audit logs and triggers modals', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        logs: [
          {
            id: 'log-101',
            actorId: 'admin-uuid',
            action: 'BAN_USER',
            targetType: 'USER',
            targetId: 'bad-user-1',
            details: { reason: 'Memory alteration' },
            createdAt: new Date().toISOString(),
          },
        ],
        count: 1,
      },
    });

    renderWithProviders(<Moderation />);

    expect(screen.getByText(/USER MODERATION & AUDIT CONSOLE/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('bad-user-1')).toBeInTheDocument();
    });
    expect(screen.getAllByText('BAN_USER').length).toBeGreaterThan(0);

    // Open ban modal
    fireEvent.click(screen.getByRole('button', { name: /Ban Account/i }));
    expect(screen.getByText('ISSUE ADMINISTRATIVE BAN')).toBeInTheDocument();
  });

  it('handles BanUserModal submission', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { success: true, message: 'Banned', userId: 'user-to-ban' },
    });

    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <BanUserModal
        isOpen={true}
        onClose={onClose}
        defaultUserId="user-to-ban"
        onSuccess={onSuccess}
      />
    );

    expect(screen.getByText('ISSUE ADMINISTRATIVE BAN')).toBeInTheDocument();
    const submitBtn = screen.getByRole('button', { name: /Confirm Account Ban/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/admin/bans', expect.objectContaining({
        userId: 'user-to-ban',
      }));
      expect(onSuccess).toHaveBeenCalledWith('user-to-ban');
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('handles KickPlayerModal submission', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { success: true, message: 'Kicked' },
    });

    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <KickPlayerModal
        isOpen={true}
        onClose={onClose}
        defaultId="user-to-kick"
        defaultTargetType="USER"
        onSuccess={onSuccess}
      />
    );

    expect(screen.getByText('DISCONNECT ACTIVE SESSION')).toBeInTheDocument();
    const kickBtn = screen.getByRole('button', { name: /Dispatch Kick Command/i });
    fireEvent.click(kickBtn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/admin/kick', expect.objectContaining({
        userId: 'user-to-kick',
      }));
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('renders ServerManager and handles CreateServerKeyModal', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation(async (url: string) => {
      if (url.includes('/admin/sessions')) {
        return {
          data: {
            onlineServersCount: 1,
            inspector: { connectedClients: 1, totalBufferedPackets: 0 },
            onlineServers: [
              {
                id: 'srv-1',
                name: 'Alpha Strike MOHPA',
                gameSlug: 'mohpa',
                ipAddress: '198.51.100.10',
                port: 13200,
                isRanked: true,
                isOnline: true,
                currentPlayers: 32,
                maxPlayers: 64,
                lastHeartbeat: new Date().toISOString(),
              },
            ],
          },
        };
      }
      return { data: {} };
    });

    renderWithProviders(<ServerManager />);

    expect(screen.getByText(/DEDICATED SERVER KEY & FLEET MANAGER/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Alpha Strike MOHPA')).toBeInTheDocument();
    });
    expect(screen.getByText('198.51.100.10:13200')).toBeInTheDocument();

    // Open key modal
    fireEvent.click(screen.getByRole('button', { name: /Register Dedicated Server Key/i }));
    expect(screen.getByText('REGISTER DEDICATED SERVER KEY')).toBeInTheDocument();
  });

  it('handles CreateServerKeyModal submission and displays secret key', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: {
        server: { id: 'srv-created' },
        secretKey: 'CS-SRV-SECRET-KEY-999',
      },
    });

    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(<CreateServerKeyModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    fireEvent.change(screen.getByPlaceholderText(/e\.g\. \[EU\] CentralSpy Tactical #01/i), {
      target: { value: 'New Test Server' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. 198\.51\.100\.24/i), {
      target: { value: '198.51.100.55' },
    });
    fireEvent.change(screen.getByPlaceholderText('13200'), {
      target: { value: '13200' },
    });

    const submitBtn = screen.getByRole('button', { name: /Generate Server Key/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('DEDICATED SERVER KEY ISSUED')).toBeInTheDocument();
      expect(screen.getByDisplayValue('CS-SRV-SECRET-KEY-999')).toBeInTheDocument();
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
