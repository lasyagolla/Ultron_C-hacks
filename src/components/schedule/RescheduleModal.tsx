import React, { useState } from 'react';
import { Calendar, Clock, Check, X, Edit2, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RescheduleSuggestion } from '../../types';

export const RescheduleModal: React.FC = () => {
  const { rescheduleSuggestion, acceptRescheduleSuggestion, rejectRescheduleSuggestion } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [customStartTime, setCustomStartTime] = useState('');
  const [customEndTime, setCustomEndTime] = useState('');

  if (!rescheduleSuggestion) return null;

  const handleStartEdit = () => {
    setCustomDate(rescheduleSuggestion.suggestedDate);
    setCustomStartTime(rescheduleSuggestion.suggestedStartTime);
    setCustomEndTime(rescheduleSuggestion.suggestedEndTime);
    setIsEditing(true);
  };

  const handleSaveCustom = () => {
    acceptRescheduleSuggestion({
      ...rescheduleSuggestion,
      suggestedDate: customDate || rescheduleSuggestion.suggestedDate,
      suggestedStartTime: customStartTime || rescheduleSuggestion.suggestedStartTime,
      suggestedEndTime: customEndTime || rescheduleSuggestion.suggestedEndTime,
      reason: 'Adjusted by student'
    });
    setIsEditing(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-md rounded-3xl p-6 border shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-primary)'
        }}
      >
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-xl bg-[var(--bg-accent-soft)] text-[var(--accent-primary)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm">Reschedule Incomplete Task</h3>
          </div>
          <button
            onClick={rejectRescheduleSuggestion}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-[var(--text-secondary)]">
            You marked <strong className="text-[var(--text-primary)]">"{rescheduleSuggestion.taskTitle}"</strong> as not completed. Bloom identified the next realistic gap in your schedule:
          </p>

          {!isEditing ? (
            <div 
              className="p-4 rounded-2xl border space-y-2.5 text-xs"
              style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--text-muted)]">Suggested Date:</span>
                <span className="font-bold text-[var(--text-primary)]">{rescheduleSuggestion.suggestedDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--text-muted)]">Available Window:</span>
                <span className="font-bold text-[var(--accent-primary)]">
                  {rescheduleSuggestion.suggestedStartTime} – {rescheduleSuggestion.suggestedEndTime}
                </span>
              </div>
              <div className="pt-1 text-[11px] text-[var(--text-muted)] border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                {rescheduleSuggestion.reason}
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-3.5 rounded-2xl border text-xs" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card-subtle)' }}>
              <div>
                <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Date</label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border bg-transparent"
                  style={{ borderColor: 'var(--border-strong)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-secondary)]">Start Time</label>
                  <input
                    type="time"
                    value={customStartTime}
                    onChange={(e) => setCustomStartTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border bg-transparent"
                    style={{ borderColor: 'var(--border-strong)' }}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-secondary)]">End Time</label>
                  <input
                    type="time"
                    value={customEndTime}
                    onChange={(e) => setCustomEndTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border bg-transparent"
                    style={{ borderColor: 'var(--border-strong)' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
          <button
            onClick={rejectRescheduleSuggestion}
            className="px-3 py-1.5 rounded-xl border font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            Don't Reschedule
          </button>

          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <>
                <button
                  onClick={handleStartEdit}
                  className="px-3 py-1.5 rounded-xl border font-semibold flex items-center space-x-1 hover:bg-[var(--bg-card-subtle)]"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Modify Slot</span>
                </button>
                <button
                  onClick={() => acceptRescheduleSuggestion(rescheduleSuggestion)}
                  className="px-4 py-1.5 rounded-xl font-semibold text-white flex items-center space-x-1"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept Slot</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleSaveCustom}
                className="px-4 py-1.5 rounded-xl font-semibold text-white flex items-center space-x-1"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Time</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
