import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FileCode, Binary, Clock, Server, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { PacketInspectorEvent } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { cn } from '../../utils/cn';

interface PacketDetailsDrawerProps {
  packet: PacketInspectorEvent | null;
  onClose: () => void;
}

export const PacketDetailsDrawer: React.FC<PacketDetailsDrawerProps> = ({ packet, onClose }) => {
  const [activeTab, setActiveTab] = useState<'kv' | 'json' | 'hex'>('kv');
  const [copied, setCopied] = useState<boolean>(false);

  if (!packet) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(packet, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format timestamp helper
  const dateObj = new Date(packet.timestamp);
  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  const formattedTime = `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}.${pad(dateObj.getMilliseconds(), 3)}`;
  const formattedDate = dateObj.toLocaleDateString();

  // Parse Key-Value pairs
  const kvEntries: { key: string; value: string; type: string }[] = [];
  if (packet.payload && typeof packet.payload === 'object') {
    Object.entries(packet.payload).forEach(([k, v]) => {
      kvEntries.push({
        key: k,
        value: typeof v === 'object' ? JSON.stringify(v) : String(v),
        type: typeof v,
      });
    });
  } else if (typeof packet.payload === 'string') {
    // Try newline or delimiter split
    const lines = packet.payload.split(/\r?\n/);
    lines.forEach((line) => {
      const eqIdx = line.indexOf('=');
      if (eqIdx > 0) {
        kvEntries.push({
          key: line.slice(0, eqIdx).trim(),
          value: line.slice(eqIdx + 1).trim(),
          type: 'string',
        });
      } else if (line.trim()) {
        kvEntries.push({
          key: 'data',
          value: line.trim(),
          type: 'string',
        });
      }
    });
  }

  // Generate formatted Hex dump view
  const generateHexDump = (): string => {
    if (packet.rawHex) {
      // Format raw hex into lines of 16 bytes
      const cleanHex = packet.rawHex.replace(/[^0-9a-fA-F]/g, '');
      const bytes: string[] = [];
      for (let i = 0; i < cleanHex.length; i += 2) {
        bytes.push(cleanHex.slice(i, i + 2));
      }

      let dump = '';
      for (let i = 0; i < bytes.length; i += 16) {
        const offset = i.toString(16).padStart(8, '0');
        const chunk = bytes.slice(i, i + 16);
        const hexPart = chunk.join(' ').padEnd(48, ' ');
        const asciiPart = chunk
          .map((b) => {
            const charCode = parseInt(b, 16);
            return charCode >= 32 && charCode <= 126 ? String.fromCharCode(charCode) : '.';
          })
          .join('');
        dump += `${offset}:  ${hexPart}  |${asciiPart}|\n`;
      }
      return dump || 'No hex data available.';
    }

    // Convert payload string/json to simulated hex dump
    const payloadStr = typeof packet.payload === 'string' ? packet.payload : JSON.stringify(packet.payload);
    let dump = '';
    const bytes: number[] = [];
    for (let i = 0; i < payloadStr.length; i++) {
      bytes.push(payloadStr.charCodeAt(i) & 0xff);
    }

    for (let i = 0; i < bytes.length; i += 16) {
      const offset = i.toString(16).padStart(8, '0');
      const chunk = bytes.slice(i, i + 16);
      const hexPart = chunk.map((b) => b.toString(16).padStart(2, '0')).join(' ').padEnd(48, ' ');
      const asciiPart = chunk
        .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'))
        .join('');
      dump += `${offset}:  ${hexPart}  |${asciiPart}|\n`;
    }
    return dump || 'No payload data available.';
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-carbon-950/70 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-carbon-900 border-l border-carbon-700 shadow-2xl z-10 flex flex-col h-full animate-slide-left">
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-carbon-950 border-b border-carbon-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-sm bg-carbon-900 border border-carbon-700 text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-hud font-bold text-sm tracking-wider uppercase text-gray-100">
                  {packet.subsystemOrCommand}
                </h3>
                <Badge
                  variant={packet.protocol === 'FESL' ? 'CYAN' : 'DEFAULT'}
                  className={packet.protocol === 'FESL' ? 'text-purple-400 border-purple-500/40 bg-purple-950/60' : 'text-blue-400 border-blue-500/40 bg-blue-950/60'}
                >
                  {packet.protocol}
                </Badge>
                <span
                  className={cn(
                    'inline-flex items-center space-x-1 px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider border',
                    packet.direction === 'INCOMING'
                      ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
                      : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                  )}
                >
                  {packet.direction === 'INCOMING' ? (
                    <ArrowDownLeft className="w-3 h-3 text-cyan-400" />
                  ) : (
                    <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                  )}
                  <span>{packet.direction}</span>
                </span>
              </div>
              <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                TXN / SUBTYPE: <span className="text-gray-200">{String(packet.subtypeOrTxn)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="xs"
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              onClick={handleCopyJson}
            >
              {copied ? 'Copied' : 'Copy JSON'}
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-sm text-gray-400 hover:text-white hover:bg-carbon-800 transition-colors focus:outline-none"
              aria-label="Close Inspector Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-carbon-950/50 border-b border-carbon-800 font-mono text-xs">
          <div className="space-y-0.5">
            <div className="text-[10px] text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" /> TIMESTAMP
            </div>
            <div className="text-gray-200 font-medium">{formattedTime}</div>
            <div className="text-[9px] text-gray-400">{formattedDate}</div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[10px] text-gray-400 flex items-center gap-1">
              <Server className="w-3 h-3 text-emerald-400" /> CLIENT ENDPOINT
            </div>
            <div className="text-gray-200 font-medium truncate">
              {packet.clientIp}:{packet.clientPort}
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[10px] text-gray-400">PAYLOAD LENGTH</div>
            <div className="text-gray-200 font-medium">
              {packet.length} <span className="text-gray-400 text-[10px]">bytes</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[10px] text-gray-400">FRAME ID</div>
            <div className="text-gray-300 font-medium truncate" title={packet.id}>
              {packet.id.slice(0, 10)}...
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center px-4 border-b border-carbon-800 bg-carbon-950/80 space-x-2">
          <button
            onClick={() => setActiveTab('kv')}
            className={cn(
              'flex items-center space-x-1.5 px-3 py-2.5 font-mono text-xs uppercase tracking-wider border-b-2 transition-colors',
              activeTab === 'kv'
                ? 'border-cyan-500 text-cyan-300 font-semibold bg-carbon-900/50'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            )}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Key-Value / Tree ({kvEntries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={cn(
              'flex items-center space-x-1.5 px-3 py-2.5 font-mono text-xs uppercase tracking-wider border-b-2 transition-colors',
              activeTab === 'json'
                ? 'border-cyan-500 text-cyan-300 font-semibold bg-carbon-900/50'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            )}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>JSON Viewer</span>
          </button>

          <button
            onClick={() => setActiveTab('hex')}
            className={cn(
              'flex items-center space-x-1.5 px-3 py-2.5 font-mono text-xs uppercase tracking-wider border-b-2 transition-colors',
              activeTab === 'hex'
                ? 'border-cyan-500 text-cyan-300 font-semibold bg-carbon-900/50'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            )}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Raw Hex / String</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs">
          {activeTab === 'kv' && (
            <div className="space-y-2">
              {kvEntries.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No Key-Value payload entries decoded.
                </div>
              ) : (
                <div className="border border-carbon-800 rounded-sm overflow-hidden bg-carbon-950/60">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-carbon-900/80 border-b border-carbon-800 text-[10px] text-gray-400 uppercase tracking-wider">
                        <th className="px-3 py-2 text-left font-semibold w-1/3">Key</th>
                        <th className="px-3 py-2 text-left font-semibold">Value</th>
                        <th className="px-3 py-2 text-right font-semibold w-16">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-carbon-800/60 text-xs">
                      {kvEntries.map((item, idx) => (
                        <tr
                          key={`${item.key}-${idx}`}
                          className={idx % 2 === 0 ? 'bg-carbon-950/30' : 'bg-carbon-900/20'}
                        >
                          <td className="px-3 py-2 font-semibold text-cyan-300 select-all">
                            {item.key}
                          </td>
                          <td className="px-3 py-2 text-gray-200 break-all select-all font-sans text-xs">
                            {item.value}
                          </td>
                          <td className="px-3 py-2 text-right text-[10px] text-gray-400 uppercase">
                            {item.type}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'json' && (
            <div className="p-4 bg-carbon-950 rounded-sm border border-carbon-800 text-gray-200 overflow-x-auto text-[11px] leading-relaxed">
              <pre className="font-mono">
                {JSON.stringify(
                  {
                    header: {
                      id: packet.id,
                      protocol: packet.protocol,
                      direction: packet.direction,
                      subsystemOrCommand: packet.subsystemOrCommand,
                      subtypeOrTxn: packet.subtypeOrTxn,
                      length: packet.length,
                      timestamp: packet.timestamp,
                      client: `${packet.clientIp}:${packet.clientPort}`,
                    },
                    payload: packet.payload,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}

          {activeTab === 'hex' && (
            <div className="p-4 bg-carbon-950 rounded-sm border border-carbon-800 text-emerald-400 overflow-x-auto text-[11px] leading-tight">
              <pre className="font-mono select-all whitespace-pre">
                {generateHexDump()}
              </pre>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-3 bg-carbon-950 border-t border-carbon-800 flex items-center justify-between text-xs font-mono text-gray-400">
          <span>CENTRALSPY PACKET INSPECTOR // V1.0</span>
          <Button variant="secondary" size="xs" onClick={onClose}>
            Close Inspector
          </Button>
        </div>
      </div>
    </div>
  );
};
