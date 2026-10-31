import React, { useEffect } from 'react';
import { X, Sparkles, Calendar, MessageSquare, Compass, Shield, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BloomOrb } from './BloomOrb';

interface BloomAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BloomAssistantModal: React.FC<BloomAssistantModalProps> = ({ isOpen, onClose }) => {
  const { profile, commitments, restPeriods, goals, setActivePage } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigateTo = (page: 'goals' | 'blurt' | 'explore') => {
    setActivePage(page);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bloom-modal-title"
    >
      <div 
        className="relative w-full max-w-2xl rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl transition-all transform"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-primary)'
        }}
      >
        {/* Subtle decorative background glow */}
        <div 
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: 'var(--orb-glow-1)' }}
        />
        <div 
          className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: 'var(--orb-glow-2)' }}
        />

        {/* Header */}
        <div className="relative flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center space-x-3">
            <BloomOrb size="sm" interactive={false} />
            <div>
              <div className="flex items-center space-x-2">
                <h3 id="bloom-modal-title" className="text-xl font-bold tracking-tight">Bloom Guide</h3>
                <span 
                  className="px-2 py-0.5 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor: 'var(--bg-accent-soft)',
                    color: 'var(--accent-primary)'
                  }}
                >
                  Stage 1 Foundation
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Your personal growth &amp; well-being companion
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Bloom guide"
            className="p-2 rounded-full hover:bg-[var(--bg-card-subtle)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
          >
            <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Content Body */}
        <div className="relative my-6 space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Welcome Message */}
          <div 
            className="p-4 sm:p-5 rounded-2xl"
            style={{
              backgroundColor: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-secondary)' }} />
              <div className="space-y-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                <p className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                  Hello, {profile?.displayName || 'there'}. I’m Bloom.
                </p>
                <p>
                  My goal is to support your academic and personal growth without ever sacrificing your health, sleep, or peace of mind. 
                  Progress should adapt to your real life—never the other way around.
                </p>
              </div>
            </div>
          </div>

          {/* Current Grounding Status */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
              Connected Personal Context
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>{commitments.length}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Weekly Routines</div>
              </div>
              <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>{restPeriods.length}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Protected Rest Blocks</div>
              </div>
              <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>{goals.length}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Active Goals</div>
              </div>
              <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
                <div className="text-sm font-semibold flex items-center justify-center h-8" style={{ color: 'var(--accent-secondary)' }}>
                  {profile?.aiConsent ? 'Consent Active' : 'Basic Mode'}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>AI Processing</div>
              </div>
            </div>
          </div>

          {/* The Three Pillars Architecture */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
              Explore the Three Pillars
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => navigateTo('goals')}
                className="flex flex-col items-start p-4 rounded-2xl border text-left transition-all hover:shadow-md group"
                style={{
                  borderColor: 'var(--border-subtle)',
                  backgroundColor: 'var(--bg-card)'
                }}
              >
                <div className="p-2 rounded-xl mb-3 group-hover:scale-105 transition-transform" style={{ backgroundColor: 'var(--bg-accent-soft)' }}>
                  <Calendar className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                </div>
                <div className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Goal Tracker</div>
                <p className="text-xs leading-normal" style={{ color: 'var(--text-secondary)' }}>
                  Google Calendar-style timetable, protected sleep &amp; workload pacing.
                </p>
              </button>

              <button
                onClick={() => navigateTo('blurt')}
                className="flex flex-col items-start p-4 rounded-2xl border text-left transition-all hover:shadow-md group"
                style={{
                  borderColor: 'var(--border-subtle)',
                  backgroundColor: 'var(--bg-card)'
                }}
              >
                <div className="p-2 rounded-xl mb-3 group-hover:scale-105 transition-transform" style={{ backgroundColor: 'var(--bg-accent-soft)' }}>
                  <MessageSquare className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                </div>
                <div className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Blurt</div>
                <p className="text-xs leading-normal" style={{ color: 'var(--text-secondary)' }}>
                  Voice &amp; text brain-dump space with category threads and private vault.
                </p>
              </button>

              <button
                onClick={() => navigateTo('explore')}
                className="flex flex-col items-start p-4 rounded-2xl border text-left transition-all hover:shadow-md group"
                style={{
                  borderColor: 'var(--border-subtle)',
                  backgroundColor: 'var(--bg-card)'
                }}
              >
                <div className="p-2 rounded-xl mb-3 group-hover:scale-105 transition-transform" style={{ backgroundColor: 'var(--bg-accent-soft)' }}>
                  <Compass className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                </div>
                <div className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Explore</div>
                <p className="text-xs leading-normal" style={{ color: 'var(--text-secondary)' }}>
                  Personal growth maps, skill pathways, and curated opportunities.
                </p>
              </button>
            </div>
          </div>

          {/* SDG 3 & Well-being commitment */}
          <div 
            className="flex items-center space-x-3 p-3.5 rounded-2xl border text-xs"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--bg-card-subtle)',
              color: 'var(--text-secondary)'
            }}
          >
            <Heart className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <p>
              Supporting <strong>UN Sustainable Development Goal 3 (Target 3.4)</strong>: Promoting mental health, balanced study habits, and preventing burnout.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative pt-4 flex items-center justify-between border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center space-x-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Shield className="w-3.5 h-3.5" />
            <span>Encrypted Private Vault isolation guaranteed</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full font-medium text-sm transition-all"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--bg-card)'
            }}
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
};
