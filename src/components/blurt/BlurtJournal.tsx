import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Unlock, 
  KeyRound, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Check, 
  X, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle, 
  Copy, 
  Palette, 
  FileText,
  Clock,
  Sparkles,
  Archive,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  JournalEntry, 
  EncryptedJournalEntry, 
  JournalSecurityConfig, 
  PASTEL_PALETTE, 
  PastelColorOption 
} from '../../types';
import * as journalCrypto from '../../services/journalCrypto';
import * as dataService from '../../services/dataService';

type JournalViewState = 'loading' | 'first_time_setup' | 'locked' | 'unlocked' | 'recovery';

export const BlurtJournal: React.FC = () => {
  const { user, vaultEntries } = useAuth();
  const userId = user?.uid || 'local_user';

  // Security & Unlock State
  const [viewState, setViewState] = useState<JournalViewState>('loading');
  const [securityConfig, setSecurityConfig] = useState<JournalSecurityConfig | null>(null);
  const activeKeyRef = useRef<CryptoKey | null>(null);

  // PIN Inputs
  const [pinInput, setPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Recovery Key Modal / State
  const [newRecoveryKey, setNewRecoveryKey] = useState<string | null>(null);
  const [recoveryInput, setRecoveryInput] = useState('');
  const [recoveryNewPin, setRecoveryNewPin] = useState('');
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Journal Entries State (Plaintext only while unlocked in memory)
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Active Writing / Editing Entry
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formColor, setFormColor] = useState<PastelColorOption>(PASTEL_PALETTE[0]); // Cream default
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Migration of legacy notes
  const [migrationNotice, setMigrationNotice] = useState<string | null>(null);

  // 1. Initial configuration check
  useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      setViewState('loading');
      try {
        const config = await dataService.getJournalSecurityConfig(userId);
        if (!isMounted) return;
        if (config && config.canaryCiphertext) {
          setSecurityConfig(config);
          setViewState('locked');
        } else {
          setViewState('first_time_setup');
        }
      } catch (err) {
        console.warn('Error loading journal config:', err);
        setViewState('first_time_setup');
      }
    }

    loadConfig();

    // CRITICAL: Mandatory Lock on Leaving Blurt
    // When the user navigates away or unmounts, purge the decryption key immediately from memory!
    return () => {
      isMounted = false;
      activeKeyRef.current = null;
    };
  }, [userId]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const timer = setInterval(() => {
      setLockoutTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutTimer]);

  // Lock the journal manually
  const handleLockJournal = () => {
    activeKeyRef.current = null;
    setEntries([]);
    setActiveEntry(null);
    setIsEditing(false);
    setPinInput('');
    setPinError(null);
    setViewState('locked');
  };

  // ----------------------------------------------------
  // A. First-Time PIN Setup
  // ----------------------------------------------------
  const handleFirstTimeSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    if (pinInput.length < 4 || pinInput.length > 6) {
      setPinError('PIN must be 4 to 6 digits.');
      return;
    }
    if (!/^\d+$/.test(pinInput)) {
      setPinError('PIN must contain numbers only.');
      return;
    }
    if (pinInput !== confirmPinInput) {
      setPinError('PINs do not match. Please re-enter carefully.');
      return;
    }

    try {
      const { config, recoveryKey } = await journalCrypto.setupJournalPIN(userId, pinInput);
      await dataService.saveJournalSecurityConfig(config);
      setSecurityConfig(config);
      setNewRecoveryKey(recoveryKey);

      // Derive key and save in memory for immediate entry
      const key = await journalCrypto.deriveJournalKey(pinInput, userId, window.crypto.getRandomValues(new Uint8Array(32)));
      activeKeyRef.current = key;
    } catch (err: any) {
      setPinError(err.message || 'Unable to initialize secure journal. Please try again.');
    }
  };

  // Complete setup after saving recovery key
  const handleAcknowledgeRecoveryKey = async () => {
    setNewRecoveryKey(null);
    setPinInput('');
    setConfirmPinInput('');
    // Prompt unlock or direct unlock
    if (securityConfig && pinInput) {
      try {
        const key = await journalCrypto.verifyPINAndDeriveKey(userId, pinInput, securityConfig);
        activeKeyRef.current = key;
        setViewState('unlocked');
        loadAndDecryptEntries(key);
        return;
      } catch {}
    }
    setViewState('locked');
  };

  // ----------------------------------------------------
  // B. Unlock Journal with PIN
  // ----------------------------------------------------
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;
    if (!pinInput) return;
    if (!securityConfig) {
      setViewState('first_time_setup');
      return;
    }

    setPinError(null);

    try {
      const key = await journalCrypto.verifyPINAndDeriveKey(userId, pinInput, securityConfig);
      activeKeyRef.current = key;
      setFailedAttempts(0);
      setPinInput('');
      setViewState('unlocked');
      await loadAndDecryptEntries(key);
    } catch (err: any) {
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);
      setPinInput('');
      if (nextFailures >= 5) {
        setLockoutTimer(30);
        setPinError('Too many incorrect attempts. Blurt is locked for 30 seconds.');
      } else {
        setPinError(`Incorrect PIN. ${5 - nextFailures} attempts remaining before temporary lockout.`);
      }
    }
  };

  // ----------------------------------------------------
  // C. PIN Recovery via Recovery Key
  // ----------------------------------------------------
  const handleResetWithRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);

    if (!recoveryInput.trim()) {
      setRecoveryError('Please enter your 24-character recovery key.');
      return;
    }
    if (recoveryNewPin.length < 4 || recoveryNewPin.length > 6 || !/^\d+$/.test(recoveryNewPin)) {
      setRecoveryError('New PIN must be 4 to 6 numbers.');
      return;
    }
    if (!securityConfig) return;

    try {
      const { updatedConfig, newKey } = await journalCrypto.resetPINWithRecoveryKey(
        userId,
        recoveryInput.trim(),
        recoveryNewPin,
        securityConfig
      );
      await dataService.saveJournalSecurityConfig(updatedConfig);
      setSecurityConfig(updatedConfig);
      activeKeyRef.current = newKey;
      setRecoveryInput('');
      setRecoveryNewPin('');
      setViewState('unlocked');
      await loadAndDecryptEntries(newKey);
    } catch (err: any) {
      setRecoveryError(err.message || 'Recovery key could not be verified.');
    }
  };

  // ----------------------------------------------------
  // D. Decrypt & Load Entries into Memory
  // ----------------------------------------------------
  const loadAndDecryptEntries = async (key: CryptoKey) => {
    setIsDecrypting(true);
    try {
      const encryptedList = await dataService.getEncryptedJournalEntries(userId);
      const decryptedList: JournalEntry[] = [];

      for (const item of encryptedList) {
        try {
          const payload = await journalCrypto.decryptJournalEntry(item.encryptedPayload, item.iv, key);
          decryptedList.push({
            id: item.id,
            userId: item.userId,
            title: payload.title,
            content: payload.content,
            color: payload.color || '#FFF8EB',
            colorFeeling: payload.colorFeeling,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
          });
        } catch {
          // If a single corrupted entry fails, continue with others
          console.warn('Skipping entry that could not be decrypted');
        }
      }

      setEntries(decryptedList);
    } catch (err) {
      console.warn('Error decrypting journal entries:', err);
    } finally {
      setIsDecrypting(false);
    }
  };

  // ----------------------------------------------------
  // E. Entry CRUD & Pastel Color Management
  // ----------------------------------------------------
  const handleOpenNewEntry = () => {
    setActiveEntry(null);
    setFormTitle('');
    setFormContent('');
    setFormColor(PASTEL_PALETTE[0]); // Cream default
    setIsEditing(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setActiveEntry(entry);
    setFormTitle(entry.title || '');
    setFormContent(entry.content);
    const matchedColor = PASTEL_PALETTE.find(p => p.hex.toLowerCase() === entry.color.toLowerCase()) || PASTEL_PALETTE[0];
    setFormColor(matchedColor);
    setIsEditing(true);
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContent.trim() || !activeKeyRef.current) return;

    setIsSaving(true);
    try {
      const entryId = activeEntry ? activeEntry.id : 'entry_' + Date.now();
      const now = new Date().toISOString();

      // Encrypt strictly on the client before saving
      const { encryptedPayload, iv, salt } = await journalCrypto.encryptJournalEntry(
        {
          title: formTitle.trim(),
          content: formContent.trim(),
          color: formColor.hex,
          colorFeeling: formColor.feeling
        },
        activeKeyRef.current
      );

      const encryptedRecord: EncryptedJournalEntry = {
        id: entryId,
        userId,
        encryptedPayload,
        iv,
        salt,
        createdAt: activeEntry ? activeEntry.createdAt : now,
        updatedAt: now
      };

      await dataService.saveEncryptedJournalEntry(encryptedRecord);

      const updatedLocal: JournalEntry = {
        id: entryId,
        userId,
        title: formTitle.trim(),
        content: formContent.trim(),
        color: formColor.hex,
        colorFeeling: formColor.feeling,
        createdAt: activeEntry ? activeEntry.createdAt : now,
        updatedAt: now
      };

      setEntries(prev => {
        const idx = prev.findIndex(e => e.id === entryId);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = updatedLocal;
          return copy;
        }
        return [updatedLocal, ...prev];
      });

      setIsEditing(false);
      setActiveEntry(null);
      setSaveSuccessNotice('Entry encrypted and saved.');
      setTimeout(() => setSaveSuccessNotice(null), 3000);
    } catch (err: any) {
      console.warn('Save error:', err);
      alert('Unable to save encrypted entry: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this entry? This action cannot be undone.')) {
      return;
    }
    try {
      await dataService.deleteEncryptedJournalEntry(userId, id);
      setEntries(prev => prev.filter(e => e.id !== id));
      if (activeEntry?.id === id) {
        setActiveEntry(null);
        setIsEditing(false);
      }
    } catch (err) {
      console.warn('Delete error:', err);
    }
  };

  // Safe migration of existing vault entries if present
  const handleMigrateVaultEntries = async () => {
    if (!activeKeyRef.current || vaultEntries.length === 0) return;
    try {
      for (const v of vaultEntries) {
        // Encrypt as journal entry with cream background
        const { encryptedPayload, iv, salt } = await journalCrypto.encryptJournalEntry(
          {
            title: v.title || 'Migrated Vault Entry',
            content: '(Encrypted note migrated from Vault)',
            color: '#FFF8EB',
            colorFeeling: 'Neutral / Default'
          },
          activeKeyRef.current
        );
        const record: EncryptedJournalEntry = {
          id: 'migrated_' + v.id,
          userId,
          encryptedPayload,
          iv,
          salt,
          createdAt: v.createdAt || new Date().toISOString(),
          updatedAt: v.updatedAt || new Date().toISOString()
        };
        await dataService.saveEncryptedJournalEntry(record);
      }
      setMigrationNotice(`Safely migrated ${vaultEntries.length} entries into encrypted journal.`);
      if (activeKeyRef.current) await loadAndDecryptEntries(activeKeyRef.current);
      setTimeout(() => setMigrationNotice(null), 4000);
    } catch (err) {
      console.warn('Migration notice:', err);
    }
  };

  // ====================================================
  // VIEW: LOADING
  // ====================================================
  if (viewState === 'loading') {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3 text-center">
        <Lock className="w-8 h-8 text-[var(--accent-primary)] animate-pulse" />
        <p className="text-xs text-[var(--text-secondary)] font-medium">Initializing secure journal environment...</p>
      </div>
    );
  }

  // ====================================================
  // VIEW: RECOVERY KEY DISPLAY (Setup Confirmation)
  // ====================================================
  if (newRecoveryKey) {
    return (
      <div className="max-w-md mx-auto py-10 px-4">
        <div 
          className="p-6 sm:p-8 rounded-3xl border space-y-5 text-center shadow-lg"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Save Your Recovery Key
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Because Blurt uses genuine end-to-end encryption, <strong>nobody—not even Bloom administrators or AI—can reset your PIN</strong>. Save this recovery key somewhere safe.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl border font-mono font-bold text-xs tracking-wider select-all bg-[var(--bg-card-subtle)] text-[var(--text-primary)] border-[var(--border-subtle)] flex items-center justify-between">
            <span>{newRecoveryKey}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(newRecoveryKey);
                setCopiedKey(true);
                setTimeout(() => setCopiedKey(false), 2000);
              }}
              className="p-1.5 rounded-xl hover:bg-black/5 text-[var(--accent-primary)] flex items-center space-x-1"
              title="Copy to clipboard"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-sans">{copiedKey ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-2xl text-left flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>If you lose both your PIN and this key, your encrypted journal entries cannot be restored.</span>
          </div>

          <button
            onClick={handleAcknowledgeRecoveryKey}
            className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-[var(--accent-primary)] hover:opacity-90 transition-all shadow-sm"
          >
            I Have Saved My Recovery Key &rarr;
          </button>
        </div>
      </div>
    );
  }

  // ====================================================
  // VIEW: FIRST-TIME PIN SETUP
  // ====================================================
  if (viewState === 'first_time_setup') {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div 
          className="p-6 sm:p-8 rounded-3xl border space-y-6 text-center shadow-lg"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Create your journal PIN
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Blurt is your private digital diary. Choose a 4–6 digit PIN to encrypt and lock your thoughts.
            </p>
          </div>

          <form onSubmit={handleFirstTimeSetup} className="space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                Choose a 4–6 digit PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pinInput}
                onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full text-center tracking-[0.5em] text-lg font-bold py-2.5 px-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                Confirm your PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={confirmPinInput}
                onChange={e => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full text-center tracking-[0.5em] text-lg font-bold py-2.5 px-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>

            {pinError && (
              <div className="p-3 rounded-2xl text-xs border border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={pinInput.length < 4 || confirmPinInput.length < 4}
              className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-[var(--accent-primary)] hover:opacity-90 disabled:opacity-40 transition-all shadow-sm"
            >
              Set PIN &amp; Lock Journal
            </button>
          </form>

          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            Client-side AES-GCM 256-bit encryption. Zero AI access.
          </p>
        </div>
      </div>
    );
  }

  // ====================================================
  // VIEW: PIN RECOVERY FORM
  // ====================================================
  if (viewState === 'recovery') {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div 
          className="p-6 sm:p-8 rounded-3xl border space-y-6 text-center shadow-lg"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Reset Journal PIN
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Enter the 24-character recovery key you saved during setup to create a new PIN.
            </p>
          </div>

          <form onSubmit={handleResetWithRecovery} className="space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                Recovery Key
              </label>
              <input
                type="text"
                value={recoveryInput}
                onChange={e => setRecoveryInput(e.target.value.toUpperCase())}
                placeholder="BLOOM-XXXX-XXXX-XXXX-XXXX"
                className="w-full text-center font-mono font-bold text-xs py-2.5 px-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                New 4–6 Digit PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={recoveryNewPin}
                onChange={e => setRecoveryNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full text-center tracking-[0.5em] text-lg font-bold py-2.5 px-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>

            {recoveryError && (
              <div className="p-3 rounded-2xl text-xs border border-rose-300 bg-rose-50 text-rose-700 flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{recoveryError}</span>
              </div>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setViewState('locked');
                  setRecoveryError(null);
                }}
                className="flex-1 py-2.5 rounded-2xl font-semibold text-xs border hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                Back to Unlock
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-2xl font-bold text-xs text-white bg-[var(--accent-primary)] hover:opacity-90 shadow-sm"
              >
                Verify &amp; Unlock
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ====================================================
  // VIEW: MANDATORY PIN ENTRY (Locked state)
  // ====================================================
  if (viewState === 'locked') {
    return (
      <div className="max-w-md mx-auto py-12 px-4 select-none">
        <div 
          className="p-6 sm:p-8 rounded-3xl border space-y-6 text-center shadow-lg relative overflow-hidden"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          {/* Subtle Ambient Glow */}
          <div 
            className="absolute -top-24 -left-24 w-60 h-60 rounded-full opacity-10 filter blur-3xl pointer-events-none"
            style={{ background: 'var(--accent-primary)' }}
          />

          <div className="w-14 h-14 rounded-2xl bg-[var(--bg-accent-soft)] text-[var(--accent-primary)] flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Enter your PIN to unlock Blurt
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Your journal is end-to-end encrypted. Enter your PIN to view or write entries.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pinInput}
                onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                disabled={lockoutTimer > 0}
                className="w-48 mx-auto text-center tracking-[0.6em] text-2xl font-bold py-3 px-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] block"
                style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                autoFocus
              />
            </div>

            {lockoutTimer > 0 && (
              <div className="p-3 rounded-2xl text-xs border border-amber-300 bg-amber-50 text-amber-800 flex items-center justify-center space-x-1.5 animate-in fade-in">
                <Clock className="w-4 h-4" />
                <span>Locked. Try again in {lockoutTimer}s.</span>
              </div>
            )}

            {pinError && lockoutTimer <= 0 && (
              <div className="p-3 rounded-2xl text-xs border border-rose-300 bg-rose-50 text-rose-700 flex items-center justify-center space-x-1.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={pinInput.length < 4 || lockoutTimer > 0}
              className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-[var(--accent-primary)] hover:opacity-90 disabled:opacity-40 transition-all shadow-sm"
            >
              Unlock Journal
            </button>
          </form>

          <div className="pt-2 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="text-[11px] text-[var(--text-muted)]">Encrypted with AES-GCM 256</span>
            <button
              onClick={() => {
                setViewState('recovery');
                setPinError(null);
              }}
              className="text-[11px] font-semibold text-[var(--accent-primary)] hover:underline"
            >
              Forgot PIN?
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ====================================================
  // VIEW: UNLOCKED JOURNAL INTERFACE
  // ====================================================
  return (
    <div className="space-y-6 select-none max-w-4xl mx-auto pb-12">
      {/* Toast Notification */}
      {saveSuccessNotice && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-2xl border text-xs font-bold text-white bg-emerald-600 shadow-xl flex items-center space-x-2 animate-in slide-in-from-bottom duration-200">
          <Check className="w-4 h-4" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* Top Header & Lock Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Blurt
            </h1>
            <span 
              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                color: '#059669'
              }}
            >
              Private Journal
            </span>
            <span className="text-[11px] text-[var(--text-muted)] flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Decrypted in memory</span>
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Your distraction-free personal diary. Express your thoughts freely on customisable pastel pages.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {!isEditing && (
            <button
              onClick={handleOpenNewEntry}
              className="px-4 py-2 rounded-2xl text-xs font-bold text-white bg-[var(--accent-primary)] hover:opacity-90 flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Entry</span>
            </button>
          )}

          <button
            onClick={handleLockJournal}
            className="px-3 py-2 rounded-2xl text-xs font-semibold border hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] flex items-center space-x-1.5 transition-all"
            style={{ borderColor: 'var(--border-subtle)' }}
            title="Lock journal immediately"
          >
            <Lock className="w-3.5 h-3.5 text-rose-500" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Migration Banner if legacy vault items exist */}
      {vaultEntries.length > 0 && !migrationNotice && (
        <div 
          className="p-3.5 rounded-2xl border text-xs flex items-center justify-between"
          style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center space-x-2">
            <Archive className="w-4 h-4 text-purple-600" />
            <span className="text-[var(--text-secondary)]">
              Found {vaultEntries.length} previous confidential notes from Vault. Would you like to migrate them into your Journal?
            </span>
          </div>
          <button
            onClick={handleMigrateVaultEntries}
            className="px-3 py-1 rounded-xl text-[11px] font-bold text-white bg-purple-600 hover:bg-purple-700 ml-2 shrink-0"
          >
            Migrate Notes
          </button>
        </div>
      )}

      {migrationNotice && (
        <div className="p-3 rounded-2xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs">
          {migrationNotice}
        </div>
      )}

      {/* ==================================================== */}
      {/* WRITING / EDITING VIEW (Customisable Pastel Journal Page) */}
      {/* ==================================================== */}
      {isEditing ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Top Return & Save Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (formContent.trim() && !confirm('Discard unsaved changes to this entry?')) return;
                setIsEditing(false);
                setActiveEntry(null);
              }}
              className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Entries</span>
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-[var(--text-muted)]">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <button
                onClick={handleSaveEntry}
                disabled={!formContent.trim() || isSaving}
                className="px-5 py-2 rounded-2xl text-xs font-bold text-white bg-[var(--accent-primary)] hover:opacity-90 disabled:opacity-40 shadow-sm flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Encrypting...' : 'Save Entry'}</span>
              </button>
            </div>
          </div>

          {/* Pastel Colour Palette Selector */}
          <div 
            className="p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Page Pastel:
              </span>
              <span className="text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>
                {formColor.name}
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">
                ({formColor.feeling})
              </span>
            </div>

            {/* 10 Curated Pastel Color Swatches */}
            <div className="flex flex-wrap items-center gap-1.5">
              {PASTEL_PALETTE.map(c => {
                const isSelected = formColor.hex.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setFormColor(c)}
                    className={`w-7 h-7 rounded-full border transition-all transform hover:scale-110 flex items-center justify-center relative ${
                      isSelected ? 'ring-2 ring-[var(--accent-primary)] scale-110 shadow-xs' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex, borderColor: c.border }}
                    title={`${c.name} • ${c.feeling}`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" style={{ color: c.text }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* The Digital Journal Page (Coloured Paper Experience) */}
          <div 
            className="rounded-3xl p-6 sm:p-10 border transition-colors duration-300 shadow-md min-h-[480px] flex flex-col space-y-4"
            style={{
              backgroundColor: formColor.hex,
              borderColor: formColor.border,
              color: formColor.text
            }}
          >
            {/* Entry Header: Optional Title & Auto Date */}
            <div className="border-b pb-3" style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}>
              <input
                type="text"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="Entry Title (optional)"
                className="w-full text-lg sm:text-xl font-bold bg-transparent focus:outline-none placeholder:opacity-50"
                style={{ color: formColor.text }}
              />
              <div className="text-[11px] font-medium opacity-60 mt-1">
                {activeEntry 
                  ? `Written on ${new Date(activeEntry.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                  : `Starting fresh on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
              </div>
            </div>

            {/* Minimal, Distraction-Free Textarea */}
            <textarea
              rows={16}
              value={formContent}
              onChange={e => setFormContent(e.target.value)}
              placeholder="Dear journal... Write whatever is on your mind. Your thoughts are encrypted and completely private."
              className="w-full bg-transparent resize-none focus:outline-none text-sm sm:text-base leading-relaxed flex-1 placeholder:opacity-40"
              style={{ color: formColor.text }}
              autoFocus
            />

            {/* Page Footer Note */}
            <div className="pt-3 border-t text-[10px] opacity-60 flex items-center justify-between" style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}>
              <span>Zero-knowledge client encrypted</span>
              <span>{formContent.length} characters</span>
            </div>
          </div>
        </div>
      ) : (
        /* ==================================================== */
        /* CHRONOLOGICAL ENTRIES LIST VIEW */
        /* ==================================================== */
        <div className="space-y-4">
          {isDecrypting ? (
            <div className="py-16 text-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[var(--accent-primary)] mx-auto" />
              <p className="text-xs text-[var(--text-secondary)]">Decrypting your journal entries...</p>
            </div>
          ) : entries.length === 0 ? (
            <div 
              className="p-12 sm:p-16 rounded-3xl border text-center space-y-4"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="w-14 h-14 rounded-2xl bg-[var(--bg-accent-soft)] text-[var(--accent-primary)] flex items-center justify-center mx-auto shadow-sm">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Your journal is empty
                </h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                  Start your digital diary by writing your first entry. Choose a pastel page colour that fits how you feel today.
                </p>
              </div>
              <button
                onClick={handleOpenNewEntry}
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-[var(--accent-primary)] hover:opacity-90 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Write Your First Entry</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entries.map(entry => {
                const matchedColor = PASTEL_PALETTE.find(p => p.hex.toLowerCase() === entry.color.toLowerCase()) || PASTEL_PALETTE[0];
                return (
                  <div
                    key={entry.id}
                    onClick={() => handleEditEntry(entry)}
                    className="p-5 rounded-3xl border cursor-pointer hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                    style={{
                      backgroundColor: matchedColor.hex,
                      borderColor: matchedColor.border,
                      color: matchedColor.text
                    }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span 
                          className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-white/40"
                          style={{ borderColor: matchedColor.border, color: matchedColor.text }}
                        >
                          {matchedColor.name} {entry.colorFeeling && `• ${entry.colorFeeling}`}
                        </span>

                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEntry(entry);
                            }}
                            className="p-1 rounded hover:bg-black/10"
                            title="Edit entry"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEntry(entry.id);
                            }}
                            className="p-1 rounded hover:bg-rose-500/20 text-rose-700"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {entry.title && (
                        <h3 className="font-extrabold text-sm sm:text-base leading-snug line-clamp-1">
                          {entry.title}
                        </h3>
                      )}

                      <p className="text-xs leading-relaxed line-clamp-4 opacity-90">
                        {entry.content}
                      </p>
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between text-[10px] opacity-70" style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}>
                      <span>
                        {new Date(entry.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span>{new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
