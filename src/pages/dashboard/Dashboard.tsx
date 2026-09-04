import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Server,
  Users,
  Trophy,
  Download,
  Activity,
  ArrowRight,
  Radio,
  Cpu,
  Key,
  Plus,
  Copy,
  Check,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useGameStore } from '../../store/gameStore';
import { personaService } from '../../services/personaService';
import { entitlementService } from '../../services/entitlementService';
import { serverService } from '../../services/serverService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { MetricCard } from '../../components/hud/MetricCard';
import { StatusIndicator } from '../../components/hud/StatusIndicator';
import { CreatePersonaModal } from '../soldiers/CreatePersonaModal';
import { useToast } from '../../components/hud/Toast';
import { GameServer } from '../../types/server';
import { Persona } from '../../types/persona';
import { Entitlement } from '../../types/entitlement';

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { activeGame, getActiveGameConfig } = useGameStore();
  const activeConfig = getActiveGameConfig();
  const { toast } = useToast();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [copiedServerId, setCopiedServerId] = useState<string | null>(null);

  // 1. Fetch live servers
  const { data: serverData, isLoading: isServersLoading } = useQuery({
    queryKey: ['servers', activeGame],
    queryFn: async () => {
      return await serverService.getServers({ gameSlug: activeGame, isOnline: true });
    },
    refetchInterval: 15000,
  });

  const onlineServers = serverData?.servers || [];
  const topFeaturedServers = [...onlineServers]
    .sort((a, b) => (b.currentPlayers || 0) - (a.currentPlayers || 0))
    .slice(0, 3);

  // 2. Fetch user personas
  const { data: personas = [], isLoading: isPersonasLoading, refetch: refetchPersonas } = useQuery<Persona[]>({
    queryKey: ['personas', activeGame],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      return await personaService.getPersonas(activeGame);
    },
    enabled: isAuthenticated,
  });

  // 3. Fetch user entitlements
  const { data: entitlements = [] } = useQuery<Entitlement[]>({
    queryKey: ['entitlements'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      return await entitlementService.getEntitlements();
    },
    enabled: isAuthenticated,
  });

  const totalPlayersOnline = onlineServers.reduce(
    (acc, s) => acc + (s.currentPlayers || 0),
    0
  );

  const handleCopyServerIp = (srv: GameServer) => {
    const text = `${srv.ipAddress}:${srv.port}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedServerId(srv.id);
      toast.info('Server Address Copied', `Direct Connect IP: ${text}`);
      setTimeout(() => setCopiedServerId(null), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      {/* Hero / Player Command Theater Header */}
      <div className="relative rounded-sm border border-carbon-700 bg-gradient-to-r from-carbon-900 via-carbon-850 to-carbon-900 p-6 sm:p-8 overflow-hidden shadow-2xl hud-border-corners">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-vignette pointer-events-none opacity-30" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="CYAN" dot>
              THEATER ONLINE
            </Badge>
            <Badge variant="DEFAULT">FESL PORT: {activeConfig.defaultFeslPort}</Badge>
            <Badge variant="DEFAULT">THEATER PORT: {activeConfig.defaultTheaterPort}</Badge>
            {isAuthenticated && user && (
              <Badge variant="EMERALD">OPERATOR: {user.username.toUpperCase()}</Badge>
            )}
          </div>

          <h1 className="font-hud font-extrabold text-3xl sm:text-4xl uppercase tracking-wider text-gray-100 flex items-center space-x-3">
            <span>{activeConfig.name}</span>
          </h1>

          <p className="mt-2 text-sm sm:text-base font-mono text-gray-400 max-w-2xl">
            {activeConfig.tagline}
          </p>

          {/* Quick Soldier Summary in banner */}
          {isAuthenticated && (
            <div className="mt-3 flex items-center space-x-2 text-xs font-mono text-cyan-300">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>
                {personas.length > 0
                  ? `Active Personas: ${personas.map((p) => p.name).join(', ')}`
                  : `No ${activeConfig.name} soldiers active yet.`}
              </span>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/servers">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Server className="w-4 h-4" />}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Join Live Servers
              </Button>
            </Link>

            <Link to="/soldiers">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Users className="w-4 h-4" />}
              >
                Soldier Roster
              </Button>
            </Link>

            <Link to="/setup">
              <Button
                variant="outline"
                size="md"
                leftIcon={<Download className="w-4 h-4" />}
              >
                Client Setup Guide
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Soldiers"
          value={isAuthenticated ? personas.length : '—'}
          subtitle={
            isAuthenticated
              ? `${activeConfig.maxPersonasPerUser - personas.length} slots remaining`
              : 'Sign in to enlist'
          }
          icon={<Users className="w-4 h-4" />}
          accentColor="cyan"
        />

        <MetricCard
          title="Owned Game Licenses"
          value={isAuthenticated ? entitlements.length : '—'}
          subtitle={
            isAuthenticated
              ? `${entitlements.map((e) => e.gameSlug).join(', ') || '0 SKUs'}`
              : 'License library'
          }
          icon={<Key className="w-4 h-4" />}
          accentColor="emerald"
        />

        <MetricCard
          title="Global Leaderboard Rank"
          value={isAuthenticated && personas.length > 0 ? '#42' : 'TOP 10%'}
          subtitle="All-time combat telemetry"
          icon={<Trophy className="w-4 h-4" />}
          trend={{ value: 'Gold Tier', direction: 'up' }}
          accentColor="amber"
        />

        <MetricCard
          title="Online Game Servers"
          value={onlineServers.length}
          subtitle={`${totalPlayersOnline} soldiers in combat`}
          icon={<Server className="w-4 h-4" />}
          trend={{ value: 'Live Telemetry', direction: 'neutral' }}
          accentColor="cyan"
        />
      </div>

      {/* Main Grid: Active Soldiers & Featured Live Servers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Soldiers Grid & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Soldiers Card */}
          <Card
            title={`ACTIVE ${activeConfig.name.toUpperCase()} SOLDIERS`}
            subtitle={`Master Account Personas (${personas.length}/${activeConfig.maxPersonasPerUser})`}
            icon={<Shield className="w-4 h-4" />}
            accent="cyan"
            headerAction={
              isAuthenticated && (
                <Button
                  variant="outline"
                  size="xs"
                  leftIcon={<Plus className="w-3 h-3" />}
                  onClick={() => setCreateModalOpen(true)}
                  disabled={personas.length >= activeConfig.maxPersonasPerUser}
                >
                  Quick Enlist
                </Button>
              )
            }
          >
            {!isAuthenticated ? (
              <div className="text-center py-6 font-mono text-xs text-gray-400 space-y-3">
                <p>Log in with your CentralSpy account to inspect and manage your active soldiers.</p>
                <Link to="/login">
                  <Button variant="primary" size="sm">
                    Operator Login
                  </Button>
                </Link>
              </div>
            ) : isPersonasLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
                <div className="h-24 bg-carbon-950 rounded border border-carbon-800" />
                <div className="h-24 bg-carbon-950 rounded border border-carbon-800" />
              </div>
            ) : personas.length === 0 ? (
              <div className="text-center py-8 font-mono text-xs text-gray-400 space-y-3">
                <p>You have not enlisted any soldiers for {activeConfig.name} yet.</p>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setCreateModalOpen(true)}
                >
                  Enlist Your First Soldier
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {personas.map((p) => {
                  const stats = p.stats || {
                    score: 0,
                    kills: 0,
                    deaths: 0,
                    wins: 0,
                    losses: 0,
                    timePlayedSeconds: 0,
                  };

                  const kd =
                    stats.deaths > 0
                      ? (stats.kills / stats.deaths).toFixed(2)
                      : stats.kills.toFixed(2);

                  return (
                    <div
                      key={p.id}
                      className="p-3.5 bg-carbon-950/80 border border-carbon-800 rounded-sm hover:border-cyan-500/50 transition-colors font-mono text-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-sm bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400 font-bold text-xs">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-gray-100 text-sm truncate">
                            {p.name}
                          </span>
                        </div>
                        <Badge variant="ONLINE" size="sm">
                          ACTIVE
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] pt-1">
                        <div className="p-1.5 bg-carbon-900 rounded border border-carbon-800/80">
                          <span className="text-gray-500 block text-[9px] uppercase">SCORE</span>
                          <span className="text-cyan-400 font-bold">{stats.score.toLocaleString()}</span>
                        </div>
                        <div className="p-1.5 bg-carbon-900 rounded border border-carbon-800/80">
                          <span className="text-gray-500 block text-[9px] uppercase">KILLS</span>
                          <span className="text-emerald-400 font-bold">{stats.kills.toLocaleString()}</span>
                        </div>
                        <div className="p-1.5 bg-carbon-900 rounded border border-carbon-800/80">
                          <span className="text-gray-500 block text-[9px] uppercase">K/D</span>
                          <span className="text-gray-200 font-bold">{kd}</span>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-between">
                        <Link
                          to="/soldiers"
                          className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <span>Manage Roster</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                        <Link
                          to="/stats"
                          className="text-[11px] text-gray-400 hover:text-gray-200 flex items-center gap-1"
                        >
                          <span>Full Stats</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Featured Live Servers */}
          <Card
            title="FEATURED LIVE SERVERS"
            subtitle="Top populated dedicated nodes ready for combat"
            icon={<Radio className="w-4 h-4" />}
            accent="emerald"
            headerAction={
              <Link to="/servers">
                <Button variant="ghost" size="xs" rightIcon={<ArrowRight className="w-3 h-3" />}>
                  View All ({onlineServers.length})
                </Button>
              </Link>
            }
          >
            {isServersLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-16 bg-carbon-950 rounded border border-carbon-800" />
                <div className="h-16 bg-carbon-950 rounded border border-carbon-800" />
              </div>
            ) : topFeaturedServers.length === 0 ? (
              <div className="text-center py-6 font-mono text-xs text-gray-500">
                No active dedicated servers detected for {activeConfig.name}. Start a server or check back shortly.
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {topFeaturedServers.map((srv) => {
                  const cur = srv.currentPlayers || 0;
                  const max = srv.maxPlayers || 64;
                  const percent = Math.min(100, Math.round((cur / max) * 100));
                  const isCopied = copiedServerId === srv.id;

                  return (
                    <div
                      key={srv.id}
                      className="p-3 bg-carbon-950/80 border border-carbon-800 rounded-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-cyan-500/40 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <StatusIndicator status="online" size="sm" />
                          <span className="font-bold text-gray-100 text-sm truncate">
                            {srv.name}
                          </span>
                          {srv.isRanked && <Badge variant="RANKED" size="sm">RANKED</Badge>}
                        </div>

                        <div className="flex items-center space-x-3 text-[11px] text-gray-400 mt-1">
                          <span>Map: {srv.mapName || 'Suez Canal 2142'}</span>
                          <span>•</span>
                          <span>Mode: {srv.gameMode || 'Titan'}</span>
                          <span>•</span>
                          <span className="text-gray-500">{srv.ipAddress}:{srv.port}</span>
                        </div>
                      </div>

                      {/* Player bar & join shortcut */}
                      <div className="flex items-center space-x-4">
                        <div className="w-24 flex flex-col space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-cyan-400 font-bold">{cur}</span>
                            <span className="text-gray-500">/ {max}</span>
                          </div>
                          <div className="w-full bg-carbon-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="xs"
                          leftIcon={
                            isCopied ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )
                          }
                          onClick={() => handleCopyServerIp(srv)}
                        >
                          {isCopied ? 'Copied' : 'Copy IP'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right 1 Col: Quick Actions & Protocol Directives */}
        <div className="space-y-6">
          {/* Tactical Quick Actions Card */}
          <Card
            title="TACTICAL QUICK ACTIONS"
            subtitle="Fast Portal Directives"
            icon={<Cpu className="w-4 h-4" />}
            accent="cyan"
          >
            <div className="flex flex-col space-y-2.5 font-mono text-xs">
              <Link to="/account?tab=licenses">
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<Key className="w-4 h-4 text-cyan-400" />}
                  className="w-full justify-start text-left"
                >
                  Claim Serial CD Key
                </Button>
              </Link>

              <Button
                variant="secondary"
                size="md"
                leftIcon={<Plus className="w-4 h-4 text-emerald-400" />}
                onClick={() => setCreateModalOpen(true)}
                disabled={!isAuthenticated || personas.length >= activeConfig.maxPersonasPerUser}
                className="w-full justify-start text-left"
              >
                Add Soldier Persona
              </Button>

              <Link to="/servers">
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<Server className="w-4 h-4 text-cyan-400" />}
                  className="w-full justify-start text-left"
                >
                  Browse Dedicated Servers
                </Button>
              </Link>

              <Link to="/setup">
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<Download className="w-4 h-4 text-amber-400" />}
                  className="w-full justify-start text-left"
                >
                  Download Setup Guide
                </Button>
              </Link>
            </div>
          </Card>

          {/* Connection Directives Mini Card */}
          <Card
            title="PROTOCOL DIRECTIVES"
            subtitle="CentralSpy Legacy FESL DNS Specs"
            icon={<Activity className="w-4 h-4" />}
          >
            <div className="space-y-3 font-mono text-xs text-gray-300">
              <p className="text-[11px] text-gray-400">
                Ensure client resolution points to this host in your system{' '}
                <code className="bg-carbon-950 px-1 py-0.5 rounded text-cyan-400 border border-carbon-800">
                  hosts
                </code>{' '}
                file:
              </p>

              <div className="p-2.5 bg-carbon-950 rounded-sm border border-carbon-800 text-[11px] text-gray-300 select-all space-y-0.5">
                <div>127.0.0.1  fesl.ea.com</div>
                <div>127.0.0.1  theater.ea.com</div>
                <div>127.0.0.1  mohpa.fesl.ea.com</div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Partition: {activeConfig.domainPartition}</span>
                <Link to="/setup" className="text-cyan-400 hover:underline">
                  Full Guide →
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Create Persona Modal */}
      <CreatePersonaModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        defaultGameSlug={activeGame}
        currentPersonaCount={personas.length}
        maxPersonas={activeConfig.maxPersonasPerUser || 4}
        onPersonaCreated={() => refetchPersonas()}
      />
    </div>
  );
};

export default Dashboard;
