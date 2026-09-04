import React from 'react';
import {
  Server,
  Network,
  Cpu,
  Shield,
  Settings,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const DedicatedServerGuide: React.FC = () => {
  const portTable = [
    { service: 'FESL Authentication Service', port: '18020 / 18270', proto: 'TCP', direction: 'Outbound / Local', note: 'Secure login & persona sync with CentralSpy' },
    { service: 'Theater Matchmaking / Lobby', port: '18275', proto: 'TCP / UDP', direction: 'Inbound / Outbound', note: 'Server registration & player heartbeats' },
    { service: 'MOHPA Gameplay Network', port: '13200', proto: 'UDP', direction: 'Inbound', note: 'Main game packets & client simulation' },
    { service: 'GameSpy Master Query', port: '29900', proto: 'UDP', direction: 'Inbound', note: 'Server list ping & query status' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overview Card */}
      <Card
        title="DEDICATED SERVER HOSTING DIRECTIVES"
        subtitle="Host public or LAN game servers connected directly to the CentralSpy cluster"
        icon={<Server className="w-4 h-4 text-cyan-400" />}
        accent="cyan"
      >
        <div className="space-y-4 font-mono text-xs text-gray-300">
          <p className="text-gray-400">
            Dedicated servers register automatically with CentralSpy's Theater matchmaking service. Once started with valid hosts file redirection, your server will instantly appear in the live Server Browser.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 bg-carbon-950/80 border border-carbon-800 rounded-sm space-y-1.5">
              <div className="flex items-center space-x-2 text-cyan-300 font-bold">
                <Network className="w-4 h-4" />
                <span>1. HOSTS REDIRECTION</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Ensure the server machine has the CentralSpy hosts entries applied so Theater registration connects to CentralSpy instead of offline EA servers.
              </p>
            </div>

            <div className="p-3.5 bg-carbon-950/80 border border-carbon-800 rounded-sm space-y-1.5">
              <div className="flex items-center space-x-2 text-emerald-300 font-bold">
                <Shield className="w-4 h-4" />
                <span>2. FIREWALL & NAT PORTS</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Forward game UDP ports (e.g. 17567, 19567) on your router to allow external players from the Internet to join your match.
              </p>
            </div>

            <div className="p-3.5 bg-carbon-950/80 border border-carbon-800 rounded-sm space-y-1.5">
              <div className="flex items-center space-x-2 text-amber-300 font-bold">
                <Cpu className="w-4 h-4" />
                <span>3. SERVER BINARY STARTUP</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Launch the dedicated server binary with <code className="text-amber-400">+dedicated 1</code> and custom server configuration arguments.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Network Port Matrix */}
      <Card
        title="NETWORK PORT MATRIX & ROUTER FORWARDING"
        subtitle="Ensure these firewall ports are open for server communication"
        icon={<Network className="w-4 h-4 text-emerald-400" />}
        accent="emerald"
      >
        <div className="overflow-x-auto rounded-sm border border-carbon-800 bg-carbon-950/60 font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-carbon-800 bg-carbon-900/80 text-[11px] uppercase tracking-wider text-gray-400">
                <th className="px-4 py-3">SERVICE / SUBSYSTEM</th>
                <th className="px-3 py-3 text-center">PORT</th>
                <th className="px-3 py-3 text-center">PROTOCOL</th>
                <th className="px-3 py-3">DIRECTION</th>
                <th className="px-4 py-3">PURPOSE / NOTES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-800/60">
              {portTable.map((item, idx) => (
                <tr key={idx} className="hover:bg-carbon-900/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-200">{item.service}</td>
                  <td className="px-3 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-sm bg-carbon-900 border border-carbon-700 text-cyan-400 font-bold">
                      {item.port}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Badge variant={item.proto.includes('UDP') ? 'AMBER' : 'CYAN'}>{item.proto}</Badge>
                  </td>
                  <td className="px-3 py-3 text-gray-400">{item.direction}</td>
                  <td className="px-4 py-3 text-gray-400 text-[11px]">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Configuration Script Example */}
      <Card
        title="SERVER CONFIGURATION SCRIPT // MEDAL OF HONOR: PACIFIC ASSAULT"
        subtitle="Sample startup parameters for server administrators"
        icon={<Settings className="w-4 h-4 text-cyan-400" />}
      >
        <div className="space-y-3 font-mono text-xs text-gray-300">
          <p className="text-gray-400">
            Create a batch startup file <code className="text-cyan-400">start_server.bat</code> in your server root directory:
          </p>

          <div className="bg-carbon-950 p-4 rounded-sm border border-carbon-800 text-cyan-300 overflow-x-auto select-all shadow-inner">
            <pre>{`@echo off
title CentralSpy MOHPA Dedicated Server Node
echo Starting Medal of Honor: Pacific Assault Dedicated Server...

:: Launch executable with dedicated parameters
mohpa_server.exe +set dedicated 1 +set net_port 13200 +set sv_maxclients 32 +map mohaa1

pause`}</pre>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DedicatedServerGuide;
