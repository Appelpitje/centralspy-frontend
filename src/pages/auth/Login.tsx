import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, User, Terminal, ArrowRight, ShieldCheck, AlertCircle, CheckSquare, Square, KeyRound } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/hud/Toast';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim()) {
      setError('Please enter your Master Username or linked Email address.');
      return;
    }

    if (!password) {
      setError('Please enter your security password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login({
        identifier: identifier.trim(),
        password,
      });

      setAuth(response.user, response.token);
      toast.success('Authentication Verified', `Welcome back, Operator ${response.user.username}`);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        'Authentication failed. Please verify credentials and network connection.';
      setError(msg);
      toast.error('Access Denied', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAdmin = () => {
    setIdentifier('admin');
    setPassword('admin123');
    setError(null);
  };

  const handleDemoPlayer = () => {
    setIdentifier('demo_soldier');
    setPassword('soldier123');
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            mohPA
          </h2>
          <p className="text-sm text-ink-muted mt-1">
            Sign in to manage soldiers and join live servers
          </p>
        </div>

        <Card
          title="Sign in"
          subtitle="Username or email, and password"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-stamp-50 border border-stamp-500/30 rounded-lg text-stamp-700 text-sm flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-stamp-500 shrink-0 mt-0.5" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            <Input
              label="Username or Email"
              type="text"
              placeholder="e.g. StrikeCommander or player@mohpa.net"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (error) setError(null);
              }}
              leftIcon={<User className="w-4 h-4" />}
              required
              autoFocus
            />

            <Input
              label="Security Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="flex items-center justify-between pt-1">
              <label
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center space-x-2 text-xs font-sans text-ink cursor-pointer select-none"
              >
                {rememberMe ? (
                  <CheckSquare className="w-4 h-4 text-olive-700" />
                ) : (
                  <Square className="w-4 h-4 text-ink-faint" />
                )}
                <span>Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-xs font-sans text-ink underline underline-offset-2 inline-flex items-center space-x-1"
              >
                <KeyRound className="w-3 h-3" />
                <span>Forgot password?</span>
              </Link>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full"
              >
                Sign in
              </Button>
            </div>
          </form>

          {/* Dev / Fast Fill Helpers */}
          <div className="mt-4 pt-4 border-t border-sand-200 flex items-center justify-between text-xs font-mono text-ink-muted">
            <span>Dev Fast-fill:</span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleDemoAdmin}
                className="text-cyan-400 hover:text-cyan-300 underline focus:outline-none"
              >
                Admin
              </button>
              <span className="text-carbon-600">•</span>
              <button
                type="button"
                onClick={handleDemoPlayer}
                className="text-cyan-400 hover:text-cyan-300 underline focus:outline-none"
              >
                Player
              </button>
            </div>
          </div>
        </Card>

        <div className="mt-6 text-center text-xs font-mono text-ink-muted space-x-1">
          <span>Unregistered operator?</span>
          <Link to="/register" className="text-cyan-400 hover:underline font-semibold">
            Create Master Account →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
