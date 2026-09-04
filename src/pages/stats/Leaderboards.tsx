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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-carbon-800 pb-4">
        <div>
          <div className="flex items-center space-x-2.5 flex-wrap">
            <h1 className="font-hud font-bold text-2xl uppercase tracking-wider text-gray-100">
              GLOBAL LEADERBOARDS & RANKINGS
            </h1>
            <Badge variant="CYAN">{activeGameConfig.name}</Badge>
          </div>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Official combat telemetry & operative rankings recorded across the CentralSpy theater.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={cn('w-3.5 h-3.5', isFetching ? 'animate-spin' : '')} />}
            onClick={() => refetch()}
            disabled={isFetching}
          >
            Refresh Telemetry
          </Button>
        </div>
      </div>

      {/* Game Switcher Tabs */}
      <div className="bg-carbon-900/90 border border-carbon-800 rounded-sm p-1.5 shadow-sm">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {GAMES.map((game) => {
            const isSelected = game.slug === selectedGame;
            return (
              <button
                key={game.slug}
                onClick={() => handleGameChange(game.slug)}
                className={cn(
                  'flex items-center space-x-2 px-3.5 py-2 rounded-sm font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-150 whitespace-nowrap focus:outline-none',
                  isSelected
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-carbon-800/80 border border-transparent'
                )}
              >
                <span className={cn('w-2 h-2 rounded-full', isSelected ? 'bg-cyan-400 animate-pulse' : 'bg-carbon-600')} />
                <span>{game.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Highlight Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="hud-card p-3.5 rounded-sm border-l-2 border-l-amber-500 shadow-[inset_2px_0_8px_-2px_rgba(245,158,11,0.25)] flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase text-gray-400 tracking-wider">
              TOP SCORING OPERATIVE
            </span>
            <div className="font-hud font-bold text-lg text-amber-300 truncate mt-0.5">
              {topScorer ? (topScorer.name || topScorer.personaName || '—') : '—'}
            </div>
            <span className="text-[11px] font-mono text-gray-400">
              {topScorer ? `${topScorer.score.toLocaleString()} PTS` : 'Awaiting data'}
            </span>
          </div>
          <div className="p-2.5 rounded-sm bg-amber-950/60 border border-amber-800/60 text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        <div className="hud-card p-3.5 rounded-sm border-l-2 border-l-crimson-500 shadow-[inset_2px_0_8px_-2px_rgba(239,68,68,0.25)] flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase text-gray-400 tracking-wider">
              TOP SECTOR FRAGGER
            </span>
            <div className="font-hud font-bold text-lg text-crimson-300 truncate mt-0.5">
              {topFragger ? (topFragger.name || topFragger.personaName || '—') : '—'}
            </div>
            <span className="text-[11px] font-mono text-gray-400">
              {topFragger ? `${topFragger.kills.toLocaleString()} KILLS` : 'Awaiting data'}
            </span>
          </div>
          <div className="p-2.5 rounded-sm bg-crimson-950/60 border border-crimson-800/60 text-crimson-400">
            <Crosshair className="w-5 h-5" />
          </div>
        </div>

        <div className="hud-card p-3.5 rounded-sm border-l-2 border-l-emerald-500 shadow-[inset_2px_0_8px_-2px_rgba(16,185,129,0.25)] flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase text-gray-400 tracking-wider">
              MOST COMBAT VICTORIES
            </span>
            <div className="font-hud font-bold text-lg text-emerald-300 truncate mt-0.5">
              {mostWins ? (mostWins.name || mostWins.personaName || '—') : '—'}
            </div>
            <span className="text-[11px] font-mono text-gray-400">
              {mostWins ? `${mostWins.wins.toLocaleString()} WINS` : 'Awaiting data'}
            </span>
          </div>
          <div className="p-2.5 rounded-sm bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Leaderboard Section */}
      <Card
        title={`VETERAN ROSTER // ${sortBy.toUpperCase()} ORDER`}
        subtitle={`${activeGameConfig.name} • ${rawLeaderboard.length} Verified Records`}
        icon={<Flame className="w-4 h-4 text-amber-400" />}
        accent="amber"
      >
        {/* Controls Row: Sort Tabs & Live Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-carbon-800 pb-4 mb-4">
          {/* Sorting Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
            {sortTabs.map((tab) => {
              const isActive = sortBy === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSortChange(tab.id)}
                  className={cn(
                    'flex items-center space-x-1.5 px-3 py-1.5 rounded-sm font-mono text-xs uppercase tracking-wider transition-all duration-150 font-medium whitespace-nowrap focus:outline-none',
                    isActive
                      ? 'bg-carbon-800 text-cyan-400 border border-cyan-500/50 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-carbon-800/50 border border-transparent'
                  )}
                >
                  <span className={isActive ? 'text-cyan-400' : 'text-gray-500'}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter soldier callsign..."
              className="w-full bg-carbon-900 border border-carbon-700 text-gray-200 placeholder-gray-500 rounded-sm text-xs font-mono pl-9 pr-3 py-1.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-sm border border-carbon-800 bg-carbon-950/60">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-carbon-800 bg-carbon-900/80 font-mono text-[11px] uppercase tracking-wider text-gray-400">
                <th className="px-3.5 py-3 text-center w-16">RANK</th>
                <th className="px-4 py-3">SOLDIER CALLSIGN</th>
                <th className="px-3 py-3 text-right">SCORE</th>
                <th className="px-3 py-3 text-right">KILLS</th>
                <th className="px-3 py-3 text-right">DEATHS</th>
                <th className="px-3 py-3 text-center">K/D</th>
                <th className="px-3 py-3 text-right">WINS</th>
                <th className="px-3 py-3 text-right">LOSSES</th>
                <th className="px-3 py-3 text-center">WIN RATE</th>
                <th className="px-4 py-3 text-right">COMBAT HOURS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-800/60 font-mono text-xs">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse bg-carbon-900/20">
                    <td className="px-3.5 py-3.5 text-center">
                      <div className="h-4 w-6 bg-carbon-800 rounded mx-auto" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-32 bg-carbon-800 rounded" />
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <div className="h-4 w-16 bg-carbon-800 rounded ml-auto" />
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <div className="h-4 w-12 bg-carbon-800 rounded ml-auto" />
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <div className="h-4 w-12 bg-carbon-800 rounded ml-auto" />
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <div className="h-4 w-10 bg-carbon-800 rounded mx-auto" />
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <div className="h-4 w-10 bg-carbon-800 rounded ml-auto" />
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <div className="h-4 w-10 bg-carbon-800 rounded ml-auto" />
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <div className="h-4 w-12 bg-carbon-800 rounded mx-auto" />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="h-4 w-14 bg-carbon-800 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : paginatedEntries.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-12 text-center text-gray-500 font-mono text-xs tracking-wider uppercase"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Shield className="w-8 h-8 text-carbon-600" />
                      <p>No telemetry recorded for {activeGameConfig.name}.</p>
                      <span className="text-[10px] text-gray-600">
                        Deploy soldiers in multiplayer matches to appear on sector leaderboards.
                      </span>
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
                        'transition-colors duration-100 group hover:bg-carbon-900/60',
                        isGold ? 'bg-amber-950/20' : isSilver ? 'bg-slate-900/20' : isBronze ? 'bg-amber-900/10' : index % 2 === 0 ? 'bg-carbon-950/40' : 'bg-carbon-900/20'
                      )}
                    >
                      {/* Rank Position */}
                      <td className="px-3.5 py-3 text-center">
                        {isGold && (
                          <span className="inline-flex items-center justify-center gap-1 font-bold text-amber-400 bg-amber-950/60 border border-amber-500/50 px-2 py-0.5 rounded-sm shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                            <Medal className="w-3.5 h-3.5" /> #1
                          </span>
                        )}
                        {isSilver && (
                          <span className="inline-flex items-center justify-center gap-1 font-bold text-gray-200 bg-slate-800/80 border border-gray-400/50 px-2 py-0.5 rounded-sm shadow-[0_0_8px_rgba(203,213,225,0.2)]">
                            <Medal className="w-3.5 h-3.5" /> #2
                          </span>
                        )}
                        {isBronze && (
                          <span className="inline-flex items-center justify-center gap-1 font-bold text-amber-600 bg-amber-950/40 border border-amber-700/50 px-2 py-0.5 rounded-sm">
                            <Medal className="w-3.5 h-3.5" /> #3
                          </span>
                        )}
                        {!isGold && !isSilver && !isBronze && (
                          <span className="text-gray-500 font-mono">#{absoluteRank}</span>
                        )}
                      </td>

                      {/* Persona Callsign */}
                      <td className="px-4 py-3">
                        <Link
                          to={`/stats/player/${encodeURIComponent(entryName)}?game=${selectedGame}`}
                          className="flex items-center space-x-2 text-gray-100 hover:text-cyan-300 group-hover:translate-x-0.5 transition-transform"
                        >
                          <div className="w-5 h-5 rounded-xs bg-carbon-800 border border-carbon-700 flex items-center justify-center text-[10px] font-bold text-cyan-400">
                            {(entryName || '?').slice(0, 1).toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-200 group-hover:text-cyan-300">
                            {entryName}
                          </span>
                          <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100" />
                        </Link>
                      </td>

                      {/* Score */}
                      <td className="px-3 py-3 text-right">
                        <span className="text-cyan-400 font-bold tracking-wide">
                          {entry.score.toLocaleString()}
                        </span>
                      </td>

                      {/* Kills */}
                      <td className="px-3 py-3 text-right">
                        <span className="text-emerald-400 font-medium">
                          {entry.kills.toLocaleString()}
                        </span>
                      </td>

                      {/* Deaths */}
                      <td className="px-3 py-3 text-right">
                        <span className="text-gray-400">
                          {entry.deaths.toLocaleString()}
                        </span>
                      </td>

                      {/* K/D Ratio */}
                      <td className="px-3 py-3 text-center">
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded-sm text-[11px] font-bold',
                            parseFloat(kd) >= 2.0
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                              : parseFloat(kd) >= 1.0
                              ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60'
                              : 'bg-carbon-900 text-gray-400 border border-carbon-800'
                          )}
                        >
                          {kd}
                        </span>
                      </td>

                      {/* Wins */}
                      <td className="px-3 py-3 text-right">
                        <span className="text-amber-400 font-medium">
                          {entry.wins.toLocaleString()}
                        </span>
                      </td>

                      {/* Losses */}
                      <td className="px-3 py-3 text-right">
                        <span className="text-gray-500">
                          {entry.losses.toLocaleString()}
                        </span>
                      </td>

                      {/* Win Rate */}
                      <td className="px-3 py-3 text-center">
                        <span className="text-gray-300 font-semibold">{winRate}</span>
                      </td>

                      {/* Combat Hours */}
                      <td className="px-4 py-3 text-right">
                        <span className="text-gray-400">{hours} hrs</span>
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-carbon-800 text-xs font-mono text-gray-400">
            <div>
              Showing <span className="text-gray-200 font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="text-gray-200 font-semibold">
                {Math.min(currentPage * pageSize, filteredLeaderboard.length)}
              </span>{' '}
              of <span className="text-gray-200 font-semibold">{filteredLeaderboard.length}</span> operatives
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-sm bg-carbon-900 border border-carbon-700 text-gray-300 hover:text-white hover:border-carbon-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2.5 py-1 bg-carbon-900 border border-carbon-700 text-cyan-400 rounded-sm font-semibold">
                PAGE {currentPage} OF {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-sm bg-carbon-900 border border-carbon-700 text-gray-300 hover:text-white hover:border-carbon-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
