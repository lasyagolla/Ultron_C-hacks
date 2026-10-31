import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BloomOrb } from '../common/BloomOrb';

export const AuthModal: React.FC = () => {
  const { 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    signInAsGuest, 
    isLoading 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setErrorMsg('Please enter your chosen name.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match.');
          setIsSubmitting(false);
          return;
        }
        await signUpWithEmail(name.trim(), email.trim(), password);
      } else {
        await signInWithEmail(email.trim(), password);
      }
    } catch (err: any) {
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/user-not-found') {
        setErrorMsg('Invalid email or password. Please try again.');
      } else if (err?.code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists. Try signing in.');
      } else if (err?.code === 'auth/popup-closed-by-user') {
        // User closed the popup, no error needed
      } else {
        setErrorMsg(err?.message || 'Authentication failed. You can also explore as Student Guest below.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMsg('Google Sign-In could not be opened. You can continue with your email or use Student Guest Access.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestSignIn = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await signInAsGuest();
    } catch (err: any) {
      setErrorMsg('Could not start guest session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 select-none"
      style={{
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)'
      }}
    >
      <div 
        className="w-full max-w-md rounded-3xl p-6 sm:p-8 border shadow-xl relative overflow-hidden transition-all"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-subtle)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        {/* Soft background accents */}
        <div 
          className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'var(--orb-glow-1)' }}
        />
        <div 
          className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'var(--orb-glow-2)' }}
        />

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center mb-3">
            <BloomOrb size="md" interactive={false} />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Bloom
          </h2>
          <p className="text-xs max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            The AI-powered personal growth and well-being companion designed for student life.
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div 
          className="grid grid-cols-2 p-1 rounded-2xl border mb-5 text-xs font-semibold"
          style={{
            backgroundColor: 'var(--bg-card-subtle)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMsg(null); }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-white dark:bg-neutral-800 shadow-sm text-[var(--accent-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(null); }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-white dark:bg-neutral-800 shadow-sm text-[var(--accent-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
            {errorMsg}
          </div>
        )}

        {/* 1-Click Google Sign In (Primary OAuth) */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting || isLoading}
          className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 rounded-2xl border text-xs font-semibold transition-all hover:bg-[var(--bg-card-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] disabled:opacity-50 mb-4"
          style={{ borderColor: 'var(--border-strong)' }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center mb-4">
          <div className="w-full border-t" style={{ borderColor: 'var(--border-subtle)' }} />
          <span 
            className="absolute px-3 text-[10px] font-medium uppercase tracking-wider"
            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
          >
            Or with email
          </span>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'signup' && (
            <div>
              <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                Preferred Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  style={{ borderColor: 'var(--border-strong)' }}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-muted)]" />
              <input
                type="email"
                required
                placeholder="student@example.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                style={{ borderColor: 'var(--border-strong)' }}
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-muted)]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                style={{ borderColor: 'var(--border-strong)' }}
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-muted)]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  style={{ borderColor: 'var(--border-strong)' }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-2xl font-semibold text-xs text-white transition-all shadow-md hover:opacity-95 disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <span>{mode === 'signin' ? 'Sign In to Bloom' : 'Begin My Journey'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Instant Guest / Preview Button */}
        <div className="mt-5 pt-4 border-t text-center space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
          <button
            type="button"
            onClick={handleGuestSignIn}
            className="text-xs font-semibold text-[var(--accent-secondary)] hover:underline flex items-center justify-center space-x-1.5 mx-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explore as Student Guest (No password needed)</span>
          </button>
          <p className="text-[10px] text-[var(--text-muted)]">
            Instant sandbox access to experience onboarding and 7-day scheduling.
          </p>
        </div>
      </div>
    </div>
  );
};
