import React, { useState } from 'react';
import { UserX, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { adminService } from '../../services/adminService';
import { cn } from '../../utils/cn';

interface KickPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultId?: string;
  defaultTargetType?: 'USER' | 'PERSONA';
  onSuccess?: () => void;
}

export const KickPlayerModal: React.FC<KickPlayerModalProps> = ({
  isOpen,
  onClose,
  defaultId = '',
  defaultTargetType = 'USER',
  onSuccess,
}) => {
  const [targetType, setTargetType] = useState<'USER' | 'PERSONA'>(defaultTargetType);
  const [targetId, setTargetId] = useState(defaultId);
  const [reason, setReason] = useState('Disconnected by administrator intervention');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (defaultId) {
      setTargetId(defaultId);
    }
    if (defaultTargetType) {
      setTargetType(defaultTargetType);
    }
  }, [defaultId, defaultTargetType, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId.trim()) {
      setError(`${targetType === 'USER' ? 'User ID' : 'Persona ID'} is required`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await adminService.kickPlayer({
        userId: targetType === 'USER' ? targetId.trim() : undefined,
        personaId: targetType === 'PERSONA' ? targetId.trim() : undefined,
        reason: reason.trim(),
      });
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to kick player');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="DISCONNECT ACTIVE SESSION"
      subtitle="Broadcast tactical disconnect command to Theater/FESL gateway"
      icon={<UserX className="w-5 h-5 text-amber-400" />}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Target Mode Toggle */}
        <div className="flex items-center space-x-2 bg-carbon-950 p-1 rounded-sm border border-carbon-800">
          <button
            type="button"
            onClick={() => setTargetType('USER')}
            className={cn(
              'flex-1 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider rounded-xs transition-colors',
              targetType === 'USER'
                ? 'bg-amber-950 text-amber-300 border border-amber-600/50 shadow-glow-amber'
                : 'text-gray-400 hover:text-gray-200'
            )}
          >
            Target by User ID
          </button>
          <button
            type="button"
            onClick={() => setTargetType('PERSONA')}
            className={cn(
              'flex-1 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider rounded-xs transition-colors',
              targetType === 'PERSONA'
                ? 'bg-amber-950 text-amber-300 border border-amber-600/50 shadow-glow-amber'
                : 'text-gray-400 hover:text-gray-200'
            )}
          >
            Target by Persona ID
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-crimson-950/80 border border-crimson-600 rounded-sm text-xs font-mono text-crimson-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label={targetType === 'USER' ? 'User Account ID' : 'Soldier / Persona ID'}
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          placeholder="e.g. 3a1f8c70-..."
          required
          autoFocus
        />

        <div className="w-full flex flex-col space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-gray-300">
            Kick Reason
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for disconnection..."
            className="w-full bg-carbon-900 border border-carbon-700 text-gray-100 placeholder-gray-500 rounded-sm text-xs font-mono p-2.5 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
          />
        </div>

        <div className="pt-2 flex items-center justify-end space-x-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            isLoading={isLoading}
            leftIcon={<UserX className="w-4 h-4 text-amber-400" />}
            className="hover:border-amber-500 text-amber-300"
          >
            Dispatch Kick Command
          </Button>
        </div>
      </form>
    </Modal>
  );
};
