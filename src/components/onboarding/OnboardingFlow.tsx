import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Plus, 
  X, 
  Moon, 
  Sun, 
  Clock, 
  Heart,
  Palette,
  Check,
  Edit2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BloomOrb } from '../common/BloomOrb';
import { WeeklyScheduleEditor } from '../schedule/WeeklyScheduleEditor';
import { RestPeriodEditor } from '../rest/RestPeriodEditor';
import { 
  WeeklyCommitment, 
  RestPeriod, 
  Goal, 
  ThemeMode, 
  AnimationPreference 
} from '../../types';

const HELP_CATEGORIES = [
  'Academics & Study Habits',
  'Time Management',
  'Extracurricular Activities',
  'Personal Goals',
  'Learning New Skills',
  'Creative Projects',
  'Building Better Routines',
  'Managing Overwhelming Schedules',
  'Exploring Future Ambitions',
];

const MOTIVATION_TONES = [
  { id: 'gentle', label: 'Gentle and reassuring', desc: 'Encouraging, supportive, stress-reducing' },
  { id: 'practical', label: 'Direct and practical', desc: 'Clear, concise, action-focused' },
  { id: 'reflective', label: 'Reflective and thoughtful', desc: 'Mindful, depth-oriented, introspective' },
  { id: 'energetic', label: 'Energetic and ambitious', desc: 'Inspiring, momentum-building' },
  { id: 'minimal', label: 'Short and minimal', desc: 'One sentence, calm, unobtrusive' },
  { id: 'balanced', label: 'Balanced', desc: 'A calm mix tailored to time of day' },
];

export const OnboardingFlow: React.FC = () => {
  const { profile, user, completeOnboarding, setTheme, setAnimationPref, theme, animationPref } = useAuth();

  const draftKey = user?.uid ? `bloom_onboarding_draft_${user.uid}` : 'bloom_onboarding_draft';

  // Load existing draft if returning with unfinished setup
  const initialDraft = (() => {
    try {
      const raw = localStorage.getItem(draftKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [step, setStep] = useState<number>(() => {
    if (initialDraft && typeof initialDraft.step === 'number' && initialDraft.step >= 1 && initialDraft.step <= 10) {
      return initialDraft.step;
    }
    return 1;
  });
  const totalSteps = 10;

  // Step 2: AI Consent
  const [aiConsent, setAiConsent] = useState<boolean>(initialDraft?.aiConsent ?? false);

  // Step 3: Profile & Help
  const [displayName, setDisplayName] = useState<string>(
    initialDraft?.displayName || profile?.displayName || user?.displayName || 'Alex'
  );
  const [selectedHelp, setSelectedHelp] = useState<string[]>(
    initialDraft?.selectedHelp || ['Academics & Study Habits', 'Time Management']
  );
  const [customHelpInput, setCustomHelpInput] = useState('');

  // Step 4: Interests & Ambitions
  const [interests, setInterests] = useState<string[]>(
    initialDraft?.interests || ['Computer Science', 'Creative Writing', 'Piano']
  );
  const [newInterestInput, setNewInterestInput] = useState('');
  const [ambitions, setAmbitions] = useState<string[]>(
    initialDraft?.ambitions || ['Build a portfolio project', 'Maintain an 8-hour sleep routine']
  );
  const [newAmbitionInput, setNewAmbitionInput] = useState('');

  // Step 5: Motivation
  const [selectedTones, setSelectedTones] = useState<string[]>(
    initialDraft?.selectedTones || ['gentle', 'practical']
  );
  const [motivationLength, setMotivationLength] = useState<'short' | 'medium' | 'long'>(
    initialDraft?.motivationLength || 'short'
  );

  // Step 6: Weekly Schedule
  const [commitments, setCommitments] = useState<WeeklyCommitment[]>(
    initialDraft?.commitments || [
      {
        id: 'comm_default_1',
        userId: user?.uid || 'user_current',
        title: 'School / Academic Classes',
        category: 'school',
        startTime: '08:30',
        endTime: '15:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        isFixed: true,
        notes: 'Daily lectures and lab blocks',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  );

  // Step 7: Rest Preferences
  const [restPeriods, setRestPeriods] = useState<RestPeriod[]>(
    initialDraft?.restPeriods || [
      {
        id: 'rest_default_1',
        userId: user?.uid || 'user_current',
        restType: 'sleep',
        label: 'Night Sleep & Recovery',
        startTime: '23:00',
        endTime: '07:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        isProtected: true
      },
      {
        id: 'rest_default_2',
        userId: user?.uid || 'user_current',
        restType: 'meal',
        label: 'Protected Lunch Break',
        startTime: '12:30',
        endTime: '13:30',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        isProtected: true
      }
    ]
  );

  // Step 8: Initial Goals
  const [goals, setGoals] = useState<Goal[]>(
    initialDraft?.goals || [
      {
        id: 'goal_initial_1',
        userId: user?.uid || 'user_current',
        title: 'Complete First Semester Project',
        category: 'Academics',
        priority: 'high',
        difficulty: 'moderate',
        targetDate: '2026-12-15',
        estimatedEffort: '4 hours / week',
        status: 'in_progress',
        progress: 20,
        createdAt: new Date().toISOString()
      }
    ]
  );
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('Academics');
  const [newGoalPriority, setNewGoalPriority] = useState<'low' | 'medium' | 'high'>('high');

  // Step 9: Theme & Animations
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(initialDraft?.selectedTheme || theme || 'soft-focus');
  const [selectedMotion, setSelectedMotion] = useState<AnimationPreference>(initialDraft?.selectedMotion || animationPref || 'full');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-save draft so user returns to unfinished setup if they refresh or leave
  useEffect(() => {
    try {
      const draft = {
        step,
        aiConsent,
        displayName,
        selectedHelp,
        interests,
        ambitions,
        selectedTones,
        motivationLength,
        commitments,
        restPeriods,
        goals,
        selectedTheme,
        selectedMotion
      };
      localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch {}
  }, [
    draftKey,
    step,
    aiConsent,
    displayName,
    selectedHelp,
    interests,
    ambitions,
    selectedTones,
    motivationLength,
    commitments,
    restPeriods,
    goals,
    selectedTheme,
    selectedMotion
  ]);

  // Add Interest
  const handleAddInterest = () => {
    if (newInterestInput.trim() && !interests.includes(newInterestInput.trim())) {
      setInterests([...interests, newInterestInput.trim()]);
      setNewInterestInput('');
    }
  };

  // Add Ambition
  const handleAddAmbition = () => {
    if (newAmbitionInput.trim() && !ambitions.includes(newAmbitionInput.trim())) {
      setAmbitions([...ambitions, newAmbitionInput.trim()]);
      setNewAmbitionInput('');
    }
  };

  // Add Goal
  const handleAddGoal = () => {
    if (newGoalTitle.trim()) {
      const g: Goal = {
        id: 'goal_' + Math.random().toString(36).substring(2, 9),
        userId: user?.uid || 'user_current',
        title: newGoalTitle.trim(),
        category: newGoalCategory,
        priority: newGoalPriority,
        difficulty: 'moderate',
        status: 'not_started',
        progress: 0,
        createdAt: new Date().toISOString()
      };
      setGoals([...goals, g]);
      setNewGoalTitle('');
    }
  };

  // Complete & Submit
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding({
        displayName,
        helpCategories: selectedHelp,
        aiConsent,
        interests,
        ambitions,
        motivation: {
          tones: selectedTones,
          length: motivationLength
        },
        commitments,
        restPeriods,
        goals,
        appearance: selectedTheme,
        animationPreference: selectedMotion
      });
    } catch (e) {
      console.error('Failed to complete onboarding:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col justify-between py-6 px-4 sm:px-6 md:px-12 select-none transition-colors"
      style={{
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Top Progress Bar */}
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-sm" style={{ color: 'var(--accent-primary)' }}>Bloom</span>
            <span className="text-[var(--text-muted)]">• Step {step} of {totalSteps}</span>
          </div>
          <span className="font-semibold text-xs text-[var(--accent-secondary)]">
            {Math.round((step / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden bg-[var(--border-subtle)]">
          <div 
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: `${(step / totalSteps) * 100}%`,
              backgroundColor: 'var(--accent-primary)'
            }}
          />
        </div>
      </div>

      {/* Main Container */}
      <main className="w-full max-w-3xl mx-auto my-8">
        <div 
          className="rounded-3xl p-6 sm:p-10 border shadow-lg relative overflow-hidden transition-all"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="space-y-6 text-center py-4">
              <div className="flex justify-center">
                <BloomOrb size="lg" interactive={false} />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-extrabold tracking-tight">
                  Let's make room for what matters.
                </h2>
                <p className="text-sm max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Tell us a little about your life, and we'll help you build plans that actually fit. 
                  Bloom connects your scheduling, personal ambitions, skill exploration, and well-being into one calm intelligence.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-left max-w-xl mx-auto text-xs">
                <div className="p-3.5 rounded-2xl border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card-subtle)' }}>
                  <div className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>1. Goal Tracker</div>
                  <p style={{ color: 'var(--text-secondary)' }}>Balanced scheduling and protected sleep cycles.</p>
                </div>
                <div className="p-3.5 rounded-2xl border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card-subtle)' }}>
                  <div className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>2. Blurt</div>
                  <p style={{ color: 'var(--text-secondary)' }}>Voice &amp; thought unravelling with private vault protection.</p>
                </div>
                <div className="p-3.5 rounded-2xl border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card-subtle)' }}>
                  <div className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>3. Explore</div>
                  <p style={{ color: 'var(--text-secondary)' }}>Personal growth maps and skill pathways without pressure.</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: AI CONSENT */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-secondary)]">Privacy &amp; Well-being</span>
                <h2 className="text-2xl font-bold mt-1">Your information, your choice.</h2>
              </div>

              <div 
                className="p-4 rounded-2xl border space-y-3 text-xs leading-relaxed"
                style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-secondary)' }}
              >
                <p>
                  This application uses AI to analyse information you choose to share outside your Private Vault. 
                  This helps personalise your goals, schedules, learning recommendations, and well-being-aware suggestions.
                </p>
                <div className="p-3 rounded-xl bg-white/70 dark:bg-black/20 border" style={{ borderColor: 'var(--border-subtle)' }}>
                  <strong className="block text-[var(--text-primary)] mb-0.5">Important Health &amp; Well-being Notice:</strong>
                  This application supports personal well-being (UN Sustainable Development Goal 3, Target 3.4) but is not therapy, medical advice, or a substitute for professional mental health support.
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>Private Vault notes are strictly excluded from AI processing.</li>
                  <li>Gemini AI processes shared context via secure server-side calls without storing training prompts.</li>
                  <li>You can withdraw consent or delete your profile information at any time in Settings.</li>
                </ul>
              </div>

              {/* Consent Checkbox */}
              <label 
                className="flex items-start space-x-3 p-4 rounded-2xl border cursor-pointer transition-all"
                style={{
                  borderColor: aiConsent ? 'var(--accent-primary)' : 'var(--border-subtle)',
                  backgroundColor: aiConsent ? 'var(--bg-accent-soft)' : 'var(--bg-card)'
                }}
              >
                <input
                  type="checkbox"
                  checked={aiConsent}
                  onChange={(e) => setAiConsent(e.target.checked)}
                  className="mt-1 rounded text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                />
                <div className="text-xs space-y-0.5">
                  <span className="font-semibold block" style={{ color: 'var(--text-primary)' }}>
                    I consent to AI-assisted scheduling and personalisation
                  </span>
                  <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    Enable Bloom to recommend schedule adjustments, detect workload friction, and organise learning pathways.
                  </p>
                </div>
              </label>

              {!aiConsent && (
                <p className="text-[11px] text-[var(--text-muted)] italic">
                  Note: Basic calendar scheduling and personal goal tracking remain fully operational even if optional AI personalisation is turned off.
                </p>
              )}
            </div>
          )}

          {/* STEP 3: PERSONAL PROFILE */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-secondary)]">Profile Setup</span>
                <h2 className="text-2xl font-bold mt-1">What should we call you?</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Your Name or Nickname
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border text-sm font-medium bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  style={{ borderColor: 'var(--border-strong)' }}
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  What would you like help with? (Select all that apply)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {HELP_CATEGORIES.map((cat) => {
                    const isChecked = selectedHelp.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          if (isChecked) setSelectedHelp(selectedHelp.filter(x => x !== cat));
                          else setSelectedHelp([...selectedHelp, cat]);
                        }}
                        className={`flex items-center space-x-2.5 p-3 rounded-2xl border text-left transition-all ${
                          isChecked 
                            ? 'bg-[var(--bg-accent-soft)] border-[var(--accent-primary)] font-semibold' 
                            : 'hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]'
                        }`}
                        style={{ borderColor: isChecked ? 'var(--accent-primary)' : 'var(--border-subtle)' }}
                      >
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] ${
                          isChecked ? 'bg-[var(--accent-primary)] text-white' : 'border-[var(--border-strong)]'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: INTERESTS AND AMBITIONS */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-secondary)]">Passions &amp; Aspirations</span>
                  <h2 className="text-2xl font-bold mt-1">What are you interested in?</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-primary)] underline"
                >
                  Skip for now (Complete later in Settings)
                </button>
              </div>

              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Select popular subject areas or specify custom interests below. These feed into your Explore map, Goal Tracker suggestions, and Blurt ideation.
              </p>

              {/* Quick Suggestion Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Popular Subjects &amp; Fields:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Computer Science', 'Machine Learning', 'Neuroscience', 'Creative Writing',
                    'Robotics', 'Psychology', 'Graphic Design', 'Economics', 'Philosophy', 'Music'
                  ].map((preset) => {
                    const isSelected = interests.includes(preset);
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          if (isSelected) setInterests(interests.filter(i => i !== preset));
                          else setInterests([...interests, preset]);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                          isSelected
                            ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                            : 'hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]'
                        }`}
                        style={{ borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)' }}
                      >
                        {isSelected ? '✓ ' : '+ '}{preset}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Other — Specify Custom Interests */}
              <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Other — Specify Custom Interests ({interests.length} selected)
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Type custom interest and press Add..."
                    value={newInterestInput}
                    onChange={(e) => setNewInterestInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddInterest(); }}}
                    className="flex-1 px-3.5 py-2 rounded-xl border text-xs bg-transparent"
                    style={{ borderColor: 'var(--border-strong)' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddInterest}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  >
                    + Add Custom
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                  {interests.map((item, idx) => (
                    <span
                      key={item + idx}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs border"
                      style={{ backgroundColor: 'var(--bg-accent-soft)', borderColor: 'var(--border-subtle)', color: 'var(--accent-primary)' }}
                    >
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const updated = [...interests];
                          updated[idx] = e.target.value;
                          setInterests(updated);
                        }}
                        className="bg-transparent border-none p-0 text-xs focus:outline-none w-auto max-w-[140px]"
                      />
                      <button
                        type="button"
                        onClick={() => setInterests(interests.filter((_, i) => i !== idx))}
                        className="text-[var(--text-muted)] hover:text-rose-600 ml-1"
                        title="Remove interest"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Ambitions */}
              <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  What would you like to achieve? (Ambitions)
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g., Build an AI app, Win a robotics competition, Learn French"
                    value={newAmbitionInput}
                    onChange={(e) => setNewAmbitionInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAmbition(); }}}
                    className="flex-1 px-3.5 py-2 rounded-xl border text-xs bg-transparent"
                    style={{ borderColor: 'var(--border-strong)' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddAmbition}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1.5">
                  {ambitions.map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between p-2.5 rounded-xl border text-xs"
                      style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}
                    >
                      <span className="font-medium">{item}</span>
                      <button
                        type="button"
                        onClick={() => setAmbitions(ambitions.filter(a => a !== item))}
                        className="text-[var(--text-muted)] hover:text-rose-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: MOTIVATION PREFERENCES */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-secondary)]">Encouragement Style</span>
                <h2 className="text-2xl font-bold mt-1">What kind of encouragement works best for you?</h2>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Bloom's Motivation sparks will match your chosen tone and length. You can change this anytime.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {MOTIVATION_TONES.map((tone) => {
                  const isSelected = selectedTones.includes(tone.id);
                  return (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) setSelectedTones(selectedTones.filter(t => t !== tone.id));
                        else setSelectedTones([...selectedTones, tone.id]);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected 
                          ? 'bg-[var(--bg-accent-soft)] border-[var(--accent-primary)] shadow-sm' 
                          : 'hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]'
                      }`}
                      style={{ borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)' }}
                    >
                      <div className="font-semibold text-xs mb-0.5" style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                        {tone.label}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">{tone.desc}</div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Message Length Preference
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(['short', 'medium', 'long'] as const).map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setMotivationLength(len)}
                      className={`py-2 rounded-xl border text-center capitalize font-semibold transition-all ${
                        motivationLength === len 
                          ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]' 
                          : 'hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]'
                      }`}
                      style={{ borderColor: motivationLength === len ? 'var(--accent-primary)' : 'var(--border-subtle)' }}
                    >
                      {len} ({len === 'short' ? '1 sentence' : len === 'medium' ? '2-3 sentences' : 'Deep reflection'})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: 7-DAY WEEKLY SCHEDULE */}
          {step === 6 && (
            <div className="space-y-4">
              <WeeklyScheduleEditor
                commitments={commitments}
                onChange={setCommitments}
                userId={user?.uid}
              />
            </div>
          )}

          {/* STEP 7: REST PREFERENCES */}
          {step === 7 && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-secondary)]">Well-being Protection</span>
                <h2 className="text-2xl font-bold mt-1">When would you like to protect time for yourself?</h2>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Target 3.4 of UN SDG 3 encourages sustainable mental well-being. Protect uninterrupted sleep, meals, and recovery time.
                </p>
              </div>

              <RestPeriodEditor
                restPeriods={restPeriods}
                onChange={setRestPeriods}
                userId={user?.uid}
              />
            </div>
          )}

          {/* STEP 8: INITIAL GOALS */}
          {step === 8 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-secondary)]">Goal Setting</span>
                  <h2 className="text-2xl font-bold mt-1">What would you like to work towards?</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(9)}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] underline"
                >
                  Skip for now
                </button>
              </div>

              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                You can add initial academic or personal targets now, or define them in Goal Tracker later.
              </p>

              {/* Add Goal Input */}
              <div className="p-4 rounded-2xl border space-y-3" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card-subtle)' }}>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Goal Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Master Calculus Integration, Prepare for Science Fair"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border bg-transparent text-xs"
                    style={{ borderColor: 'var(--border-strong)' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Category
                    </label>
                    <input
                      type="text"
                      placeholder="Academics, Project, Health..."
                      value={newGoalCategory}
                      onChange={(e) => setNewGoalCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border bg-transparent text-xs"
                      style={{ borderColor: 'var(--border-strong)' }}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Priority
                    </label>
                    <select
                      value={newGoalPriority}
                      onChange={(e) => setNewGoalPriority(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border bg-transparent text-xs"
                      style={{ borderColor: 'var(--border-strong)' }}
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddGoal}
                  disabled={!newGoalTitle.trim()}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white disabled:opacity-40"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  + Add Goal
                </button>
              </div>

              {/* Current Goals list */}
              <div className="space-y-2">
                {goals.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between p-3 rounded-2xl border text-xs"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                  >
                    <div>
                      <div className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>{g.title}</div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{g.category} • Priority: {g.priority}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGoals(goals.filter(item => item.id !== g.id))}
                      className="text-[var(--text-muted)] hover:text-rose-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 9: APPEARANCE & ANIMATIONS */}
          {step === 9 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-secondary)]">Personalization</span>
                <h2 className="text-2xl font-bold mt-1">Select your space appearance</h2>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  All four themes adapt smoothly and persist across all devices.
                </p>
              </div>

              {/* Themes Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'soft-focus' as ThemeMode, name: 'Soft Focus', desc: 'Warm ivory with calm forest green and sage accents', bg: '#F8F9F5', fg: '#344E41' },
                  { id: 'midnight' as ThemeMode, name: 'Midnight', desc: 'Sophisticated dark monochrome for night focus', bg: '#0D0F0E', fg: '#F3F5F4' },
                  { id: 'minimal' as ThemeMode, name: 'Black & White', desc: 'Strictly monochrome high-contrast black-and-white', bg: '#FFFFFF', fg: '#111827' },
                  { id: 'system' as ThemeMode, name: 'Follow System', desc: 'Dynamically synchronizes with your device settings', bg: '#E5EFE7', fg: '#29352F' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTheme(t.id);
                      setTheme(t.id);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      selectedTheme === t.id 
                        ? 'ring-2 ring-[var(--accent-primary)] shadow-md font-semibold' 
                        : 'hover:opacity-90 opacity-75'
                    }`}
                    style={{
                      borderColor: selectedTheme === t.id ? 'var(--accent-primary)' : 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-card-subtle)'
                    }}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <div 
                        className="w-5 h-5 rounded-full border shadow-sm"
                        style={{ backgroundColor: t.bg, borderColor: t.fg }}
                      />
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{t.name}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {t.desc}
                    </p>
                  </button>
                ))}
              </div>

              {/* Motion preferences */}
              <div className="pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Motion &amp; Animations Preference
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'full' as AnimationPreference, label: 'Full Animations' },
                    { id: 'reduced' as AnimationPreference, label: 'Reduced Motion' },
                    { id: 'off' as AnimationPreference, label: 'Animations Off' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedMotion(m.id);
                        setAnimationPref(m.id);
                      }}
                      className={`py-2 rounded-xl border text-center font-semibold transition-all ${
                        selectedMotion === m.id
                          ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                          : 'hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]'
                      }`}
                      style={{ borderColor: selectedMotion === m.id ? 'var(--accent-primary)' : 'var(--border-subtle)' }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 10: FINAL REVIEW */}
          {step === 10 && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <div className="inline-flex p-2 rounded-full bg-[var(--bg-accent-soft)] mb-1">
                  <CheckCircle2 className="w-6 h-6 text-[var(--accent-primary)]" />
                </div>
                <h2 className="text-2xl font-bold">Review Your Blueprint</h2>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Here is how Bloom will organize your time and personal space.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Profile & Help */}
                <div className="p-3.5 rounded-2xl border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card-subtle)' }}>
                  <div className="flex items-center justify-between mb-1.5 font-bold" style={{ color: 'var(--text-primary)' }}>
                    <span>Profile &amp; Focus</span>
                    <button onClick={() => setStep(3)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><Edit2 className="w-3 h-3" /></button>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>Name: <strong>{displayName}</strong></div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-1 truncate">
                    Focus: {selectedHelp.slice(0, 2).join(', ')}...
                  </div>
                </div>

                {/* AI Consent */}
                <div className="p-3.5 rounded-2xl border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card-subtle)' }}>
                  <div className="flex items-center justify-between mb-1.5 font-bold" style={{ color: 'var(--text-primary)' }}>
                    <span>AI Personalisation</span>
                    <button onClick={() => setStep(2)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><Edit2 className="w-3 h-3" /></button>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    Status: <strong>{aiConsent ? 'Consent Granted' : 'Standard Mode'}</strong>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-1">
                    Private Vault remains 100% isolated.
                  </div>
                </div>

                {/* Weekly Schedule */}
                <div className="p-3.5 rounded-2xl border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card-subtle)' }}>
                  <div className="flex items-center justify-between mb-1.5 font-bold" style={{ color: 'var(--text-primary)' }}>
                    <span>Weekly Commitments</span>
                    <button onClick={() => setStep(6)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><Edit2 className="w-3 h-3" /></button>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    <strong>{commitments.length}</strong> recurring activities configured
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-1">
                    Mapped across Monday through Sunday.
                  </div>
                </div>

                {/* Rest Periods */}
                <div className="p-3.5 rounded-2xl border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card-subtle)' }}>
                  <div className="flex items-center justify-between mb-1.5 font-bold" style={{ color: 'var(--text-primary)' }}>
                    <span>Protected Rest</span>
                    <button onClick={() => setStep(7)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><Edit2 className="w-3 h-3" /></button>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    <strong>{restPeriods.length}</strong> protected blocks
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-1">
                    Guarding healthy sleep &amp; daily recharge.
                  </div>
                </div>

                {/* Interests & Ambitions */}
                <div className="p-3.5 rounded-2xl border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card-subtle)' }}>
                  <div className="flex items-center justify-between mb-1.5 font-bold" style={{ color: 'var(--text-primary)' }}>
                    <span>Interests &amp; Ambitions</span>
                    <button onClick={() => setStep(4)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><Edit2 className="w-3 h-3" /></button>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    {interests.length} Interests • {ambitions.length} Ambitions
                  </div>
                </div>

                {/* Appearance */}
                <div className="p-3.5 rounded-2xl border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card-subtle)' }}>
                  <div className="flex items-center justify-between mb-1.5 font-bold" style={{ color: 'var(--text-primary)' }}>
                    <span>Theme &amp; Motion</span>
                    <button onClick={() => setStep(9)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><Edit2 className="w-3 h-3" /></button>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] capitalize">
                    Theme: {selectedTheme} • Motion: {selectedMotion}
                  </div>
                </div>
              </div>

              {/* Enter My Space Button */}
              <div className="pt-4 text-center">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-2xl text-sm font-bold text-white shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Enter My Space</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation Buttons */}
      <footer className="w-full max-w-3xl mx-auto flex items-center justify-between pt-4">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold border hover:bg-[var(--bg-card-subtle)] transition-all"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {step < totalSteps && (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </footer>
    </div>
  );
};
