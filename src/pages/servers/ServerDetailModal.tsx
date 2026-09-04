import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Server,
  MapPin,
  Users,
  Activity,
  Shield,
  Zap,
  Copy,
  Check,
  Settings,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Crown,
  Signal,
  RefreshCw,
} from 'lucide-react';
import { GameServer, ScoreboardPlayer } from '../../types/server';
import serverService from '../../services/serverService';
import { getFaction, getRegionInfo, GAME_METADATA } from '../../utils/gameMaps';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { DirectConnectModal } from '../../components/servers/DirectConnectModal';
import { useToast } from '../../components/hud/Toast';
import { cn } from '../../utils/cn';

export interface ServerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: GameServer | null;
  onSelectPlayer?: (playerName: string) => void;
}

export const ServerDetailModal: React.FC<ServerDetailModalProps> = ({
  isOpen,
  onClose,
  server: initialServer,
  onSelectPlayer,
}) => {
  const { toast } = useToast();
  const [activeScoreboardTab, setActiveScoreboardTab] = useState<'all' | 'split' | 'team1' | 'team2'>('split');
  const [rulesExpanded, setRulesExpanded] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);
  const [copiedArg, setCopiedArg] = useState(false);
  const [directConnectOpen, setDirectConnectOpen] = useState(false);

  // Fetch live server details with scoreboard & rules
  const {
    data: detailsData,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['server-details', initialServer?.id],
    queryFn: () => (initialServer ? serverService.getServerDetails(initialServer.id) : null),
    enabled: isOpen && !!initialServer?.id,
    refetchInterval: isOpen ? 10000 : false, // Poll scoreboard every 10s when modal is open
  });

  if (!initialServer) return null;

  const server = detailsData?.server || initialServer;
  const scoreboard: ScoreboardPlayer[] = detailsData?.scoreboard || server.details?.players || [];
  const rules: Record<string, any> = detailsData?.rules || server.details?.rules || {};

  const gameMeta = GAME_METADATA[server.gameSlug];
  const team1Faction = getFaction(server.gameSlug, 1);
  const team2Faction = getFaction(server.gameSlug, 2);
  const region = getRegionInfo(server.region || (server.details?.region as string) || 'iad');

  const targetAddress = `${server.ipAddress}:${server.port}`;
  const joinArg = `+joinServer ${targetAddress} +playerName "CentralSpyPlayer"`;

  const curPlayers = server.currentPlayers ?? scoreboard.length;
  const maxPlayers = server.maxPlayers ?? 64;
  const capacityPercent = Math.min(100, Math.round((curPlayers / Math.max(1, maxPlayers)) * 100));

  // Partition players into teams
  const team1Players = scoreboard.filter((p) => (p.team === 1 || p.team === undefined ? true : false) && p.team !== 2);
  const team2Players = scoreboard.filter((p) => p.team === 2);

  // Team scores
  const team1Score = team1Players.reduce((sum, p) => sum + (p.score || 0), 0);
  const team2Score = team2Players.reduce((sum, p) => sum + (p.score || 0), 0);

  const copyIp = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(targetAddress);
      }
      setCopiedIp(true);
      toast.success('Address Copied', `Server address ${targetAddress} copied to clipboard.`);
      setTimeout(() => setCopiedIp(false), 2000);
    } catch {
      toast.error('Copy Failed', 'Could not copy to clipboard.');
    }
  };

  const copyJoinCommand = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(joinArg);
      }
      setCopiedArg(true);
      toast.success('Launch Argument Copied', `Launch argument copied to clipboard.`);
      setTimeout(() => setCopiedArg(false), 2000);
    } catch {
      toast.error('Copy Failed', 'Could not copy to clipboard.');
    }
  };

  const renderPlayerTable = (players: ScoreboardPlayer[]) => {
    if (players.length === 0) {
      return (
        <div className="py-8 text-center text-gray-500 font-mono text-xs border border-carbon-800/60 rounded-sm bg-carbon-950/40">
          <Users className="w-6 h-6 text-gray-600 mx-auto mb-1.5" />
          <p>No active combatants in this theater sector.</p>
        </div>
      );
    }

    // Sort by score descending
    const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

    return (
      <div className="overflow-x-auto rounded-sm border border-carbon-800 bg-carbon-950/70">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="bg-carbon-900/90 border-b border-carbon-800 text-[10px] uppercase tracking-wider text-gray-400">
              <th className="px-3 py-2 w-12 text-center">POS</th>
              <th className="px-3 py-2">SOLDIER CALLSIGN</th>
              <th className="px-3 py-2 text-right">SCORE</th>
              <th className="px-3 py-2 text-center">K / D</th>
              <th className="px-3 py-2 text-right">PING</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-carbon-800/50">
            {sorted.map((player, idx) => {
              const ping = player.ping ?? player.pingMs ?? 35;
              const pingColor =
                ping < 60 ? 'text-emerald-400' : ping < 130 ? 'text-amber-400' : 'text-crimson-400';

              return (
                <tr
                  key={`${player.name}-${idx}`}
                  className="hover:bg-carbon-800/40 transition-colors"
                >
                  <td className="px-3 py-2 text-center text-gray-500 font-bold">
                    {idx === 0 ? (
                      <Crown className="w-3.5 h-3.5 text-amber-400 mx-auto" />
                    ) : (
                      `#${idx + 1}`
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => onSelectPlayer && onSelectPlayer(player.name)}
                      className="font-semibold text-gray-200 hover:text-cyan-400 text-left transition-colors flex items-center space-x-1.5"
                    >
                      <span>{player.name}</span>
                      {player.rank && (
                        <span className="text-[10px] px-1 py-0.2 rounded bg-carbon-800 text-cyan-400 border border-carbon-700">
                          R{player.rank}
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-cyan-400">
                    {(player.score || 0).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-center text-gray-300">
                    <span className="text-emerald-400 font-semibold">{player.kills || 0}</span>
                    <span className="text-gray-500 mx-1">/</span>
                    <span className="text-crimson-400">{player.deaths ?? 0}</span>
                  </td>
                  <td className={cn('px-3 py-2 text-right font-mono text-[11px] font-semibold', pingColor)}>
                    {ping}ms
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-hud font-bold text-lg uppercase tracking-wider text-gray-100 truncate">
              {server.name}
            </span>
            <Badge variant="CYAN" size="sm">
              {gameMeta?.shortTitle || server.gameSlug.toUpperCase()}
            </Badge>
            {server.isRanked ? (
              <Badge variant="RANKED" size="sm">
                RANKED
              </Badge>
            ) : (
              <Badge variant="DEFAULT" size="sm">
                UNRANKED
              </Badge>
            )}
            {server.isOfficial && (
              <Badge variant="OFFICIAL" size="sm">
                OFFICIAL
              </Badge>
            )}
          </div>
        }
        subtitle={`Dedicated Node: ${targetAddress} • Region: ${region.name}`}
        icon={<Server className="w-5 h-5 text-cyan-400" />}
        size="2xl"
      >
        <div className="space-y-6 font-mono text-xs">
          {/* Top Quick Status & Actions Bar */}
          <div className="p-4 bg-carbon-950/80 border border-carbon-800 rounded-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              {/* Online Status */}
              <div className="flex items-center space-x-2">
                <span className="relative flex h-3 w-3">
                  {server.isOnline && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span
                    className={cn(
                      'relative inline-flex rounded-full h-3 w-3',
                      server.isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-crimson-500'
                    )}
                  />
                </span>
                <span className={cn('font-bold tracking-wider', server.isOnline ? 'text-emerald-400' : 'text-crimson-400')}>
                  {server.isOnline ? 'ONLINE & SYNCED' : 'OFFLINE'}
                </span>
              </div>

              {/* IP / Port */}
              <div className="flex items-center space-x-2 text-gray-300">
                <Signal className="w-4 h-4 text-cyan-400" />
                <span>{targetAddress}</span>
                <button
                  type="button"
                  onClick={copyIp}
                  className="p-1 rounded bg-carbon-900 border border-carbon-700 hover:text-cyan-400 transition-colors"
                  title="Copy IP:Port"
                >
                  {copiedIp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                </button>
              </div>

              {/* Region */}
              <div className="flex items-center space-x-1.5 text-gray-300">
                <span>{region.flag}</span>
                <span className="text-gray-400 uppercase">{region.code}</span>
                <span className="text-[10px] text-gray-500">({region.estimatedPing}ms)</span>
              </div>

              {/* Tick rate */}
              <div className="flex items-center space-x-1.5 text-gray-400">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>{server.tickRate || server.details?.tickRate || 30} Hz Tick</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end md:self-auto">
              <Button
                variant="secondary"
                size="xs"
                leftIcon={<RefreshCw className={cn('w-3 h-3', isFetching ? 'animate-spin' : '')} />}
                onClick={() => refetch()}
                disabled={isFetching}
              >
                Refresh
              </Button>
              <Button
                variant="primary"
                size="xs"
                leftIcon={<Zap className="w-3 h-3" />}
                onClick={() => setDirectConnectOpen(true)}
              >
                Direct Connect
              </Button>
            </div>
          </div>

          {/* Map Preview & Telemetry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Map Preview Card */}
            <div className="p-4 bg-carbon-900 border border-carbon-800 rounded-sm relative overflow-hidden flex flex-col justify-between space-y-3">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  THEATER SECTOR
                </span>
                <Badge variant="DEFAULT" size="sm">
                  {server.subState || server.details?.subState || 'IN_PROGRESS'}
                </Badge>
              </div>

              <div>
                <h4 className="font-hud font-bold text-lg text-gray-100 uppercase tracking-wide">
                  {server.mapName || 'Suez Canal 2142'}
                </h4>
                <p className="text-[11px] text-cyan-400 mt-0.5 uppercase tracking-wider">
                  {server.gameMode || 'Titan / Conquest'}
                </p>
              </div>

              <div className="pt-2 border-t border-carbon-800/80 flex items-center justify-between text-[11px] text-gray-400">
                <span>Heartbeat:</span>
                <span className="text-gray-300">
                  {server.lastHeartbeat
                    ? new Date(server.lastHeartbeat).toLocaleTimeString()
                    : 'Active'}
                </span>
              </div>
            </div>

            {/* Capacity & Occupancy Card */}
            <div className="p-4 bg-carbon-900 border border-carbon-800 rounded-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  SOLDIER CAPACITY
                </span>
                <span className="text-xs font-bold text-gray-200">
                  {curPlayers} <span className="text-gray-500">/ {maxPlayers}</span>
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>Occupancy</span>
                  <span className="text-cyan-400 font-bold">{capacityPercent}%</span>
                </div>
                <div className="w-full bg-carbon-950 h-2 rounded-full overflow-hidden border border-carbon-800">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      capacityPercent >= 90
                        ? 'bg-amber-500'
                        : capacityPercent >= 100
                        ? 'bg-crimson-500'
                        : 'bg-cyan-500'
                    )}
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-carbon-800/80 flex items-center justify-between text-[11px] text-gray-400">
                <span>Spectators / Slots:</span>
                <span className="text-gray-300">
                  {Math.max(0, maxPlayers - curPlayers)} slots available
                </span>
              </div>
            </div>

            {/* Direct Join Quick Arguments Card */}
            <div className="p-4 bg-carbon-900 border border-carbon-800 rounded-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  DIRECT JOIN ARGUMENT
                </span>
              </div>

              <div className="bg-carbon-950 p-2 rounded border border-carbon-800 text-[10px] text-cyan-300 break-all select-all font-mono">
                {joinArg}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-carbon-800/80">
                <Button
                  type="button"
                  variant="secondary"
                  size="xs"
                  leftIcon={copiedArg ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  onClick={copyJoinCommand}
                  className="w-full"
                >
                  {copiedArg ? 'Copied' : 'Copy Arg'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  leftIcon={<ExternalLink className="w-3 h-3" />}
                  onClick={() => setDirectConnectOpen(true)}
                  className="w-full"
                >
                  Options
                </Button>
              </div>
            </div>
          </div>

          {/* Live Scoreboard Section */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-carbon-800 pb-2">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <h3 className="font-hud font-bold text-sm tracking-wider uppercase text-gray-100">
                  LIVE THEATER SCOREBOARD
                </h3>
                <Badge variant="CYAN" size="sm">
                  {scoreboard.length} ACTIVE
                </Badge>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center space-x-1 bg-carbon-950 p-1 rounded-sm border border-carbon-800">
                <button
                  type="button"
                  onClick={() => setActiveScoreboardTab('split')}
                  className={cn(
                    'px-2.5 py-1 text-[10px] uppercase font-mono rounded-sm transition-colors',
                    activeScoreboardTab === 'split'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-gray-400 hover:text-gray-200'
                  )}
                >
                  Faction Split View
                </button>
                <button
                  type="button"
                  onClick={() => setActiveScoreboardTab('team1')}
                  className={cn(
                    'px-2.5 py-1 text-[10px] uppercase font-mono rounded-sm transition-colors',
                    activeScoreboardTab === 'team1'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-gray-400 hover:text-gray-200'
                  )}
                >
                  {team1Faction.shortName} ({team1Players.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveScoreboardTab('team2')}
                  className={cn(
                    'px-2.5 py-1 text-[10px] uppercase font-mono rounded-sm transition-colors',
                    activeScoreboardTab === 'team2'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-gray-400 hover:text-gray-200'
                  )}
                >
                  {team2Faction.shortName} ({team2Players.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveScoreboardTab('all')}
                  className={cn(
                    'px-2.5 py-1 text-[10px] uppercase font-mono rounded-sm transition-colors',
                    activeScoreboardTab === 'all'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-gray-400 hover:text-gray-200'
                  )}
                >
                  All Combatants
                </button>
              </div>
            </div>

            {/* Scoreboard Tab Content */}
            {activeScoreboardTab === 'split' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Team 1 Panel */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-cyan-950/40 border border-cyan-500/30 rounded-sm">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
                      <span className="font-hud font-bold text-xs uppercase text-cyan-300">
                        {team1Faction.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="text-gray-400">Score: <b className="text-cyan-400">{team1Score}</b></span>
                      <span className="text-gray-500">|</span>
                      <span className="text-gray-300">{team1Players.length} Soldiers</span>
                    </div>
                  </div>
                  {renderPlayerTable(team1Players)}
                </div>

                {/* Team 2 Panel */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-crimson-950/40 border border-crimson-500/30 rounded-sm">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-crimson-400 shadow-[0_0_8px_#ef4444]" />
                      <span className="font-hud font-bold text-xs uppercase text-crimson-300">
                        {team2Faction.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="text-gray-400">Score: <b className="text-crimson-400">{team2Score}</b></span>
                      <span className="text-gray-500">|</span>
                      <span className="text-gray-300">{team2Players.length} Soldiers</span>
                    </div>
                  </div>
                  {renderPlayerTable(team2Players)}
                </div>
              </div>
            ) : activeScoreboardTab === 'team1' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-cyan-950/40 border border-cyan-500/30 rounded-sm">
                  <span className="font-hud font-bold text-xs uppercase text-cyan-300">
                    {team1Faction.name} — {team1Players.length} Active Players (Score: {team1Score})
                  </span>
                </div>
                {renderPlayerTable(team1Players)}
              </div>
            ) : activeScoreboardTab === 'team2' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-crimson-950/40 border border-crimson-500/30 rounded-sm">
                  <span className="font-hud font-bold text-xs uppercase text-crimson-300">
                    {team2Faction.name} — {team2Players.length} Active Players (Score: {team2Score})
                  </span>
                </div>
                {renderPlayerTable(team2Players)}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-carbon-900 border border-carbon-800 rounded-sm text-gray-300 text-xs">
                  <span>ALL ACTIVE COMBATANTS ({scoreboard.length})</span>
                </div>
                {renderPlayerTable(scoreboard)}
              </div>
            )}
          </div>

          {/* Telemetry & Rules Card (Collapsible) */}
          <div className="border border-carbon-800 rounded-sm bg-carbon-900/60 overflow-hidden">
            <button
              type="button"
              onClick={() => setRulesExpanded(!rulesExpanded)}
              className="w-full px-4 py-3 flex items-center justify-between bg-carbon-900 hover:bg-carbon-800/80 transition-colors text-left"
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-cyan-400" />
                <span className="font-hud font-bold text-xs uppercase tracking-wider text-gray-200">
                  SERVER RULES & CVAR CONFIGURATION
                </span>
                <span className="text-[10px] text-gray-400">
                  ({Object.keys(rules).length} parameters)
                </span>
              </div>
              {rulesExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {rulesExpanded && (
              <div className="p-4 border-t border-carbon-800 space-y-3">
                {Object.keys(rules).length === 0 ? (
                  <p className="text-gray-500 text-xs font-mono">
                    No custom cvar overrides or server rules broadcasted. Server is utilizing standard EA Theater defaults.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {Object.entries(rules).map(([k, v]) => (
                      <div
                        key={k}
                        className="p-2 bg-carbon-950 border border-carbon-800/80 rounded-sm flex items-center justify-between text-xs"
                      >
                        <span className="text-gray-400 font-mono text-[11px] truncate max-w-[140px]" title={k}>
                          {k}
                        </span>
                        <span className="text-cyan-300 font-mono font-bold text-[11px] ml-2">
                          {typeof v === 'boolean'
                            ? v
                              ? 'ENABLED'
                              : 'DISABLED'
                            : typeof v === 'object'
                            ? JSON.stringify(v)
                            : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Embedded Direct Connect Modal */}
      {directConnectOpen && (
        <DirectConnectModal
          isOpen={directConnectOpen}
          onClose={() => setDirectConnectOpen(false)}
          server={server}
        />
      )}
    </>
  );
};
