import React, { useRef, useEffect } from 'react';
import {
  Terminal,
  Play,
  Pause,
  Trash2,
  ArrowDownToLine,
  Search,
  Filter,
  RefreshCw,
  Activity,
  Layers,
} from 'lucide-react';
import { useProtocolInspector } from '../../hooks/useProtocolInspector';
import { PacketDetailsDrawer } from './PacketDetailsDrawer';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PacketInspectorEvent } from '../../types';
import { cn } from '../../utils/cn';

const SUBSYSTEM_PRESETS = [
  'fsys',
  'acct',
  'subs',
  'dobj',
  'rank',
  'pnow',
  'CONN',
  'USER',
  'GLST',
  'EGAM',
];

export const ProtocolInspector: React.FC = () => {
  const {
    packets,
    totalBufferedPackets,
    connectionState,
    activeClients,
    isPaused,
    togglePause,
    autoScroll,
    toggleAutoScroll,
    selectedPacket,
    setSelectedPacket,
    filter,
    setFilter,
    clearBuffer,
    reconnect,
  } = useProtocolInspector();

  const feedContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new packets if enabled
  useEffect(() => {
    if (autoScroll && feedContainerRef.current) {
      feedContainerRef.current.scrollTop = feedContainerRef.current.scrollHeight;
    }
  }, [packets, autoScroll]);

  // Helper to format payload summary
  const getPayloadPreview = (pkt: PacketInspectorEvent): string => {
    if (typeof pkt.payload === 'string') {
      return pkt.payload.replace(/\r?\n/g, ' | ').slice(0, 80);
    }
    if (pkt.payload && typeof pkt.payload === 'object') {
      const keys = Object.keys(pkt.payload);
      if (keys.length === 0) return '{}';
      return keys
        .slice(0, 3)
        .map((k) => `${k}=${JSON.stringify((pkt.payload as any)[k])}`)
        .join(', ')
        .slice(0, 80);
    }
    return '-';
  };

  const statusLedClass =
    connectionState === 'OPEN'
      ? isPaused
        ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
        : 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
      : 'bg-crimson-500 shadow-[0_0_8px_#ef4444]';

  const statusLabel =
    connectionState === 'OPEN'
      ? isPaused
        ? 'PAUSED'
        : 'LIVE STREAMING'
      : connectionState === 'CONNECTING'
      ? 'CONNECTING'
      : 'DISCONNECTED';

  return (
    <div className="space-y-4 animate-fade-in max-w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-sand-200 pb-3 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-hud font-bold text-xl uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              REAL-TIME FESL & THEATER PROTOCOL INSPECTOR
            </h1>
            <Badge variant="RANKED">LIVE WS</Badge>
          </div>
          <p className="text-xs font-mono text-ink-muted mt-0.5">
            Deep frame packet inspection, transactional decoding, and bidirectional telemetry.
          </p>
        </div>

        {/* Stats strip */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-sand-50 border border-sand-200 rounded-sm">
            <span className={cn('w-2 h-2 rounded-full shrink-0', statusLedClass)} />
            <span className="font-semibold text-ink">{statusLabel}</span>
          </div>

          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-sand-50 border border-sand-200 rounded-sm text-ink">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              BUFFER: <strong className="text-cyan-400">{totalBufferedPackets}</strong> / 500
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-sand-50 border border-sand-200 rounded-sm text-ink">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>
              CLIENTS: <strong className="text-purple-400">{activeClients}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="bg-sand-50 border border-sand-200 rounded-sm p-3 space-y-3">
        {/* Main Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant={isPaused ? 'tactical' : 'secondary'}
              size="sm"
              leftIcon={isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              onClick={togglePause}
            >
              {isPaused ? 'Resume Stream' : 'Pause Stream'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-crimson-400" />}
              onClick={clearBuffer}
              title="Clear Local and Server Packet Buffer"
            >
              Clear Buffer
            </Button>

            <Button
              variant={autoScroll ? 'primary' : 'secondary'}
              size="sm"
              leftIcon={<ArrowDownToLine className="w-3.5 h-3.5" />}
              onClick={toggleAutoScroll}
              title="Toggle Auto-scroll to Newest Frame"
            >
              Auto-Scroll: {autoScroll ? 'ON' : 'OFF'}
            </Button>

            {connectionState !== 'OPEN' && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className="w-3.5 h-3.5 text-amber-400" />}
                onClick={reconnect}
              >
                Reconnect WS
              </Button>
            )}
          </div>

          {/* Protocol & Direction Pills */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {/* Protocol */}
            <div className="flex items-center bg-sand-50 border border-sand-200 rounded-sm p-0.5">
              {(['ALL', 'FESL', 'THEATER'] as const).map((proto) => (
                <button
                  key={proto}
                  onClick={() => setFilter({ protocol: proto })}
                  className={cn(
                    'px-2.5 py-1 rounded-xs text-[11px] font-semibold transition-colors',
                    filter.protocol === proto
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-glow-cyan'
                      : 'text-ink-muted hover:text-ink'
                  )}
                >
                  {proto}
                </button>
              ))}
            </div>

            {/* Direction */}
            <div className="flex items-center bg-sand-50 border border-sand-200 rounded-sm p-0.5">
              {(['ALL', 'INCOMING', 'OUTGOING'] as const).map((dir) => (
                <button
                  key={dir}
                  onClick={() => setFilter({ direction: dir })}
                  className={cn(
                    'px-2.5 py-1 rounded-xs text-[11px] font-semibold transition-colors',
                    filter.direction === dir
                      ? dir === 'INCOMING'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                        : dir === 'OUTGOING'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                        : 'bg-sand-200 text-ink border border-sand-300'
                      : 'text-ink-muted hover:text-ink'
                  )}
                >
                  {dir === 'INCOMING' ? 'IN' : dir === 'OUTGOING' ? 'OUT' : 'ALL DIR'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Subsystem Preset Badges & Search Inputs */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-2 border-t border-sand-200">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            <span className="text-[10px] uppercase tracking-wider text-ink-muted flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-cyan-400" /> Presets:
            </span>
            {SUBSYSTEM_PRESETS.map((cmd) => {
              const isSelected =
                filter.subsystemOrCommand?.toLowerCase() === cmd.toLowerCase();
              return (
                <button
                  key={cmd}
                  onClick={() =>
                    setFilter({
                      subsystemOrCommand: isSelected ? '' : cmd,
                    })
                  }
                  className={cn(
                    'px-2 py-0.5 rounded-sm text-[10px] font-mono font-semibold transition-colors border',
                    isSelected
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-glow-cyan'
                      : 'bg-sand-50 text-ink-muted border-sand-200 hover:border-sand-300 hover:text-ink'
                  )}
                >
                  {cmd}
                </button>
              );
            })}
          </div>

          {/* Inputs for Subsystem, Client IP & Search */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Subsystem Input */}
            <div className="relative">
              <input
                type="text"
                value={filter.subsystemOrCommand || ''}
                onChange={(e) => setFilter({ subsystemOrCommand: e.target.value })}
                placeholder="Filter Subsystem..."
                className="w-36 bg-sand-50 border border-sand-200 text-ink placeholder-ink-faint rounded-sm text-xs font-mono px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Client IP */}
            <div className="relative">
              <input
                type="text"
                value={filter.clientIp || ''}
                onChange={(e) => setFilter({ clientIp: e.target.value })}
                placeholder="Filter Client IP..."
                className="w-36 bg-sand-50 border border-sand-200 text-ink placeholder-ink-faint rounded-sm text-xs font-mono px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Search Query */}
            <div className="relative flex-1 lg:w-48">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-ink-muted pointer-events-none" />
              <input
                type="text"
                value={filter.searchQuery || ''}
                onChange={(e) => setFilter({ searchQuery: e.target.value })}
                placeholder="Search payload text..."
                className="w-full bg-sand-50 border border-sand-200 text-ink placeholder-ink-faint rounded-sm text-xs font-mono pl-8 pr-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Packet Feed Table */}
      <div className="border border-sand-200 rounded-sm bg-sand-50 shadow-hud-card overflow-hidden flex flex-col h-[600px]">
        {/* Table Header */}
        <div className="bg-sand-50 border-b border-sand-200 px-4 py-2.5 grid grid-cols-12 gap-2 text-[10px] font-mono uppercase tracking-wider text-ink-muted font-semibold select-none">
          <div className="col-span-2 sm:col-span-1">TIME</div>
          <div className="col-span-1 text-center">DIR</div>
          <div className="col-span-1 text-center">PROTO</div>
          <div className="col-span-3 sm:col-span-2">COMMAND / SUB</div>
          <div className="col-span-2 sm:col-span-1">TXN / SUB</div>
          <div className="hidden sm:block sm:col-span-2">CLIENT ENDPOINT</div>
          <div className="col-span-1 text-right">SIZE</div>
          <div className="col-span-2 sm:col-span-3">PAYLOAD PREVIEW</div>
        </div>

        {/* Table Body */}
        <div ref={feedContainerRef} className="flex-1 overflow-y-auto divide-y divide-sand-200/40 font-mono text-xs">
          {packets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3 p-8">
              <Terminal className="w-8 h-8 text-olive-600" />
              <div className="text-center">
                <p className="font-semibold text-ink">
                  Waiting for packets
                </p>
                <p className="text-sm text-ink-muted mt-1">
                  FESL and Theater traffic matching your filters will show up here.
                </p>
              </div>
            </div>
          ) : (
            packets.map((pkt, idx) => {
              const isSelected = selectedPacket?.id === pkt.id;
              const dateObj = new Date(pkt.timestamp);
              const pad = (n: number, z = 2) => String(n).padStart(z, '0');
              const timeStr = `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}.${pad(dateObj.getMilliseconds(), 3)}`;

              return (
                <div
                  key={pkt.id || `pkt-${idx}`}
                  onClick={() => setSelectedPacket(pkt)}
                  className={cn(
                    'grid grid-cols-12 gap-2 px-4 py-2 items-center cursor-pointer transition-colors duration-100 select-none',
                    isSelected
                      ? 'bg-olive-50 border-l-2 border-olive-600 text-ink'
                      : idx % 2 === 0
                      ? 'bg-sand-50 hover:bg-sand-50'
                      : 'bg-sand-100 hover:bg-sand-50'
                  )}
                >
                  {/* Timestamp */}
                  <div className="col-span-2 sm:col-span-1 text-[11px] text-ink-muted truncate">
                    {timeStr}
                  </div>

                  {/* Direction */}
                  <div className="col-span-1 flex justify-center">
                    <span
                      className={cn(
                        'inline-flex items-center px-1.5 py-0.2 rounded-xs text-[10px] font-bold uppercase tracking-wider border',
                        pkt.direction === 'INCOMING'
                          ? 'bg-cyan-950/80 text-cyan-300 border-cyan-600/50'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
                      )}
                    >
                      {pkt.direction === 'INCOMING' ? 'IN' : 'OUT'}
                    </span>
                  </div>

                  {/* Protocol */}
                  <div className="col-span-1 flex justify-center">
                    <span
                      className={cn(
                        'inline-flex items-center px-1.5 py-0.2 rounded-xs text-[10px] font-bold uppercase tracking-wider border',
                        pkt.protocol === 'FESL'
                          ? 'bg-purple-950/70 text-purple-300 border-purple-600/50'
                          : 'bg-blue-950/70 text-blue-300 border-blue-600/50'
                      )}
                    >
                      {pkt.protocol}
                    </span>
                  </div>

                  {/* Command / Subsystem */}
                  <div className="col-span-3 sm:col-span-2 font-bold text-ink truncate flex items-center space-x-1">
                    <span className="text-cyan-400">{pkt.subsystemOrCommand}</span>
                  </div>

                  {/* TXN / Subtype */}
                  <div className="col-span-2 sm:col-span-1 text-ink-muted truncate text-[11px]">
                    {String(pkt.subtypeOrTxn)}
                  </div>

                  {/* Client Endpoint */}
                  <div className="hidden sm:block sm:col-span-2 text-ink-muted text-[11px] truncate">
                    {pkt.clientIp}:{pkt.clientPort}
                  </div>

                  {/* Length */}
                  <div className="col-span-1 text-right text-ink-muted text-[11px]">
                    {pkt.length} B
                  </div>

                  {/* Payload preview */}
                  <div className="col-span-2 sm:col-span-3 text-ink-muted text-[11px] truncate font-sans">
                    {getPayloadPreview(pkt)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-sand-50 border-t border-sand-200 flex items-center justify-between text-[11px] font-mono text-ink-muted">
          <div>
            SHOWING <strong className="text-ink">{packets.length}</strong> FRAMES // CLICK ROW FOR DEEP INSPECTION
          </div>
          <div className="flex items-center space-x-3">
            <span>SOCKET STATUS: <span className="text-emerald-400 font-semibold">{connectionState}</span></span>
          </div>
        </div>
      </div>

      {/* Packet Inspection Drawer */}
      <PacketDetailsDrawer
        packet={selectedPacket}
        onClose={() => setSelectedPacket(null)}
      />
    </div>
  );
};
export default ProtocolInspector;
