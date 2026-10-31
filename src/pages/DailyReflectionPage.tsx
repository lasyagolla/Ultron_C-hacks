import React, { useState, useMemo } from 'react';
import { 
  Sun, 
  Moon, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Settings2, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DailyReflectionQuestion, ReflectionAnswer } from '../types';

export const DailyReflectionPage: React.FC = () => {
  const { 
    dailyReflections, 
    reflectionQuestions, 
    saveMorningReflection, 
    saveNightReflection, 
    updateQuestions,
    tasks, 
    updateTaskStatus,
    goals 
  } = useAuth();

  const [activeMode, setActiveMode] = useState<'morning' | 'night' | 'history'>('morning');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isQuestionEditorOpen, setIsQuestionEditorOpen] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Form answer states keyed by questionId
  const [morningAnswers, setMorningAnswers] = useState<Record<string, string>>({});
  const [nightAnswers, setNightAnswers] = useState<Record<string, string>>({});
  const [nightMood, setNightMood] = useState<number>(4);

  // Separate morning and night questions
  const morningQuestions = useMemo(() => {
    return reflectionQuestions
      .filter((q) => q.type === 'morning')
      .sort((a, b) => a.order - b.order);
  }, [reflectionQuestions]);

  const nightQuestions = useMemo(() => {
    return reflectionQuestions
      .filter((q) => q.type === 'night')
      .sort((a, b) => a.order - b.order);
  }, [reflectionQuestions]);

  // Existing reflection for selectedDate
  const currentReflection = useMemo(() => {
    return dailyReflections.find((r) => r.date === selectedDate);
  }, [dailyReflections, selectedDate]);

  // Initialize form when date or reflection changes
  React.useEffect(() => {
    if (currentReflection) {
      if (currentReflection.morningAnswers) {
        const mObj: Record<string, string> = {};
        currentReflection.morningAnswers.forEach((a) => {
          mObj[a.questionId] = a.answerText;
        });
        setMorningAnswers(mObj);
      } else {
        setMorningAnswers({});
      }

      if (currentReflection.nightAnswers) {
        const nObj: Record<string, string> = {};
        currentReflection.nightAnswers.forEach((a) => {
          nObj[a.questionId] = a.answerText;
        });
        setNightAnswers(nObj);
      } else {
        setNightAnswers({});
      }

      if (currentReflection.nightMood) {
        setNightMood(currentReflection.nightMood);
      }
    } else {
      setMorningAnswers({});
      setNightAnswers({});
    }
  }, [currentReflection, selectedDate]);

  // Save Morning Reflection
  const handleSaveMorning = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatted: ReflectionAnswer[] = morningQuestions.map((q) => ({
      questionId: q.id,
      questionText: q.questionText,
      answerText: morningAnswers[q.id] || '',
    }));

    await saveMorningReflection(selectedDate, formatted);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  // Save Night Reflection
  const handleSaveNight = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatted: ReflectionAnswer[] = nightQuestions.map((q) => ({
      questionId: q.id,
      questionText: q.questionText,
      answerText: nightAnswers[q.id] || '',
    }));

    await saveNightReflection(selectedDate, formatted, nightMood);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  // Tasks for selected date to review during Night Reflection
  const selectedDateTasks = useMemo(() => {
    return tasks.filter((t) => t.scheduledDate === selectedDate);
  }, [tasks, selectedDate]);

  // Question editing state
  const [editingQuestionsList, setEditingQuestionsList] = useState<DailyReflectionQuestion[]>([]);
  const [newQuestionType, setNewQuestionType] = useState<'morning' | 'night'>('morning');
  const [newQuestionText, setNewQuestionText] = useState('');

  const openQuestionEditor = () => {
    setEditingQuestionsList([...reflectionQuestions]);
    setIsQuestionEditorOpen(true);
  };

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    const newQ: DailyReflectionQuestion = {
      id: 'q_' + Math.random().toString(36).substring(2, 9),
      type: newQuestionType,
      questionText: newQuestionText.trim(),
      order: editingQuestionsList.length,
    };
    setEditingQuestionsList([...editingQuestionsList, newQ]);
    setNewQuestionText('');
  };

  const handleDeleteQuestion = (id: string) => {
    setEditingQuestionsList(editingQuestionsList.filter((q) => q.id !== id));
  };

  const handleSaveQuestions = async () => {
    await updateQuestions(editingQuestionsList);
    setIsQuestionEditorOpen(false);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Daily Reflection
            </h1>
            <span 
              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
              style={{
                backgroundColor: 'var(--bg-accent-soft)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--accent-primary)',
              }}
            >
              Intentions &amp; Rest
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Mindful daily bookends. Start with intention, close with honest reflection and frictionless adjustments.
          </p>
        </div>

        {/* Date Selector & Question Customizer Button */}
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-2xl border text-xs bg-transparent"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
          />

          <button
            onClick={openQuestionEditor}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl border text-xs font-semibold hover:bg-[var(--bg-card-subtle)]"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Edit Questions</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setActiveMode('morning')}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl border transition-all text-xs font-bold ${
            activeMode === 'morning'
              ? 'bg-[var(--bg-accent-soft)] border-[var(--accent-primary)] text-[var(--accent-primary)] shadow-sm'
              : 'hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
          }`}
        >
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Morning Reflection</span>
        </button>

        <button
          onClick={() => setActiveMode('night')}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl border transition-all text-xs font-bold ${
            activeMode === 'night'
              ? 'bg-[var(--bg-accent-soft)] border-[var(--accent-primary)] text-[var(--accent-primary)] shadow-sm'
              : 'hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
          }`}
        >
          <Moon className="w-4 h-4 text-indigo-400" />
          <span>Night Reflection</span>
        </button>

        <button
          onClick={() => setActiveMode('history')}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl border transition-all text-xs font-bold ${
            activeMode === 'history'
              ? 'bg-[var(--bg-accent-soft)] border-[var(--accent-primary)] text-[var(--accent-primary)] shadow-sm'
              : 'hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
          }`}
        >
          <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
          <span>Reflection History ({dailyReflections.length})</span>
        </button>
      </div>

      {/* Feedback banner */}
      {savedNotice && (
        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 text-xs border border-emerald-300 flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>Reflection saved automatically for {selectedDate}.</span>
        </div>
      )}

      {/* 1. MORNING REFLECTION VIEW */}
      {activeMode === 'morning' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Questions Form (2 spans) */}
          <div 
            className="lg:col-span-2 rounded-3xl p-6 sm:p-8 border space-y-6"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Morning Grounding &amp; Intentions
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Take two quiet minutes to clarify what matters today.
                </p>
              </div>
              <Sun className="w-6 h-6 text-amber-500 opacity-80" />
            </div>

            <form onSubmit={handleSaveMorning} className="space-y-6">
              {morningQuestions.map((q, idx) => (
                <div key={q.id} className="space-y-2">
                  <label className="block text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    {idx + 1}. {q.questionText}
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Type your authentic thoughts..."
                    value={morningAnswers[q.id] || ''}
                    onChange={(e) => setMorningAnswers({ ...morningAnswers, [q.id]: e.target.value })}
                    className="w-full p-4 rounded-2xl border text-xs leading-relaxed bg-[var(--bg-card-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] resize-none"
                    style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
                  />
                </div>
              ))}

              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-[11px] text-[var(--text-muted)] italic">
                  Note: Morning intentions do not alter your calendar without explicit approval.
                </span>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl text-xs font-bold text-white shadow-sm transition-all"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  Save Morning Reflection
                </button>
              </div>
            </form>
          </div>

          {/* Reference: Today's Scheduled Goals */}
          <div 
            className="p-5 rounded-3xl border space-y-4"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <h3 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                Scheduled Goals for Reference
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Active anchors linked to your Goal Tracker.
              </p>
            </div>

            {goals.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] py-4 text-center italic">
                No active goals currently defined.
              </p>
            ) : (
              <div className="space-y-2.5">
                {goals.map((g) => (
                  <div key={g.id} className="p-3 rounded-2xl border text-xs" style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}>
                    <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{g.title}</div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-1">{g.category} • {g.estimatedEffort || 'Self-paced'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. NIGHT REFLECTION VIEW */}
      {activeMode === 'night' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Night Questions (2 spans) */}
          <div 
            className="lg:col-span-2 rounded-3xl p-6 sm:p-8 border space-y-6"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Evening Reflection &amp; Friction Discovery
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Reflect on what protected you today and unpack where friction emerged.
                </p>
              </div>
              <Moon className="w-6 h-6 text-indigo-400 opacity-80" />
            </div>

            {/* Evening Mood Rating */}
            <div className="space-y-2 p-3.5 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text-secondary)]">How does your energy feel right now?</span>
                <span className="font-bold text-[var(--accent-primary)]">
                  {nightMood === 1 ? 'Depleted' : nightMood === 2 ? 'Tired' : nightMood === 3 ? 'Steady' : nightMood === 4 ? 'Good' : 'Flourishing'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={nightMood}
                onChange={(e) => setNightMood(Number(e.target.value))}
                className="w-full accent-[var(--accent-primary)] cursor-pointer"
              />
            </div>

            <form onSubmit={handleSaveNight} className="space-y-6">
              {nightQuestions.map((q, idx) => (
                <div key={q.id} className="space-y-2">
                  <label className="block text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    {idx + 1}. {q.questionText}
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Reflect honestly. What worked? What caused resistance?"
                    value={nightAnswers[q.id] || ''}
                    onChange={(e) => setNightAnswers({ ...nightAnswers, [q.id]: e.target.value })}
                    className="w-full p-4 rounded-2xl border text-xs leading-relaxed bg-[var(--bg-card-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] resize-none"
                    style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
                  />
                </div>
              ))}

              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-[11px] text-[var(--text-muted)] italic">
                  Evening reflections feed directly into your Analyzer insights.
                </span>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl text-xs font-bold text-white shadow-sm transition-all"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  Save Night Reflection
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Review Daily Tasks & Trigger Rescheduling */}
          <div 
            className="p-5 rounded-3xl border space-y-4"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <h3 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                Today's Task Review ({selectedDateTasks.length})
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Marking tasks incomplete triggers automatic gap-finding.
              </p>
            </div>

            {selectedDateTasks.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] py-4 text-center italic">
                No tasks scheduled for {selectedDate}.
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDateTasks.map((t) => (
                  <div key={t.id} className="p-3 rounded-2xl border space-y-2 text-xs" style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}>
                    <div className="font-bold text-[var(--text-primary)]">{t.title}</div>
                    
                    {/* Status selection buttons */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => updateTaskStatus(t.id, 'completed')}
                        className={`py-1 px-2 rounded-lg text-[10px] font-semibold transition-all ${
                          t.status === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : 'border text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
                        }`}
                        style={{ borderColor: 'var(--border-subtle)' }}
                      >
                        ✓ Completed
                      </button>

                      <button
                        onClick={() => updateTaskStatus(t.id, 'partial')}
                        className={`py-1 px-2 rounded-lg text-[10px] font-semibold transition-all ${
                          t.status === 'partial'
                            ? 'bg-amber-600 text-white'
                            : 'border text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
                        }`}
                        style={{ borderColor: 'var(--border-subtle)' }}
                      >
                        ~ Partial
                      </button>

                      <button
                        onClick={() => updateTaskStatus(t.id, 'postponed', 'Postponed during evening reflection')}
                        className={`py-1 px-2 rounded-lg text-[10px] font-semibold transition-all ${
                          t.status === 'postponed'
                            ? 'bg-indigo-600 text-white'
                            : 'border text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
                        }`}
                        style={{ borderColor: 'var(--border-subtle)' }}
                      >
                        ⏱ Postpone
                      </button>

                      <button
                        onClick={() => updateTaskStatus(t.id, 'not_completed', 'Marked incomplete during evening review')}
                        className={`py-1 px-2 rounded-lg text-[10px] font-semibold transition-all ${
                          t.status === 'not_completed'
                            ? 'bg-rose-600 text-white'
                            : 'border text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
                        }`}
                        style={{ borderColor: 'var(--border-subtle)' }}
                      >
                        ✕ Reschedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. HISTORICAL REFLECTION LOGS */}
      {activeMode === 'history' && (
        <div 
          className="rounded-3xl p-6 sm:p-8 border space-y-5"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              Chronological Reflection History ({dailyReflections.length} Entries)
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Historical responses preserve their original questions as answered.
            </p>
          </div>

          {dailyReflections.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] text-center py-10 italic">
              No historical reflections recorded yet. Complete today's Morning or Night reflection to begin your archive.
            </p>
          ) : (
            <div className="space-y-4">
              {dailyReflections.map((refl) => (
                <div 
                  key={refl.id}
                  className="p-5 rounded-2xl border space-y-4"
                  style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}
                >
                  <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                    <span className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>
                      Date: {refl.date}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedDate(refl.date);
                        setActiveMode('morning');
                      }}
                      className="text-xs font-semibold text-[var(--accent-primary)] hover:underline"
                    >
                      Revisit / Edit
                    </button>
                  </div>

                  {/* Morning answers */}
                  {refl.morningAnswers && refl.morningAnswers.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 flex items-center space-x-1">
                        <Sun className="w-3.5 h-3.5" />
                        <span>Morning Intentions</span>
                      </span>
                      {refl.morningAnswers.map((ans, idx) => (
                        <div key={idx} className="text-xs pl-2 border-l-2 border-amber-300">
                          <div className="font-semibold text-[var(--text-muted)]">{ans.questionText}</div>
                          <div className="text-[var(--text-primary)] mt-0.5">{ans.answerText || '(No response recorded)'}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Night answers */}
                  {refl.nightAnswers && refl.nightAnswers.length > 0 && (
                    <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 flex items-center space-x-1">
                        <Moon className="w-3.5 h-3.5" />
                        <span>Evening Review</span>
                      </span>
                      {refl.nightAnswers.map((ans, idx) => (
                        <div key={idx} className="text-xs pl-2 border-l-2 border-indigo-300">
                          <div className="font-semibold text-[var(--text-muted)]">{ans.questionText}</div>
                          <div className="text-[var(--text-primary)] mt-0.5">{ans.answerText || '(No response recorded)'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EDIT QUESTIONS MODAL */}
      {isQuestionEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div 
            className="w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <h4 className="font-bold text-sm">Customize Reflection Questions</h4>
                <p className="text-[11px] text-[var(--text-muted)]">Changes will apply to future reflections without altering past answers.</p>
              </div>
              <button onClick={() => setIsQuestionEditorOpen(false)} className="text-[var(--text-muted)]">✕</button>
            </div>

            {/* List of current questions */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-[var(--text-primary)]">Morning Questions</span>
              <div className="space-y-1.5">
                {editingQuestionsList.filter(q => q.type === 'morning').map(q => (
                  <div key={q.id} className="flex items-center justify-between p-2.5 rounded-xl border text-xs" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card-subtle)' }}>
                    <span>{q.questionText}</span>
                    <button onClick={() => handleDeleteQuestion(q.id)} className="text-[var(--text-muted)] hover:text-rose-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <span className="text-xs font-bold text-[var(--text-primary)] pt-2 block">Night Questions</span>
              <div className="space-y-1.5">
                {editingQuestionsList.filter(q => q.type === 'night').map(q => (
                  <div key={q.id} className="flex items-center justify-between p-2.5 rounded-xl border text-xs" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card-subtle)' }}>
                    <span>{q.questionText}</span>
                    <button onClick={() => handleDeleteQuestion(q.id)} className="text-[var(--text-muted)] hover:text-rose-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add new question form */}
            <div className="pt-3 border-t space-y-2 text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="font-bold text-[var(--text-primary)]">Add New Question</span>
              <div className="flex space-x-2">
                <select
                  value={newQuestionType}
                  onChange={(e) => setNewQuestionType(e.target.value as any)}
                  className="px-2 py-1.5 rounded-xl border bg-transparent"
                  style={{ borderColor: 'var(--border-strong)' }}
                >
                  <option value="morning">Morning</option>
                  <option value="night">Night</option>
                </select>
                <input
                  type="text"
                  placeholder="e.g. What energized me today?"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl border bg-transparent"
                  style={{ borderColor: 'var(--border-strong)' }}
                />
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-3 py-1.5 rounded-xl font-semibold text-white"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <button onClick={() => setIsQuestionEditorOpen(false)} className="px-3 py-1.5 rounded-xl border text-xs">Cancel</button>
              <button onClick={handleSaveQuestions} className="px-4 py-1.5 rounded-xl font-semibold text-xs text-white" style={{ backgroundColor: 'var(--accent-primary)' }}>
                Save Custom Questions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
