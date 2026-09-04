import React, { useState } from 'react';
import { Server, Plus, Shield, Check, Copy } from 'lucide-react';
import { GAMES } from '../../types/game';
import { GameServer, RegisterServerData, RegisterServerResponse } from '../../types/server';
import serverService from '../../services/serverService';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useToast } from '../hud/Toast';

export interface RegisterServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered?: (server: GameServer) => void;
}

export const RegisterServerModal: React.FC<RegisterServerModalProps> = ({
  isOpen,
  onClose,
  onRegistered,
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<RegisterServerData>({
    name: '',
    gameSlug: 'mohpa',
    ipAddress: '',
    port: 13200,
    queryPort: 29900,
    isRanked: true,
    maxPlayers: 64,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<RegisterServerResponse | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.ipAddress.trim()) {
      toast.error('Validation Error', 'Server name and IP address are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await serverService.registerServer({
        ...formData,
        name: formData.name.trim(),
        ipAddress: formData.ipAddress.trim(),
        port: Number(formData.port),
        queryPort: Number(formData.queryPort) || 0,
        maxPlayers: Number(formData.maxPlayers) || 64,
      });

      setRegistrationResult(result);
      toast.success('Server Registered', `Server node "${formData.name}" enrolled into CentralSpy theater network.`);
      if (onRegistered) {
        onRegistered(result.server);
      }
    } catch (err: any) {
      toast.error('Registration Failed', err.response?.data?.error || 'Failed to register server node.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySecret = async () => {
    if (!registrationResult?.secretKey) return;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(registrationResult.secretKey);
      }
      setCopiedSecret(true);
      toast.success('Secret Key Copied', 'Server secret key copied to clipboard.');
      setTimeout(() => setCopiedSecret(false), 2000);
    } catch {
      toast.error('Copy Failed', 'Failed to copy secret key.');
    }
  };

  const handleResetAndClose = () => {
    setRegistrationResult(null);
    setFormData({
      name: '',
      gameSlug: 'mohpa',
      ipAddress: '',
      port: 13200,
      queryPort: 29900,
      isRanked: true,
      maxPlayers: 64,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title="REGISTER DEDICATED THEATER SERVER"
      subtitle="Enroll a new game server node into CentralSpy Theater directory"
      icon={<Server className="w-5 h-5 text-cyan-400" />}
      size="lg"
    >
      {registrationResult ? (
        <div className="space-y-4 font-mono text-xs animate-fade-in">
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-sm text-emerald-300 space-y-2">
            <h4 className="font-hud font-bold text-sm uppercase text-emerald-400 mb-1">
              NODE ENROLLMENT SUCCESSFUL
            </h4>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              Your server <b>{registrationResult.server.name}</b> has been registered. The backend queried the node via UDP.
            </p>

            {/* Live Query Telemetry Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-500/30 text-[11px]">
              <div className="bg-carbon-950/60 p-2 rounded border border-emerald-500/20">
                <span className="text-gray-400 block text-[10px] uppercase">STATUS</span>
                <span className={registrationResult.server.isOnline ? 'text-emerald-400 font-bold' : 'text-crimson-400 font-bold'}>
                  {registrationResult.server.isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
              <div className="bg-carbon-950/60 p-2 rounded border border-emerald-500/20">
                <span className="text-gray-400 block text-[10px] uppercase">MAP</span>
                <span className="text-cyan-300 font-bold truncate block">
                  {registrationResult.server.mapName || 'None'}
                </span>
              </div>
              <div className="bg-carbon-950/60 p-2 rounded border border-emerald-500/20">
                <span className="text-gray-400 block text-[10px] uppercase">MODE</span>
                <span className="text-cyan-300 font-bold truncate block">
                  {registrationResult.server.gameMode || 'None'}
                </span>
              </div>
              <div className="bg-carbon-950/60 p-2 rounded border border-emerald-500/20">
                <span className="text-gray-400 block text-[10px] uppercase">PLAYERS</span>
                <span className="text-cyan-300 font-bold">
                  {registrationResult.server.currentPlayers || 0} / {registrationResult.server.maxPlayers || 64}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 uppercase text-[11px]">Server Secret Key</label>
            <div className="flex items-center bg-carbon-950 border border-carbon-700 rounded-sm p-1.5">
              <code className="flex-1 px-2.5 py-1 text-cyan-300 font-mono text-xs select-all break-all">
                {registrationResult.secretKey}
              </code>
              <Button
                type="button"
                variant="primary"
                size="xs"
                leftIcon={copiedSecret ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                onClick={handleCopySecret}
              >
                {copiedSecret ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <p className="text-[10px] text-gray-500">
              Keep this key secure. It authorizes heartbeat telemetry and player count updates.
            </p>
          </div>

          <div className="pt-3 flex justify-end">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleResetAndClose}
            >
              Done & Return to Browser
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <Input
            label="Server Display Name"
            placeholder="e.g. [EU] Titan 24/7 Fast Spawn"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Target Game Network"
              options={GAMES.map((g) => ({ value: g.slug, label: g.name }))}
              value={formData.gameSlug}
              onChange={(e) => setFormData({ ...formData, gameSlug: e.target.value })}
            />

            <Input
              label="Public IPv4 Address"
              placeholder="e.g. 198.51.100.24"
              value={formData.ipAddress}
              onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Game Port"
              type="number"
              placeholder="18275"
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: Number(e.target.value) })}
              required
            />

            <Input
              label="Query Port"
              type="number"
              placeholder="18270"
              value={formData.queryPort || ''}
              onChange={(e) => setFormData({ ...formData, queryPort: Number(e.target.value) })}
            />

            <Input
              label="Max Players"
              type="number"
              placeholder="64"
              value={formData.maxPlayers || ''}
              onChange={(e) => setFormData({ ...formData, maxPlayers: Number(e.target.value) })}
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <label className="flex items-center space-x-2 text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isRanked}
                onChange={(e) => setFormData({ ...formData, isRanked: e.target.checked })}
                className="w-4 h-4 rounded bg-carbon-950 border-carbon-700 text-cyan-500 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                Enable Ranked Stats Tracking for this Node
              </span>
            </label>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-carbon-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetAndClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              isLoading={isSubmitting}
            >
              Register Node
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
