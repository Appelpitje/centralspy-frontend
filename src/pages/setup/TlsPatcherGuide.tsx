import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';

export const MOHPA_PATCH_ZIP_URL =
  'https://centralspy.appelpitje.dev/downloads/CentralSpy-MOHPA-Patch.zip';

interface PatchDirective {
  gameTitle: string;
  engine: string;
  targetBinary: string;
  offsetHex: string;
  originalBytes: string;
  patchedBytes: string;
  instructions: string[];
}

export const TlsPatcherGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'manual' | 'aluigi'>('overview');

  const patchDirectives: PatchDirective[] = [
    {
      gameTitle: 'Medal of Honor: Pacific Assault',
      engine: 'MOHPA Engine (id Tech 3 / EA DirtySDK / Jabba FESL)',
      targetBinary: 'mohpa.exe / mohpa_server.exe',
      offsetHex: 'Offset 0x6F70BF (mohpa.exe) / 0x668BFF (mohpa_server.exe)',
      originalBytes: '85 C0 7D 0C C7 86 18 01 (JGE +0xC check EA CA)',
      patchedBytes: '85 C0 EB 0C C7 86 18 01 (JMP +0xC bypass EA CA)',
      instructions: [
        'Download CentralSpy-MOHPA-Patch.zip (the whole archive — not only Patch-MOHPA.bat). Extract it into the folder that contains mohpa.exe.',
        'Double-click Patch-MOHPA.bat. It launches Patch-MOHPA.ps1 in the same folder (Python is not required). That applies DirtySDK SSL bypass, peerchat port 18270, IsStatsConnected, GameSpy hostnames, and MOTD URLs.',
        'Merge the generated centralspy-hosts.txt into your OS or Wine hosts file (mohpa.fesl.ea.com, fesl.ea.com, theater.ea.com, plus GameSpy aliases).',
        'Keep the in-game login screen (mp_account_login). Do not use the OpenSpy bypass that jumps straight to the server browser.',
        'Fully quit the game, relaunch, open Multiplayer, and log in with a CentralSpy account.',
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Intro Card */}
      <Card
        title="TLS & SSL CERTIFICATE BYPASS ARCHITECTURE"
        subtitle="Understand and apply cryptographic bypasses for legacy EA game engines"
        icon={<ShieldAlert className="w-4 h-4 text-amber-400" />}
        accent="amber"
      >
        <div className="space-y-4 font-mono text-xs text-gray-300">
          <div className="p-3 bg-cyan-950/30 border border-cyan-800/50 rounded-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h4 className="text-cyan-300 font-bold uppercase tracking-wider">
                MOHPA client patch (full zip)
              </h4>
              <p className="text-gray-400 text-[11px] mt-1">
                Contains Patch-MOHPA.bat, Patch-MOHPA.ps1, Restore-Original.bat, patcher.py, and README.
                Extract next to mohpa.exe, then run the .bat.
              </p>
            </div>
            <a
              href={MOHPA_PATCH_ZIP_URL}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sm font-mono text-xs font-bold uppercase tracking-wider bg-cyan-600 text-white hover:bg-cyan-500 border border-cyan-400/40 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Download CentralSpy MOHPA Patch (.zip)
            </a>
          </div>

          <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-sm flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-amber-300 font-bold uppercase tracking-wider">
                Why is TLS Certificate Patching Required?
              </h4>
              <p className="text-gray-400 text-[11px] mt-1">
                Legacy EA titles from 2006–2012 used hardcoded VeriSign / EA Root CA certificate public keys inside the game binaries. Because CentralSpy operates as a private replacement server with custom TLS certificates, the game client will abort the handshake with an <code className="text-amber-300">SSL_ERROR_HANDSHAKE_FAILURE</code> unless the verification check is bypassed using the proven Aluigi SSL patcher or binary modifications.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 border-b border-carbon-800 pb-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                'px-3 py-1.5 rounded-sm font-semibold uppercase tracking-wider transition-colors',
                activeTab === 'overview'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                  : 'text-gray-400 hover:text-gray-200'
              )}
            >
              Engine Directives
            </button>
            <button
              onClick={() => setActiveTab('aluigi')}
              className={cn(
                'px-3 py-1.5 rounded-sm font-semibold uppercase tracking-wider transition-colors',
                activeTab === 'aluigi'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                  : 'text-gray-400 hover:text-gray-200'
              )}
            >
              Aluigi Universal Patcher Guide
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={cn(
                'px-3 py-1.5 rounded-sm font-semibold uppercase tracking-wider transition-colors',
                activeTab === 'manual'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                  : 'text-gray-400 hover:text-gray-200'
              )}
            >
              Hex & Disassembly Signatures
            </button>
          </div>

          {/* Tab Content: Engine Directives */}
          {activeTab === 'overview' && (
            <div className="space-y-4 pt-2">
              <p className="text-gray-400">
                Directives and execution steps for all 5 supported CentralSpy game titles:
              </p>

              <div className="space-y-3">
                {patchDirectives.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-carbon-950/80 border border-carbon-800 rounded-sm space-y-2 hover:border-carbon-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-carbon-800/80 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-hud font-bold text-gray-100 text-sm">
                          {item.gameTitle}
                        </span>
                        <Badge variant="CYAN">{item.engine}</Badge>
                      </div>
                      <span className="text-[11px] font-mono text-cyan-400">
                        Target: {item.targetBinary}
                      </span>
                    </div>

                    <ol className="list-decimal list-inside space-y-1.5 text-gray-300 pl-1 pt-1 text-[11px]">
                      {item.instructions.map((step, sIdx) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content: Aluigi Patcher */}
          {activeTab === 'aluigi' && (
            <div className="space-y-4 pt-2 text-gray-300">
              <div className="p-4 bg-carbon-950/90 border border-carbon-800 rounded-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-hud font-bold text-sm text-cyan-300 uppercase">
                    Aluigi EA SSL Universal Bypass Routine
                  </h4>
                  <Badge variant="ONLINE">VERIFIED WORKING</Badge>
                </div>

                <p className="text-[11px] text-gray-400">
                  Developed by veteran security researcher Luigi Auriemma (aluigi), this utility dynamically intercepts the OpenSSL / SChannel root certificate verification callbacks, causing the game to trust any SSL certificate issued by private servers (such as CentralSpy).
                </p>

                <div className="space-y-2 pt-2 border-t border-carbon-800/80">
                  <h5 className="font-semibold text-gray-200 uppercase text-[11px]">
                    Method A: Drag-and-Drop Automated Patching
                  </h5>
                  <ol className="list-decimal list-inside space-y-1 text-gray-400 pl-1 text-[11px]">
                    <li>Download the compiled <code className="text-cyan-400">ea_ssl_patch.exe</code> tool.</li>
                    <li>Make a backup copy of your original game executable (e.g. <code className="text-gray-300">mohpa.exe.bak</code>).</li>
                    <li>Drag your game executable directly onto <code className="text-cyan-400">ea_ssl_patch.exe</code>.</li>
                    <li>The patcher will scan byte patterns, apply the jump patch, and output a confirmation message.</li>
                  </ol>
                </div>

                <div className="space-y-2 pt-2 border-t border-carbon-800/80">
                  <h5 className="font-semibold text-gray-200 uppercase text-[11px]">
                    Method B: DLL Proxy Injection (Non-Destructive)
                  </h5>
                  <ol className="list-decimal list-inside space-y-1 text-gray-400 pl-1 text-[11px]">
                    <li>Place <code className="text-cyan-400">dinput8.dll</code> or <code className="text-cyan-400">ws2_32.dll</code> proxy wrapper in the game folder.</li>
                    <li>The wrapper automatically hooks memory upon startup, meaning the original game executable remains 100% untouched.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Hex Signatures */}
          {activeTab === 'manual' && (
            <div className="space-y-4 pt-2">
              <p className="text-gray-400">
                For security researchers and server developers patching executables using HxD, IDA Pro, or Ghidra:
              </p>

              <div className="space-y-3">
                {patchDirectives.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-carbon-950 border border-carbon-800 rounded-sm font-mono text-[11px] space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-gray-200 font-bold">
                      <span>{item.gameTitle} ({item.targetBinary})</span>
                      <span className="text-amber-400">{item.offsetHex}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div className="p-2 bg-carbon-900 rounded border border-carbon-800">
                        <span className="text-gray-500 block text-[10px]">ORIGINAL HEX BYTES:</span>
                        <code className="text-crimson-400 font-bold">{item.originalBytes}</code>
                      </div>
                      <div className="p-2 bg-carbon-900 rounded border border-carbon-800">
                        <span className="text-gray-500 block text-[10px]">PATCHED REPLACEMENT:</span>
                        <code className="text-emerald-400 font-bold">{item.patchedBytes}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TlsPatcherGuide;
