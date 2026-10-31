import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  AlertTriangle, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Info,
  CalendarDays,
  Lock,
  Unlock,
  Layers
} from 'lucide-react';
import { WeeklyCommitment, DayOfWeek, CommitmentCategory } from '../../types';

interface WeeklyScheduleEditorProps {
  commitments: WeeklyCommitment[];
  onChange: (commitments: WeeklyCommitment[]) => void;
  userId?: string;
  isSettingsMode?: boolean;
}

const DAYS_OF_WEEK: { id: DayOfWeek; label: string; short: string }[] = [
  { id: 'monday', label: 'Monday', short: 'Mon' },
  { id: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { id: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { id: 'thursday', label: 'Thursday', short: 'Thu' },
  { id: 'friday', label: 'Friday', short: 'Fri' },
  { id: 'saturday', label: 'Saturday', short: 'Sat' },
  { id: 'sunday', label: 'Sunday', short: 'Sun' },
];

const CATEGORIES: { id: CommitmentCategory; label: string; color: string }[] = [
  { id: 'school', label: 'School', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' },
  { id: 'tuition', label: 'Tuition', color: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800' },
  { id: 'extracurricular', label: 'Extracurricular', color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' },
  { id: 'hobby', label: 'Hobby', color: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800' },
  { id: 'personal', label: 'Personal', color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800' },
  { id: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' },
];

export const WeeklyScheduleEditor: React.FC<WeeklyScheduleEditorProps> = ({
  commitments,
  onChange,
  userId = 'user_current',
  isSettingsMode = false,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [editingCommitment, setEditingCommitment] = useState<WeeklyCommitment | null>(null);
  const [copySourceDay, setCopySourceDay] = useState<DayOfWeek | null>(null);
  const [copyTargetDays, setCopyTargetDays] = useState<DayOfWeek[]>([]);
  const [showCopyModal, setShowCopyModal] = useState(false);

  // Form states for add/edit modal
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<CommitmentCategory>('school');
  const [formStartTime, setFormStartTime] = useState('08:00');
  const [formEndTime, setFormEndTime] = useState('15:00');
  const [formDays, setFormDays] = useState<DayOfWeek[]>(['monday']);
  const [formIsFixed, setFormIsFixed] = useState(true);
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Filter commitments for current selected day
  const dayCommitments = useMemo(() => {
    return commitments
      .filter((c) => c.days.includes(selectedDay))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [commitments, selectedDay]);

  // Conflict / overlap calculation for each day
  const dailyConflicts = useMemo(() => {
    const conflictsMap: Record<DayOfWeek, { commitmentA: WeeklyCommitment; commitmentB: WeeklyCommitment }[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };

    DAYS_OF_WEEK.forEach(({ id: day }) => {
      const dayItems = commitments.filter((c) => c.days.includes(day));
      for (let i = 0; i < dayItems.length; i++) {
        for (let j = i + 1; j < dayItems.length; j++) {
          const a = dayItems[i];
          const b = dayItems[j];
          // Check time overlap: (startA < endB) and (endA > startB)
          if (a.startTime < b.endTime && a.endTime > b.startTime) {
            conflictsMap[day].push({ commitmentA: a, commitmentB: b });
          }
        }
      }
    });

    return conflictsMap;
  }, [commitments]);

  // Helper to open Add modal
  const handleOpenAddModal = (presetDay?: DayOfWeek) => {
    setEditingCommitment(null);
    setFormTitle('');
    setFormCategory('school');
    setFormStartTime('08:00');
    setFormEndTime('15:00');
    setFormDays([presetDay || selectedDay]);
    setFormIsFixed(true);
    setFormNotes('');
    setFormError(null);
    setIsEditingModalOpen(true);
  };

  // Helper to open Edit modal
  const handleOpenEditModal = (commitment: WeeklyCommitment) => {
    setEditingCommitment(commitment);
    setFormTitle(commitment.title);
    setFormCategory(commitment.category);
    setFormStartTime(commitment.startTime);
    setFormEndTime(commitment.endTime);
    setFormDays([...commitment.days]);
    setFormIsFixed(commitment.isFixed);
    setFormNotes(commitment.notes || '');
    setFormError(null);
    setIsEditingModalOpen(true);
  };

  // Duplicate commitment
  const handleDuplicate = (c: WeeklyCommitment) => {
    const duplicated: WeeklyCommitment = {
      ...c,
      id: 'comm_' + Math.random().toString(36).substring(2, 9),
      title: `${c.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onChange([...commitments, duplicated]);
  };

  // Delete commitment
  const handleDelete = (id: string) => {
    onChange(commitments.filter((c) => c.id !== id));
  };

  // Save Add/Edit Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Please enter an activity name.');
      return;
    }
    if (formDays.length === 0) {
      setFormError('Please select at least one day.');
      return;
    }
    if (formStartTime >= formEndTime) {
      setFormError('End time must be after start time.');
      return;
    }

    if (editingCommitment) {
      // Update existing
      const updated: WeeklyCommitment = {
        ...editingCommitment,
        title: formTitle.trim(),
        category: formCategory,
        startTime: formStartTime,
        endTime: formEndTime,
        days: formDays,
        isFixed: formIsFixed,
        notes: formNotes.trim(),
        updatedAt: new Date().toISOString(),
      };
      onChange(commitments.map((c) => (c.id === editingCommitment.id ? updated : c)));
    } else {
      // Create new
      const newCommitment: WeeklyCommitment = {
        id: 'comm_' + Math.random().toString(36).substring(2, 9),
        userId,
        title: formTitle.trim(),
        category: formCategory,
        startTime: formStartTime,
        endTime: formEndTime,
        days: formDays,
        isFixed: formIsFixed,
        notes: formNotes.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onChange([...commitments, newCommitment]);
    }

    setIsEditingModalOpen(false);
  };

  // Copy schedule from one day to others
  const executeCopyDay = () => {
    if (!copySourceDay || copyTargetDays.length === 0) return;

    // Get commitments on source day
    const sourceItems = commitments.filter((c) => c.days.includes(copySourceDay));

    let updatedList = [...commitments];

    copyTargetDays.forEach((targetDay) => {
      // First remove existing commitments that solely belonged to targetDay, or remove targetDay from their days array
      updatedList = updatedList
        .map((c) => {
          if (c.days.includes(targetDay)) {
            const remainingDays = c.days.filter((d) => d !== targetDay);
            if (remainingDays.length === 0) return null;
            return { ...c, days: remainingDays };
          }
          return c;
        })
        .filter((c): c is WeeklyCommitment => c !== null);

      // Now replicate source items onto target day
      sourceItems.forEach((sourceItem) => {
        // If the sourceItem already exists, just add targetDay
        const existingIdx = updatedList.findIndex((item) => item.id === sourceItem.id);
        if (existingIdx >= 0) {
          if (!updatedList[existingIdx].days.includes(targetDay)) {
            updatedList[existingIdx] = {
              ...updatedList[existingIdx],
              days: [...updatedList[existingIdx].days, targetDay],
            };
          }
        } else {
          // Clone
          updatedList.push({
            ...sourceItem,
            id: 'comm_' + Math.random().toString(36).substring(2, 9),
            days: [targetDay],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      });
    });

    onChange(updatedList);
    setShowCopyModal(false);
    setCopyTargetDays([]);
  };

  // Clear day schedule (free day)
  const handleClearDay = (day: DayOfWeek) => {
    const updated = commitments
      .map((c) => {
        if (c.days.includes(day)) {
          const rem = c.days.filter((d) => d !== day);
          return rem.length > 0 ? { ...c, days: rem } : null;
        }
        return c;
      })
      .filter((c): c is WeeklyCommitment => c !== null);
    onChange(updated);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <div className="flex items-center space-x-2">
            <CalendarDays className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Seven-Day Recurring Schedule
            </h3>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Map recurring classes, tuition, and activities. Bloom protects your time around these anchors.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div 
            className="flex p-1 rounded-xl border"
            style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}
          >
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-neutral-800 shadow-sm text-[var(--accent-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Day Detail
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-neutral-800 shadow-sm text-[var(--accent-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Full Week
            </button>
          </div>

          {/* Add Commitment Button */}
          <button
            type="button"
            onClick={() => handleOpenAddModal()}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--bg-card)',
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Commitment</span>
          </button>
        </div>
      </div>

      {/* Seven Day Selection Tabs */}
      <div className="grid grid-cols-7 gap-1.5 p-1.5 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}>
        {DAYS_OF_WEEK.map((day) => {
          const count = commitments.filter((c) => c.days.includes(day.id)).length;
          const hasConflict = dailyConflicts[day.id].length > 0;
          const isSelected = selectedDay === day.id;

          return (
            <button
              key={day.id}
              type="button"
              onClick={() => setSelectedDay(day.id)}
              className={`relative flex flex-col items-center py-2 px-1 rounded-xl text-center transition-all ${
                isSelected
                  ? 'shadow-sm border'
                  : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              style={{
                backgroundColor: isSelected ? 'var(--bg-card)' : 'transparent',
                borderColor: isSelected ? 'var(--border-strong)' : 'transparent',
              }}
            >
              <span className={`text-xs font-semibold ${isSelected ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}>
                <span className="hidden sm:inline">{day.label}</span>
                <span className="sm:hidden">{day.short}</span>
              </span>
              <div className="flex items-center space-x-1 mt-1">
                <span 
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    count > 0 ? 'bg-[var(--bg-accent-soft)] text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {count} {count === 1 ? 'item' : 'items'}
                </span>
                {hasConflict && (
                  <span title="Overlapping schedule detected" className="text-amber-500">
                    <AlertTriangle className="w-3 h-3" />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Conflict Banner if overlap detected on selected day */}
      {dailyConflicts[selectedDay].length > 0 && (
        <div 
          className="flex items-start space-x-3 p-3.5 rounded-2xl border text-xs"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            borderColor: 'rgba(245, 158, 11, 0.3)',
            color: '#b45309',
          }}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
          <div className="space-y-1">
            <span className="font-bold">Schedule Overlap Alert ({selectedDay}):</span>
            <ul className="list-disc pl-4 space-y-0.5">
              {dailyConflicts[selectedDay].map((c, i) => (
                <li key={i}>
                  <strong>{c.commitmentA.title}</strong> ({c.commitmentA.startTime}–{c.commitmentA.endTime}) overlaps with <strong>{c.commitmentB.title}</strong> ({c.commitmentB.startTime}–{c.commitmentB.endTime}).
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Content: Day Detail vs Full Week */}
      {viewMode === 'day' ? (
        <div className="space-y-4">
          {/* Day Toolbar Actions */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>
              {selectedDay}'s Commitments ({dayCommitments.length})
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setCopySourceDay(selectedDay);
                  setCopyTargetDays([]);
                  setShowCopyModal(true);
                }}
                disabled={dayCommitments.length === 0}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all hover:bg-[var(--bg-card-subtle)] disabled:opacity-40"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
              >
                <Copy className="w-3 h-3" />
                <span>Copy Day to...</span>
              </button>

              <button
                type="button"
                onClick={() => handleClearDay(selectedDay)}
                disabled={dayCommitments.length === 0}
                className="px-2.5 py-1 rounded-lg border text-[11px] font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all disabled:opacity-40"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                Mark as Free Day
              </button>
            </div>
          </div>

          {/* List of Commitments */}
          {dayCommitments.length === 0 ? (
            <div 
              className="p-8 text-center rounded-2xl border border-dashed"
              style={{
                borderColor: 'var(--border-strong)',
                backgroundColor: 'var(--bg-card-subtle)',
              }}
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-accent-soft)' }}>
                <Clock className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                No fixed commitments on {selectedDay}
              </h4>
              <p className="text-xs max-w-sm mx-auto mt-1" style={{ color: 'var(--text-muted)' }}>
                This day is currently open for flexible study, rest, and personal projects.
              </p>
              <button
                type="button"
                onClick={() => handleOpenAddModal(selectedDay)}
                className="mt-4 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--bg-card)',
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add an Activity</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {dayCommitments.map((c) => {
                const categoryConfig = CATEGORIES.find((cat) => cat.id === c.category) || CATEGORIES[5];
                return (
                  <div
                    key={c.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border transition-all hover:shadow-sm"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-subtle)',
                    }}
                  >
                    <div className="flex items-start sm:items-center space-x-3">
                      {/* Fixed / Flexible badge */}
                      <div 
                        title={c.isFixed ? 'Fixed commitment (cannot be easily shifted)' : 'Flexible commitment'}
                        className={`p-2 rounded-xl flex-shrink-0 ${
                          c.isFixed ? 'bg-[var(--bg-accent-soft)] text-[var(--accent-primary)]' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}
                      >
                        {c.isFixed ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {c.title}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${categoryConfig.color}`}>
                            {categoryConfig.label}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-[var(--text-muted)]" />
                            <span>
                              {c.startTime} – {c.endTime}
                            </span>
                          </span>

                          <span className="text-[var(--text-muted)]">•</span>

                          <span className="text-[11px] text-[var(--text-muted)]">
                            Repeats: {c.days.map((d) => d.slice(0, 3)).join(', ')}
                          </span>
                        </div>

                        {c.notes && (
                          <p className="text-[11px] italic text-[var(--text-muted)] pt-0.5">
                            "{c.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 self-end sm:self-center mt-3 sm:mt-0">
                      <button
                        type="button"
                        onClick={() => handleDuplicate(c)}
                        title="Duplicate commitment"
                        className="p-1.5 rounded-lg hover:bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(c)}
                        title="Edit commitment"
                        className="p-1.5 rounded-lg hover:bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        title="Delete commitment"
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-[var(--text-muted)] hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Full Week Grid View */
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {DAYS_OF_WEEK.map((day) => {
            const items = commitments
              .filter((c) => c.days.includes(day.id))
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div
                key={day.id}
                className="p-3 rounded-2xl border space-y-2 flex flex-col min-h-[180px]"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center justify-between pb-1.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-xs font-bold capitalize" style={{ color: 'var(--text-primary)' }}>
                    {day.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenAddModal(day.id)}
                    title={`Add to ${day.label}`}
                    className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-card-subtle)]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 flex-1 overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="text-[11px] text-[var(--text-muted)] text-center py-6 italic">
                      Free day
                    </div>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleOpenEditModal(item)}
                        className="p-2 rounded-xl text-left border cursor-pointer hover:shadow-sm transition-all"
                        style={{
                          backgroundColor: 'var(--bg-card-subtle)',
                          borderColor: 'var(--border-subtle)',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs truncate max-w-[100px]" style={{ color: 'var(--text-primary)' }}>
                            {item.title}
                          </span>
                          {item.isFixed && <Lock className="w-2.5 h-2.5 text-[var(--text-muted)]" />}
                        </div>
                        <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                          {item.startTime}–{item.endTime}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Commitment Add/Edit Modal */}
      {isEditingModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <h4 className="font-bold text-base">
                {editingCommitment ? 'Edit Weekly Commitment' : 'Add Weekly Commitment'}
              </h4>
              <button
                type="button"
                onClick={() => setIsEditingModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Activity Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Mathematics Lecture, Piano Lesson, Debate Club"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  style={{ borderColor: 'var(--border-strong)' }}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormCategory(cat.id)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        formCategory === cat.id
                          ? 'ring-2 ring-[var(--accent-primary)] font-bold'
                          : 'opacity-70 hover:opacity-100'
                      } ${cat.color}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                    style={{ borderColor: 'var(--border-strong)' }}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                    style={{ borderColor: 'var(--border-strong)' }}
                  />
                </div>
              </div>

              {/* Repeating Weekdays */}
              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Repeating Days (Select all that apply)
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS_OF_WEEK.map((d) => {
                    const isChecked = formDays.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setFormDays(formDays.filter((x) => x !== d.id));
                          } else {
                            setFormDays([...formDays, d.id]);
                          }
                        }}
                        className={`py-2 rounded-xl text-center text-xs font-semibold border transition-all ${
                          isChecked
                            ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                            : 'hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]'
                        }`}
                        style={{ borderColor: isChecked ? 'var(--accent-primary)' : 'var(--border-subtle)' }}
                      >
                        {d.short}
                      </button>
                    );
                  })}
                </div>
                {/* Quick Presets */}
                <div className="flex space-x-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setFormDays(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'])}
                    className="text-[10px] underline text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    Weekdays (Mon-Fri)
                  </button>
                  <span className="text-[10px] text-[var(--text-muted)]">•</span>
                  <button
                    type="button"
                    onClick={() => setFormDays(['saturday', 'sunday'])}
                    className="text-[10px] underline text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    Weekends (Sat-Sun)
                  </button>
                  <span className="text-[10px] text-[var(--text-muted)]">•</span>
                  <button
                    type="button"
                    onClick={() => setFormDays(DAYS_OF_WEEK.map((d) => d.id))}
                    className="text-[10px] underline text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    Every Day
                  </button>
                </div>
              </div>

              {/* Fixed vs Flexible Toggle */}
              <div 
                className="p-3.5 rounded-2xl border flex items-start space-x-3 cursor-pointer"
                style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card-subtle)' }}
                onClick={() => setFormIsFixed(!formIsFixed)}
              >
                <input
                  type="checkbox"
                  id="formIsFixed"
                  checked={formIsFixed}
                  onChange={(e) => setFormIsFixed(e.target.checked)}
                  className="mt-0.5 rounded text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                />
                <div className="space-y-0.5">
                  <label htmlFor="formIsFixed" className="font-semibold cursor-pointer block" style={{ color: 'var(--text-primary)' }}>
                    Fixed Commitment (Unmovable)
                  </label>
                  <p className="text-[11px] leading-normal" style={{ color: 'var(--text-secondary)' }}>
                    {formIsFixed
                      ? 'Fixed commitments (like school or official lectures) cannot be shifted by Bloom.'
                      : 'Flexible commitments may be rescheduled with your confirmation when adjustments are needed.'}
                  </p>
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Optional Notes
                </label>
                <input
                  type="text"
                  placeholder="Room number, instructor, textbook link..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  style={{ borderColor: 'var(--border-strong)' }}
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setIsEditingModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-medium border hover:bg-[var(--bg-card-subtle)]"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-semibold text-white shadow-sm transition-all"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  {editingCommitment ? 'Save Changes' : 'Add Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Copy Schedule Modal */}
      {showCopyModal && copySourceDay && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <h4 className="font-bold text-sm">
                Copy {copySourceDay.toUpperCase()} Schedule
              </h4>
              <button
                type="button"
                onClick={() => setShowCopyModal(false)}
                className="text-[var(--text-muted)]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Select the days you want to duplicate {copySourceDay}'s activities to:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DAYS_OF_WEEK.filter((d) => d.id !== copySourceDay).map((d) => {
                const isSelected = copyTargetDays.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setCopyTargetDays(copyTargetDays.filter((x) => x !== d.id));
                      } else {
                        setCopyTargetDays([...copyTargetDays, d.id]);
                      }
                    }}
                    className={`p-2.5 rounded-xl text-center text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                        : 'hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]'
                    }`}
                    style={{ borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)' }}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => setShowCopyModal(false)}
                className="px-3.5 py-1.5 rounded-xl font-medium text-xs border"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={copyTargetDays.length === 0}
                onClick={executeCopyDay}
                className="px-4 py-1.5 rounded-xl font-semibold text-xs text-white disabled:opacity-40"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                Copy to {copyTargetDays.length} {copyTargetDays.length === 1 ? 'Day' : 'Days'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
