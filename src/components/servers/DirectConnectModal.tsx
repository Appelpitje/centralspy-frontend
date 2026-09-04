import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Terminal,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Server,
  User,
  Zap,
  Info,
} from 'lucide-react';
import { GameServer } from '../../types/server';
import { useAuthStore } from '../../store/authStore';
import personaService from '../../services/personaService';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useToast } from '../hud/Toast';

export interface DirectConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: GameServer | null;
  initialSoldierName?: string;
}

export const DirectConnectModal: React.FC<DirectConnectModalProps> = ({
  isOpen,
  onClose,
  server,
  initialSoldierName,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const { toast } = useToast();

  const [soldierName, setSoldierName] = useState<string>(initialSoldierName || '');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Fetch soldier personas if logged in
  const { data: personas = [] } = useQuery({
    queryKey: ['personas', server?.gameSlug],
    queryFn: () => personaService.getPersonas(server?.gameSlug as string),
    enabled: isOpen && !!server?.gameSlug && isAuthenticated,
  });

  // Set default soldier name from personas or user
  useEffect(() => {
    if (personas.length > 0 && !soldierName) {
      setSoldierName(personas[0].name);
    } else if (user?.username && !soldierName) {
      setSoldierName(user.username);
    }
  }, [personas, user, soldierName]);

  if (!server) return null;

  const targetAddress = `${server.ipAddress}:${server.port}`;
  const effectiveSoldier = soldierName.trim() || 'Soldier';

  // Formats
  const cliArgument = `+joinServer ${targetAddress} +playerName "${effectiveSoldier}"`;
  const uriProtocol = `centralspy://join/${server.gameSlug}/${targetAddress}?player=${encodeURIComponent(effectiveSoldier)}`;
  const consoleCommand = `connect ${targetAddress}`;
  const exeCommand = `${server.gameSlug.toUpperCase()}.exe +joinServer ${targetAddress} +playerName "${effectiveSoldier}"`;

  const copyToClipboard = async (text: string, key: string, label: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedKey(key);
      toast.success('Directive Copied', `${label} copied to tactical clipboard.`);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      toast.error('Clipboard Error', 'Failed to copy string to clipboard.');
    }
  };

  const handleLaunchProtocol = () => {
    window.location.href = uriProtocol;
    toast.info('Initiating Client Launch', `Dispatched protocol link to CentralSpy Game Launcher.`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="DIRECT CONNECT DIRECTIVE"
      subtitle={`Generate tactical launch arguments for ${server.name}`}
      icon={<Zap className="w-5 h-5 text-cyan-400" />}
      size="lg"
    >
      <div className="space-y-5 font-mono text-xs">
        {/* Server Quick Info Bar */}
        <div className="p-3.5 bg-carbon-950 border border-carbon-800 rounded-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-sm bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <Server className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-hud font-bold text-sm text-gray-100 uppercase truncate max-w-xs">
                  {server.name}
                </span>
                <Badge variant={server.isRanked ? 'RANKED' : 'DEFAULT'} size="sm">
                  {server.isRanked ? 'RANKED' : 'UNRANKED'}
                </Badge>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Target Node: <span className="text-cyan-400 font-bold">{targetAddress}</span>
                {server.mapName && <span> • Map: {server.mapName}</span>}
              </p>
            </div>
          </div>

          <Badge variant={server.isOnline ? 'ONLINE' : 'OFFLINE'} dot size="sm">
            {server.isOnline ? 'ONLINE' : 'OFFLINE'}
          </Badge>
        </div>

        {/* Soldier / Persona Selector */}
        <div className="space-y-2 p-3.5 bg-carbon-900/80 border border-carbon-800 rounded-sm">
          <label className="text-xs uppercase tracking-wider text-gray-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              Active Soldier Callsign
            </span>
            {isAuthenticated && personas.length > 0 && (
              <span className="text-[10px] text-cyan-400">
                {personas.length} Persona{personas.length > 1 ? 's' : ''} Loaded
              </span>
            )}
          </label>

          {isAuthenticated && personas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={soldierName}
                onChange={(e) => setSoldierName(e.target.value)}
                className="bg-carbon-950 border border-carbon-700 text-gray-100 rounded-sm text-xs px-3 py-2 focus:outline-none focus:border-cyan-500"
              >
                {personas.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} (Score: {p.stats?.score || 0})
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={soldierName}
                onChange={(e) => setSoldierName(e.target.value)}
                placeholder="Or type custom persona callsign..."
                className="bg-carbon-950 border border-carbon-700 text-gray-100 rounded-sm text-xs px-3 py-2 focus:outline-none focus:border-cyan-500"
              />
            </div>
          ) : (
            <input
              type="text"
              value={soldierName}
              onChange={(e) => setSoldierName(e.target.value)}
              placeholder="Enter in-game persona callsign (e.g. CommanderAlpha)..."
              className="w-full bg-carbon-950 border border-carbon-700 text-gray-100 rounded-sm text-xs px-3 py-2 focus:outline-none focus:border-cyan-500"
            />
          )}
          <p className="text-[10px] text-gray-500">
            Selected persona will be injected into launch parameters for seamless authentication.
          </p>
        </div>

        {/* Command Line Launch Arguments */}
        <div className="space-y-3">
          {/* 1. CLI Parameter */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-gray-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Game Executable Launch Arguments
              </span>
              <span className="text-gray-500">Shortcut / Steam / Origin Launch Option</span>
            </div>
            <div className="flex items-center bg-carbon-950 border border-carbon-700 rounded-sm p-1.5">
              <code className="flex-1 px-2.5 py-1 text-cyan-300 font-mono text-xs overflow-x-auto select-all whitespace-nowrap">
                {cliArgument}
              </code>
              <Button
                type="button"
                variant="primary"
                size="xs"
                leftIcon={copiedKey === 'cli' ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                onClick={() => copyToClipboard(cliArgument, 'cli', 'Launch arguments')}
              >
                {copiedKey === 'cli' ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* 2. Full Executable CLI */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-gray-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                Terminal / Command Prompt Execution
              </span>
              <span className="text-gray-500">CMD / PowerShell</span>
            </div>
            <div className="flex items-center bg-carbon-950 border border-carbon-700 rounded-sm p-1.5">
              <code className="flex-1 px-2.5 py-1 text-amber-300 font-mono text-xs overflow-x-auto select-all whitespace-nowrap">
                {exeCommand}
              </code>
              <Button
                type="button"
                variant="secondary"
                size="xs"
                leftIcon={copiedKey === 'exe' ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                onClick={() => copyToClipboard(exeCommand, 'exe', 'Command line executable string')}
              >
                {copiedKey === 'exe' ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* 3. In-Game Console */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-gray-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                In-Game Tilde (~) Console Command
              </span>
              <span className="text-gray-500">Direct Connect</span>
            </div>
            <div className="flex items-center bg-carbon-950 border border-carbon-700 rounded-sm p-1.5">
              <code className="flex-1 px-2.5 py-1 text-emerald-300 font-mono text-xs overflow-x-auto select-all whitespace-nowrap">
                {consoleCommand}
              </code>
              <Button
                type="button"
                variant="secondary"
                size="xs"
                leftIcon={copiedKey === 'console' ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                onClick={() => copyToClipboard(consoleCommand, 'console', 'In-game console command')}
              >
                {copiedKey === 'console' ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>

        {/* Tactical Helper Notice */}
        <div className="p-3 bg-carbon-950/60 border border-carbon-800 rounded-sm flex items-start space-x-2.5 text-gray-400 text-[11px]">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Ensure your game client is configured to route master server queries through the CentralSpy FESL and Theater emulator. Refer to the{' '}
            <a href="/setup" className="text-cyan-400 underline hover:text-cyan-300">
              Client Setup & Guides
            </a>{' '}
            for hosts file patches or custom proxy DLLs.
          </p>
        </div>

        {/* Footer actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-carbon-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={handleLaunchProtocol}
              title="Trigger CentralSpy Launcher Protocol Handler"
            >
              Launch via Protocol URI
            </Button>
            <Button
              type="button"
              variant="tactical"
              size="sm"
              leftIcon={<Zap className="w-3.5 h-3.5" />}
              onClick={() => copyToClipboard(cliArgument, 'cli', 'Launch arguments')}
            >
              Copy & Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
