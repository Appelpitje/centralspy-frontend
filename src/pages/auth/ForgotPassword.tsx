import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert, Terminal } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/hud/Toast';

export const ForgotPassword: React.FC = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Invalid Email', 'Please enter a valid operator email address.');
      return;
    }

    setIsLoading(true);

    // Simulate recovery dispatch
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      toast.success(
        'Recovery Signal Dispatched',
        `Security reset instructions sent to ${email.trim()}`
      );
    }, 800);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-sm bg-cyan-950 border border-cyan-500/60 mx-auto flex items-center justify-center shadow-glow-cyan mb-3">
            <Terminal className="w-6 h-6 text-cyan-400" />
          </div>
          <h2 className="font-hud font-extrabold text-2xl uppercase tracking-wider text-gray-100">
            Account Recovery
          </h2>
          <p className="text-xs font-mono text-gray-400 mt-1">
            CentralSpy Master Security Password Reset
          </p>
        </div>

        <Card
          title="PASSWORD RECOVERY"
          subtitle="Reset Access to EA Nucleus Protocol Services"
          icon={<KeyRound className="w-4 h-4" />}
          accent="cyan"
          className="shadow-2xl"
        >
          {isSubmitted ? (
            <div className="space-y-4 py-2 font-mono">
              <div className="p-4 bg-emerald-950/60 border border-emerald-600/60 rounded-sm flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-200">
                  <p className="font-bold text-emerald-300 uppercase">
                    Recovery Directives Transmitted
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-400/90">
                    If an account is associated with <span className="font-bold text-white">{email}</span>, a temporary authorization code and reset link have been dispatched.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-carbon-950/80 border border-carbon-800 rounded-sm text-[11px] text-gray-400 space-y-1">
                <p className="font-bold text-gray-300 uppercase flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  Security Notice:
                </p>
                <p>
                  In a decentralized server environment, your password is required to encrypt subaccount persona hashes. If you are running locally, check with your server admin or dev console.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setIsSubmitted(false)}
                  className="w-full"
                >
                  Enter Different Email
                </Button>

                <Link to="/login" className="w-full">
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    className="w-full"
                  >
                    Return to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs font-mono text-gray-300">
                Provide the email address associated with your Master Account. We will dispatch a secure recovery token to reset your password.
              </p>

              <Input
                label="Master Operator Email"
                type="email"
                placeholder="e.g. commander@centralspy.net"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
                autoFocus
              />

              <div className="p-3 bg-carbon-950/80 border border-carbon-800 rounded-sm text-[11px] font-mono text-gray-400">
                <span className="text-amber-400 font-bold uppercase block mb-1">
                  Offline / Local Dev Notice:
                </span>
                For standalone / offline test clusters, you can also reset your password or inspect your user hash directly through the Admin Console or SQLite/Postgres database.
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
                  Send Recovery Directives
                </Button>
              </div>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="text-xs font-mono text-gray-400 hover:text-cyan-400 hover:underline flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Operator Login</span>
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
