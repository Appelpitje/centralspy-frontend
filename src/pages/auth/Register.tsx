import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  User,
  Mail,
  Calendar,
  Terminal,
  ArrowRight,
  UserPlus,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/hud/Toast';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countryCode, setCountryCode] = useState('US');
  const [dob, setDob] = useState('2000-01-01');

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const countryOptions = [
    { value: 'US', label: 'United States (US)' },
    { value: 'GB', label: 'United Kingdom (GB)' },
    { value: 'DE', label: 'Germany (DE)' },
    { value: 'FR', label: 'France (FR)' },
    { value: 'BE', label: 'Belgium (BE)' },
    { value: 'NL', label: 'Netherlands (NL)' },
    { value: 'SE', label: 'Sweden (SE)' },
    { value: 'CA', label: 'Canada (CA)' },
    { value: 'AU', label: 'Australia (AU)' },
    { value: 'JP', label: 'Japan (JP)' },
    { value: 'RU', label: 'Russian Federation (RU)' },
    { value: 'PL', label: 'Poland (PL)' },
    { value: 'BR', label: 'Brazil (BR)' },
    { value: 'ES', label: 'Spain (ES)' },
    { value: 'IT', label: 'Italy (IT)' },
  ];

  // Helper for age validation (>= 13 years old)
  const isAtLeast13YearsOld = (dobString: string): boolean => {
    if (!dobString) return false;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return false;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 13;
  };

  // Field validation rules
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    if (!username.trim()) {
      errors.username = 'Master Username is required.';
    } else if (username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters.';
    } else if (!/^[a-zA-Z0-9_\-]+$/.test(username.trim())) {
      errors.username = 'Only alphanumeric, underscores, and hyphens allowed.';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email format (e.g. name@domain.com).';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (password && confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    } else if (!confirmPassword && password) {
      errors.confirmPassword = 'Confirmation password is required.';
    }

    if (!dob) {
      errors.dob = 'Date of birth is required.';
    } else if (!isAtLeast13YearsOld(dob)) {
      errors.dob = 'Operator must be at least 13 years of age to enlist.';
    }

    return errors;
  }, [username, email, password, confirmPassword, dob]);

  const isValid = Object.keys(validationErrors).length === 0;

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Touch all fields
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
      dob: true,
    });

    if (!isValid) {
      setError('Please resolve the errors highlighted below.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.register({
        username: username.trim(),
        email: email.trim(),
        password,
        countryCode,
        dob,
      });

      setAuth(response.user, response.token);
      toast.success(
        'Enlistment Complete',
        `Master account initialized. Welcome to CentralSpy, Operator ${response.user.username}!`
      );
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        'Registration failed. Username or email may already be registered.';
      setError(msg);
      toast.error('Registration Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-sm bg-cyan-950 border border-cyan-500/60 mx-auto flex items-center justify-center shadow-glow-cyan mb-3">
            <Terminal className="w-6 h-6 text-cyan-400" />
          </div>
          <h2 className="font-hud font-extrabold text-2xl uppercase tracking-wider text-gray-100">
            Enlist In CentralSpy
          </h2>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Create Master EA Nucleus Account for Multi-Game Access
          </p>
        </div>

        <Card
          title="OPERATOR ENLISTMENT"
          subtitle="Deploy a Master Identity across all FESL Lobbies"
          icon={<UserPlus className="w-4 h-4" />}
          accent="cyan"
          className="shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-crimson-950/80 border border-crimson-700/80 rounded-sm text-crimson-300 font-mono text-xs flex items-start space-x-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-crimson-400 shrink-0 mt-0.5" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            <Input
              label="Master Username"
              type="text"
              placeholder="e.g. StrikeCommander"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError(null);
              }}
              onBlur={() => markTouched('username')}
              error={touched.username ? validationErrors.username : undefined}
              leftIcon={<User className="w-4 h-4" />}
              helperText={
                !touched.username || !validationErrors.username
                  ? 'Min 3 chars (letters, numbers, hyphens).'
                  : undefined
              }
              required
              autoFocus
            />

            <Input
              label="Contact Email Address"
              type="email"
              placeholder="e.g. commander@centralspy.net"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              onBlur={() => markTouched('email')}
              error={touched.email ? validationErrors.email : undefined}
              leftIcon={<Mail className="w-4 h-4" />}
              helperText={
                !touched.email || !validationErrors.email
                  ? 'Used for account security & persona authorization.'
                  : undefined
              }
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                onBlur={() => markTouched('password')}
                error={touched.password ? validationErrors.password : undefined}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                onBlur={() => markTouched('confirmPassword')}
                error={touched.confirmPassword ? validationErrors.confirmPassword : undefined}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Country / Region"
                options={countryOptions}
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              />

              <Input
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={(e) => {
                  setDob(e.target.value);
                  if (error) setError(null);
                }}
                onBlur={() => markTouched('dob')}
                error={touched.dob ? validationErrors.dob : undefined}
                leftIcon={<Calendar className="w-4 h-4" />}
                helperText={
                  !touched.dob || !validationErrors.dob
                    ? 'Requires age >= 13.'
                    : undefined
                }
                required
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full shadow-glow-cyan"
              >
                Enlist Master Account
              </Button>
            </div>
          </form>
        </Card>

        <div className="mt-6 text-center text-xs font-mono text-gray-400 space-x-1">
          <span>Already registered with CentralSpy?</span>
          <Link to="/login" className="text-cyan-400 hover:underline font-semibold">
            Operator Login →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
