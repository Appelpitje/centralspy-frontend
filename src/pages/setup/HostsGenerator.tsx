import React, { useState, useMemo } from 'react';
import {
  Terminal,
  Copy,
  Download,
  CheckCircle2,
  Layers,
  Laptop,
  Apple,
  Globe,
} from 'lucide-react';
import { GAMES, SupportedGameSlug } from '../../types/game';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { cn } from '../../utils/cn';
import { resolveMasterServerInfo, isIpv4Address } from '../../utils/masterServer';

export const HostsGenerator: React.FC = () => {
  const masterInfo = useMemo(() => resolveMasterServerInfo(), []);

  // Default server IP: prefer IPv4 for hosts file compatibility (e.g. 178.105.150.25 or 127.0.0.1)
  const defaultHost = masterInfo.ip || masterInfo.host || '127.0.0.1';

  const [serverIp, setServerIp] = useState<string>(defaultHost);
  const [selectedGames, setSelectedGames] = useState<Record<SupportedGameSlug, boolean>>({
    mohpa: true,
  });
  const [copied, setCopied] = useState(false);
  const [activeOs, setActiveOs] = useState<'windows' | 'macos' | 'linux'>('windows');

  // Toggle individual game
  const toggleGame = (slug: SupportedGameSlug) => {
    setSelectedGames((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  // Select / Deselect All
  const selectAll = (val: boolean) => {
    const updated: Record<SupportedGameSlug, boolean> = {
      mohpa: val,
    };
    setSelectedGames(updated);
  };

  // Build generated hosts string
  const generatedHosts = useMemo(() => {
    const ip = serverIp.trim() || '127.0.0.1';
    const lines: string[] = [
      '# =========================================================',
      '# mohPA Emulated Network Hosts Configuration',
      `# Target mohPA Master Server: ${ip}`,
      '# Note: Web Portal = portal.mohpa.net',
      '# Master Server (FESL & Theater) = 178.105.150.25',
      `# Generated: ${new Date().toISOString()}`,
      '# =========================================================',
      '',
      '# Core EA Master Authentication & Theater Redirection',
      `${ip.padEnd(16)} fesl.ea.com`,
      `${ip.padEnd(16)} theater.ea.com`,
      '',
    ];

    if (selectedGames.mohpa) {
      lines.push(
        '# Medal of Honor: Pacific Assault',
        `${ip.padEnd(16)} mohpa.fesl.ea.com`,
        `${ip.padEnd(16)} mohpa.theater.ea.com`,
        `${ip.padEnd(16)} eagames.fesl.ea.com`,
        `${ip.padEnd(16)} mohpa-server.theater.ea.com`,
        `${ip.padEnd(16)} medalofhonor.ea.com`,
        `${ip.padEnd(16)} mohpa.ea.com`,
        `${'127.0.0.1'.padEnd(16)} demangler.ea.com`,
        '',
        '# GameSpy Presence / Browser (served by mohPA, not OpenSpy)',
        `${ip.padEnd(16)} gpcm.fesl.ea.com`,
        `${ip.padEnd(16)} gpsp.fesl.ea.com`,
        `${ip.padEnd(16)} peerchat.fesl.ea.com`,
        `${ip.padEnd(16)} gamestats.fesl.ea.com`,
        `${ip.padEnd(16)} motd.fesl.ea.com`,
        `${ip.padEnd(16)} mohpa.available.fesl.ea.com`,
        `${ip.padEnd(16)} mohpa.master.fesl.ea.com`,
        `${ip.padEnd(16)} mohpa.ms1.fesl.ea.com`,
        `${ip.padEnd(16)} mohpa.ms2.fesl.ea.com`,
        `${ip.padEnd(16)} mohpa.ms3.fesl.ea.com`,
        `${ip.padEnd(16)} mohpa.ms4.fesl.ea.com`,
        '',
        '# Stock GameSpy names (unpatched exe) and OpenSpy names (if that patch was applied)',
        `${ip.padEnd(16)} gpcm.gamespy.com`,
        `${ip.padEnd(16)} gpsp.gamespy.com`,
        `${ip.padEnd(16)} peerchat.gamespy.com`,
        `${ip.padEnd(16)} gamestats.gamespy.com`,
        `${ip.padEnd(16)} motd.gamespy.com`,
        `${ip.padEnd(16)} mohpa.available.gamespy.com`,
        `${ip.padEnd(16)} mohpa.master.gamespy.com`,
        `${ip.padEnd(16)} gpcm.openspy.net`,
        `${ip.padEnd(16)} gpsp.openspy.net`,
        `${ip.padEnd(16)} peerchat.openspy.net`,
        `${ip.padEnd(16)} gamestats.openspy.net`,
        `${ip.padEnd(16)} motd.openspy.net`,
        `${ip.padEnd(16)} mohpa.available.openspy.net`,
        `${ip.padEnd(16)} mohpa.master.openspy.net`,
        ''
      );
    }

    return lines.join('\n').trim();
  }, [serverIp, selectedGames]);

  // Copy to clipboard
  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(generatedHosts);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Download hosts.txt file
  const handleDownload = () => {
    const blob = new Blob([generatedHosts], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hosts.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const selectedCount = Object.values(selectedGames).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <Card
        title="INTERACTIVE HOSTS FILE GENERATOR"
        subtitle="Configure target server IP and included game redirect entries"
        icon={<Terminal className="w-4 h-4 text-cyan-400" />}
        accent="cyan"
      >
        <div className="space-y-6 font-mono text-xs">
          {/* Master Server vs Web Portal Notice */}
          <div className="p-3 bg-sand-50 border border-sand-200 rounded-sm space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>MOHPA MASTER SERVER VS WEB PORTAL</span>
              </div>
              <span className="text-[10px] text-olive-800 bg-olive-50 border border-olive-200 px-1.5 py-0.5 rounded-full">
                ACTIVE CLUSTER
              </span>
            </div>
            <p className="text-ink text-[11px] leading-relaxed">
              This web portal runs on <code className="text-cyan-300">{typeof window !== 'undefined' ? window.location.hostname : 'portal.mohpa.net'}</code> (web UI).
              The mohPA Master Server (FESL authentication &amp; Theater matchmaking) is located on{' '}
              <strong className="text-emerald-400">{masterInfo.host}</strong> (IPv4: <strong className="text-emerald-400">{masterInfo.ip}</strong>).
            </p>
            <p className="text-amber-400/90 text-[10px]">
              ⚠️ Game client hosts redirects (<code className="text-amber-300">fesl.ea.com</code>, <code className="text-amber-300">theater.ea.com</code>) must route to the masterserver (<code className="text-emerald-300">{masterInfo.ip}</code> / <code className="text-emerald-300">{masterInfo.host}</code>), <strong>never</strong> to the frontend portal!
            </p>
          </div>

          {/* Server IP Input */}
          <div className="space-y-2">
            <label className="block text-ink font-semibold tracking-wider uppercase text-[11px]">
              1. mohPA Master Server IPv4 Address or Hostname
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-2.5 w-4 h-4 text-ink-muted pointer-events-none" />
                <input
                  type="text"
                  value={serverIp}
                  onChange={(e) => setServerIp(e.target.value)}
                  placeholder="e.g. 178.105.150.25"
                  className="w-full bg-sand-50 border border-sand-300 text-cyan-300 placeholder-ink-faint rounded-sm text-xs font-mono pl-9 pr-3 py-2 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {masterInfo.ip && masterInfo.ip !== '127.0.0.1' && (
                  <Button
                    variant={serverIp === masterInfo.ip ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setServerIp(masterInfo.ip)}
                  >
                    Master IP ({masterInfo.ip})
                  </Button>
                )}
                {masterInfo.host && masterInfo.host !== masterInfo.ip && (
                  <Button
                    variant={serverIp === masterInfo.host ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setServerIp(masterInfo.host)}
                  >
                    Master Host ({masterInfo.host})
                  </Button>
                )}
                <Button
                  variant={serverIp === '127.0.0.1' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setServerIp('127.0.0.1')}
                >
                  Localhost (127.0.0.1)
                </Button>
              </div>
            </div>

            {/* Non-IPv4 Warning Callout */}
            {!isIpv4Address(serverIp) && (
              <div className="p-2.5 bg-sand-100 border border-sand-300 rounded-lg text-[11px] text-ink flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-ink">Hosts file format:</span> Operating system hosts files (<code className="text-ink font-mono">/etc/hosts</code> or Windows <code className="text-ink font-mono">drivers\etc\hosts</code>) require a numeric <strong>IPv4 address</strong> on the left column, not a domain name.
                  {masterInfo.ip && (
                    <span className="block mt-0.5 text-amber-300/90">
                      The master server domain <code className="text-ink font-semibold">{masterInfo.host}</code> resolves to IP <code className="text-ink font-semibold">{masterInfo.ip}</code>.
                    </span>
                  )}
                </div>
                {masterInfo.ip && serverIp !== masterInfo.ip && (
                  <Button
                    variant="outline"
                    size="xs"
                    className="shrink-0 text-amber-300 border-amber-600 hover:bg-amber-900/50"
                    onClick={() => setServerIp(masterInfo.ip)}
                  >
                    Use IPv4: {masterInfo.ip}
                  </Button>
                )}
              </div>
            )}

            <p className="text-[10px] text-ink-muted">
              Use <code className="text-emerald-400">{masterInfo.ip}</code> (<code className="text-cyan-400">{masterInfo.host}</code>) for the official mohPA master server, or <code className="text-cyan-400">127.0.0.1</code> if running a local test instance.
            </p>
          </div>

          {/* Game Selection Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-sand-200">
            <div className="flex items-center justify-between">
              <label className="block text-ink font-semibold tracking-wider uppercase text-[11px]">
                2. Select Games to Include in Hosts Redirects ({selectedCount}/{GAMES.length} Selected)
              </label>
              <div className="flex items-center space-x-2 text-[10px]">
                <button
                  type="button"
                  onClick={() => selectAll(true)}
                  className="text-cyan-400 hover:underline focus:outline-none"
                >
                  Select All
                </button>
                <span className="text-carbon-600">|</span>
                <button
                  type="button"
                  onClick={() => selectAll(false)}
                  className="text-ink-muted hover:underline focus:outline-none"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
              {GAMES.map((game) => {
                const isChecked = selectedGames[game.slug];
                return (
                  <label
                    key={game.slug}
                    className={cn(
                      'flex items-center space-x-3 p-2.5 rounded-sm border cursor-pointer transition-all select-none',
                      isChecked
                        ? 'bg-olive-50 border-olive-300 text-ink'
                        : 'bg-sand-50 border-sand-200 text-ink-muted hover:border-sand-300'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleGame(game.slug)}
                      className="w-3.5 h-3.5 rounded-xs accent-cyan-500 bg-sand-50 border-sand-300"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs leading-tight text-ink">
                        {game.name}
                      </span>
                      <span className="text-[10px] text-ink-muted">{game.slug}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Generated Output Preview & Actions */}
          <div className="space-y-2 pt-2 border-t border-sand-200">
            <div className="flex items-center justify-between">
              <span className="text-ink font-semibold tracking-wider uppercase text-[11px]">
                3. Generated Hosts Configuration
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="xs"
                  leftIcon={copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  onClick={handleCopy}
                >
                  {copied ? 'Copied to Clipboard' : 'Copy Hosts Config'}
                </Button>
                <Button
                  variant="primary"
                  size="xs"
                  leftIcon={<Download className="w-3 h-3" />}
                  onClick={handleDownload}
                >
                  Download hosts.txt
                </Button>
              </div>
            </div>

            <div className="bg-sand-50 p-4 rounded-sm border border-sand-200 text-cyan-300 select-all overflow-x-auto text-[11px] leading-relaxed shadow-inner max-h-72">
              <pre>{generatedHosts}</pre>
            </div>
          </div>
        </div>
      </Card>

      {/* OS Installation Instructions */}
      <Card
        title="OPERATING SYSTEM INJECTION PROTOCOLS"
        subtitle="Tactical instructions for applying hosts redirection across operating systems"
        icon={<Layers className="w-4 h-4 text-emerald-400" />}
        accent="emerald"
      >
        <div className="space-y-4 font-mono text-xs">
          {/* OS Switcher */}
          <div className="flex items-center space-x-2 border-b border-sand-200 pb-3">
            <button
              onClick={() => setActiveOs('windows')}
              className={cn(
                'flex items-center space-x-2 px-3 py-1.5 rounded-sm font-semibold uppercase tracking-wider transition-colors',
                activeOs === 'windows'
                  ? 'bg-olive-600 text-white border border-olive-700'
                  : 'text-ink-muted hover:text-ink'
              )}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Windows 10 / 11</span>
            </button>

            <button
              onClick={() => setActiveOs('macos')}
              className={cn(
                'flex items-center space-x-2 px-3 py-1.5 rounded-sm font-semibold uppercase tracking-wider transition-colors',
                activeOs === 'macos'
                  ? 'bg-olive-600 text-white border border-olive-700'
                  : 'text-ink-muted hover:text-ink'
              )}
            >
              <Apple className="w-3.5 h-3.5" />
              <span>macOS (Darwin)</span>
            </button>

            <button
              onClick={() => setActiveOs('linux')}
              className={cn(
                'flex items-center space-x-2 px-3 py-1.5 rounded-sm font-semibold uppercase tracking-wider transition-colors',
                activeOs === 'linux'
                  ? 'bg-olive-600 text-white border border-olive-700'
                  : 'text-ink-muted hover:text-ink'
              )}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Linux (Wine / Proton)</span>
            </button>
          </div>

          {/* Windows Steps */}
          {activeOs === 'windows' && (
            <div className="space-y-3 text-ink">
              <p className="text-ink-muted">
                The Windows hosts file is protected by User Account Control (UAC). Follow these steps to edit it:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-ink pl-1">
                <li>
                  Press <kbd className="px-1.5 py-0.5 bg-sand-200 rounded border border-sand-300 text-ink">Win + S</kbd> and search for <strong className="text-ink">Notepad</strong>.
                </li>
                <li>
                  Right-click Notepad and choose <span className="text-amber-400 font-semibold">"Run as administrator"</span>.
                </li>
                <li>
                  In Notepad, click <strong>File &gt; Open</strong> and paste:
                  <div className="mt-1 bg-sand-50 p-2 rounded border border-sand-200 text-cyan-300 select-all font-mono">
                    C:\Windows\System32\drivers\etc\hosts
                  </div>
                  <span className="text-[10px] text-ink-muted">(Make sure the file type filter in the bottom right is set to "All Files (*.*)")</span>
                </li>
                <li>
                  Paste the generated mohPA hosts entries at the bottom of the file and save (<kbd className="px-1.5 py-0.5 bg-sand-200 rounded border border-sand-300 text-cyan-300">Ctrl + S</kbd>).
                </li>
                <li>
                  Flush your Windows DNS resolver cache by opening Command Prompt (cmd) and executing:
                  <div className="mt-1 bg-sand-50 p-2 rounded border border-sand-200 text-emerald-300 select-all font-mono">
                    ipconfig /flushdns
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* macOS Steps */}
          {activeOs === 'macos' && (
            <div className="space-y-3 text-ink">
              <p className="text-ink-muted">
                To edit the hosts file on macOS with Terminal:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-ink pl-1">
                <li>
                  Open <strong className="text-ink">Terminal.app</strong> (Applications &gt; Utilities &gt; Terminal).
                </li>
                <li>
                  Execute nano editor with superuser privileges:
                  <div className="mt-1 bg-sand-50 p-2 rounded border border-sand-200 text-cyan-300 select-all font-mono">
                    sudo nano /etc/hosts
                  </div>
                </li>
                <li>
                  Paste the generated entries, then press <kbd className="px-1.5 py-0.5 bg-sand-200 rounded border border-sand-300 text-cyan-300">Ctrl + O</kbd> to save and <kbd className="px-1.5 py-0.5 bg-sand-200 rounded border border-sand-300 text-cyan-300">Ctrl + X</kbd> to exit.
                </li>
                <li>
                  Flush macOS mDNS resolver cache:
                  <div className="mt-1 bg-sand-50 p-2 rounded border border-sand-200 text-emerald-300 select-all font-mono">
                    sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* Linux Steps */}
          {activeOs === 'linux' && (
            <div className="space-y-3 text-ink">
              <p className="text-ink-muted">
                For Linux systems running native servers or clients via Wine / Proton / Lutris:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-ink pl-1">
                <li>
                  Open terminal and edit <code className="text-cyan-400">/etc/hosts</code>:
                  <div className="mt-1 bg-sand-50 p-2 rounded border border-sand-200 text-cyan-300 select-all font-mono">
                    sudo nano /etc/hosts
                  </div>
                </li>
                <li>
                  Paste the generated entries, save, and restart systemd-resolved (if applicable):
                  <div className="mt-1 bg-sand-50 p-2 rounded border border-sand-200 text-emerald-300 select-all font-mono">
                    sudo systemctl restart systemd-resolved
                  </div>
                </li>
                <li>
                  If using Steam Proton prefixes, ensure the Wine sandbox resolves system hosts properly.
                </li>
              </ol>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default HostsGenerator;
