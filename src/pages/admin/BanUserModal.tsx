import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { adminService } from '../../services/adminService';

interface BanUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUserId?: string;
  onSuccess?: (userId: string) => void;
}

export const BanUserModal: React.FC<BanUserModalProps> = ({
  isOpen,
  onClose,
  defaultUserId = '',
  onSuccess,
}) => {
  const [userId, setUserId] = useState(defaultUserId);
  const [reason, setReason] = useState('Violation of Community Code of Conduct / Protocol Tampering');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync defaultUserId if modal opens with prefilled user
  React.useEffect(() => {
    if (defaultUserId) {
      setUserId(defaultUserId);
    }
  }, [defaultUserId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) {
      setError('User ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await adminService.banUser({
        userId: userId.trim(),
        reason: reason.trim(),
      });
      if (onSuccess) {
        onSuccess(userId.trim());
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to ban user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ISSUE ADMINISTRATIVE BAN"
      subtitle="Revoke account access and block FESL network authentication"
      icon={<ShieldAlert className="w-5 h-5 text-crimson-400" />}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Warning Banner */}
        <div className="p-3 bg-crimson-950/40 border border-crimson-500/40 rounded-sm flex items-start space-x-3 text-xs font-mono text-crimson-300">
          <AlertTriangle className="w-4 h-4 text-crimson-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-crimson-200">TACTICAL WARNING:</strong> Banning this account will immediately invalidate all active FESL session tokens and block access across all CentralSpy supported game titles.
          </div>
        </div>

        {error && (
          <div className="p-2.5 bg-crimson-950/80 border border-crimson-600 rounded-sm text-xs font-mono text-crimson-300">
            {error}
          </div>
        )}

        <Input
          label="Target User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="e.g. 7f0a9b2c-..."
          required
          autoFocus
        />

        <div className="w-full flex flex-col space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-gray-300">
            Reason / Infraction Note
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Specify reason for moderation audit log..."
            className="w-full bg-carbon-900 border border-carbon-700 text-gray-100 placeholder-gray-500 rounded-sm text-xs font-mono p-2.5 focus:outline-none focus:border-crimson-500 focus:ring-1 focus:ring-crimson-500/50"
          />
        </div>

        <div className="pt-2 flex items-center justify-end space-x-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            size="sm"
            isLoading={isLoading}
            leftIcon={<ShieldAlert className="w-4 h-4" />}
          >
            Confirm Account Ban
          </Button>
        </div>
      </form>
    </Modal>
  );
};
