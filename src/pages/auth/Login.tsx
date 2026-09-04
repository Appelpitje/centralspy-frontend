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
          <div className="w-12 h-12 rounded-sm bg-cyan-950 border border-cyan-500/60 mx-auto flex items-center justify-center shadow-glow-cyan mb-3">
            <Terminal className="w-6 h-6 text-cyan-400" />
          </div>
          <h2 className="font-hud font-extrabold text-2xl uppercase tracking-wider text-gray-100">
            CentralSpy Access Portal
          </h2>
          <p className="text-xs font-mono text-gray-400 mt-1">
            EA FESL & Theater Network Protocol Gateway
          </p>
        </div>

        <Card
          title="OPERATOR AUTHENTICATION"
          subtitle="Enter Master Account Credentials"
          icon={<ShieldCheck className="w-4 h-4" />}
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
              label="Username or Email"
              type="text"
              placeholder="e.g. StrikeCommander or player@centralspy.net"
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
                className="flex items-center space-x-2 text-xs font-mono text-gray-300 cursor-pointer select-none"
              >
                {rememberMe ? (
                  <CheckSquare className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Square className="w-4 h-4 text-gray-500" />
                )}
                <span>Remember Operator</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline flex items-center space-x-1"
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
                className="w-full shadow-glow-cyan"
              >
                Authenticate Session
              </Button>
            </div>
          </form>

          {/* Dev / Fast Fill Helpers */}
          <div className="mt-4 pt-4 border-t border-carbon-800 flex items-center justify-between text-xs font-mono text-gray-400">
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

        <div className="mt-6 text-center text-xs font-mono text-gray-400 space-x-1">
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
