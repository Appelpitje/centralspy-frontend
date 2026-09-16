import React, { useMemo } from 'react';
import { Search, RotateCcw, Filter, MapPin, Gamepad2, ShieldCheck, EyeOff, Layers } from 'lucide-react';
import { GAMES } from '../../types/game';
import { GAME_METADATA } from '../../utils/gameMaps';
import { Button } from '../common/Button';
import { cn } from '../../utils/cn';

export interface ServerFilterState {
  search: string;
  gameSlug: string; // '' for all games
  mapName: string; // '' for all maps
  isRanked: boolean;
  isOfficial: boolean;
  hideEmpty: boolean;
  hideFull: boolean;
}

export interface ServerFiltersProps {
  filters: ServerFilterState;
  onFilterChange: (updates: Partial<ServerFilterState>) => void;
  onReset: () => void;
  availableMaps?: string[];
  totalCount?: number;
  filteredCount?: number;
  className?: string;
}

export const ServerFilters: React.FC<ServerFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  availableMaps = [],
  totalCount,
  filteredCount,
  className,
}) => {
  // Collect map choices based on selected game or available maps in servers list
  const mapOptions = useMemo(() => {
    const set = new Set<string>();
    if (filters.gameSlug && GAME_METADATA[filters.gameSlug]) {
      GAME_METADATA[filters.gameSlug].maps.forEach((m) => set.add(m));
    } else if (!filters.gameSlug) {
      Object.values(GAME_METADATA).forEach((meta) => {
        meta.maps.forEach((m) => set.add(m));
      });
    }
    // Also include any custom server map names detected
    availableMaps.forEach((m) => {
      if (m && m.trim()) set.add(m.trim());
    });

    return Array.from(set).sort();
  }, [filters.gameSlug, availableMaps]);

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.gameSlug ||
      filters.mapName ||
      filters.isRanked ||
      filters.isOfficial ||
      filters.hideEmpty ||
      filters.hideFull
  );

  return (
    <div
      className={cn(
        'bg-sand-50 border border-sand-200 rounded-xl p-4 space-y-4 shadow-soft',
        className
      )}
    >
      {/* Top row: Search input, Game select, Map select, Reset */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Search input */}
        <div className="lg:col-span-5 relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-ink-muted pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search server name, IP address, or keyword..."
            className="w-full bg-sand-50 border border-sand-300 text-ink placeholder-ink-faint rounded-lg text-sm pl-9 pr-3 py-2.5 transition-colors focus:outline-none focus:border-olive-400 focus:ring-2 focus:ring-olive-500/20"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 text-ink-muted hover:text-ink text-xs font-mono"
            >
              ×
            </button>
          )}
        </div>

        {/* Game Selector */}
        <div className="lg:col-span-3 relative flex items-center">
          <Gamepad2 className="absolute left-3 w-4 h-4 text-olive-600 pointer-events-none" />
          <select
            value={filters.gameSlug}
            onChange={(e) => onFilterChange({ gameSlug: e.target.value, mapName: '' })}
            className="w-full bg-sand-50 border border-sand-300 text-ink rounded-lg text-sm pl-9 pr-8 py-2.5 appearance-none cursor-pointer focus:outline-none focus:border-olive-400 focus:ring-2 focus:ring-olive-500/20"
            aria-label="Filter by Game"
          >
            <option value="">All Games ({GAMES.length} Theaters)</option>
            {GAMES.map((game) => (
              <option key={game.slug} value={game.slug}>
                {game.name}
              </option>
            ))}
          </select>
          <div className="absolute right-3 pointer-events-none text-ink-muted text-[10px]">▼</div>
        </div>

        {/* Map Selector */}
        <div className="lg:col-span-3 relative flex items-center">
          <MapPin className="absolute left-3 w-4 h-4 text-olive-600 pointer-events-none" />
          <select
            value={filters.mapName}
            onChange={(e) => onFilterChange({ mapName: e.target.value })}
            className="w-full bg-sand-50 border border-sand-300 text-ink rounded-lg text-sm pl-9 pr-8 py-2.5 appearance-none cursor-pointer focus:outline-none focus:border-olive-400 focus:ring-2 focus:ring-olive-500/20"
            aria-label="Filter by Map"
          >
            <option value="">All Battlefields / Maps ({mapOptions.length})</option>
            {mapOptions.map((map) => (
              <option key={map} value={map}>
                {map}
              </option>
            ))}
          </select>
          <div className="absolute right-3 pointer-events-none text-ink-muted text-[10px]">▼</div>
        </div>

        {/* Clear Filters Button */}
        <div className="lg:col-span-1 flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            disabled={!hasActiveFilters}
            className="w-full h-full min-h-[38px] text-ink-muted hover:text-ink hover:bg-sand-100 border border-sand-200 disabled:opacity-30"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Bottom row: Filter Checkbox Toggles & Results Counter */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-sand-200 text-sm">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Ranked Only */}
          <label className="flex items-center space-x-2 text-ink cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.isRanked}
              onChange={(e) => onFilterChange({ isRanked: e.target.checked })}
              className="w-3.5 h-3.5 rounded border-sand-300 text-olive-600 focus:ring-olive-500 cursor-pointer"
            />
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-olive-600" />
              Ranked only
            </span>
          </label>

          {/* Official Only */}
          <label className="flex items-center space-x-2 text-ink cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.isOfficial}
              onChange={(e) => onFilterChange({ isOfficial: e.target.checked })}
              className="w-3.5 h-3.5 rounded border-sand-300 text-olive-600 focus:ring-olive-500 cursor-pointer"
            />
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-olive-600" />
              Official
            </span>
          </label>

          <label className="flex items-center space-x-2 text-ink cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.hideEmpty}
              onChange={(e) => onFilterChange({ hideEmpty: e.target.checked })}
              className="w-3.5 h-3.5 rounded border-sand-300 text-olive-600 focus:ring-olive-500 cursor-pointer"
            />
            <span className="flex items-center gap-1.5">
              <EyeOff className="w-3.5 h-3.5 text-ink-muted" />
              Hide empty
            </span>
          </label>

          <label className="flex items-center space-x-2 text-ink cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.hideFull}
              onChange={(e) => onFilterChange({ hideFull: e.target.checked })}
              className="w-3.5 h-3.5 rounded border-sand-300 text-olive-600 focus:ring-olive-500 cursor-pointer"
            />
            <span className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-ink-muted" />
              Hide full
            </span>
          </label>
        </div>

        <div className="flex items-center space-x-2 text-sm text-ink-muted">
          <span>
            {filteredCount !== undefined ? filteredCount : 0}
            {totalCount !== undefined && ` / ${totalCount}`} matching
          </span>
        </div>
      </div>
    </div>
  );
};
