import React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Terminal,
  ShieldAlert,
  Server,
  HelpCircle,
  Gamepad2,
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { GAMES, SupportedGameSlug } from '../../types/game';
import { Badge } from '../../components/common/Badge';
import { Tabs } from '../../components/common/Tabs';
import { HostsGenerator } from './HostsGenerator';
import { TlsPatcherGuide } from './TlsPatcherGuide';
import { DedicatedServerGuide } from './DedicatedServerGuide';
import { TroubleshootingFaq } from './TroubleshootingFaq';
import { cn } from '../../utils/cn';
import { resolveMasterServerInfo } from '../../utils/masterServer';

export const DownloadGuides: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeGame, setActiveGame, getActiveGameConfig } = useGameStore();

  const tabParam = searchParams.get('tab') || 'patches';
  const activeTab = ['patches', 'dedicated', 'faq', 'hosts'].includes(tabParam)
    ? tabParam
    : 'patches';

  const activeConfig = getActiveGameConfig();
  const masterInfo = resolveMasterServerInfo();

  const handleTabChange = (id: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', id);
    setSearchParams(newParams);
  };

  const tabs = [
    {
      id: 'patches',
      label: 'Quick Setup (Client Patch)',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
    },
    {
      id: 'dedicated',
      label: 'Dedicated Server Setup',
      icon: <Server className="w-3.5 h-3.5" />,
    },
    {
      id: 'faq',
      label: 'Troubleshooting FAQ',
      icon: <HelpCircle className="w-3.5 h-3.5" />,
    },
    {
      id: 'hosts',
      label: 'Manual / Legacy Hosts (Optional)',
      icon: <Terminal className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-sand-200 pb-4">
        <div>
          <div className="flex items-center space-x-2.5 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              Setup
            </h1>
            <Badge variant="CYAN">{activeConfig.name}</Badge>
          </div>
          <p className="text-sm text-ink-muted mt-1">
            Client patch, dedicated server, and connection help for {activeConfig.name}.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="ONLINE">MOHPA THEATER READY</Badge>
        </div>
      </div>

      {/* Network Infrastructure Architecture Banner */}
      <div className="p-4 bg-sand-50 border border-sand-200 rounded-xl space-y-1.5 text-sm">
        <div className="flex items-center space-x-2 text-ink font-medium">
          <Server className="w-3.5 h-3.5 text-olive-600" />
          <span>How traffic is routed</span>
        </div>
        <p className="text-ink-muted leading-relaxed">
          The mohPA Master Server (FESL authentication &amp; Theater matchmaking) runs on{' '}
          <strong className="text-emerald-400">{masterInfo.host}</strong> (IPv4: <strong className="text-emerald-400">{masterInfo.ip}</strong>).
          This web application (<code className="text-cyan-300">{typeof window !== 'undefined' ? window.location.hostname : 'portal.mohpa.net'}</code>) is exclusively the frontend management portal.
        </p>
        <p className="text-emerald-400/90 text-[10px]">
          ✨ No hosts-file edits needed! The mohPA MOHPA patcher hooks DNS resolution directly in the game client, routing automatically to the master server (<code className="text-emerald-300">{masterInfo.ip}</code> / <code className="text-emerald-300">{masterInfo.host}</code>).
        </p>
      </div>

      {/* Game Quick Bar */}
      <div className="hud-card p-3 rounded-sm flex items-center justify-between overflow-x-auto gap-4 border-l-2 border-l-cyan-500">
        <div className="flex items-center space-x-2 text-xs font-mono text-ink">
          <Gamepad2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-semibold text-ink">SUPPORTED THEATERS:</span>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          {GAMES.map((game) => (
            <button
              key={game.slug}
              onClick={() => setActiveGame(game.slug as SupportedGameSlug)}
              className={cn(
                'px-2.5 py-1 rounded-sm text-[11px] font-mono transition-colors',
                game.slug === activeGame
                  ? 'bg-olive-600 text-white border border-olive-700 font-medium'
                  : 'bg-sand-50 text-ink-muted hover:text-ink border border-sand-200'
              )}
            >
              {game.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {/* Tab Panels */}
      <div>
        {activeTab === 'hosts' && <HostsGenerator />}
        {activeTab === 'patches' && <TlsPatcherGuide />}
        {activeTab === 'dedicated' && <DedicatedServerGuide />}
        {activeTab === 'faq' && <TroubleshootingFaq />}
      </div>
    </div>
  );
};

export default DownloadGuides;
