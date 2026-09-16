import React, { useState, useMemo, useEffect } from 'react';
import { UserPlus, AlertCircle, ShieldAlert, Shield } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { GAMES, SupportedGameSlug } from '../../types/game';
import { personaService } from '../../services/personaService';
import { useToast } from '../../components/hud/Toast';

export interface CreatePersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGameSlug: SupportedGameSlug | string;
  currentPersonaCount: number;
  maxPersonas: number;
  onPersonaCreated: () => void;
}

export const CreatePersonaModal: React.FC<CreatePersonaModalProps> = ({
  isOpen,
  onClose,
  defaultGameSlug,
  currentPersonaCount,
  maxPersonas,
  onPersonaCreated,
}) => {
  const { toast } = useToast();
  const [gameSlug, setGameSlug] = useState<string>(defaultGameSlug);
  const [personaName, setPersonaName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setGameSlug(defaultGameSlug);
      setPersonaName('');
      setApiError(null);
    }
  }, [isOpen, defaultGameSlug]);

  const gameOptions = useMemo(
    () =>
      GAMES.map((g) => ({
        value: g.slug,
        label: `${g.name} (${g.slug.toUpperCase()})`,
      })),
    []
  );

  const selectedGameConfig = useMemo(() => {
    return GAMES.find((g) => g.slug === gameSlug) || GAMES[0];
  }, [gameSlug]);

  // Client-side regex & length validation
  const validationError = useMemo(() => {
    if (!personaName) return null;
    const trimmed = personaName.trim();
    if (trimmed.length < 3) {
      return 'Soldier callsign must be at least 3 characters.';
    }
    if (trimmed.length > 24) {
      return 'Soldier callsign cannot exceed 24 characters.';
    }
    const validRegex = /^[a-zA-Z0-9_\-\[\]]+$/;
    if (!validRegex.test(trimmed)) {
      return 'Only letters, numbers, hyphens, underscores, and brackets (e.g. [CLAN]Name) are permitted.';
    }
    return null;
  }, [personaName]);

  const isLimitReached = currentPersonaCount >= maxPersonas;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!personaName.trim()) {
      setApiError('Please enter a soldier callsign.');
      return;
    }

    if (validationError) {
      setApiError(validationError);
      return;
    }

    if (isLimitReached) {
      setApiError(`Maximum limit of ${maxPersonas} personas reached for ${selectedGameConfig.name}.`);
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      await personaService.createPersona({
        gameSlug,
        name: personaName.trim(),
      });

      toast.success(
        'Soldier Enlisted',
        `Persona "${personaName.trim()}" is now deployed for ${selectedGameConfig.name}.`
      );
      onPersonaCreated();
      onClose();
    } catch (err: any) {
      const status = err.response?.status;
      const errorMsg = err.response?.data?.error;

      if (status === 409) {
        setApiError(`The callsign "${personaName.trim()}" is already registered for this game. Please pick another name.`);
      } else if (errorMsg) {
        setApiError(errorMsg);
      } else {
        setApiError('Failed to create soldier persona. Please check network connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ENLIST NEW SOLDIER PERSONA"
      subtitle={`Master Account Roster (${currentPersonaCount} / ${maxPersonas} Active)`}
      icon={<UserPlus className="w-5 h-5 text-cyan-400" />}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
        {apiError && (
          <div className="p-3 bg-stamp-50 border border-stamp-500/30 rounded-lg text-stamp-700 text-sm flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-stamp-500 shrink-0 mt-0.5" />
            <span className="flex-1">{apiError}</span>
          </div>
        )}

        {isLimitReached && (
          <div className="p-3 bg-sand-100 border border-sand-300 rounded-lg text-ink text-sm flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="flex-1">
              Roster capacity reached ({maxPersonas}/{maxPersonas}). Discharge an inactive persona before enlisting a new soldier.
            </span>
          </div>
        )}

        <Select
          label="Target Game Deployment"
          options={gameOptions}
          value={gameSlug}
          onChange={(e) => setGameSlug(e.target.value)}
        />

        <div>
          <Input
            label="Soldier Callsign / Nickname"
            placeholder="e.g. StrikeOperator or [101st]Viper"
            value={personaName}
            onChange={(e) => {
              setPersonaName(e.target.value);
              if (apiError) setApiError(null);
            }}
            error={validationError || undefined}
            helperText="3 to 24 characters. Alphanumeric, underscores, dashes, and [Clan] brackets allowed."
            leftIcon={<Shield className="w-4 h-4" />}
            required
            autoFocus
          />
        </div>

        {/* Real-time regex validation guide */}
        <div className="p-2.5 bg-sand-50 border border-sand-200 rounded-sm space-y-1 text-[11px] text-ink-muted">
          <div className="flex items-center justify-between">
            <span>Character Limit (3-24):</span>
            <span
              className={
                personaName.trim().length >= 3 && personaName.trim().length <= 24
                  ? 'text-emerald-400 font-bold'
                  : 'text-ink-muted'
              }
            >
              {personaName.trim().length} / 24
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Allowed Syntax:</span>
            <span
              className={
                personaName && !validationError
                  ? 'text-emerald-400 font-bold'
                  : 'text-ink-muted'
              }
            >
              ^[a-zA-Z0-9_\-\[\]]+$
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-sand-200">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            disabled={isLimitReached || !!validationError || !personaName.trim()}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Enlist Soldier
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePersonaModal;
