import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Trophy,
  Medal,
  Crosshair,
  Award,
  Flame,
  RefreshCw,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { statsService, LeaderboardSortOption } from '../../services/statsService';
import { useGameStore } from '../../store/gameStore';
import { GAMES, SupportedGameSlug } from '../../types/game';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';

export const Leaderboards: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeGame, setActiveGame } = useGameStore();

  // URL game param or fallback to store activeGame
  const queryGame = searchParams.get('game') as SupportedGameSlug | null;
  const selectedGame = queryGame && GAMES.some((g) => g.slug === queryGame) ? queryGame : activeGame;

  // URL sort param or fallback to 'score'
  const querySort = searchParams.get('sort') as LeaderboardSortOption | null;
  const sortBy: LeaderboardSortOption =
    querySort && ['score', 'kills', 'wins', 'playtime'].includes(querySort)
      ? querySort
      : 'score';

  const [searchFilter, setSearchFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const activeGameConfig = GAMES.find((g) => g.slug === selectedGame) || GAMES[0];

  // Fetch leaderboard data from API
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['leaderboard', selectedGame, sortBy],
    queryFn: () => statsService.getLeaderboard(selectedGame, sortBy, 100, 0),
  });

  const rawLeaderboard = data?.leaderboard || [];

  // Filter leaderboard by soldier name
  const filteredLeaderboard = useMemo(() => {
    if (!searchFilter.trim()) return rawLeaderboard;
    const q = searchFilter.toLowerCase().trim();
    return rawLeaderboard.filter((entry) => {
      const name = entry.name || entry.personaName || '';
      return name.toLowerCase().includes(q);
    });
  }, [rawLeaderboard, searchFilter]);

  // Paginated records
  const totalPages = Math.ceil(filteredLeaderboard.length / pageSize) || 1;
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeaderboard.slice(start, start + pageSize);
  }, [filteredLeaderboard, currentPage, pageSize]);

  // Handle Game Switching
  const handleGameChange = (slug: SupportedGameSlug) => {
    setActiveGame(slug);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('game', slug);
    setSearchParams(newParams);
  };

  // Handle Sort Change
  const handleSortChange = (newSort: LeaderboardSortOption) => {
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', newSort);
    setSearchParams(newParams);
  };

  // Top fragger / high scorer / stats for summary banner
  const topScorer = rawLeaderboard[0];
  const topFragger = useMemo(() => {
    if (!rawLeaderboard.length) return null;
    return [...rawLeaderboard].sort((a, b) => b.kills - a.kills)[0];
  }, [rawLeaderboard]);
  const mostWins = useMemo(() => {
    if (!rawLeaderboard.length) return null;
    return [...rawLeaderboard].sort((a, b) => b.wins - a.wins)[0];
  }, [rawLeaderboard]);

  const sortTabs: { id: LeaderboardSortOption; label: string; icon: React.ReactNode }[] = [
    { id: 'score', label: 'Top Score', icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'kills', label: 'Most Kills', icon: <Crosshair className="w-3.5 h-3.5" /> },
    { id: 'wins', label: 'Most Victories', icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'playtime', label: 'Combat Playtime', icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Stats</h1>
          <p className="text-sm text-ink-muted mt-1">
            {activeGameConfig.name} leaderboard
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RefreshCw className={cn('w-3.5 h-3.5', isFetching ? 'animate-spin' : '')} />}
          onClick={() => refetch()}
          disabled={isFetching}
        >
          Refresh
        </Button>
      </div>

      {/* Game Switcher Tabs */}
      <div className="bg-sand-50 border border-sand-200 rounded-xl p-1.5">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {GAMES.map((game) => {
            const isSelected = game.slug === selectedGame;
            return (
              <button
                key={game.slug}
                onClick={() => handleGameChange(game.slug)}
                className={cn(
                  'flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm whitespace-nowrap',
                  isSelected
                    ? 'bg-olive-50 text-olive-800 font-medium'
                    : 'text-ink-muted hover:text-ink hover:bg-sand-100'
                )}
              >
                <span>{game.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Highlight Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-sand-50 border border-sand-200 rounded-xl p-4 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-ink-muted">Top score</span>
            <div className="font-semibold text-lg text-ink truncate mt-0.5">
              {topScorer ? (topScorer.name || topScorer.personaName || '—') : '—'}
            </div>
            <span className="text-xs text-ink-muted">
              {topScorer ? `${topScorer.score.toLocaleString()} pts` : 'No data yet'}
            </span>
          </div>
          <Trophy className="w-5 h-5 text-olive-600" />
        </div>

        <div className="bg-sand-50 border border-sand-200 rounded-xl p-4 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-ink-muted">Most kills</span>
            <div className="font-semibold text-lg text-ink truncate mt-0.5">
              {topFragger ? (topFragger.name || topFragger.personaName || '—') : '—'}
            </div>
            <span className="text-xs text-ink-muted">
              {topFragger ? `${topFragger.kills.toLocaleString()} kills` : 'No data yet'}
            </span>
          </div>
          <Crosshair className="w-5 h-5 text-olive-600" />
        </div>

        <div className="bg-sand-50 border border-sand-200 rounded-xl p-4 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-ink-muted">Most wins</span>
            <div className="font-semibold text-lg text-ink truncate mt-0.5">
              {mostWins ? (mostWins.name || mostWins.personaName || '—') : '—'}
            </div>
            <span className="text-xs text-ink-muted">
              {mostWins ? `${mostWins.wins.toLocaleString()} wins` : 'No data yet'}
            </span>
          </div>
          <Award className="w-5 h-5 text-olive-600" />
        </div>
      </div>

      {/* Main Leaderboard Section */}
      <Card
        title="Leaderboard"
        subtitle={`${activeGameConfig.name} · ${rawLeaderboard.length} records`}
        icon={<Flame className="w-4 h-4 text-olive-600" />}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-sand-200 pb-4 mb-4">
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
            {sortTabs.map((tab) => {
              const isActive = sortBy === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSortChange(tab.id)}
                  className={cn(
                    'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap',
                    isActive
                      ? 'bg-olive-50 text-olive-800 font-medium'
                      : 'text-ink-muted hover:text-ink hover:bg-sand-100'
                  )}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-ink-faint pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter by soldier name"
              className="w-full bg-sand-50 border border-sand-300 text-ink placeholder-ink-faint rounded-lg text-sm pl-9 pr-3 py-1.5 focus:outline-none focus:border-olive-400 focus:ring-2 focus:ring-olive-500/20"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-xl border border-sand-200 bg-sand-50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-sand-200 bg-sand-100 text-xs font-medium text-ink-muted">
                <th className="px-3.5 py-3 text-center w-16">Rank</th>
                <th className="px-4 py-3">Soldier</th>
                <th className="px-3 py-3 text-right">Score</th>
                <th className="px-3 py-3 text-right">Kills</th>
                <th className="px-3 py-3 text-right">Deaths</th>
                <th className="px-3 py-3 text-center">K/D</th>
                <th className="px-3 py-3 text-right">Wins</th>
                <th className="px-3 py-3 text-right">Losses</th>
                <th className="px-3 py-3 text-center">Win rate</th>
                <th className="px-4 py-3 text-right">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 text-sm text-ink">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center">
                    <p className="text-sm font-medium text-ink">Loading rankings…</p>
                  </td>
                </tr>
              ) : paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Shield className="w-8 h-8 text-olive-600" />
                      <p className="text-sm font-medium text-ink">
                        No rankings yet for {activeGameConfig.name}.
                      </p>
                      <p className="text-sm text-ink-muted max-w-md">
                        Play multiplayer matches to appear on the leaderboard.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedEntries.map((entry, index) => {
                  const absoluteRank = (currentPage - 1) * pageSize + index + 1;
                  const kd =
                    entry.deaths > 0
                      ? (entry.kills / entry.deaths).toFixed(2)
                      : entry.kills > 0
                      ? `${entry.kills}.00`
                      : '0.00';
                  const totalGames = entry.wins + entry.losses;
                  const winRate =
                    totalGames > 0
                      ? `${((entry.wins / totalGames) * 100).toFixed(1)}%`
                      : '0.0%';
                  const hours = (entry.timePlayedSeconds / 3600).toFixed(1);

                  // Rank Medals & Accents
                  const isGold = absoluteRank === 1;
                  const isSilver = absoluteRank === 2;
                  const isBronze = absoluteRank === 3;

                  const entryName = entry.name || entry.personaName || 'Unknown';

                  return (
                    <tr
                      key={entry.personaId || `${entryName}-${index}`}
                      className={cn(
                        'transition-colors duration-100 group hover:bg-olive-50',
                        index % 2 === 0 ? 'bg-sand-50' : 'bg-sand-100/60'
                      )}
                    >
                      {/* Rank Position */}
                      <td className="px-3.5 py-3 text-center">
                        {isGold && (
                          <span className="inline-flex items-center justify-center gap-1 font-semibold text-olive-800 bg-olive-50 px-2 py-0.5 rounded-full">
                            <Medal className="w-3.5 h-3.5" /> #1
                          </span>
                        )}
                        {isSilver && (
                          <span className="inline-flex items-center justify-center gap-1 font-semibold text-ink bg-sand-200 px-2 py-0.5 rounded-full">
                            <Medal className="w-3.5 h-3.5" /> #2
                          </span>
                        )}
                        {isBronze && (
                          <span className="inline-flex items-center justify-center gap-1 font-semibold text-ink-muted bg-sand-200 px-2 py-0.5 rounded-full">
                            <Medal className="w-3.5 h-3.5" /> #3
                          </span>
                        )}
                        {!isGold && !isSilver && !isBronze && (
                          <span className="text-ink-muted tabular-nums">#{absoluteRank}</span>
                        )}
                      </td>

                      {/* Persona Callsign */}
                      <td className="px-4 py-3">
                        <Link
                          to={`/stats/player/${encodeURIComponent(entryName)}?game=${selectedGame}`}
                          className="flex items-center space-x-2 text-ink hover:text-olive-700"
                        >
                          <div className="w-6 h-6 rounded-full bg-olive-50 text-olive-800 flex items-center justify-center text-[10px] font-semibold">
                            {(entryName || '?').slice(0, 1).toUpperCase()}
                          </div>
                          <span className="font-medium">
                            {entryName}
                          </span>
                          <ExternalLink className="w-3 h-3 text-ink-faint opacity-0 group-hover:opacity-100" />
                        </Link>
                      </td>

                      {/* Score */}
                      <td className="px-3 py-3 text-right">
                        <span className="font-semibold tabular-nums text-ink">
                          {entry.score.toLocaleString()}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-right">
                        <span className="tabular-nums text-ink">
                          {entry.kills.toLocaleString()}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-right">
                        <span className="tabular-nums text-ink-muted">
                          {entry.deaths.toLocaleString()}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <span className="tabular-nums text-ink">{kd}</span>
                      </td>

                      <td className="px-3 py-3 text-right">
                        <span className="tabular-nums text-ink">
                          {entry.wins.toLocaleString()}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-right">
                        <span className="tabular-nums text-ink-muted">
                          {entry.losses.toLocaleString()}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <span className="tabular-nums text-ink">{winRate}</span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span className="tabular-nums text-ink-muted">{hours}h</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-sand-200 text-sm text-ink-muted">
            <div>
              Showing <span className="text-ink font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="text-ink font-medium">
                {Math.min(currentPage * pageSize, filteredLeaderboard.length)}
              </span>{' '}
              of <span className="text-ink font-medium">{filteredLeaderboard.length}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-sand-300 text-ink hover:bg-sand-100 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2.5 py-1 text-ink">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-sand-300 text-ink hover:bg-sand-100 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Leaderboards;
