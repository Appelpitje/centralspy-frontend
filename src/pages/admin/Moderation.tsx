import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldAlert,
  UserX,
  UserCheck,
  Search,
  RefreshCw,
  Clock,
  Terminal,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AuditLog } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { BanUserModal } from './BanUserModal';
import { KickPlayerModal } from './KickPlayerModal';
import { cn } from '../../utils/cn';

export const Moderation: React.FC = () => {
  const queryClient = useQueryClient();

  // Modals state
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isKickModalOpen, setIsKickModalOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState('');
  const [unbanUserId, setUnbanUserId] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Pagination & Search state
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  // Fetch Audit Logs
  const { data: auditData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-audit-logs', page, pageSize],
    queryFn: () => adminService.getAuditLogs(pageSize, (page - 1) * pageSize),
  });

  // Unban mutation
  const unbanMutation = useMutation({
    mutationFn: (userId: string) => adminService.unbanUser(userId),
    onSuccess: (data) => {
      setNotification({ message: data.message || 'User successfully unbanned', type: 'success' });
      setUnbanUserId('');
      queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
      setTimeout(() => setNotification(null), 4000);
    },
    onError: (err: any) => {
      setNotification({
        message: err.response?.data?.error || err.message || 'Failed to unban user',
        type: 'error',
      });
      setTimeout(() => setNotification(null), 4000);
    },
  });

  const handleUnbanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unbanUserId.trim()) return;
    unbanMutation.mutate(unbanUserId.trim());
  };

  const handleBanSuccess = (userId: string) => {
    setNotification({ message: `Administrative ban issued for User ID: ${userId}`, type: 'success' });
    queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleKickSuccess = () => {
    setNotification({ message: 'Player kick command broadcasted to inspector stream', type: 'success' });
    queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
    setTimeout(() => setNotification(null), 4000);
  };

  // Filter logs locally based on search and action filter
  const logs = auditData?.logs || [];
  const filteredLogs = logs.filter((log: AuditLog) => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const inAction = log.action.toLowerCase().includes(q);
      const inActor = log.actorId?.toLowerCase().includes(q) || false;
      const inTarget = log.targetId?.toLowerCase().includes(q) || false;
      const inType = log.targetType.toLowerCase().includes(q);
      const inDetails = JSON.stringify(log.details).toLowerCase().includes(q);
      return inAction || inActor || inTarget || inType || inDetails;
    }
    return true;
  });

  const totalPages = Math.ceil((auditData?.count || 1) / pageSize) || 1;

  const renderActionBadge = (action: string) => {
    switch (action) {
      case 'BAN_USER':
        return <Badge variant="BANNED">BAN_USER</Badge>;
      case 'UNBAN_USER':
        return <Badge variant="EMERALD">UNBAN_USER</Badge>;
      case 'KICK_PLAYER':
        return <Badge variant="AMBER">KICK_PLAYER</Badge>;
      case 'CREATE_SERVER_KEY':
        return <Badge variant="CYAN">CREATE_SERVER_KEY</Badge>;
      default:
        return <Badge variant="DEFAULT">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-carbon-800 pb-4 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-hud font-bold text-xl uppercase tracking-wider text-crimson-400 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6" />
              USER MODERATION & AUDIT CONSOLE
            </h1>
            <Badge variant="ADMIN">LEVEL 10 SEC</Badge>
          </div>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Enforce account restrictions, disconnect live sessions, and track administrative audit events.
          </p>
        </div>

        {/* Quick Modal Trigger Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="danger"
            size="sm"
            leftIcon={<ShieldAlert className="w-4 h-4" />}
            onClick={() => {
              setTargetUserId('');
              setIsBanModalOpen(true);
            }}
          >
            Ban Account
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<UserX className="w-4 h-4 text-amber-400" />}
            onClick={() => setIsKickModalOpen(true)}
          >
            Kick Active Session
          </Button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={cn(
            'p-3 rounded-sm border font-mono text-xs flex items-center space-x-2 animate-fade-in',
            notification.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
              : 'bg-crimson-950/80 border-crimson-500/60 text-crimson-200'
          )}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-crimson-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Moderation Actions Quick Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Revoke Ban Form Card */}
        <Card
          title="REVOKE ACCOUNT BAN"
          subtitle="Restore authentication rights for a previously banned user ID"
          icon={<UserCheck className="w-4 h-4 text-emerald-400" />}
          accent="emerald"
        >
          <form onSubmit={handleUnbanSubmit} className="space-y-3 font-mono text-xs">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={unbanUserId}
                  onChange={(e) => setUnbanUserId(e.target.value)}
                  placeholder="Enter User ID to Unban..."
                  className="w-full bg-carbon-950 border border-carbon-700 text-gray-100 placeholder-gray-500 rounded-sm text-xs font-mono px-3 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <Button
                type="submit"
                variant="tactical"
                size="sm"
                isLoading={unbanMutation.isPending}
                disabled={!unbanUserId.trim()}
              >
                Revoke Ban
              </Button>
            </div>
            <p className="text-[11px] text-gray-400">
              Unbanning will immediately restore EA FESL login capabilities for all soldiers associated with this account.
            </p>
          </form>
        </Card>

        {/* Quick Moderation Guide / Security Context */}
        <Card
          title="MODERATION PROTOCOL COMPLIANCE"
          subtitle="Zero-tolerance enforcement parameters"
          icon={<Terminal className="w-4 h-4 text-cyan-400" />}
          accent="cyan"
        >
          <div className="space-y-2 font-mono text-xs text-gray-300">
            <div className="flex items-center justify-between text-[11px] border-b border-carbon-800 pb-1">
              <span className="text-gray-400">AUDIT LOG RETENTION:</span>
              <span className="text-emerald-400 font-semibold">IMMUTABLE (365 DAYS)</span>
            </div>
            <div className="flex items-center justify-between text-[11px] border-b border-carbon-800 pb-1">
              <span className="text-gray-400">SESSION TEARDOWN:</span>
              <span className="text-cyan-400 font-semibold">THEATER & FESL BROADCAST</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-400">AUDIT ACTOR AUTH:</span>
              <span className="text-amber-400 font-semibold">JWT ADMIN SIGNED</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Audit Logs Section */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h2 className="font-hud font-bold text-base uppercase tracking-wider text-gray-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              ADMINISTRATIVE AUDIT TRAIL
            </h2>
            <Badge variant="DEFAULT">{logs.length} RECORDS</Badge>
          </div>

          {/* Search and Action Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Action Filter */}
            <div className="flex items-center bg-carbon-900 border border-carbon-800 rounded-sm p-0.5 font-mono text-xs">
              {['ALL', 'BAN_USER', 'UNBAN_USER', 'KICK_PLAYER', 'CREATE_SERVER_KEY'].map((act) => (
                <button
                  key={act}
                  onClick={() => setActionFilter(act)}
                  className={cn(
                    'px-2 py-1 rounded-xs text-[10px] font-semibold uppercase transition-colors',
                    actionFilter === act
                      ? 'bg-carbon-800 text-cyan-300 border border-carbon-700'
                      : 'text-gray-400 hover:text-gray-200'
                  )}
                >
                  {act === 'CREATE_SERVER_KEY' ? 'SRV_KEY' : act}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit trail..."
                className="w-48 bg-carbon-900 border border-carbon-800 text-gray-200 placeholder-gray-500 rounded-sm text-xs font-mono pl-8 pr-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={cn('w-3.5 h-3.5', isFetching && 'animate-spin')} />}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Audit Table */}
        <div className="border border-carbon-800 rounded-sm bg-carbon-950/70 shadow-hud-card overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-carbon-900/90 border-b border-carbon-800 text-[10px] uppercase tracking-wider text-gray-400">
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">Admin Actor</th>
                <th className="px-4 py-3 font-semibold text-center">Action</th>
                <th className="px-4 py-3 font-semibold">Target Type & ID</th>
                <th className="px-4 py-3 font-semibold">Audit Details & Parameters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-800/60 text-gray-300">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`loading-${i}`} className="animate-pulse bg-carbon-900/20">
                    <td colSpan={5} className="px-4 py-3.5">
                      <div className="h-3.5 bg-carbon-800 rounded-sm w-3/4" />
                    </td>
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500 font-mono text-xs uppercase">
                    No matching audit records located.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log: AuditLog, idx: number) => {
                  const logDate = new Date(log.createdAt);
                  const timeFormatted = logDate.toLocaleString();

                  return (
                    <tr
                      key={log.id || `log-${idx}`}
                      className={idx % 2 === 0 ? 'bg-carbon-950/40 hover:bg-carbon-900/40' : 'bg-carbon-900/20 hover:bg-carbon-900/40'}
                    >
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-[11px]">
                        {timeFormatted}
                      </td>
                      <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                        <span className="text-cyan-300 font-semibold truncate max-w-[120px] inline-block" title={log.actorId || 'SYSTEM'}>
                          {log.actorId ? `${log.actorId.slice(0, 8)}...` : 'SYSTEM'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {renderActionBadge(log.action)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-gray-400 text-[10px] mr-1.5">{log.targetType}:</span>
                        <span className="text-gray-200 font-mono select-all font-medium">
                          {log.targetId || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-[11px] font-sans">
                        {log.details ? (
                          <div className="max-w-md truncate font-mono text-[11px] text-gray-300" title={JSON.stringify(log.details, null, 2)}>
                            {log.details.reason ? (
                              <span>Reason: <strong className="text-gray-200">{log.details.reason}</strong></span>
                            ) : (
                              JSON.stringify(log.details)
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1 text-xs font-mono text-gray-400">
            <div>
              Page <strong className="text-gray-200">{page}</strong> of <strong className="text-gray-200">{totalPages}</strong>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-sm bg-carbon-900 border border-carbon-700 text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-sm bg-carbon-900 border border-carbon-700 text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <BanUserModal
        isOpen={isBanModalOpen}
        onClose={() => setIsBanModalOpen(false)}
        defaultUserId={targetUserId}
        onSuccess={handleBanSuccess}
      />

      <KickPlayerModal
        isOpen={isKickModalOpen}
        onClose={() => setIsKickModalOpen(false)}
        onSuccess={handleKickSuccess}
      />
    </div>
  );
};
export default Moderation;
