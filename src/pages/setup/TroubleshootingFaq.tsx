import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';

interface FaqItem {
  id: string;
  code: string;
  category: 'NETWORK' | 'AUTH' | 'CRYPTO' | 'GAMEPLAY';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  symptom: string;
  rootCause: string;
  solution: string[];
}

export const TroubleshootingFaq: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('err-122');

  const faqItems: FaqItem[] = [
    {
      id: 'err-122',
      code: 'errorCode=122',
      category: 'NETWORK',
      severity: 'CRITICAL',
      title: 'Connection Refused / FESL Service Unreachable',
      symptom: 'Game hangs at login screen, then throws error dialog "Failed to connect to EA Online. (errorCode=122)".',
      rootCause: 'The game client cannot establish a TCP connection to FESL on port 18270 at the IP address specified in your hosts file.',
      solution: [
        'Verify your system hosts file (C:\\Windows\\System32\\drivers\\etc\\hosts or /etc/hosts) has correct redirection lines.',
        'Flush your DNS resolver cache by running `ipconfig /flushdns` in an elevated terminal.',
        'Ensure the CentralSpy server instance is actively running and listening on port 18270 (FESL) and 18275 (Theater).',
        'Verify that Windows Defender Firewall or antivirus software is not blocking outbound TCP traffic on port 18270.',
      ],
    },
    {
      id: 'err-locerror',
      code: 'LOCERROR_gamenotregistered',
      category: 'AUTH',
      severity: 'CRITICAL',
      title: 'Invalid Key / Game Not Registered to Account',
      symptom: 'Login succeeds, but game displays "LOCERROR_gamenotregistered" or "Invalid CD Key for this title".',
      rootCause: 'Your CentralSpy Master Account does not currently own an active entitlement CD Key SKU for this game title.',
      solution: [
        'Visit your CentralSpy User Profile and check the Entitlements tab.',
        'Click "Grant Entitlement" or "Claim License" for the desired game SKU (e.g. MOHPA-PC).',
        'Restart your game client and re-authenticate.',
      ],
    },
    {
      id: 'err-theater',
      code: 'Cannot connect to Theater',
      category: 'NETWORK',
      severity: 'WARNING',
      title: 'Theater Lobby / Server Browser Disconnection',
      symptom: 'Successfully logs into soldier persona, but server list stays empty or throws "Theater connection timed out".',
      rootCause: 'The Theater service (port 18275) handles matchmaking packets. If UDP port 18275 is blocked by router NAT or firewall, lobby synchronization drops.',
      solution: [
        'Confirm port 18275 (both TCP and UDP) is reachable and open on both client and server firewalls.',
        'If hosting servers behind a home NAT router, enable NAT Loopback / Hairpinning or forward port 18275.',
        'Check that your game client hosts file redirect includes `${gameSlug}.theater.ea.com`.',
      ],
    },
    {
      id: 'err-ssl',
      code: 'SSL_ERROR_HANDSHAKE_FAILURE',
      category: 'CRYPTO',
      severity: 'CRITICAL',
      title: 'SSL Certificate Pinning Handshake Failure',
      symptom: 'Game crashes or aborts immediately during the "Connecting to Master Server" phase without detailed error message.',
      rootCause: 'The game binary detected an untrusted SSL certificate issued by CentralSpy rather than EA VeriSign Root CA.',
      solution: [
        'Apply the Aluigi Universal SSL Bypass patch (ea_ssl_patch.exe) onto your game executable.',
        'Alternatively, drop the `dinput8.dll` memory hook into the game root directory.',
        'Refer to the "Client Patches & SSL" tab for binary-specific offset patches.',
      ],
    },
    {
      id: 'err-credentials',
      code: 'AUTH_INVALID_CREDENTIALS',
      category: 'AUTH',
      severity: 'WARNING',
      title: 'Invalid Master Account Credentials',
      symptom: 'Login fails with "The account name or password entered is invalid".',
      rootCause: 'Attempting to log in using a Soldier Persona callsign instead of the CentralSpy Master Account Email address.',
      solution: [
        'Enter your CentralSpy Master Email (e.g. soldier@example.com) in the username field, not your in-game soldier name.',
        'Ensure password matches your CentralSpy Web Portal password.',
        'Soldier personas are chosen inside the soldier selection menu after the master login succeeds.',
      ],
    },
    {
      id: 'err-maxpersonas',
      code: 'SUBACCOUNT_LIMIT_EXCEEDED',
      category: 'AUTH',
      severity: 'INFO',
      title: 'Sub-Account / Persona Limit Reached',
      symptom: 'In-game soldier creation prompt fails with "Cannot create additional soldiers".',
      rootCause: 'Each game enforces a persona limit per master account (typically 4 soldiers, or 6 for Play4Free).',
      solution: [
        'Navigate to the "Soldiers & Personas" manager in the CentralSpy portal.',
        'Deactivate or delete unused soldier personas to free up allocation slots.',
      ],
    },
  ];

  const filteredItems = useMemo(() => {
    return faqItems.filter((item) => {
      const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      if (!matchesCat) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.code.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.symptom.toLowerCase().includes(q) ||
        item.rootCause.toLowerCase().includes(q)
      );
    });
  }, [faqItems, searchQuery, selectedCategory]);

  const categories = ['ALL', 'NETWORK', 'AUTH', 'CRYPTO', 'GAMEPLAY'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search and Filters Header */}
      <Card
        title="CENTRALSPY TROUBLESHOOTING & ERROR CODE MATRIX"
        subtitle="Search verified solutions for connection anomalies and protocol status codes"
        icon={<HelpCircle className="w-4 h-4 text-cyan-400" />}
        accent="cyan"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search error code (e.g. 122, LOCERROR, SSL)..."
                className="w-full bg-carbon-900 border border-carbon-700 text-gray-200 placeholder-gray-500 rounded-sm text-xs font-mono pl-9 pr-3 py-2 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'px-2.5 py-1 rounded-sm text-[10px] font-semibold uppercase tracking-wider transition-colors',
                    selectedCategory === cat
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                      : 'bg-carbon-900 text-gray-400 hover:text-gray-200 border border-carbon-800'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Accordion FAQ Cards */}
      <div className="space-y-3 font-mono text-xs">
        {filteredItems.length === 0 ? (
          <div className="hud-card p-8 rounded-sm text-center text-gray-500">
            <p>No matching error codes found in troubleshooting database.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className={cn(
                  'rounded-sm border transition-all duration-150 overflow-hidden',
                  isExpanded
                    ? 'bg-carbon-900/90 border-cyan-500/50 shadow-glow-cyan'
                    : 'bg-carbon-950/80 border-carbon-800 hover:border-carbon-700'
                )}
              >
                {/* Header Toggle */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full p-4 flex items-center justify-between text-left focus:outline-none"
                >
                  <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                    <span className="px-2 py-0.5 rounded-sm bg-carbon-950 border border-carbon-700 text-cyan-400 font-bold text-[11px]">
                      {item.code}
                    </span>
                    <span className="font-hud font-bold text-sm text-gray-100">
                      {item.title}
                    </span>
                    <Badge variant={item.severity === 'CRITICAL' ? 'CRIMSON' : 'AMBER'}>
                      {item.severity}
                    </Badge>
                  </div>

                  <div className="text-gray-400 pl-2">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Expanded Body */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-carbon-800/80 space-y-3 bg-carbon-950/40">
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                        Observed Symptom:
                      </span>
                      <p className="text-gray-300">{item.symptom}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                        Root Cause:
                      </span>
                      <p className="text-gray-400 text-[11px]">{item.rootCause}</p>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolution Directive:
                      </span>
                      <ol className="list-decimal list-inside space-y-1 text-gray-300 pl-1 text-[11px]">
                        {item.solution.map((step, sIdx) => (
                          <li key={sIdx} className="leading-relaxed">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TroubleshootingFaq;
