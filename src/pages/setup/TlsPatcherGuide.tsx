import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';

export const MOHPA_PATCH_ZIP_URL =
  '/downloads/mohPA-Client-Patch.zip';

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
        'Confirm you have official MOHPA v1.2 (GOG, Origin/EA App, or retail disc + EA 1.2 patch).',
        'Extract the zip contents directly into your game folder containing mohpa.exe.',
        'Run Patch-MOHPA.bat (creates mohpa.exe.bak and patches mohpa.exe automatically).',
        'Fully quit the game (and Wine), relaunch mohpa.exe, and log in under Multiplayer with your mohPA account.',
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
        <div className="space-y-4 font-mono text-xs text-ink">
          <div className="p-4 bg-olive-50 border border-olive-200 rounded-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="text-ink font-semibold">
                  mohPA client patch
                </h4>
                <p className="text-ink-muted text-[11px] mt-1">
                  Download mohPA-Client-Patch.zip (contains Patch-MOHPA.bat, Patch-MOHPA.ps1, Restore-Original.bat, patcher.py, and README).
                </p>
              </div>
              <a
                href={MOHPA_PATCH_ZIP_URL}
                download="mohPA-Client-Patch.zip"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-olive-600 text-white hover:bg-olive-700 border border-transparent shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                Download mohPA Patch (.zip)
              </a>
            </div>

            <div className="pt-2.5 border-t border-olive-200">
              <h5 className="text-sm font-semibold text-ink mb-1.5">
                Instructions
              </h5>
              <ol className="list-decimal list-inside space-y-1.5 text-ink text-[11px]">
                <li>Confirm you have official <strong className="text-cyan-300">v1.2</strong> (GOG, Origin/EA App, or retail disc + EA 1.2 patch).</li>
                <li>Extract the zip contents directly into your game folder containing <code className="text-cyan-300">mohpa.exe</code>.</li>
                <li>Run <code className="text-cyan-300">Patch-MOHPA.bat</code> (creates <code className="text-ink-muted">mohpa.exe.bak</code>, then applies the patch).</li>
                <li>Fully quit the game (check Task Manager), relaunch <code className="text-cyan-300">mohpa.exe</code>, and log in under <strong>Multiplayer</strong> with your mohPA account.</li>
              </ol>
            </div>
          </div>

          <div className="p-3.5 bg-olive-50 border border-olive-200 rounded-lg flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-olive-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-ink font-semibold text-sm">
                No hosts-file edits required
              </h4>
              <p className="text-ink text-[11px] leading-relaxed">
                The patcher rewrites hardcoded GameSpy and EA host strings to mohPA and hooks <code className="text-emerald-400">gethostbyname</code> directly inside the game binary. Residual domains (<code className="text-cyan-300">fesl.ea.com</code>, <code className="text-cyan-300">theater.ea.com</code>, etc.) resolve directly to mohPA at runtime without editing system files. If you previously added mohPA entries to your hosts file, you can safely delete them.
              </p>
              <p className="text-ink-muted text-[10px]">
                To restore stock: double-click <code className="text-amber-400">Restore-Original.bat</code> or rename <code className="text-amber-400">mohpa.exe.bak</code> back to <code className="text-amber-400">mohpa.exe</code>.
              </p>
            </div>
          </div>

          <div className="p-3 bg-sand-100 border border-sand-300 rounded-lg flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-ink font-semibold">
                Why TLS patching is required
              </h4>
              <p className="text-ink-muted text-[11px] mt-1">
                Legacy EA titles from 2006–2012 used hardcoded VeriSign / EA Root CA certificate public keys inside the game binaries. Because mohPA operates as a private replacement server with custom TLS certificates, the game client will abort the handshake with an <code className="text-amber-300">SSL_ERROR_HANDSHAKE_FAILURE</code> unless the verification check is bypassed using the proven Aluigi SSL patcher or binary modifications.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 border-b border-sand-200 pb-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                'px-3 py-1.5 rounded-sm font-semibold uppercase tracking-wider transition-colors',
                activeTab === 'overview'
                  ? 'bg-olive-600 text-white border border-olive-700'
                  : 'text-ink-muted hover:text-ink'
              )}
            >
              Engine Directives
            </button>
            <button
              onClick={() => setActiveTab('aluigi')}
              className={cn(
                'px-3 py-1.5 rounded-sm font-semibold uppercase tracking-wider transition-colors',
                activeTab === 'aluigi'
                  ? 'bg-olive-600 text-white border border-olive-700'
                  : 'text-ink-muted hover:text-ink'
              )}
            >
              Aluigi Universal Patcher Guide
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={cn(
                'px-3 py-1.5 rounded-sm font-semibold uppercase tracking-wider transition-colors',
                activeTab === 'manual'
                  ? 'bg-olive-600 text-white border border-olive-700'
                  : 'text-ink-muted hover:text-ink'
              )}
            >
              Hex & Disassembly Signatures
            </button>
          </div>

          {/* Tab Content: Engine Directives */}
          {activeTab === 'overview' && (
            <div className="space-y-4 pt-2">
              <p className="text-ink-muted">
                Directives and execution steps for all 5 supported mohPA game titles:
              </p>

              <div className="space-y-3">
                {patchDirectives.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-sand-50 border border-sand-200 rounded-sm space-y-2 hover:border-sand-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-sand-200 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-hud font-bold text-ink text-sm">
                          {item.gameTitle}
                        </span>
                        <Badge variant="CYAN">{item.engine}</Badge>
                      </div>
                      <span className="text-[11px] font-mono text-cyan-400">
                        Target: {item.targetBinary}
                      </span>
                    </div>

                    <ol className="list-decimal list-inside space-y-1.5 text-ink pl-1 pt-1 text-[11px]">
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
            <div className="space-y-4 pt-2 text-ink">
              <div className="p-4 bg-sand-50 border border-sand-200 rounded-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-hud font-bold text-sm text-cyan-300 uppercase">
                    Aluigi EA SSL Universal Bypass Routine
                  </h4>
                  <Badge variant="ONLINE">VERIFIED WORKING</Badge>
                </div>

                <p className="text-[11px] text-ink-muted">
                  Developed by veteran security researcher Luigi Auriemma (aluigi), this utility dynamically intercepts the OpenSSL / SChannel root certificate verification callbacks, causing the game to trust any SSL certificate issued by private servers (such as mohPA).
                </p>

                <div className="space-y-2 pt-2 border-t border-sand-200">
                  <h5 className="font-semibold text-ink uppercase text-[11px]">
                    Method A: Drag-and-Drop Automated Patching
                  </h5>
                  <ol className="list-decimal list-inside space-y-1 text-ink-muted pl-1 text-[11px]">
                    <li>Download the compiled <code className="text-cyan-400">ea_ssl_patch.exe</code> tool.</li>
                    <li>Make a backup copy of your original game executable (e.g. <code className="text-ink">mohpa.exe.bak</code>).</li>
                    <li>Drag your game executable directly onto <code className="text-cyan-400">ea_ssl_patch.exe</code>.</li>
                    <li>The patcher will scan byte patterns, apply the jump patch, and output a confirmation message.</li>
                  </ol>
                </div>

                <div className="space-y-2 pt-2 border-t border-sand-200">
                  <h5 className="font-semibold text-ink uppercase text-[11px]">
                    Method B: DLL Proxy Injection (Non-Destructive)
                  </h5>
                  <ol className="list-decimal list-inside space-y-1 text-ink-muted pl-1 text-[11px]">
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
              <p className="text-ink-muted">
                For security researchers and server developers patching executables using HxD, IDA Pro, or Ghidra:
              </p>

              <div className="space-y-3">
                {patchDirectives.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-sand-50 border border-sand-200 rounded-sm font-mono text-[11px] space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-ink font-bold">
                      <span>{item.gameTitle} ({item.targetBinary})</span>
                      <span className="text-amber-400">{item.offsetHex}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div className="p-2 bg-sand-50 rounded border border-sand-200">
                        <span className="text-ink-muted block text-[10px]">ORIGINAL HEX BYTES:</span>
                        <code className="text-crimson-400 font-bold">{item.originalBytes}</code>
                      </div>
                      <div className="p-2 bg-sand-50 rounded border border-sand-200">
                        <span className="text-ink-muted block text-[10px]">PATCHED REPLACEMENT:</span>
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
