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
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Reset password
          </h2>
          <p className="text-sm text-ink-muted mt-1">
            We’ll send a reset link if that account exists
          </p>
        </div>

        <Card
          title="Reset password"
          subtitle="Enter the email on your account"
          icon={<KeyRound className="w-4 h-4" />}
          accent="cyan"
          className="shadow-2xl"
        >
          {isSubmitted ? (
            <div className="space-y-4 py-2 font-mono">
              <div className="p-4 bg-olive-50 border border-olive-200 rounded-lg flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-olive-700 shrink-0 mt-0.5" />
                <div className="text-sm text-ink">
                  <p className="font-semibold">
                    Reset email sent
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">
                    If an account is associated with <span className="font-semibold text-ink">{email}</span>, a reset link has been sent.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-sand-50 border border-sand-200 rounded-sm text-[11px] text-ink-muted space-y-1">
                <p className="font-bold text-ink uppercase flex items-center gap-1.5">
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
              <p className="text-xs font-mono text-ink">
                Provide the email address associated with your Master Account. We will dispatch a secure recovery token to reset your password.
              </p>

              <Input
                label="Master Operator Email"
                type="email"
                placeholder="e.g. commander@mohpa.net"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
                autoFocus
              />

              <div className="p-3 bg-sand-50 border border-sand-200 rounded-sm text-[11px] font-mono text-ink-muted">
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
                  className="text-xs font-mono text-ink-muted hover:text-cyan-400 hover:underline flex items-center justify-center gap-1.5"
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
