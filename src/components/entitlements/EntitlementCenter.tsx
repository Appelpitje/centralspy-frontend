import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Key,
  Plus,
  Copy,
  Check,
  Gamepad2,
  Calendar,
  Zap,
} from 'lucide-react';
import { entitlementService } from '../../services/entitlementService';
import { GAMES } from '../../types/game';
import { Entitlement } from '../../types/entitlement';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useToast } from '../hud/Toast';

export const EntitlementCenter: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [cdKey, setCdKey] = useState('');
  const [selectedGameSlug, setSelectedGameSlug] = useState<string>('mohpa');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Fetch all entitlements
  const { data: entitlements = [], isLoading } = useQuery<Entitlement[]>({
    queryKey: ['entitlements'],
    queryFn: async () => {
      return await entitlementService.getEntitlements();
    },
  });

  // Claim mutation
  const claimMutation = useMutation({
    mutationFn: async (data: { cdKey: string; gameSlug?: string }) => {
      return await entitlementService.claimCdKey(data);
    },
    onSuccess: (res) => {
      toast.success(
        'License Key Activated',
        `Successfully registered SKU for ${res.entitlement.gameSlug.toUpperCase()}`
      );
      setCdKey('');
      setClaimModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['entitlements'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || 'Invalid or already redeemed CD key.';
      toast.error('Claim Failed', msg);
    },
  });

  // Grant Dev License mutation
  const grantMutation = useMutation({
    mutationFn: async (slug: string) => {
      return await entitlementService.grantSelfGame(slug);
    },
    onSuccess: (res) => {
      toast.success(
        'Developer License Granted',
        `Test license generated for ${res.entitlement.gameSlug.toUpperCase()}`
      );
      queryClient.invalidateQueries({ queryKey: ['entitlements'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || 'Unable to grant license.';
      toast.error('Grant Failed', msg);
    },
  });

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cdKey.trim()) return;
    claimMutation.mutate({
      cdKey: cdKey.trim(),
      gameSlug: selectedGameSlug || undefined,
    });
  };

  const handleCopyKey = (key: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(key);
      setCopiedKeyId(id);
      toast.info('CD Key Copied', 'Serial key copied to clipboard.');
      setTimeout(() => {
        setCopiedKeyId(null);
      }, 2000);
    }
  };

  const getGameConfig = (slug: string) => {
    return GAMES.find((g) => g.slug === slug) || {
      slug,
      name: slug.toUpperCase(),
      tagline: 'Legacy EA Game License',
      skus: [`${slug.toUpperCase()}-PC`],
    };
  };

  const gameOptions = GAMES.map((g) => ({
    value: g.slug,
    label: `${g.name} (${g.shortName || g.slug.toUpperCase()})`,
  }));

  return (
    <div className="space-y-6">
      {/* Top action header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-carbon-900 border border-carbon-800 rounded-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-cyan-400" />
            <h2 className="font-hud font-bold text-base uppercase tracking-wider text-gray-100">
              GAME LICENSES & ENTITLEMENTS
            </h2>
          </div>
          <p className="text-xs font-mono text-gray-400 mt-0.5">
            Manage your digital game ownership and serial licenses across CentralSpy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Dev Quick-Grant dropdown */}
          <div className="relative group">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Zap className="w-3.5 h-3.5 text-amber-400" />}
              isLoading={grantMutation.isPending}
            >
              Dev Quick-Grant License
            </Button>
            <div className="absolute right-0 top-full mt-1 w-56 bg-carbon-900 border border-carbon-700 rounded-sm shadow-2xl p-1 z-30 hidden group-hover:block group-focus-within:block font-mono text-xs">
              <div className="px-2 py-1 text-[10px] text-gray-400 uppercase tracking-wider border-b border-carbon-800 font-bold">
                Instant Game Activation
              </div>
              {GAMES.map((game) => (
                <button
                  key={game.slug}
                  onClick={() => grantMutation.mutate(game.slug)}
                  className="w-full text-left px-2 py-1.5 hover:bg-carbon-800 text-gray-200 hover:text-cyan-400 rounded-sm transition-colors flex items-center justify-between"
                >
                  <span className="truncate">{game.name}</span>
                  <span className="text-[10px] text-gray-500">{game.slug}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setClaimModalOpen(true)}
          >
            Claim Serial Key
          </Button>
        </div>
      </div>

      {/* Grid of owned games */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="hud-card p-6 animate-pulse space-y-4">
              <div className="h-4 bg-carbon-800 rounded w-1/2" />
              <div className="h-8 bg-carbon-800 rounded w-3/4" />
              <div className="h-4 bg-carbon-800 rounded w-full" />
            </div>
          ))}
        </div>
      ) : entitlements.length === 0 ? (
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto space-y-3 font-mono">
            <Gamepad2 className="w-12 h-12 text-gray-500 mx-auto" />
            <h3 className="font-hud font-bold text-lg text-gray-200 uppercase">
              No Game Entitlements Registered
            </h3>
            <p className="text-xs text-gray-400">
              You do not have any registered game licenses under your master account. Claim a CD key or use the Dev Quick-Grant button to unlock game access.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setClaimModalOpen(true)}
              >
                Claim Serial Key
              </Button>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Zap className="w-4 h-4 text-amber-400" />}
                onClick={() => grantMutation.mutate('mohpa')}
              >
                Grant MOHPA
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entitlements.map((ent) => {
            const config = getGameConfig(ent.gameSlug);
            const isCopied = copiedKeyId === ent.id;

            return (
              <Card
                key={ent.id}
                title={config.name}
                subtitle={config.tagline}
                icon={<Gamepad2 className="w-4 h-4" />}
                accent="cyan"
                headerAction={
                  <Badge variant="ONLINE" size="sm">
                    ACTIVATED
                  </Badge>
                }
              >
                <div className="space-y-4 font-mono text-xs">
                  {/* SKU tags */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider mr-1">
                      SKU:
                    </span>
                    {config.skus.slice(0, 2).map((sku) => (
                      <span
                        key={sku}
                        className="px-1.5 py-0.5 bg-carbon-950 border border-carbon-800 text-[10px] rounded-sm text-cyan-300 font-mono"
                      >
                        {sku}
                      </span>
                    ))}
                  </div>

                  {/* CD Key Box */}
                  <div className="p-2.5 bg-carbon-950 border border-carbon-800 rounded-sm flex items-center justify-between">
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-[10px] text-gray-500 uppercase">SERIAL CD KEY</span>
                      <span className="font-mono text-gray-200 font-semibold tracking-wider text-xs truncate">
                        {ent.cdKey}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyKey(ent.cdKey, ent.id)}
                      className="p-1.5 rounded-sm bg-carbon-800 hover:bg-carbon-700 text-gray-300 hover:text-cyan-400 transition-colors focus:outline-none shrink-0"
                      title="Copy CD Key"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Activation Date */}
                  <div className="pt-2 border-t border-carbon-800 flex items-center justify-between text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      Activated:
                    </span>
                    <span className="text-gray-300">
                      {ent.activatedAt
                        ? new Date(ent.activatedAt).toLocaleDateString()
                        : ent.createdAt
                        ? new Date(ent.createdAt).toLocaleDateString()
                        : 'Active'}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Serial Key Claim Modal */}
      <Modal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        title="CLAIM GAME SERIAL KEY"
        subtitle="Redeem CD key to unlock EA Nucleus game entitlement"
        icon={<Key className="w-5 h-5 text-cyan-400" />}
      >
        <form onSubmit={handleClaimSubmit} className="space-y-4">
          <Select
            label="Game Title (Optional Override)"
            options={gameOptions}
            value={selectedGameSlug}
            onChange={(e) => setSelectedGameSlug(e.target.value)}
          />

          <Input
            label="Serial / CD Key"
            placeholder="e.g. MOHPA-XXXX-XXXX-XXXX"
            value={cdKey}
            onChange={(e) => setCdKey(e.target.value)}
            helperText="Standard EA 16 or 20 character alpha-numeric product key format."
            required
            autoFocus
          />

          <div className="p-3 bg-carbon-950/80 border border-carbon-800 rounded-sm text-[11px] font-mono text-gray-400">
            <span className="text-cyan-400 font-bold uppercase block mb-1">
              Automated Entitlement Routing
            </span>
            Claiming this license activates your Master Account to participate in dedicated game servers and unlock all soldier class kits.
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setClaimModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={claimMutation.isPending}
              leftIcon={<Key className="w-4 h-4" />}
            >
              Redeem Serial Key
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EntitlementCenter;
