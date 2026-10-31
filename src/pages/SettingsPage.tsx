import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  Compass, 
  Moon, 
  Palette, 
  Shield, 
  LogOut, 
  Check, 
  Sparkles, 
  AlertCircle,
  Clock,
  Plus,
  Trash2,
  Lock,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { WeeklyScheduleEditor } from '../components/schedule/WeeklyScheduleEditor';
import { RestPeriodEditor } from '../components/rest/RestPeriodEditor';
import { ThemeMode, AnimationPreference } from '../types';
import { Target } from 'lucide-react';

type SettingsTab = 
  | 'profile' 
  | 'focus'
  | 'schedule' 
  | 'interests' 
  | 'rest' 
  | 'appearance' 
  | 'consent' 
  | 'privacy';

export const SettingsPage: React.FC = () => {
  const { 
    profile, 
    user, 
    commitments, 
    addOrUpdateCommitment, 
    removeCommitment, 
    restPeriods, 
    addOrUpdateRestPeriod, 
    removeRestPeriod, 
    interests, 
    addNewInterest, 
    removeInterestItem, 
    ambitions, 
    addNewAmbition, 
    removeAmbitionItem, 
    goals,
    focusMode,
    setFocusMode,
    theme, 
    setTheme, 
    animationPref, 
    setAnimationPref, 
    updateDisplayName, 
    updateAiConsent, 
    signOut 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Profile edit state
  const [editingName, setEditingName] = useState(profile?.displayName || 'Alex');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

  // Interest and ambition input state
  const [newInterest, setNewInterest] = useState('');
  const [newAmbition, setNewAmbition] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingName.trim()) return;
    await updateDisplayName(editingName.trim());
    setProfileSuccessMsg(true);
    setTimeout(() => setProfileSuccessMsg(false), 2500);
  };

  const handleAddInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInterest.trim()) return;
    await addNewInterest(newInterest.trim());
    setNewInterest('');
  };

  const handleAddAmbition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmbition.trim()) return;
    await addNewAmbition(newAmbition.trim());
    setNewAmbition('');
  };

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'focus', label: 'Focus / Exam Mode', icon: Target },
    { id: 'schedule', label: 'My Weekly Schedule', icon: Calendar },
    { id: 'interests', label: 'Interests & Ambitions', icon: Compass },
    { id: 'rest', label: 'Rest Preferences', icon: Moon },
    { id: 'appearance', label: 'Appearance & Motion', icon: Palette },
    { id: 'consent', label: 'AI Consent & Ethics', icon: Shield },
    { id: 'privacy', label: 'Future Privacy & Vault', icon: Lock },
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Settings &amp; Preferences
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Manage your personal context, recurring timetable, rest periods, and appearance.
          </p>
        </div>

        <button
          onClick={signOut}
          className="self-start sm:self-auto flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Settings Navigation & Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="space-y-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-left transition-all ${
                  isActive
                    ? 'bg-[var(--bg-accent-soft)] text-[var(--accent-primary)] shadow-sm'
                    : 'hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Panel Content (3 spans) */}
        <div 
          className="md:col-span-3 rounded-3xl p-6 sm:p-8 border space-y-6"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  User Profile
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Update your preferred display name and review account details.
                </p>
              </div>

              {profileSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs border border-emerald-200 flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md text-xs">
                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-transparent font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                    style={{ borderColor: 'var(--border-strong)' }}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Account Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || profile?.email || ''}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-[var(--bg-card-subtle)] text-xs opacity-75 cursor-not-allowed"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  />
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">
                    Managed via authenticated session.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Timezone
                  </label>
                  <div className="text-xs font-mono p-2.5 rounded-xl border bg-[var(--bg-card-subtle)]" style={{ borderColor: 'var(--border-subtle)' }}>
                    {profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white transition-all shadow-sm"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {/* FOCUS / EXAM MODE TAB */}
          {activeTab === 'focus' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    Focus &amp; Exam Mode
                  </h3>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Configure an intensive study sprint or exam preparation mode. Reversible at any time with zero data loss.
                </p>
              </div>

              {/* Status Toggle Card */}
              <div 
                className="p-5 rounded-2xl border space-y-4"
                style={{
                  backgroundColor: focusMode.enabled ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-card-subtle)',
                  borderColor: focusMode.enabled ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-subtle)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs block" style={{ color: 'var(--text-primary)' }}>
                      Focus Mode Active
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {focusMode.enabled ? 'Currently prioritizing study blocks and simplifying views' : 'Standard balanced rhythm active'}
                    </span>
                  </div>

                  <button
                    onClick={() => setFocusMode({ ...focusMode, enabled: !focusMode.enabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      focusMode.enabled ? 'bg-amber-600' : 'bg-neutral-300 dark:bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        focusMode.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {focusMode.enabled && (
                  <div className="pt-3 border-t space-y-4 text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div>
                      <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Target Exam or Focal Goal
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Calculus Midterm, Biology Finals, Thesis Defense"
                        value={focusMode.targetGoalOrExam}
                        onChange={(e) => setFocusMode({ ...focusMode, targetGoalOrExam: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border bg-transparent font-medium"
                        style={{ borderColor: 'var(--border-strong)' }}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={focusMode.startDate || ''}
                          onChange={(e) => setFocusMode({ ...focusMode, startDate: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border bg-transparent text-xs"
                          style={{ borderColor: 'var(--border-strong)' }}
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                          Target Exam Date / Deadline
                        </label>
                        <input
                          type="date"
                          value={focusMode.endDate || ''}
                          onChange={(e) => setFocusMode({ ...focusMode, endDate: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border bg-transparent text-xs"
                          style={{ borderColor: 'var(--border-strong)' }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <span className="font-semibold block text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                        Focus Mode Rules &amp; Safeguards:
                      </span>
                      <label className="flex items-center space-x-2 text-xs">
                        <input
                          type="checkbox"
                          checked={focusMode.academicPrioritization}
                          onChange={(e) => setFocusMode({ ...focusMode, academicPrioritization: e.target.checked })}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span>Elevate academic and revision tasks to the top of daily plans</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs">
                        <input
                          type="checkbox"
                          checked={focusMode.distractionReduction}
                          onChange={(e) => setFocusMode({ ...focusMode, distractionReduction: e.target.checked })}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span>Streamline homepage into distraction-free view</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Zero data loss guarantee banner */}
              <div className="p-4 rounded-2xl border text-xs leading-relaxed space-y-1 bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                <span className="font-bold block">100% Reversible Without Data Loss</span>
                <p>
                  Turning off Focus Mode instantly restores your standard balanced timetable, radar insights, and all general tasks. No schedules, goals, or historical records are modified or removed.
                </p>
              </div>
            </div>
          )}

          {/* MY WEEKLY SCHEDULE TAB (Reuses WeeklyScheduleEditor) */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <WeeklyScheduleEditor
                commitments={commitments}
                onChange={(updated) => {
                  // Synchronize each commitment
                  const currentIds = new Set(commitments.map(c => c.id));
                  const updatedIds = new Set(updated.map(c => c.id));

                  // Removed items
                  commitments.forEach(c => {
                    if (!updatedIds.has(c.id)) removeCommitment(c.id);
                  });

                  // Added or updated items
                  updated.forEach(c => {
                    addOrUpdateCommitment(c);
                  });
                }}
                userId={user?.uid}
                isSettingsMode={true}
              />
            </div>
          )}

          {/* INTERESTS & AMBITIONS TAB */}
          {activeTab === 'interests' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Interests &amp; Ambitions
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Add or remove your subjects and personal goals. Used by Explore and Blurt.
                </p>
              </div>

              {/* Interests Section */}
              <div className="space-y-3">
                <label className="block font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>
                  Interests &amp; Focus Areas ({interests.length})
                </label>
                <form onSubmit={handleAddInterest} className="flex space-x-2 max-w-md">
                  <input
                    type="text"
                    placeholder="e.g. Neuroscience, Robotics, Creative Writing"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border text-xs bg-transparent"
                    style={{ borderColor: 'var(--border-strong)' }}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  >
                    Add
                  </button>
                </form>

                <div className="flex flex-wrap gap-2">
                  {interests.map((i) => (
                    <span
                      key={i.id}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs border"
                      style={{
                        backgroundColor: 'var(--bg-accent-soft)',
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--accent-primary)'
                      }}
                    >
                      <span>{i.name}</span>
                      <button
                        onClick={() => removeInterestItem(i.id)}
                        className="text-[var(--text-muted)] hover:text-rose-600"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Ambitions Section */}
              <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <label className="block font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>
                  Ambitions &amp; Long-term Aspirations ({ambitions.length})
                </label>
                <form onSubmit={handleAddAmbition} className="flex space-x-2 max-w-md">
                  <input
                    type="text"
                    placeholder="e.g. Publish a research paper, Launch student podcast"
                    value={newAmbition}
                    onChange={(e) => setNewAmbition(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border text-xs bg-transparent"
                    style={{ borderColor: 'var(--border-strong)' }}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  >
                    Add
                  </button>
                </form>

                <div className="space-y-2">
                  {ambitions.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-3 rounded-2xl border text-xs"
                      style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}
                    >
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{a.title}</span>
                      <button
                        onClick={() => removeAmbitionItem(a.id)}
                        className="p-1 text-[var(--text-muted)] hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* REST PREFERENCES TAB */}
          {activeTab === 'rest' && (
            <div className="space-y-4">
              <RestPeriodEditor
                restPeriods={restPeriods}
                onChange={(updated) => {
                  const currentIds = new Set(restPeriods.map(r => r.id));
                  const updatedIds = new Set(updated.map(r => r.id));

                  restPeriods.forEach(r => {
                    if (!updatedIds.has(r.id)) removeRestPeriod(r.id);
                  });

                  updated.forEach(r => {
                    addOrUpdateRestPeriod(r);
                  });
                }}
                userId={user?.uid}
              />
            </div>
          )}

          {/* APPEARANCE & MOTION TAB */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Appearance Themes
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Select your aesthetic preference. Instantly applies across all views and persists on login.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'soft-focus' as ThemeMode, name: 'Soft Focus', desc: 'Warm ivory background, forest green & sage accents', bg: '#F8F9F5', fg: '#344E41' },
                  { id: 'midnight' as ThemeMode, name: 'Midnight', desc: 'Sophisticated dark monochrome for calm evening focus (always dark)', bg: '#0D0F0E', fg: '#F3F5F4' },
                  { id: 'minimal' as ThemeMode, name: 'Black & White', desc: 'Strictly monochrome high-contrast black-and-white', bg: '#FFFFFF', fg: '#111827' },
                  { id: 'system' as ThemeMode, name: 'Follow System', desc: 'Responds directly to your device appearance settings', bg: '#E5EFE7', fg: '#29352F' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      theme === t.id 
                        ? 'ring-2 ring-[var(--accent-primary)] font-bold shadow-md' 
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      borderColor: theme === t.id ? 'var(--accent-primary)' : 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-card-subtle)'
                    }}
                  >
                    <div className="flex items-center space-x-2 mb-1.5">
                      <div className="w-5 h-5 rounded-full border shadow-sm" style={{ backgroundColor: t.bg, borderColor: t.fg }} />
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{t.name}</span>
                    </div>
                    <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{t.desc}</p>
                  </button>
                ))}
              </div>

              {/* Animation preference */}
              <div className="pt-4 border-t space-y-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <label className="block text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Animation &amp; Accessibility Preference
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'full' as AnimationPreference, label: 'Full Animations' },
                    { id: 'reduced' as AnimationPreference, label: 'Reduced Motion' },
                    { id: 'off' as AnimationPreference, label: 'Animations Off' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setAnimationPref(m.id)}
                      className={`py-2 rounded-xl border text-center font-semibold transition-all ${
                        animationPref === m.id
                          ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                          : 'hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]'
                      }`}
                      style={{ borderColor: animationPref === m.id ? 'var(--accent-primary)' : 'var(--border-subtle)' }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI CONSENT TAB */}
          {activeTab === 'consent' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  AI Consent &amp; Well-being Ethics
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Transparent control over AI features and data processing.
                </p>
              </div>

              <div 
                className="p-4 rounded-2xl border space-y-3 text-xs leading-relaxed"
                style={{
                  backgroundColor: 'var(--bg-card-subtle)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-secondary)'
                }}
              >
                <p>
                  Bloom adheres to <strong>UN Sustainable Development Goal 3 (Target 3.4)</strong> by providing well-being-aware planning.
                </p>
                <p>
                  Current AI Personalization Status: <strong>{profile?.aiConsent ? 'Consent Active' : 'Consent Withdrawn / Standard Mode'}</strong>
                </p>
                {profile?.aiConsentTimestamp && (
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Consent recorded on: {new Date(profile.aiConsentTimestamp).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => updateAiConsent(!profile?.aiConsent)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all ${
                    profile?.aiConsent ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {profile?.aiConsent ? 'Withdraw AI Personalisation Consent' : 'Grant AI Personalisation Consent'}
                </button>
              </div>
            </div>
          )}

          {/* FUTURE PRIVACY & VAULT TAB */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Privacy &amp; Vault Architecture
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Guaranteed boundary separation for confidential student notes.
                </p>
              </div>

              <div className="p-4 rounded-2xl border space-y-2 text-xs" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card-subtle)' }}>
                <span className="font-bold text-[var(--text-primary)]">Zero-Knowledge Vault Preparation:</span>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  In Step 3, the Private Vault will be encrypted client-side. The shared context that powers Goal Tracker, Blurt, and Explore will remain strictly walled off from Private Vault entries.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl border" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="font-bold block mb-1">Bloom Quiet Mode</span>
                  <p className="text-[11px] text-[var(--text-muted)]">Configurable in Stage 6 to silence all proactively generated suggestions.</p>
                </div>
                <div className="p-3 rounded-2xl border" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="font-bold block mb-1">Notification Control</span>
                  <p className="text-[11px] text-[var(--text-muted)]">Quiet hours aligned with your protected rest blocks.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
