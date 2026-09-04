import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Terminal,
  Key,
  Shield,
  UserX,
  Clock,
  ArrowRight,
  Radio,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { MetricCard } from '../../components/hud/MetricCard';
import { StatusIndicator } from '../../components/hud/StatusIndicator';

export const AdminDashboard: React.FC = () => {
  const { data: sessionData, refetch, isFetching } = useQuery({
    queryKey: ['admin-sessions-telemetry'],
    queryFn: () => adminService.getAdminSessions(),
    refetchInterval: 10000,
  });

  const { data: auditData } = useQuery({
    queryKey: ['admin-audit-count'],
    queryFn: () => adminService.getAuditLogs(10, 0),
    refetchInterval: 15000,
  });

  const inspectorStats = sessionData?.inspector || {
    connectedClients: 0,
    totalBufferedPackets: 0,
    totalPacketsObserved: 0,
  };

  const onlineServersCount = sessionData?.onlineServersCount || 0;
  const auditLogsCount = auditData?.count || 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-carbon-800 pb-4 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-hud font-bold text-2xl uppercase tracking-wider text-crimson-400 flex items-center gap-2">
              <ShieldAlert className="w-7 h-7" />
              CENTRALSPY ADMIN & PROTOCOL OPS CONSOLE
            </h1>
            <Badge variant="ADMIN">LEVEL 10 SEC</Badge>
          </div>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Real-time FESL/Theater engine packet debugger, dedicated server authority, and user moderation center.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={isFetching ? 'w-3.5 h-3.5 animate-spin' : 'w-3.5 h-3.5'} />}
            onClick={() => refetch()}
          >
            Sync Telemetry
          </Button>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active FESL Sockets"
          value={inspectorStats.connectedClients || 0}
          subtitle="Live WebSocket clients"
          icon={<Terminal className="w-4 h-4" />}
          accentColor="cyan"
        />
        <MetricCard
          title="Buffered Packets"
          value={inspectorStats.totalBufferedPackets ?? inspectorStats.totalPacketsObserved ?? 0}
          subtitle="Decoded protocol frames"
          icon={<Cpu className="w-4 h-4" />}
          accentColor="amber"
        />
        <MetricCard
          title="Online Dedicated Servers"
          value={onlineServersCount}
          subtitle="Heartbeat verified"
          icon={<Radio className="w-4 h-4" />}
          accentColor="emerald"
        />
        <MetricCard
          title="Security Audit Events"
          value={auditLogsCount}
          subtitle="Tracked admin operations"
          icon={<Shield className="w-4 h-4" />}
          accentColor="crimson"
        />
      </div>

      {/* System Telemetry & Fastify Health Strip */}
      <div className="p-4 bg-carbon-900 border border-carbon-800 rounded-sm font-mono text-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">FASTIFY CORE:</span>
            <StatusIndicator status="online" label="HEALTHY" size="sm" />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400">WS INSPECTOR:</span>
            <span className="text-cyan-400 font-semibold">/ws/inspector</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400">ZERO-TRUST AUTH:</span>
            <Badge variant="RANKED">ENFORCED</Badge>
          </div>
        </div>

        <div className="text-[11px] text-gray-400">
          CENTRALSPY MASTER PROTOCOL BRIDGE // REVISION 1.0.0
        </div>
      </div>

      {/* Quick Navigation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Protocol Inspector Card */}
        <Card
          title="REAL-TIME PROTOCOL INSPECTOR"
          subtitle="Live stream of raw & decoded FESL/Theater packets"
          icon={<Terminal className="w-5 h-5 text-cyan-400" />}
          accent="cyan"
          footer={
            <Link to="/admin/inspector" className="w-full">
              <Button variant="primary" size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Launch Protocol Inspector
              </Button>
            </Link>
          }
        >
          <div className="space-y-3 font-mono text-xs text-gray-300">
            <p>
              Inspect inbound and outbound network packets for EA FESL (<code className="text-cyan-400">fsys</code>, <code className="text-cyan-400">acct</code>, <code className="text-cyan-400">subs</code>, <code className="text-cyan-400">dobj</code>, <code className="text-cyan-400">rank</code>) and Theater matchmaking (<code className="text-cyan-400">CONN</code>, <code className="text-cyan-400">USER</code>, <code className="text-cyan-400">GLST</code>, <code className="text-cyan-400">EGAM</code>).
            </p>
            <div className="p-3 bg-carbon-950 rounded-sm border border-carbon-800 flex items-center justify-between text-[11px]">
              <span className="text-gray-400">LIVE CLIENTS CONNECTED:</span>
              <span className="text-cyan-400 font-bold">{inspectorStats.connectedClients || 1}</span>
            </div>
          </div>
        </Card>

        {/* User Moderation & Bans Card */}
        <Card
          title="USER MODERATION & BANS"
          subtitle="Enforce account suspensions and disconnect active sessions"
          icon={<UserX className="w-5 h-5 text-crimson-400" />}
          accent="crimson"
          footer={
            <Link to="/admin/moderation" className="w-full">
              <Button variant="danger" size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Open Moderation Center
              </Button>
            </Link>
          }
        >
          <div className="space-y-3 font-mono text-xs text-gray-300">
            <p>
              Issue immediate zero-tolerance account bans, revoke existing bans, or disconnect rogue players with real-time Theater kick packet broadcast.
            </p>
            <div className="p-3 bg-carbon-950 rounded-sm border border-carbon-800 flex items-center justify-between text-[11px]">
              <span className="text-gray-400">MODERATION ACTIONS LOGGED:</span>
              <span className="text-crimson-400 font-bold">{auditLogsCount}</span>
            </div>
          </div>
        </Card>

        {/* Dedicated Server Key Provisioning Card */}
        <Card
          title="SERVER KEY GENERATOR & FLEET"
          subtitle="Issue cryptographically signed server authentication tokens"
          icon={<Key className="w-5 h-5 text-amber-400" />}
          accent="amber"
          footer={
            <Link to="/admin/servers" className="w-full">
              <Button variant="secondary" size="sm" className="w-full hover:border-amber-500 text-amber-300" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Manage Dedicated Servers
              </Button>
            </Link>
          }
        >
          <div className="space-y-3 font-mono text-xs text-gray-300">
            <p>
              Generate secure <code className="text-amber-400">CS-SRV-...</code> tokens for trusted community hosts and dedicated server operators.
            </p>
            <div className="p-3 bg-carbon-950 rounded-sm border border-carbon-800 flex items-center justify-between text-[11px]">
              <span className="text-gray-400">ONLINE DEDICATED SERVERS:</span>
              <span className="text-amber-400 font-bold">{onlineServersCount}</span>
            </div>
          </div>
        </Card>

        {/* Audit Logs Card */}
        <Card
          title="SECURITY AUDIT LOGS"
          subtitle="Immutable audit trail of administrator events"
          icon={<Clock className="w-5 h-5 text-emerald-400" />}
          accent="emerald"
          footer={
            <Link to="/admin/moderation" className="w-full">
              <Button variant="tactical" size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View Full Audit Trail
              </Button>
            </Link>
          }
        >
          <div className="space-y-3 font-mono text-xs text-gray-300">
            <p>
              Inspect cryptographically signed audit logs with administrative actor IDs, timestamp signatures, target identifiers, and reason payloads.
            </p>
            <div className="p-3 bg-carbon-950 rounded-sm border border-carbon-800 flex items-center justify-between text-[11px]">
              <span className="text-gray-400">LOG INTEGRITY:</span>
              <span className="text-emerald-400 font-bold">VERIFIED</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
export default AdminDashboard;
