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

  const tabParam = searchParams.get('tab') || 'hosts';
  const activeTab = ['hosts', 'patches', 'dedicated', 'faq'].includes(tabParam)
    ? tabParam
    : 'hosts';

  const activeConfig = getActiveGameConfig();
  const masterInfo = resolveMasterServerInfo();

  const handleTabChange = (id: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', id);
    setSearchParams(newParams);
  };

  const tabs = [
    {
      id: 'hosts',
      label: 'Quick Setup (Hosts File)',
      icon: <Terminal className="w-3.5 h-3.5" />,
    },
    {
      id: 'patches',
      label: 'Client Patches & SSL',
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
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-carbon-800 pb-4">
        <div>
          <div className="flex items-center space-x-2.5 flex-wrap">
            <h1 className="font-hud font-bold text-2xl uppercase tracking-wider text-gray-100">
              GAME SETUP & CLIENT CONNECTION CENTER
            </h1>
            <Badge variant="CYAN">{activeConfig.name}</Badge>
          </div>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Tactical directives, DNS configuration, and binary patches to connect your legacy client to CentralSpy.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="ONLINE">MOHPA THEATER READY</Badge>
        </div>
      </div>

      {/* Network Infrastructure Architecture Banner */}
      <div className="p-3.5 bg-carbon-950/90 border border-cyan-900/60 rounded-sm space-y-1.5 font-mono text-xs border-l-4 border-l-cyan-500">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
          <Server className="w-3.5 h-3.5 text-cyan-400" />
          <span>NETWORK INFRASTRUCTURE ARCHITECTURE</span>
        </div>
        <p className="text-gray-300 text-[11px] leading-relaxed">
          The CentralSpy Master Server (FESL authentication &amp; Theater matchmaking) runs on{' '}
          <strong className="text-emerald-400">{masterInfo.host}</strong> (IPv4: <strong className="text-emerald-400">{masterInfo.ip}</strong>).
          This web application (<code className="text-cyan-300">{typeof window !== 'undefined' ? window.location.hostname : 'portal.appelpitje.dev'}</code>) is exclusively the frontend management portal.
        </p>
        <p className="text-amber-400/90 text-[10px]">
          ⚠️ Always redirect your game client / dedicated server hosts file to the master server (<code className="text-emerald-300">{masterInfo.ip}</code> / <code className="text-emerald-300">{masterInfo.host}</code>), <strong>not</strong> the web portal domain.
        </p>
      </div>

      {/* Game Quick Bar */}
      <div className="hud-card p-3 rounded-sm flex items-center justify-between overflow-x-auto gap-4 border-l-2 border-l-cyan-500">
        <div className="flex items-center space-x-2 text-xs font-mono text-gray-300">
          <Gamepad2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-semibold text-gray-200">SUPPORTED THEATERS:</span>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          {GAMES.map((game) => (
            <button
              key={game.slug}
              onClick={() => setActiveGame(game.slug as SupportedGameSlug)}
              className={cn(
                'px-2.5 py-1 rounded-sm text-[11px] font-mono transition-colors',
                game.slug === activeGame
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 font-bold'
                  : 'bg-carbon-900 text-gray-400 hover:text-gray-200 border border-carbon-800'
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
