import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Server,
  RefreshCw,
  MapPin,
  Users,
  Activity,
  Zap,
  Plus,
  Radio,
  Globe,
} from 'lucide-react';
import { GameServer, ServerFilter } from '../../types/server';
import serverService from '../../services/serverService';
import { getRegionInfo, GAME_METADATA, formatMapName, formatGameMode } from '../../utils/gameMaps';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { DataTable, Column } from '../../components/common/DataTable';
import { ServerFilters, ServerFilterState } from '../../components/servers/ServerFilters';
import { ServerDetailModal } from './ServerDetailModal';
import { DirectConnectModal } from '../../components/servers/DirectConnectModal';
import { RegisterServerModal } from '../../components/servers/RegisterServerModal';
import { cn } from '../../utils/cn';

export const ServerBrowser: React.FC = () => {
  // Auto-refresh state (every 10s via React Query refetchInterval)
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filters state
  const [filters, setFilters] = useState<ServerFilterState>({
    search: '',
    gameSlug: '', // default to all games, or user can choose specific game
    mapName: '',
    isRanked: false,
    isOfficial: false,
    hideEmpty: false,
    hideFull: false,
  });

  // Modals state
  const [selectedServer, setSelectedServer] = useState<GameServer | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [directConnectServer, setDirectConnectServer] = useState<GameServer | null>(null);
  const [directConnectOpen, setDirectConnectOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  // Query server list with backend params
  const {
    data: responseData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['servers', filters.gameSlug, filters.isRanked, filters.mapName, filters.search],
    queryFn: async () => {
      const apiFilter: ServerFilter = {};
      if (filters.gameSlug) apiFilter.gameSlug = filters.gameSlug;
      if (filters.isRanked) apiFilter.isRanked = true;
      if (filters.mapName) apiFilter.mapName = filters.mapName;
      if (filters.search) apiFilter.search = filters.search;
      apiFilter.limit = 100;

      return await serverService.getServers(apiFilter);
    },
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const rawServers = responseData?.servers || [];

  // Available map names extracted from current servers
  const availableMaps = useMemo(() => {
    const set = new Set<string>();
    rawServers.forEach((s) => {
      if (s.mapName) set.add(s.mapName);
    });
    return Array.from(set);
  }, [rawServers]);

  // Client-side filtering for Hide Empty, Hide Full, Official, and client search if needed
  const filteredServers = useMemo(() => {
    return rawServers.filter((srv) => {
      const cur = srv.currentPlayers ?? (srv.details?.players ? srv.details.players.length : 0);
      const max = srv.maxPlayers ?? 64;

      // 1. Hide empty
      if (filters.hideEmpty && cur === 0) {
        return false;
      }

      // 2. Hide full
      if (filters.hideFull && cur >= max) {
        return false;
      }

      // 3. Official only
      if (filters.isOfficial && !srv.isOfficial && !srv.details?.isOfficial) {
        return false;
      }

      // 4. Client-side search fallback (matches name, IP, map, mode)
      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        const matchesName = srv.name.toLowerCase().includes(query);
        const matchesIp = `${srv.ipAddress}:${srv.port}`.includes(query);
        const matchesMap = srv.mapName?.toLowerCase().includes(query);
        const matchesMode = srv.gameMode?.toLowerCase().includes(query);
        if (!matchesName && !matchesIp && !matchesMap && !matchesMode) {
          return false;
        }
      }

      return true;
    });
  }, [rawServers, filters]);

  // Global Telemetry calculations
  const telemetry = useMemo(() => {
    const totalServers = rawServers.length;
    const onlineServers = rawServers.filter((s) => s.isOnline).length;
    const activePlayers = rawServers.reduce((sum, s) => sum + (s.currentPlayers || 0), 0);
    const totalCapacity = rawServers.reduce((sum, s) => sum + (s.maxPlayers || 64), 0);

    return {
      totalServers,
      onlineServers,
      activePlayers,
      totalCapacity,
    };
  }, [rawServers]);

  const handleFilterUpdate = (updates: Partial<ServerFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      gameSlug: '',
      mapName: '',
      isRanked: false,
      isOfficial: false,
      hideEmpty: false,
      hideFull: false,
    });
  };

  const handleOpenDetails = (server: GameServer) => {
    setSelectedServer(server);
    setDetailModalOpen(true);
  };

  const handleOpenDirectConnect = (e: React.MouseEvent, server: GameServer) => {
    e.stopPropagation();
    setDirectConnectServer(server);
    setDirectConnectOpen(true);
  };

  // Table column configuration
  const columns: Column<GameServer>[] = [
    {
      key: 'isOnline',
      header: 'STATUS',
      width: '70px',
      align: 'center',
      sortable: true,
      sortValue: (srv) => (srv.isOnline ? 1 : 0),
      render: (srv) => (
        <div className="flex items-center justify-center">
          <span className="relative flex h-2.5 w-2.5">
            {srv.isOnline && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={cn(
                'relative inline-flex rounded-full h-2.5 w-2.5',
                srv.isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-crimson-500'
              )}
            />
          </span>
        </div>
      ),
    },
    {
      key: 'gameSlug',
      header: 'GAME',
      width: '110px',
      sortable: true,
      render: (srv) => {
        const meta = GAME_METADATA[srv.gameSlug];
        const shortName = meta?.shortTitle || srv.gameSlug.toUpperCase();
        return (
          <Badge variant="CYAN" size="sm" className="truncate max-w-[100px]">
            {shortName}
          </Badge>
        );
      },
    },
    {
      key: 'name',
      header: 'SERVER NAME & NODE',
      sortable: true,
      render: (srv) => {
        const region = getRegionInfo(
          srv.region || srv.details?.region || srv.countryCode || srv.details?.countryCode,
          srv.ipAddress
        );
        return (
          <div className="flex flex-col space-y-0.5 py-0.5 group">
            <div className="flex items-center space-x-1.5 font-semibold text-gray-100 group-hover:text-cyan-300 transition-colors">
              <span className="truncate max-w-xs md:max-w-md">{srv.name}</span>
              {srv.isRanked && (
                <Badge variant="RANKED" size="sm" className="hidden sm:inline-flex">
                  RANKED
                </Badge>
              )}
              {srv.isOfficial && (
                <Badge variant="OFFICIAL" size="sm" className="hidden sm:inline-flex">
                  OFFICIAL
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-gray-400">
              <span className="font-mono text-gray-400">
                {srv.ipAddress}:{srv.port}
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1 text-gray-400" title={region.name}>
                <span>{region.flag}</span>
                <span className="uppercase">{region.code.toUpperCase()}</span>
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'mapName',
      header: 'CURRENT MAP',
      sortable: true,
      render: (srv) => (
        <div className="flex items-center space-x-1.5 text-gray-200">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate max-w-[130px]" title={formatMapName(srv.mapName, srv.gameSlug)}>
            {formatMapName(srv.mapName, srv.gameSlug)}
          </span>
        </div>
      ),
    },
    {
      key: 'gameMode',
      header: 'GAME MODE',
      sortable: true,
      render: (srv) => (
        <span className="text-gray-300 font-mono text-[11px] uppercase truncate block max-w-[110px]" title={formatGameMode(srv.gameMode, srv.gameSlug)}>
          {formatGameMode(srv.gameMode, srv.gameSlug)}
        </span>
      ),
    },
    {
      key: 'currentPlayers',
      header: 'CAPACITY',
      width: '130px',
      sortable: true,
      sortValue: (srv) => srv.currentPlayers || 0,
      render: (srv) => {
        const cur = srv.currentPlayers || 0;
        const max = srv.maxPlayers || 64;
        const percent = Math.min(100, Math.round((cur / Math.max(1, max)) * 100));

        const barColor =
          percent >= 100 ? 'bg-crimson-500' : percent >= 80 ? 'bg-amber-400' : 'bg-cyan-500';

        return (
          <div className="flex flex-col space-y-1 w-24">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className={cn('font-bold', cur > 0 ? 'text-cyan-300' : 'text-gray-400')}>
                {cur}
              </span>
              <span className="text-gray-500">/ {max}</span>
            </div>
            <div className="w-full bg-carbon-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-300', barColor)}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'region',
      header: 'REGION / PING',
      width: '110px',
      sortable: true,
      sortValue: (srv) => srv.ping || srv.details?.ping || 30,
      render: (srv) => {
        const region = getRegionInfo(
          srv.region || srv.details?.region || srv.countryCode || srv.details?.countryCode,
          srv.ipAddress
        );
        const ping = srv.ping ?? srv.details?.ping ?? region.estimatedPing;
        const pingColor =
          ping < 50 ? 'text-emerald-400' : ping < 110 ? 'text-amber-400' : 'text-crimson-400';

        return (
          <div className="flex items-center space-x-1.5 font-mono text-[11px]" title={`${region.name} (${ping}ms)`}>
            <span>{region.flag}</span>
            <span className={cn('font-bold', pingColor)}>{ping}ms</span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'TACTICAL ACTIONS',
      width: '180px',
      align: 'right',
      render: (srv) => (
        <div className="flex items-center justify-end space-x-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="xs"
            leftIcon={<Zap className="w-3 h-3" />}
            onClick={(e) => handleOpenDirectConnect(e, srv)}
            title="Direct Connect / Launch Arguments"
          >
            Connect
          </Button>

          <Button
            variant="ghost"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDetails(srv);
            }}
            title="View Scoreboard & Details"
          >
            Scoreboard
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Header & Live Telemetry Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-carbon-800 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="font-hud font-bold text-2xl uppercase tracking-wider text-gray-100 flex items-center gap-2">
              <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
              LIVE THEATER SERVER BROWSER
            </h1>
            <Badge variant="CYAN" dot>
              {filters.gameSlug ? GAME_METADATA[filters.gameSlug]?.shortTitle || filters.gameSlug : 'GLOBAL THEATER'}
            </Badge>
          </div>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Real-time telemetry heartbeat & active dedicated servers across EA FESL / Theater emulators.
          </p>
        </div>

        {/* Action Controls & Auto-refresh toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Auto Refresh Toggle */}
          <label className="flex items-center space-x-2 px-3 py-1.5 bg-carbon-900 border border-carbon-800 rounded-sm text-xs font-mono text-gray-300 cursor-pointer select-none hover:border-carbon-700 transition-colors">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-carbon-950 border-carbon-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <RefreshCw className={cn('w-3 h-3 text-cyan-400', autoRefresh && isFetching ? 'animate-spin' : '')} />
              Auto-Sync (10s)
            </span>
          </label>

          {/* Quick Refresh Button */}
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={cn('w-3.5 h-3.5', isFetching ? 'animate-spin' : '')} />}
            onClick={() => refetch()}
            disabled={isFetching}
          >
            Refresh
          </Button>

          {/* Register Server Button */}
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setRegisterModalOpen(true)}
          >
            Register Server
          </Button>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-3.5 bg-carbon-900 border border-carbon-800 rounded-sm hud-border-corners flex items-center space-x-3">
          <div className="w-10 h-10 rounded-sm bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-gray-400 block tracking-wider">ONLINE NODES</span>
            <span className="font-hud font-bold text-lg text-emerald-400">
              {telemetry.onlineServers} <span className="text-xs text-gray-500">/ {telemetry.totalServers}</span>
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-carbon-900 border border-carbon-800 rounded-sm hud-border-corners flex items-center space-x-3">
          <div className="w-10 h-10 rounded-sm bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-gray-400 block tracking-wider">ACTIVE COMBATANTS</span>
            <span className="font-hud font-bold text-lg text-cyan-400">
              {telemetry.activePlayers.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-carbon-900 border border-carbon-800 rounded-sm hud-border-corners flex items-center space-x-3">
          <div className="w-10 h-10 rounded-sm bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-gray-400 block tracking-wider">NETWORK CAPACITY</span>
            <span className="font-hud font-bold text-lg text-purple-400">
              {telemetry.totalCapacity.toLocaleString()} <span className="text-xs text-gray-500">SLOTS</span>
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-carbon-900 border border-carbon-800 rounded-sm hud-border-corners flex items-center space-x-3">
          <div className="w-10 h-10 rounded-sm bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-gray-400 block tracking-wider">THEATER STATUS</span>
            <span className="font-hud font-bold text-lg text-amber-400">
              SYNCED <span className="text-xs text-emerald-400">100%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <ServerFilters
        filters={filters}
        onFilterChange={handleFilterUpdate}
        onReset={handleResetFilters}
        availableMaps={availableMaps}
        totalCount={rawServers.length}
        filteredCount={filteredServers.length}
      />

      {/* Main Server Table Card */}
      <Card
        title={
          <div className="flex items-center space-x-2">
            <span>DEDICATED THEATER NODES</span>
            <Badge variant="CYAN" size="sm">
              {filteredServers.length} ACTIVE
            </Badge>
          </div>
        }
        subtitle="Click any server row to open live scoreboard telemetry, cvar rules, and direct join directives."
        icon={<Server className="w-4 h-4" />}
        accent="cyan"
      >
        <DataTable<GameServer>
          columns={columns}
          data={filteredServers}
          keyExtractor={(srv) => srv.id}
          isLoading={isLoading}
          onRowClick={(srv) => handleOpenDetails(srv)}
          emptyMessage={
            rawServers.length === 0
              ? 'No live theater servers currently registered in CentralSpy network.'
              : 'No servers match the selected tactical filter criteria.'
          }
        />

        {/* Empty state clear filters helper */}
        {!isLoading && filteredServers.length === 0 && rawServers.length > 0 && (
          <div className="text-center pt-3 pb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
            >
              Reset Filters & Show All Servers
            </Button>
          </div>
        )}
      </Card>

      {/* Server Detail Modal */}
      {selectedServer && (
        <ServerDetailModal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          server={selectedServer}
        />
      )}

      {/* Direct Connect Modal */}
      {directConnectServer && (
        <DirectConnectModal
          isOpen={directConnectOpen}
          onClose={() => setDirectConnectOpen(false)}
          server={directConnectServer}
        />
      )}

      {/* Register Server Modal */}
      {registerModalOpen && (
        <RegisterServerModal
          isOpen={registerModalOpen}
          onClose={() => setRegisterModalOpen(false)}
          onRegistered={() => {
            refetch();
          }}
        />
      )}
    </div>
  );
};
