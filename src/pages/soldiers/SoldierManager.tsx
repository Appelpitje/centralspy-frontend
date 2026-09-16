import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Plus,
  Shield,
  Clock,
  Crosshair,
  Trophy,
  Award,
  Trash2,
  ExternalLink,
  Gamepad2,
  Skull,
  Flame,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useGameStore } from '../../store/gameStore';
import { personaService } from '../../services/personaService';
import { GAMES, SupportedGameSlug } from '../../types/game';
import { Persona } from '../../types/persona';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Tabs } from '../../components/common/Tabs';
import { CreatePersonaModal } from './CreatePersonaModal';
import { DeletePersonaModal } from './DeletePersonaModal';

export const SoldierManager: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { activeGame, setActiveGame, getActiveGameConfig } = useGameStore();
  const activeConfig = getActiveGameConfig();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [personaToDelete, setPersonaToDelete] = useState<Persona | null>(null);

  // Fetch personas for the selected game
  const { data: personas = [], isLoading, refetch } = useQuery<Persona[]>({
    queryKey: ['personas', activeGame],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      return await personaService.getPersonas(activeGame);
    },
    enabled: isAuthenticated,
  });

  const maxPersonas = activeConfig.maxPersonasPerUser || 4;
  const currentCount = personas.length;
  const progressPercent = Math.min(100, Math.round((currentCount / maxPersonas) * 100));

  const gameTabs = GAMES.map((g) => ({
    id: g.slug,
    label: g.name,
    icon: <Gamepad2 className="w-3.5 h-3.5" />,
  }));

  const handleTabChange = (slug: string) => {
    setActiveGame(slug as SupportedGameSlug);
  };

  // Helper function to format combat time
  const formatCombatTime = (seconds: number = 0) => {
    if (!seconds) return '0 hrs';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      {/* Top Header & Enlist Action */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-sand-200 pb-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              Soldiers
            </h1>
            <Badge variant="CYAN">{activeConfig.name}</Badge>
          </div>
          <p className="text-sm text-ink-muted mt-1">
            Create and manage your {activeConfig.name} soldiers.
          </p>
        </div>

        {isAuthenticated && (
          <div className="flex items-center space-x-3">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setCreateModalOpen(true)}
              disabled={currentCount >= maxPersonas}
            >
              Enlist New Soldier
            </Button>
          </div>
        )}
      </div>

      {/* Game Selector Tabs */}
      <Tabs
        tabs={gameTabs}
        activeTab={activeGame}
        onChange={handleTabChange}
      />

      {/* Roster Limit Progress Bar */}
      {isAuthenticated && (
        <div className="p-4 bg-sand-50 border border-sand-200 rounded-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-mono text-xs">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <span className="font-bold text-ink uppercase">
                {activeConfig.name} Soldier Roster Status
              </span>
              <p className="text-[11px] text-ink-muted">
                {currentCount >= maxPersonas
                  ? 'Maximum capacity reached for this game title.'
                  : `${maxPersonas - currentCount} deployment slot(s) available.`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:min-w-[200px]">
            <div className="w-full bg-sand-50 border border-sand-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  currentCount >= maxPersonas ? 'bg-amber-500' : 'bg-cyan-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-ink whitespace-nowrap">
              {currentCount} / {maxPersonas}
            </span>
          </div>
        </div>
      )}

      {/* Roster Cards List */}
      {!isAuthenticated ? (
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto space-y-3 font-mono">
            <Users className="w-10 h-10 text-olive-600 mx-auto" />
            <h3 className="text-lg font-semibold text-ink">
              Log in to manage soldiers
            </h3>
            <p className="text-sm text-ink-muted">
              Sign in to view, create, or manage soldiers for {activeConfig.name}.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link to="/login">
                <Button variant="primary" size="md">
                  Operator Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" size="md">
                  Register Account
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="hud-card p-6 animate-pulse space-y-4">
              <div className="h-5 bg-sand-300 rounded w-1/2" />
              <div className="h-10 bg-sand-300 rounded w-3/4" />
              <div className="h-4 bg-sand-300 rounded w-full" />
            </div>
          ))}
        </div>
      ) : personas.length === 0 ? (
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto space-y-3 font-mono">
            <Users className="w-10 h-10 text-olive-600 mx-auto" />
            <h3 className="text-lg font-semibold text-ink">
              No soldiers yet
            </h3>
            <p className="text-sm text-ink-muted">
              Create a soldier for {activeConfig.name} to join live servers.
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setCreateModalOpen(true)}
              >
                Enlist First Soldier
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.map((p) => {
            const stats = p.stats || {
              score: 0,
              kills: 0,
              deaths: 0,
              wins: 0,
              losses: 0,
              timePlayedSeconds: 0,
            };

            const kdRatio =
              stats.deaths > 0
                ? (stats.kills / stats.deaths).toFixed(2)
                : stats.kills.toFixed(2);

            const winRate =
              stats.wins + stats.losses > 0
                ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100)
                : 0;

            return (
              <Card
                key={p.id}
                title={p.name}
                subtitle={`Persona ID: ${p.id.slice(0, 8)}...`}
                icon={<Shield className="w-4 h-4" />}
                accent="cyan"
                headerAction={
                  <Badge variant="ONLINE" dot size="sm">
                    READY
                  </Badge>
                }
              >
                <div className="space-y-4 font-mono text-xs">
                  {/* Primary Score & Kills Badge Row */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 bg-sand-50 border border-sand-200 rounded-sm">
                      <span className="text-[10px] text-ink-muted block uppercase flex items-center justify-center gap-1">
                        <Trophy className="w-3 h-3 text-cyan-400" />
                        TOTAL SCORE
                      </span>
                      <span className="text-cyan-400 font-bold text-base">
                        {stats.score.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-2.5 bg-sand-50 border border-sand-200 rounded-sm">
                      <span className="text-[10px] text-ink-muted block uppercase flex items-center justify-center gap-1">
                        <Flame className="w-3 h-3 text-emerald-400" />
                        CONFIRMED KILLS
                      </span>
                      <span className="text-emerald-400 font-bold text-base">
                        {stats.kills.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Telemetry Metric Breakdown */}
                  <div className="space-y-2 pt-2 border-t border-sand-200 text-ink">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-ink-muted">
                        <Crosshair className="w-3.5 h-3.5 text-ink-muted" />
                        K/D Ratio:
                      </span>
                      <span className="text-ink font-bold">{kdRatio}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-ink-muted">
                        <Skull className="w-3.5 h-3.5 text-ink-muted" />
                        Deaths:
                      </span>
                      <span className="text-ink">{stats.deaths.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-ink-muted">
                        <Award className="w-3.5 h-3.5 text-ink-muted" />
                        Win / Loss:
                      </span>
                      <span className="text-ink">
                        {stats.wins}W / {stats.losses}L ({winRate}%)
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-ink-muted">
                        <Clock className="w-3.5 h-3.5 text-ink-muted" />
                        Combat Time:
                      </span>
                      <span className="text-ink">{formatCombatTime(stats.timePlayedSeconds)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-ink-muted pt-1 border-t border-sand-200">
                      <span>Enlisted:</span>
                      <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-sand-200 flex items-center justify-between gap-2">
                    <Link to="/stats" className="flex-1">
                      <Button
                        variant="secondary"
                        size="xs"
                        leftIcon={<ExternalLink className="w-3 h-3" />}
                        className="w-full"
                      >
                        View Full Dossier
                      </Button>
                    </Link>

                    <Button
                      variant="danger"
                      size="xs"
                      leftIcon={<Trash2 className="w-3 h-3" />}
                      onClick={() => setPersonaToDelete(p)}
                      title="Discharge Persona"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Enlist Persona Modal */}
      <CreatePersonaModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        defaultGameSlug={activeGame}
        currentPersonaCount={currentCount}
        maxPersonas={maxPersonas}
        onPersonaCreated={() => refetch()}
      />

      {/* Delete Persona Confirmation Modal */}
      <DeletePersonaModal
        isOpen={!!personaToDelete}
        onClose={() => setPersonaToDelete(null)}
        persona={personaToDelete}
        onPersonaDeleted={() => refetch()}
      />
    </div>
  );
};

export default SoldierManager;
