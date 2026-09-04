import React, { useState } from 'react';
import { Key, Copy, Check, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { adminService } from '../../services/adminService';
import { GAMES, GameConfig } from '../../types/game';

interface CreateServerKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateServerKeyModal: React.FC<CreateServerKeyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Form fields
  const [serverName, setServerName] = useState('');
  const [gameSlug, setGameSlug] = useState('mohpa');
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState('13200');
  const [maxPlayers, setMaxPlayers] = useState('64');
  const [isRanked, setIsRanked] = useState(true);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedSecretKey, setGeneratedSecretKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setGeneratedSecretKey(null);
      setError(null);
      setCopied(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverName.trim() || !gameSlug || !ipAddress.trim() || !port) {
      setError('Please provide Server Name, Game Slug, IP Address, and Port.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await adminService.createServerKey({
        serverName: serverName.trim(),
        gameSlug,
        ipAddress: ipAddress.trim(),
        port: parseInt(port, 10),
        maxPlayers: parseInt(maxPlayers, 10) || 64,
        isRanked,
      });

      setGeneratedSecretKey(response.secretKey);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to generate server key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (!generatedSecretKey) return;
    navigator.clipboard.writeText(generatedSecretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setGeneratedSecretKey(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={generatedSecretKey ? 'DEDICATED SERVER KEY ISSUED' : 'REGISTER DEDICATED SERVER KEY'}
      subtitle={
        generatedSecretKey
          ? 'Secure authentication token generated for dedicated server node'
          : 'Issue authorized FESL server registration credentials'
      }
      icon={<Key className="w-5 h-5 text-amber-400" />}
      size="lg"
    >
      {generatedSecretKey ? (
        <div className="space-y-4 font-mono text-xs animate-fade-in">
          <div className="p-4 bg-amber-950/40 border border-amber-500/50 rounded-sm flex items-start space-x-3 text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-100">CRITICAL SECURITY NOTICE:</strong>
              <p className="mt-1 text-[11px] text-amber-300">
                Copy and store this server token immediately in your dedicated server configuration (<code className="text-amber-200">server_settings.con</code> or env variables). This secret key will not be shown again.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-gray-300 font-semibold">
              Server Secret Key (Token)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={generatedSecretKey}
                className="w-full bg-carbon-950 border border-carbon-700 text-cyan-300 font-mono text-xs px-3 py-2.5 rounded-sm select-all focus:outline-none"
              />
              <Button
                variant={copied ? 'tactical' : 'primary'}
                size="md"
                leftIcon={copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                onClick={handleCopyKey}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="p-3 bg-carbon-950 border border-carbon-800 rounded-sm space-y-1 text-gray-400 text-[11px]">
            <div><strong>SERVER NAME:</strong> {serverName}</div>
            <div><strong>GAME:</strong> {gameSlug.toUpperCase()}</div>
            <div><strong>BIND ENDPOINT:</strong> {ipAddress}:{port}</div>
            <div><strong>RANKED STATUS:</strong> {isRanked ? 'YES' : 'NO'}</div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="secondary" size="sm" onClick={handleClose}>
              Done & Close
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {error && (
            <div className="p-2.5 bg-crimson-950/80 border border-crimson-600 rounded-sm text-xs font-mono text-crimson-300">
              {error}
            </div>
          )}

          <Input
            label="Server Display Name"
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            placeholder="e.g. [EU] CentralSpy Tactical #01"
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Target Game Title"
              value={gameSlug}
              onChange={(e) => setGameSlug(e.target.value)}
              options={GAMES.map((g: GameConfig) => ({
                value: g.slug,
                label: `${g.name} (${g.slug.toUpperCase()})`,
              }))}
              required
            />

            <Input
              label="Max Players Limit"
              type="number"
              min={2}
              max={128}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value)}
              placeholder="64"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Public IP Address"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="e.g. 198.51.100.24"
              required
            />

            <Input
              label="Game Server Port"
              type="number"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="13200"
              required
            />
          </div>

          <div className="flex items-center space-x-3 p-3 bg-carbon-950 border border-carbon-800 rounded-sm">
            <input
              type="checkbox"
              id="isRankedToggle"
              checked={isRanked}
              onChange={(e) => setIsRanked(e.target.checked)}
              className="w-4 h-4 rounded-xs text-cyan-500 bg-carbon-900 border-carbon-700 focus:ring-cyan-500"
            />
            <label htmlFor="isRankedToggle" className="cursor-pointer">
              <div className="text-xs font-semibold text-gray-200 uppercase">
                Authorize Official Ranked Stats Recording
              </div>
              <div className="text-[10px] text-gray-400">
                Allows this server to submit verified match results to CentralSpy leaderboards.
              </div>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Generate Server Key
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
