import React, { useState } from 'react';
import { AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Persona } from '../../types/persona';
import { personaService } from '../../services/personaService';
import { useToast } from '../../components/hud/Toast';

export interface DeletePersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: Persona | null;
  onPersonaDeleted: () => void;
}

export const DeletePersonaModal: React.FC<DeletePersonaModalProps> = ({
  isOpen,
  onClose,
  persona,
  onPersonaDeleted,
}) => {
  const { toast } = useToast();
  const [confirmText, setConfirmText] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!persona) return null;

  const isConfirmed = confirmText.trim() === persona.name;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) {
      setError(`Please type "${persona.name}" to confirm discharge.`);
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await personaService.deletePersona(persona.id);
      toast.success(
        'Soldier Discharged',
        `Persona "${persona.name}" has been permanently decommissioned.`
      );
      setConfirmText('');
      onPersonaDeleted();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to delete persona. Please try again.';
      setError(msg);
      toast.error('Discharge Failed', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="DISCHARGE SOLDIER PERSONA"
      subtitle={`Decommissioning ${persona.name}`}
      icon={<AlertTriangle className="w-5 h-5 text-crimson-400" />}
      size="md"
    >
      <form onSubmit={handleDelete} className="space-y-4 font-mono text-xs">
        {error && (
          <div className="p-3 bg-stamp-50 border border-stamp-500/30 rounded-lg text-stamp-700 text-sm">
            {error}
          </div>
        )}

        <div className="p-3.5 bg-stamp-50 border border-stamp-500/30 rounded-lg space-y-2 text-ink">
          <div className="flex items-center space-x-2 text-stamp-700 font-semibold">
            <ShieldAlert className="w-4 h-4" />
            <span>Permanent deletion</span>
          </div>
          <p className="text-sm leading-relaxed text-ink-muted">
            Discharging <span className="font-semibold text-ink">{persona.name}</span> will permanently wipe all attached combat telemetry, unlocked weapons, soldier achievements, and leaderboard rankings across the mohPA network.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-ink">
            To confirm this operation, type the soldier callsign{' '}
            <span className="text-cyan-400 font-bold select-all bg-sand-50 px-1.5 py-0.5 rounded border border-sand-200">
              {persona.name}
            </span>{' '}
            below:
          </p>

          <Input
            placeholder={`Type ${persona.name} to confirm`}
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              if (error) setError(null);
            }}
            required
            autoFocus
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-sand-200">
          <Button type="button" variant="ghost" size="md" onClick={handleClose}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant="danger"
            size="md"
            isLoading={isDeleting}
            disabled={!isConfirmed}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Discharge Soldier
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DeletePersonaModal;
