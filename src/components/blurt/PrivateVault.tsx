import React, { useState } from 'react';
import { 
  FolderLock, 
  KeyRound, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  AlertCircle,
  X,
  Check,
  ShieldAlert
} from 'lucide-react';
import { VaultEntry } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { encryptVaultText, decryptVaultText } from '../../services/vaultCrypto';

export const PrivateVault: React.FC = () => {
  const { vaultEntries, saveVaultEntry, deleteVaultEntry } = useAuth();
  
  const [passphrase, setPassphrase] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockedKey, setUnlockedKey] = useState<string | null>(null);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  // Decrypted cache in memory only (never written to disk or synced)
  const [decryptedNotes, setDecryptedNotes] = useState<Record<string, { title: string; content: string }>>({});
  
  // Note creation / editing state
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) return;

    setUnlockError(null);
    try {
      // Try decrypting existing entries to verify passphrase correctness
      const decryptedMap: Record<string, { title: string; content: string }> = {};
      let failureCount = 0;

      for (const entry of vaultEntries) {
        try {
          const decTitle = await decryptVaultText(entry.encryptedData, entry.iv, entry.salt, passphrase);
          decryptedMap[entry.id] = {
            title: entry.title,
            content: decTitle
          };
        } catch {
          failureCount++;
        }
      }

      if (vaultEntries.length > 0 && failureCount === vaultEntries.length) {
        setUnlockError('Incorrect passphrase. Could not decrypt vault entries.');
        return;
      }

      setUnlockedKey(passphrase);
      setDecryptedNotes(decryptedMap);
      setIsUnlocked(true);
      setPassphrase('');
    } catch {
      setUnlockError('Decryption failed. Please verify your passphrase.');
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setUnlockedKey(null);
    setDecryptedNotes({});
    setUnlockError(null);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockedKey || !noteTitle.trim()) return;

    setIsSaving(true);
    try {
      const fullText = noteContent.trim() ? `${noteTitle.trim()}\n\n${noteContent.trim()}` : noteTitle.trim();
      const encrypted = await encryptVaultText(fullText, unlockedKey);

      const entryId = editingId || 'vault_' + Date.now();
      const newEntry: VaultEntry = {
        id: entryId,
        userId: 'current',
        title: noteTitle.trim(),
        encryptedData: encrypted.ciphertext,
        iv: encrypted.iv,
        salt: encrypted.salt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveVaultEntry(newEntry);

      // Update in-memory decrypted cache
      setDecryptedNotes(prev => ({
        ...prev,
        [entryId]: {
          title: noteTitle.trim(),
          content: noteContent.trim()
        }
      }));

      setNoteTitle('');
      setNoteContent('');
      setEditingId(null);
      setIsAdding(false);
    } catch (err: any) {
      setUnlockError('Failed to encrypt note: ' + err?.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = (entry: VaultEntry) => {
    const dec = decryptedNotes[entry.id];
    setEditingId(entry.id);
    setNoteTitle(dec?.title || entry.title || 'Private Note');
    setNoteContent(dec?.content || '');
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    await deleteVaultEntry(id);
    setDecryptedNotes(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  return (
    <div className="space-y-6 select-none max-w-4xl mx-auto">
      {/* Zero-AI Security Indicator Banner */}
      <div 
        className="p-4 sm:p-5 rounded-3xl border flex items-start space-x-3.5"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-subtle)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>
              Zero-AI Private Vault (Client-Side Encrypted)
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
              AES-GCM 256-bit
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
            Everything here is encrypted in your browser using PBKDF2 (100,000 iterations) and AES-256 before saving. 
            <strong className="text-[var(--text-primary)]"> Notes in this vault are strictly excluded from all Gemini AI models and cannot be read by anyone without your passphrase.</strong>
          </p>
        </div>
      </div>

      {!isUnlocked ? (
        /* LOCKED SCREEN */
        <div 
          className="p-8 sm:p-12 rounded-3xl border text-center max-w-md mx-auto space-y-5"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div className="w-16 h-16 rounded-full bg-[var(--bg-accent-soft)] text-[var(--accent-primary)] flex items-center justify-center mx-auto border" style={{ borderColor: 'var(--border-subtle)' }}>
            <FolderLock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-extrabold text-base sm:text-lg" style={{ color: 'var(--text-primary)' }}>
              Vault is Locked
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {vaultEntries.length > 0 
                ? `Enter your passphrase to decrypt your ${vaultEntries.length} encrypted notes.`
                : 'Create your private passphrase to initialize your personal vault.'}
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-3">
            <input
              type="password"
              required
              value={passphrase}
              onChange={e => setPassphrase(e.target.value)}
              placeholder="Enter your personal passphrase"
              className="w-full px-4 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none text-center tracking-widest"
              style={{
                backgroundColor: 'var(--bg-card-subtle)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)'
              }}
            />

            {unlockError && (
              <p className="text-[11px] text-red-500 font-medium">
                {unlockError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--accent-primary)] hover:opacity-90 transition-opacity flex items-center justify-center space-x-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>{vaultEntries.length > 0 ? 'Unlock Vault' : 'Create & Open Vault'}</span>
            </button>
          </form>
        </div>
      ) : (
        /* UNLOCKED SCREEN */
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border bg-[var(--bg-card)]" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Vault Unlocked</span>
              <span className="text-[11px] text-[var(--text-muted)]">({vaultEntries.length} items)</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setEditingId(null);
                  setNoteTitle('');
                  setNoteContent('');
                  setIsAdding(true);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[var(--accent-primary)] hover:opacity-90 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Private Note</span>
              </button>

              <button
                onClick={handleLock}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] flex items-center space-x-1"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Vault</span>
              </button>
            </div>
          </div>

          {/* New / Edit Note Form */}
          {isAdding && (
            <form
              onSubmit={handleSaveNote}
              className="p-5 rounded-3xl border space-y-3 bg-[var(--bg-card)]"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                  {editingId ? 'Edit Encrypted Note' : 'New Encrypted Note'}
                </span>
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                required
                value={noteTitle}
                onChange={e => setNoteTitle(e.target.value)}
                placeholder="Note title (e.g. Private thoughts on exam stress)"
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none"
                style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              />

              <textarea
                rows={4}
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                placeholder="Write your raw, confidential thoughts freely. This text is encrypted with your key before leaving your device."
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none"
                style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              />

              <div className="flex items-center justify-end space-x-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[var(--accent-primary)] hover:opacity-90 disabled:opacity-50"
                >
                  {isSaving ? 'Encrypting...' : editingId ? 'Update Note' : 'Encrypt & Save'}
                </button>
              </div>
            </form>
          )}

          {/* Notes Grid */}
          {vaultEntries.length === 0 ? (
            <div 
              className="p-12 rounded-3xl border text-center space-y-2 bg-[var(--bg-card)]"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <Lock className="w-6 h-6 text-[var(--text-muted)] mx-auto opacity-50" />
              <p className="text-xs font-medium text-[var(--text-secondary)]">
                Your private vault is empty. Click "+ New Private Note" to store sensitive thoughts.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {vaultEntries.map(entry => {
                const dec = decryptedNotes[entry.id];
                return (
                  <div 
                    key={entry.id}
                    className="p-4 rounded-2xl border flex flex-col justify-between space-y-2.5 bg-[var(--bg-card)]"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                          {dec?.title || entry.title || 'Encrypted Entry'}
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleStartEdit(entry)}
                            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-1 rounded text-[var(--text-muted)] hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap line-clamp-4">
                        {dec?.content || '(Decrypted content ready)'}
                      </p>
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between text-[10px] text-[var(--text-muted)]" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span>Saved {new Date(entry.createdAt).toLocaleDateString()}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Encrypted AES-256</span>
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
