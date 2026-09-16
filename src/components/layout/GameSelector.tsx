import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Gamepad2, Check } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { GAMES, SupportedGameSlug } from '../../types/game';
import { cn } from '../../utils/cn';

export const GameSelector: React.FC<{ className?: string }> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { activeGame, setActiveGame, getActiveGameConfig } = useGameStore();

  const activeConfig = getActiveGameConfig() || GAMES[0];
  const games = GAMES;
  const isMultiGame = games.length > 1;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => isMultiGame && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center space-x-2.5 px-3 py-1.5 rounded-sm bg-sand-50 border border-sand-300 transition-all duration-150 text-left focus:outline-none",
          isMultiGame ? "hover:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500 cursor-pointer" : "cursor-default"
        )}
        aria-expanded={isOpen}
      >
        <Gamepad2 className="w-4 h-4 text-cyan-400 shrink-0" />
        <div className="flex flex-col pr-1">
          <span className="text-[9px] font-mono uppercase text-ink-muted leading-none">ACTIVE THEATER</span>
          <span className="text-xs font-mono font-bold text-ink tracking-wide leading-tight">
            {activeConfig.name}
          </span>
        </div>
        {isMultiGame && (
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 text-ink-muted transition-transform duration-150',
              isOpen ? 'rotate-180 text-cyan-400' : ''
            )}
          />
        )}
      </button>

      {isOpen && isMultiGame && (
        <div className="absolute left-0 mt-1.5 w-64 bg-sand-50 border border-sand-300 rounded-sm shadow-2xl py-1.5 z-50 backdrop-blur-md animate-fade-in divide-y divide-sand-200">
          <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-ink-muted">
            Select Game Network
          </div>
          <div className="py-1">
            {games.map((g) => {
              const isSelected = g.slug === activeGame;
              return (
                <button
                  key={g.slug}
                  onClick={() => {
                    setActiveGame(g.slug as SupportedGameSlug);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-xs font-mono text-left transition-colors duration-100',
                    isSelected
                      ? 'bg-olive-50 text-olive-800 font-semibold'
                      : 'text-ink hover:bg-sand-200 hover:text-ink'
                  )}
                >
                  <div className="flex flex-col">
                    <span className="leading-tight">{g.name}</span>
                    <span className="text-[10px] text-ink-muted font-normal leading-tight mt-0.5">
                      {g.skus[0]}
                    </span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
