import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  User as UserIcon,
  Key,
  Mail,
  Lock,
  Calendar,
  Globe,
  AlertCircle,
  Activity,
  Laptop,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Tabs } from '../../components/common/Tabs';
import { useToast } from '../../components/hud/Toast';
import { EntitlementCenter } from '../../components/entitlements/EntitlementCenter';
import { MeResponse } from '../../types/user';

export const AccountSettings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'licenses' ? 'licenses' : 'profile';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();

  // Profile data fetch
  const { data: meData, refetch: refetchMe } = useQuery<MeResponse>({
    queryKey: ['me'],
    queryFn: async () => {
      return await authService.getMe();
    },
    enabled: !!user,
  });

  const currentUser = meData?.user || user;

  // Email update state
  const [newEmail, setNewEmail] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Password update state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams(tabId === 'licenses' ? { tab: 'licenses' } : {});
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setIsUpdatingEmail(true);
    setEmailError(null);

    try {
      const res = await authService.updateMe({ email: newEmail.trim() });
      if (res.user) {
        updateUser(res.user);
      }
      toast.success('Email Updated', `Your Master Account email is now ${newEmail.trim()}`);
      setNewEmail('');
      refetchMe();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to update email address.';
      setEmailError(msg);
      toast.error('Email Update Failed', msg);
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password confirmation does not match.');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordError(null);

    try {
      await authService.updateMe({
        currentPassword,
        newPassword,
      });
      toast.success('Security Update', 'Master password successfully changed.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to change password. Verify current password.';
      setPasswordError(msg);
      toast.error('Password Update Failed', msg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const tabs = [
    {
      id: 'profile',
      label: 'Profile & Security',
      icon: <UserIcon className="w-4 h-4" />,
    },
    {
      id: 'licenses',
      label: 'Game CD Keys & Licenses',
      icon: <Key className="w-4 h-4" />,
      count: meData?.entitlements?.length,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      {/* Page Header */}
      <div className="border-b border-carbon-800 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="font-hud font-bold text-2xl uppercase tracking-wider text-gray-100 flex items-center gap-2.5">
              <span>MASTER ACCOUNT & SECURITY CENTER</span>
              {currentUser?.isAdmin && <Badge variant="ADMIN">ADMIN</Badge>}
            </h1>
            <p className="text-xs font-mono text-gray-400 mt-1">
              EA Nucleus profile credentials, game entitlements, and security authorization.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="ONLINE" dot size="md">
              AUTHENTICATED
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Top Row: Master Overview & Active Sessions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Master Profile Dossier Card */}
            <div className="lg:col-span-2">
              <Card
                title="MASTER OPERATOR DOSSIER"
                subtitle="EA Nucleus Identity & Telemetry Identification"
                icon={<UserIcon className="w-4 h-4" />}
                accent="cyan"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                  <div className="p-3 bg-carbon-950/70 border border-carbon-800 rounded-sm">
                    <span className="text-[10px] text-gray-500 uppercase block mb-0.5">
                      Master Username
                    </span>
                    <span className="text-cyan-400 font-bold text-sm">
                      {currentUser?.username || '—'}
                    </span>
                  </div>

                  <div className="p-3 bg-carbon-950/70 border border-carbon-800 rounded-sm">
                    <span className="text-[10px] text-gray-500 uppercase block mb-0.5">
                      Linked Contact Email
                    </span>
                    <span className="text-gray-200 font-semibold text-xs truncate block">
                      {currentUser?.email || '—'}
                    </span>
                  </div>

                  <div className="p-3 bg-carbon-950/70 border border-carbon-800 rounded-sm">
                    <span className="text-[10px] text-gray-500 uppercase block mb-0.5">
                      Nucleus Account UUID
                    </span>
                    <span className="text-gray-400 text-[11px] font-mono truncate block">
                      {currentUser?.id || '—'}
                    </span>
                  </div>

                  <div className="p-3 bg-carbon-950/70 border border-carbon-800 rounded-sm">
                    <span className="text-[10px] text-gray-500 uppercase block mb-0.5">
                      Country / Region Code
                    </span>
                    <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      {currentUser?.countryCode || 'US'}
                    </span>
                  </div>

                  <div className="p-3 bg-carbon-950/70 border border-carbon-800 rounded-sm">
                    <span className="text-[10px] text-gray-500 uppercase block mb-0.5">
                      Date of Birth
                    </span>
                    <span className="text-gray-300 font-semibold text-xs flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      {currentUser?.dob || '2000-01-01'}
                    </span>
                  </div>

                  <div className="p-3 bg-carbon-950/70 border border-carbon-800 rounded-sm">
                    <span className="text-[10px] text-gray-500 uppercase block mb-0.5">
                      Account Enlistment Date
                    </span>
                    <span className="text-gray-300 font-semibold text-xs flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      {currentUser?.createdAt
                        ? new Date(currentUser.createdAt).toLocaleDateString()
                        : '—'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Active Sessions & Security Info */}
            <div>
              <Card
                title="SECURITY & SESSION PROTOCOL"
                subtitle="Live FESL Token State"
                icon={<ShieldCheck className="w-4 h-4" />}
                accent="emerald"
              >
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-3 bg-carbon-950 border border-carbon-800 rounded-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                        Current Web Session:
                      </span>
                      <Badge variant="ONLINE" size="sm">
                        ACTIVE
                      </Badge>
                    </div>
                    <div className="text-[11px] text-gray-400">
                      Browser client authorized via JSON Web Token.
                    </div>
                  </div>

                  <div className="p-3 bg-carbon-950 border border-carbon-800 rounded-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        FESL Sub-Account Auth:
                      </span>
                      <span className="text-emerald-400 font-bold text-[11px]">READY</span>
                    </div>
                    <div className="text-[11px] text-gray-400">
                      Credentials encrypted for in-game legacy Theater handshake.
                    </div>
                  </div>

                  <div className="p-2.5 bg-carbon-950/50 border border-carbon-800 rounded-sm text-[11px] text-gray-500">
                    Never share your password or auth tokens with unauthorized servers.
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Bottom Row: Update Forms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Update Email Card */}
            <Card
              title="UPDATE CONTACT EMAIL"
              subtitle="Modify Linked Master Email"
              icon={<Mail className="w-4 h-4" />}
            >
              <form onSubmit={handleUpdateEmail} className="space-y-4">
                {emailError && (
                  <div className="p-2.5 bg-crimson-950/80 border border-crimson-700/80 rounded-sm text-crimson-300 font-mono text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-crimson-400 shrink-0" />
                    <span>{emailError}</span>
                  </div>
                )}

                <div className="text-xs font-mono text-gray-400">
                  Current Email: <span className="text-gray-200 font-bold">{currentUser?.email}</span>
                </div>

                <Input
                  label="New Contact Email"
                  type="email"
                  placeholder="e.g. new_commander@centralspy.net"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isUpdatingEmail}
                  className="w-full"
                >
                  Save New Email
                </Button>
              </form>
            </Card>

            {/* Update Password Card */}
            <Card
              title="UPDATE SECURITY PASSWORD"
              subtitle="Change Account Authentication Password"
              icon={<Lock className="w-4 h-4" />}
            >
              <form onSubmit={handleUpdatePassword} className="space-y-3">
                {passwordError && (
                  <div className="p-2.5 bg-crimson-950/80 border border-crimson-700/80 rounded-sm text-crimson-300 font-mono text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-crimson-400 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <Input
                  label="Current Password"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />

                <Input
                  label="New Password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />

                <div className="pt-1">
                  <Button
                    type="submit"
                    variant="tactical"
                    size="md"
                    isLoading={isUpdatingPassword}
                    className="w-full"
                  >
                    Change Security Password
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* Tab Content: Licenses */}
      {activeTab === 'licenses' && <EntitlementCenter />}
    </div>
  );
};

export default AccountSettings;
