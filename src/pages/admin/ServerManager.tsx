import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Server,
  Plus,
  RefreshCw,
  Activity,
  Key,
  Globe,
  Radio,
  Copy,
  Check,
  Search,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { GameServer } from '../../types';
import { GAMES, GameConfig } from '../../types/game';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { StatusIndicator } from '../../components/hud/StatusIndicator';
import { MetricCard } from '../../components/hud/MetricCard';
import { CreateServerKeyModal } from './CreateServerKeyModal';

export const ServerManager: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState('ALL');
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  // Fetch admin sessions & online servers
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-servers-sessions'],
    queryFn: () => adminService.getAdminSessions(),
  });

  const servers: GameServer[] = data?.onlineServers || [];

  const handleCopyIp = (endpoint: string) => {
    navigator.clipboard.writeText(endpoint);
    setCopiedIp(endpoint);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  // Filter servers
  const filteredServers = servers.filter((srv) => {
    if (selectedGame !== 'ALL' && srv.gameSlug.toLowerCase() !== selectedGame.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const inName = srv.name.toLowerCase().includes(q);
      const inIp = `${srv.ipAddress}:${srv.port}`.includes(q);
      const inGame = srv.gameSlug.toLowerCase().includes(q);
      return inName || inIp || inGame;
    }
    return true;
  });

  const totalPlayers = servers.reduce((acc, s) => acc + (s.currentPlayers || 0), 0);
  const rankedServersCount = servers.filter((s) => s.isRanked).length;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-sand-200 pb-4 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-hud font-bold text-xl uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Server className="w-6 h-6" />
              DEDICATED SERVER KEY & FLEET MANAGER
            </h1>
            <Badge variant="OFFICIAL">AUTHORITY NODE</Badge>
          </div>
          <p className="text-xs font-mono text-ink-muted mt-1">
            Provision cryptographically signed server tokens, monitor game nodes, and enforce ranked compliance.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Register Dedicated Server Key
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Online Servers"
          value={data?.onlineServersCount || servers.length}
          subtitle="Active heartbeats"
          icon={<Radio className="w-4 h-4" />}
          accentColor="emerald"
        />
        <MetricCard
          title="Ranked Nodes"
          value={rankedServersCount}
          subtitle="Official stats recording"
          icon={<Server className="w-4 h-4" />}
          accentColor="cyan"
        />
        <MetricCard
          title="Active Connected Players"
          value={totalPlayers}
          subtitle="Across all games"
          icon={<Activity className="w-4 h-4" />}
          accentColor="amber"
        />
        <MetricCard
          title="Authority Protocol"
          value="ENFORCED"
          subtitle="Zero-trust token verification"
          icon={<Key className="w-4 h-4" />}
          accentColor="crimson"
        />
      </div>

      {/* Server List Section */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h2 className="font-hud font-bold text-base uppercase tracking-wider text-ink flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              ACTIVE DEDICATED GAME SERVERS
            </h2>
            <Badge variant="DEFAULT">{servers.length} NODES</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {/* Game Filter */}
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="bg-sand-50 border border-sand-200 text-ink rounded-sm text-xs font-mono px-3 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">ALL GAMES</option>
              {GAMES.map((g: GameConfig) => (
                <option key={g.slug} value={g.slug}>
                  {g.name} ({g.slug.toUpperCase()})
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-ink-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search server name or IP..."
                className="w-48 bg-sand-50 border border-sand-200 text-ink placeholder-ink-faint rounded-sm text-xs font-mono pl-8 pr-2.5 py-1.5 focus:outline-none focus:border-amber-500"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={isFetching ? 'w-3.5 h-3.5 animate-spin' : 'w-3.5 h-3.5'} />}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Server Table */}
        <div className="border border-sand-200 rounded-sm bg-sand-50 shadow-hud-card overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-sand-50 border-b border-sand-200 text-[10px] uppercase tracking-wider text-ink-muted">
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Server Name</th>
                <th className="px-4 py-3 font-semibold">Game Title</th>
                <th className="px-4 py-3 font-semibold">IP Address : Port</th>
                <th className="px-4 py-3 font-semibold text-center">Players</th>
                <th className="px-4 py-3 font-semibold text-center">Ranked</th>
                <th className="px-4 py-3 font-semibold">Last Heartbeat</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 text-ink">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-sm font-medium text-ink">
                    Loading servers…
                  </td>
                </tr>
              ) : filteredServers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-sm font-medium text-ink">
                    No active dedicated servers reported. Click "Register Dedicated Server Key" to issue a key.
                  </td>
                </tr>
              ) : (
                filteredServers.map((srv, idx) => {
                  const endpoint = `${srv.ipAddress}:${srv.port}`;
                  const isCopied = copiedIp === endpoint;
                  const dateObj = new Date(srv.lastHeartbeat);
                  const formattedTime = dateObj.toLocaleTimeString();

                  return (
                    <tr
                      key={srv.id || `srv-${idx}`}
                      className={idx % 2 === 0 ? 'bg-sand-50 hover:bg-sand-100' : 'bg-sand-100 hover:bg-sand-100'}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusIndicator
                          status={srv.isOnline ? 'online' : 'offline'}
                          label={srv.isOnline ? 'ONLINE' : 'OFFLINE'}
                          size="sm"
                        />
                      </td>

                      <td className="px-4 py-3 font-semibold text-ink whitespace-nowrap">
                        {srv.name}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant="CYAN">{srv.gameSlug.toUpperCase()}</Badge>
                      </td>

                      <td className="px-4 py-3 font-mono text-ink whitespace-nowrap">
                        <span className="select-all">{endpoint}</span>
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="text-cyan-400 font-bold">{srv.currentPlayers || 0}</span>
                        <span className="text-ink-muted text-[10px]"> / {srv.maxPlayers || 64}</span>
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {srv.isRanked ? (
                          <Badge variant="RANKED">RANKED</Badge>
                        ) : (
                          <Badge variant="DEFAULT">UNRANKED</Badge>
                        )}
                      </td>

                      <td className="px-4 py-3 text-ink-muted text-[11px] whitespace-nowrap">
                        {formattedTime}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="xs"
                          leftIcon={isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          onClick={() => handleCopyIp(endpoint)}
                        >
                          {isCopied ? 'Copied' : 'Copy IP'}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <CreateServerKeyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
export default ServerManager;
