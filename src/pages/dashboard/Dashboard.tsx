import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Plus, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useGameStore } from '../../store/gameStore';
import { personaService } from '../../services/personaService';
import { serverService } from '../../services/serverService';
import { Button } from '../../components/common/Button';
import { CreatePersonaModal } from '../soldiers/CreatePersonaModal';
import { useToast } from '../../components/hud/Toast';
import { GameServer } from '../../types/server';
import { Persona } from '../../types/persona';
import { cn } from '../../utils/cn';

export const Dashboard: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { activeGame, getActiveGameConfig } = useGameStore();
  const activeConfig = getActiveGameConfig();
  const { toast } = useToast();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);

  const { data: serverData, isLoading: isServersLoading } = useQuery({
    queryKey: ['servers', activeGame],
    queryFn: async () => {
      return await serverService.getServers({ gameSlug: activeGame, isOnline: true });
    },
    refetchInterval: 15000,
  });

  const onlineServers = serverData?.servers || [];
  const listedServers = [...onlineServers]
    .sort((a, b) => (b.currentPlayers || 0) - (a.currentPlayers || 0))
    .slice(0, 8);

  const { data: personas = [], isLoading: isPersonasLoading, refetch: refetchPersonas } = useQuery<Persona[]>({
    queryKey: ['personas', activeGame],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      return await personaService.getPersonas(activeGame);
    },
    enabled: isAuthenticated,
  });

  const activeSelection = selectedServerId
    ? listedServers.find((s) => s.id === selectedServerId)
    : listedServers[0];

  const handleJoin = (srv: GameServer) => {
    const text = `${srv.ipAddress}:${srv.port}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success('Address copied', `${srv.name} — ${text}`);
    }
  };

  const openSlots = Math.max(0, (activeConfig.maxPersonasPerUser || 4) - personas.length);

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {activeConfig.name} · FESL {activeConfig.defaultFeslPort} · Theater {activeConfig.defaultTheaterPort}
        </p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-ink">Soldiers</h2>
          {isAuthenticated && openSlots > 0 && (
            <Button variant="ghost" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateModalOpen(true)}>
              New soldier
            </Button>
          )}
        </div>

        {!isAuthenticated ? (
          <div className="rounded-xl border border-sand-200 bg-sand-50 p-6 shadow-soft">
            <p className="text-sm text-ink-muted mb-4">
              Log in to manage your soldiers and join a server.
            </p>
            <Link to="/login">
              <Button variant="primary" size="sm">
                Log in
              </Button>
            </Link>
          </div>
        ) : isPersonasLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-32 rounded-xl bg-sand-200/70 animate-pulse" />
            <div className="h-32 rounded-xl bg-sand-200/70 animate-pulse" />
            <div className="h-32 rounded-xl bg-sand-200/50 animate-pulse" />
          </div>
        ) : personas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-sand-300 bg-sand-50 p-8 text-center">
            <Users className="w-6 h-6 text-olive-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-ink mb-4">You don’t have a soldier yet.</p>
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateModalOpen(true)}>
              Create soldier
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {personas.map((p) => {
              const stats = p.stats;
              const hours = stats?.timePlayedSeconds
                ? Math.round(stats.timePlayedSeconds / 3600)
                : 0;
              return (
                <Link
                  key={p.id}
                  to="/soldiers"
                  className="rounded-xl border border-sand-200 bg-sand-50 p-4 shadow-soft hover:border-olive-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-ink truncate">{p.name}</p>
                    {p.isActive && (
                      <span className="text-[11px] font-medium text-olive-700 bg-olive-50 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-2xl font-semibold tabular-nums text-ink">
                    {(stats?.score || 0).toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-ink-faint">{hours}h played</p>
                </Link>
              );
            })}

            {openSlots > 0 && (
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="rounded-xl border border-dashed border-sand-300 min-h-[8rem] flex flex-col items-center justify-center text-ink-muted hover:border-olive-300 hover:text-olive-700 hover:bg-sand-50 transition-colors"
              >
                <Plus className="w-5 h-5 mb-1" />
                <span className="text-sm font-medium">New soldier</span>
                <span className="mt-0.5 text-xs text-ink-faint">
                  {personas.length}/{activeConfig.maxPersonasPerUser || 4} used
                </span>
              </button>
            )}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-ink">Live servers</h2>
          <Link to="/servers" className="text-sm text-olive-700 hover:text-olive-800 inline-flex items-center gap-1">
            All servers
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="rounded-xl border border-sand-200 bg-sand-50 shadow-soft overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-medium text-ink-muted border-b border-sand-200">
                <th className="px-4 py-3">Server</th>
                <th className="px-4 py-3">Map</th>
                <th className="px-4 py-3">Players</th>
                <th className="px-4 py-3">Ping</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {isServersLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm font-medium text-ink">
                    Loading servers…
                  </td>
                </tr>
              ) : listedServers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm font-medium text-ink">
                    No live servers right now.
                  </td>
                </tr>
              ) : (
                listedServers.map((srv) => {
                  const selected = activeSelection?.id === srv.id;
                  const cur = srv.currentPlayers || 0;
                  const max = srv.maxPlayers || 32;
                  return (
                    <tr
                      key={srv.id}
                      onClick={() => setSelectedServerId(srv.id)}
                      className={cn(
                        'text-sm border-b border-sand-200 last:border-0 cursor-pointer',
                        selected ? 'bg-olive-50' : 'hover:bg-sand-100'
                      )}
                    >
                      <td className="px-4 py-3 font-medium text-ink">{srv.name}</td>
                      <td className="px-4 py-3 text-ink-muted">{srv.mapName || '—'}</td>
                      <td className="px-4 py-3 tabular-nums text-ink">
                        {cur}/{max}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-ink-muted">
                        {srv.ping != null ? `${srv.ping} ms` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {selected && (
                          <Button
                            type="button"
                            variant="primary"
                            size="xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoin(srv);
                            }}
                          >
                            Join
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3">
          <Link to="/setup" className="text-sm text-olive-700 hover:text-olive-800 inline-flex items-center gap-1">
            Client setup
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

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
