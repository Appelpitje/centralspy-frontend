import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Key, Plus } from 'lucide-react';
import apiClient from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../components/hud/Toast';
import { MeResponse } from '../../types/user';

export const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [cdKey, setCdKey] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);

  const { data, refetch } = useQuery<MeResponse>({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await authService.getMe();
      return res;
    },
    enabled: !!user,
  });

  const handleClaimKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cdKey.trim()) return;

    setIsClaiming(true);
    try {
      await apiClient.post('/entitlements/claim', { cdKey: cdKey.trim() });
      toast.success('Entitlement Activated', `License key has been added to your profile.`);
      setCdKey('');
      refetch();
    } catch (err: any) {
      toast.error('Claim Failed', err.response?.data?.error || 'Invalid or already used CD key.');
    } finally {
      setIsClaiming(false);
    }
  };

  const entitlements = data?.entitlements || [];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="border-b border-carbon-800 pb-4">
        <h1 className="font-hud font-bold text-2xl uppercase tracking-wider text-gray-100">
          MASTER OPERATOR DOSSIER
        </h1>
        <p className="text-xs font-mono text-gray-400 mt-1">
          Master Nucleus identity, game entitlements, and security authorization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Info Card */}
        <Card
          title="ACCOUNT SPECIFICATIONS"
          icon={<User className="w-4 h-4" />}
          accent="cyan"
        >
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-2.5 bg-carbon-950/60 rounded border border-carbon-800">
              <span className="text-gray-400">Master Username:</span>
              <span className="text-cyan-400 font-bold">{user?.username}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-carbon-950/60 rounded border border-carbon-800">
              <span className="text-gray-400">Linked Email:</span>
              <span className="text-gray-200">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-carbon-950/60 rounded border border-carbon-800">
              <span className="text-gray-400">Country Code:</span>
              <span className="text-gray-200 font-semibold">{user?.countryCode || 'US'}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-carbon-950/60 rounded border border-carbon-800">
              <span className="text-gray-400">Authorization Level:</span>
              {user?.isAdmin ? (
                <Badge variant="ADMIN" size="sm">ADMINISTRATOR</Badge>
              ) : (
                <Badge variant="DEFAULT" size="sm">VERIFIED OPERATOR</Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Claim Key Card */}
        <Card
          title="CD KEY / LICENSE REDEMPTION"
          icon={<Key className="w-4 h-4" />}
          accent="emerald"
        >
          <form onSubmit={handleClaimKey} className="space-y-3">
            <p className="text-xs font-mono text-gray-400">
              Enter a game serial key (e.g. MOHPA-XXXX-XXXX) to unlock game access.
            </p>

            <Input
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={cdKey}
              onChange={(e) => setCdKey(e.target.value)}
              className="font-mono uppercase tracking-wider"
              required
            />

            <Button
              type="submit"
              variant="tactical"
              size="md"
              isLoading={isClaiming}
              leftIcon={<Plus className="w-4 h-4" />}
              className="w-full"
            >
              Redeem License Key
            </Button>
          </form>
        </Card>
      </div>

      {/* Entitlements Card */}
      <Card
        title="OWNED GAME LICENSES & ENTITLEMENTS"
        subtitle="Active game SKUs associated with your Master Account"
        icon={<Key className="w-4 h-4" />}
      >
        {entitlements.length === 0 ? (
          <div className="text-center py-6 font-mono text-xs text-gray-500">
            No serial keys claimed yet.
          </div>
        ) : (
          <div className="divide-y divide-carbon-800 font-mono text-xs">
            {entitlements.map((ent) => (
              <div key={ent.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-200 uppercase">{ent.gameSlug}</span>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">{ent.cdKey}</p>
                </div>
                <Badge variant="ONLINE" size="sm">ACTIVE LICENSE</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
