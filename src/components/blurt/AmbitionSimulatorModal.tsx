import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Clock, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight,
  Target,
  Zap,
  Check
} from 'lucide-react';
import { AmbitionPathway, PathwayStep } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface AmbitionSimulatorModalProps {
  ambitionTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onAdopted?: (pathway: AmbitionPathway) => void;
}

export const AmbitionSimulatorModal: React.FC<AmbitionSimulatorModalProps> = ({
  ambitionTitle,
  isOpen,
  onClose,
  onAdopted
}) => {
  const { simulateAmbition, addNewGoal, setActivePage } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [pathways, setPathways] = useState<AmbitionPathway[]>([]);
  const [selectedPathwayIndex, setSelectedPathwayIndex] = useState(0);
  const [adoptedSuccess, setAdoptedSuccess] = useState(false);

  // Load simulation pathways on open
  React.useEffect(() => {
    if (isOpen && ambitionTitle) {
      setIsLoading(true);
      setAdoptedSuccess(false);
      simulateAmbition(ambitionTitle)
        .then(result => {
          setPathways(result);
          setSelectedPathwayIndex(0);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, ambitionTitle]);

  if (!isOpen) return null;

  const currentPathway = pathways[selectedPathwayIndex];

  const handleAdoptPathway = async () => {
    if (!currentPathway) return;

    // Convert into a real Goal in Goal Tracker
    const newGoal = {
      title: currentPathway.ambitionTitle || ambitionTitle,
      category: 'academic',
      priority: 'high' as const,
      difficulty: 'moderate' as const,
      status: 'in_progress' as const,
      progress: 0,
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      milestones: currentPathway.steps.map((st, i) => ({
        id: 'ms_' + Date.now() + '_' + i,
        goalId: '',
        title: st.milestoneTitle || st.title,
        status: 'pending' as const
      })),
      description: `${currentPathway.pathwayName} (${currentPathway.estimatedWeeklyHours}h/week)\n${currentPathway.summary}`
    };

    await addNewGoal(newGoal);
    setAdoptedSuccess(true);
    if (onAdopted) onAdopted(currentPathway);

    setTimeout(() => {
      onClose();
      setActivePage('goals');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div 
        className="w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in duration-200"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-2xl bg-[var(--bg-accent-soft)] text-[var(--accent-primary)] border" style={{ borderColor: 'var(--border-subtle)' }}>
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base sm:text-lg" style={{ color: 'var(--text-primary)' }}>
                  Ambition Simulator
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border text-[var(--accent-primary)] bg-[var(--bg-accent-soft)]" style={{ borderColor: 'var(--border-subtle)' }}>
                  AI Pathway Modeling
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Exploring: <span className="font-semibold text-[var(--text-primary)]">"{ambitionTitle}"</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                Simulating realistic pathways against your weekly schedule...
              </p>
              <p className="text-[11px] text-[var(--text-muted)] max-w-sm mx-auto">
                Balancing academic commitments, study blocks, and protected rest.
              </p>
            </div>
          ) : pathways.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--text-muted)]">
              Could not generate pathways for this ambition right now. Please try again.
            </div>
          ) : (
            <>
              {/* Pathway Tabs */}
              <div className="flex p-1 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}>
                {pathways.map((pathway, idx) => (
                  <button
                    key={pathway.id || idx}
                    onClick={() => setSelectedPathwayIndex(idx)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                      selectedPathwayIndex === idx
                        ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {pathway.pathwayName}
                  </button>
                ))}
              </div>

              {/* Selected Pathway Details */}
              {currentPathway && (
                <div className="space-y-5">
                  {/* Summary & Metrics */}
                  <div className="p-4 rounded-2xl border space-y-3" style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {currentPathway.summary}
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                      <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border text-center" style={{ borderColor: 'var(--border-subtle)' }}>
                        <div className="text-sm font-black text-[var(--accent-primary)]">
                          {currentPathway.estimatedWeeklyHours} hrs/week
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)]">Weekly Time Investment</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border text-center" style={{ borderColor: 'var(--border-subtle)' }}>
                        <div className="text-sm font-black capitalize text-emerald-600 dark:text-emerald-400">
                          {currentPathway.scheduleCompatibility}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)]">Schedule Fit</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border text-center col-span-2 sm:col-span-1" style={{ borderColor: 'var(--border-subtle)' }}>
                        <div className="text-sm font-black text-[var(--accent-secondary)]">
                          {currentPathway.steps.reduce((acc, s) => acc + (s.durationWeeks || 2), 0)} weeks
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)]">Estimated Horizon</div>
                      </div>
                    </div>

                    {currentPathway.compatibilityNotes && (
                      <div className="text-[11px] text-[var(--text-muted)] flex items-center space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{currentPathway.compatibilityNotes}</span>
                      </div>
                    )}
                  </div>

                  {/* Step-by-step Milestones */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Pathway Milestones ({currentPathway.steps.length} Steps)
                    </span>
                    <div className="space-y-2">
                      {currentPathway.steps.map((st, i) => (
                        <div 
                          key={i}
                          className="p-3 rounded-2xl border flex items-center justify-between text-xs"
                          style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="w-6 h-6 rounded-full bg-[var(--bg-accent-soft)] text-[var(--accent-primary)] font-bold text-xs flex items-center justify-center border" style={{ borderColor: 'var(--border-subtle)' }}>
                              {i + 1}
                            </span>
                            <div>
                              <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{st.title}</div>
                              <div className="text-[11px] text-[var(--text-muted)]">{st.milestoneTitle}</div>
                            </div>
                          </div>
                          <span className="text-[11px] px-2 py-0.5 rounded-lg border font-medium text-[var(--text-secondary)]" style={{ borderColor: 'var(--border-subtle)' }}>
                            {st.durationWeeks} wks
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills & Potential Friction */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-2xl border space-y-1.5" style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}>
                      <span className="text-[11px] font-bold uppercase text-[var(--accent-primary)]">Key Skills Built</span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentPathway.requiredSkills.map((sk, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-card)] border text-[var(--text-secondary)]" style={{ borderColor: 'var(--border-subtle)' }}>
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl border space-y-1.5" style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}>
                      <span className="text-[11px] font-bold uppercase text-amber-600 dark:text-amber-400">Potential Friction</span>
                      <ul className="text-[10px] space-y-0.5 text-[var(--text-secondary)]">
                        {currentPathway.potentialChallenges.map((ch, i) => (
                          <li key={i} className="flex items-center space-x-1">
                            <span className="text-amber-500">•</span>
                            <span>{ch}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)]"
          >
            Cancel
          </button>

          <button
            onClick={handleAdoptPathway}
            disabled={isLoading || !currentPathway || adoptedSuccess}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--accent-primary)] hover:opacity-90 disabled:opacity-50 flex items-center space-x-2 transition-all shadow-sm"
          >
            {adoptedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Adopted to Goal Tracker!</span>
              </>
            ) : (
              <>
                <span>Adopt this Pathway</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
