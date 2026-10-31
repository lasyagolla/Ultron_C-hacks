import React, { useMemo, useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  Plus, 
  ChevronRight, 
  Sun, 
  Moon, 
  Target, 
  Brain, 
  ShieldCheck, 
  TreePine, 
  RotateCcw,
  BookOpen,
  HelpCircle,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GrowthSymbol } from '../components/common/GrowthSymbol';
import { DailyGrowthTree } from '../components/progress/DailyGrowthTree';
import { TaskStatus, DailyTask } from '../types';

export const HomePage: React.FC = () => {
  const { 
    profile, 
    tasks, 
    updateTaskStatus, 
    calendarEvents, 
    commitments, 
    goals, 
    focusMode, 
    setFocusMode,
    setActivePage,
    analyzerInsights,
    reflections
  } = useAuth();

  const [introDismissed, setIntroDismissed] = useState(false);

  // Today formatted
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const formattedToday = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  // Today's tasks
  const todayTasks = useMemo(() => {
    return tasks.filter(t => t.scheduledDate === todayStr || !t.scheduledDate);
  }, [tasks, todayStr]);

  // Active Goals (excluding completed and archived goals)
  const activeGoals = useMemo(() => {
    return goals.filter(g => !g.archived && g.status !== 'completed');
  }, [goals]);

  // Today's calendar events
  const todayEvents = useMemo(() => {
    return calendarEvents
      .filter(e => e.date === todayStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [calendarEvents, todayStr]);

  // Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const name = profile?.displayName || 'Friend';
    if (hour < 12) return `Good morning, ${name}.`;
    if (hour < 17) return `Good afternoon, ${name}.`;
    return `Good evening, ${name}.`;
  }, [profile?.displayName]);

  // Latest Analyzer Insight
  const latestInsight = useMemo(() => {
    return analyzerInsights && analyzerInsights.length > 0 ? analyzerInsights[0] : null;
  }, [analyzerInsights]);

  // Today's reflection status
  const todayReflection = useMemo(() => {
    return reflections.find((r: any) => r.date === todayStr);
  }, [reflections, todayStr]);

  const handleStatusChange = async (task: DailyTask, status: TaskStatus) => {
    await updateTaskStatus(task.id, status);
  };

  return (
    <div className="space-y-8 select-none max-w-6xl mx-auto">
      {/* 1. Header & Minimal Identity */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center space-x-3.5">
          <GrowthSymbol size="md" className="flex-shrink-0" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Bloom
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border text-[var(--accent-primary)] bg-[var(--bg-accent-soft)]" style={{ borderColor: 'var(--border-subtle)' }}>
                Personal Growth System
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {greeting}
            </h1>
          </div>
        </div>

        {/* Date and Focus Mode Indicator */}
        <div className="flex items-center space-x-3">
          {focusMode.enabled && (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Focus Mode: {focusMode.targetGoalOrExam || 'Active'}</span>
            </div>
          )}
          <div className="text-xs font-medium px-3 py-1.5 rounded-xl border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-secondary)' }}>
            {formattedToday}
          </div>
        </div>
      </header>

      {/* 2. Focus / Exam Mode Banner (if active) */}
      {focusMode.enabled && (
        <section className="p-4 rounded-2xl border flex items-center justify-between bg-amber-500/5 border-amber-500/20 text-xs">
          <div className="flex items-center space-x-3">
            <Target className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-amber-900 dark:text-amber-200">
                Focus Mode Active ({focusMode.targetGoalOrExam || 'Exam Period'})
              </span>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                Non-essential notifications are paused. Academic tasks and high-priority study blocks are elevated.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFocusMode({ ...focusMode, enabled: false })}
            className="px-3 py-1 rounded-xl text-xs font-semibold border border-amber-500/30 text-amber-800 dark:text-amber-200 hover:bg-amber-500/10"
          >
            Turn Off
          </button>
        </section>
      )}

      {/* 3. App Introduction Card: Understand, Recognise, Adapt */}
      {!introDismissed && (
        <section 
          className="relative rounded-3xl p-6 border transition-all"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <button
            onClick={() => setIntroDismissed(true)}
            className="absolute top-4 right-4 p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            title="Dismiss explanation"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="max-w-2xl">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-secondary)] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Core System Architecture</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              A personalized AI powered assistant that helps you grow.
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
              Bloom is built on three core pillars designed to align with your natural rhythm and protect your well-being.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5">
            {/* Understand */}
            <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center space-x-2 mb-1.5 font-bold text-xs" style={{ color: 'var(--accent-primary)' }}>
                <span className="w-5 h-5 rounded-lg flex items-center justify-center bg-[var(--bg-accent-soft)] text-[10px]">1</span>
                <span>Understand</span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Learns about your interests, goals, schedule, and experiences without rigid judgment or guilt.
              </p>
            </div>

            {/* Recognise */}
            <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center space-x-2 mb-1.5 font-bold text-xs" style={{ color: 'var(--accent-primary)' }}>
                <span className="w-5 h-5 rounded-lg flex items-center justify-center bg-[var(--bg-accent-soft)] text-[10px]">2</span>
                <span>Recognise</span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Identifies friction, recurring obstacles, and energy patterns across your reflections and tasks.
              </p>
            </div>

            {/* Adapt */}
            <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center space-x-2 mb-1.5 font-bold text-xs" style={{ color: 'var(--accent-primary)' }}>
                <span className="w-5 h-5 rounded-lg flex items-center justify-center bg-[var(--bg-accent-soft)] text-[10px]">3</span>
                <span>Adapt</span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Personalises plans, suggests realistic rescheduling, and preserves protected rest periods.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 4. Three Main Organized Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PILLAR 1: TODAY'S PLAN (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <section 
            className="p-6 rounded-3xl border space-y-5"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[var(--accent-primary)]" />
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Today's Plan
                </h3>
                <span className="text-xs text-[var(--text-muted)]">
                  ({todayTasks.length} tasks • {todayEvents.length} events)
                </span>
              </div>
              <button
                onClick={() => setActivePage('goals')}
                className="text-xs font-semibold text-[var(--accent-primary)] hover:underline flex items-center space-x-1"
              >
                <span>Full Calendar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Today's Schedule Overview */}
            {todayEvents.length > 0 ? (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-secondary)]">
                  Scheduled Timeline Blocks
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {todayEvents.map(e => (
                    <div 
                      key={e.id}
                      className="p-2.5 rounded-xl border flex items-center justify-between text-xs"
                      style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--accent-primary)' }} />
                        <span className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{e.title}</span>
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)] flex-shrink-0 ml-2">
                        {e.startTime} - {e.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-dashed text-xs text-[var(--text-secondary)]" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card-subtle)' }}>
                No fixed commitments mapped for today. Time is flexible.
              </div>
            )}

            {/* Daily Tasks Checklist */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-secondary)]">
                  Daily Tasks Checklist
                </span>
                <button
                  onClick={() => setActivePage('goals')}
                  className="text-xs text-[var(--accent-primary)] hover:underline flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>

              {todayTasks.length === 0 ? (
                <div className="text-center py-6 text-xs text-[var(--text-muted)]">
                  No tasks scheduled for today. Create one in Goal Tracker to nurture your Growth Tree.
                </div>
              ) : (
                <div className="space-y-2">
                  {todayTasks.map((t) => {
                    const isDone = t.status === 'completed';
                    return (
                      <div
                        key={t.id}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isDone ? 'opacity-60 bg-[var(--bg-card-subtle)]' : 'hover:shadow-sm'
                        }`}
                        style={{
                          backgroundColor: 'var(--bg-card-subtle)',
                          borderColor: 'var(--border-subtle)'
                        }}
                      >
                        <div className="flex items-start space-x-3 min-w-0">
                          <button
                            onClick={() => handleStatusChange(t, isDone ? 'not_started' : 'completed')}
                            className="mt-0.5"
                            title={isDone ? 'Mark Incomplete' : 'Mark Completed'}
                          >
                            <CheckCircle2 className={`w-5 h-5 transition-colors ${
                              isDone ? 'text-emerald-600 fill-emerald-100 dark:fill-emerald-950' : 'text-[var(--text-muted)] hover:text-emerald-500'
                            }`} />
                          </button>
                          <div className="min-w-0">
                            <span className={`text-xs font-semibold block truncate ${
                              isDone ? 'line-through text-[var(--text-muted)]' : ''
                            }`} style={{ color: isDone ? undefined : 'var(--text-primary)' }}>
                              {t.title}
                            </span>
                            <div className="flex items-center space-x-2 text-[10px] text-[var(--text-muted)] mt-0.5">
                              <span>{t.estimatedDurationMinutes} mins</span>
                              <span>•</span>
                              <span className="capitalize">{t.priority} priority</span>
                              {t.scheduledTime && (
                                <>
                                  <span>•</span>
                                  <span>{t.scheduledTime}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Selectors */}
                        <div className="flex items-center space-x-1.5 self-end sm:self-center">
                          {(['completed', 'partial', 'not_completed'] as TaskStatus[]).map((st) => (
                            <button
                              key={st}
                              onClick={() => handleStatusChange(t, st)}
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold border transition-all ${
                                t.status === st
                                  ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                                  : 'hover:bg-[var(--bg-card)] text-[var(--text-secondary)]'
                              }`}
                              style={{ borderColor: t.status === st ? 'var(--accent-primary)' : 'var(--border-subtle)' }}
                            >
                              {st === 'not_completed' ? 'Not Completed' : st.charAt(0).toUpperCase() + st.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* PILLARS 2 & 3: PERSONAL PROGRESS & INSIGHTS (1 Col) */}
        <div className="space-y-6">
          
          {/* PILLAR 2: PERSONAL PROGRESS */}
          <section 
            className="p-5 rounded-3xl border space-y-4"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center space-x-2">
                <TreePine className="w-4 h-4 text-[var(--accent-primary)]" />
                <h3 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  Personal Progress
                </h3>
              </div>
              <button
                onClick={() => setActivePage('progress')}
                className="text-[11px] text-[var(--accent-primary)] hover:underline flex items-center space-x-0.5"
              >
                <span>Your Forest</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Compact Daily Growth Tree */}
            <DailyGrowthTree isCompact={true} />

            {/* Active Goals Snapshot */}
            <div className="pt-2 border-t space-y-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  Active Goals ({activeGoals.length})
                </span>
                <button onClick={() => setActivePage('goals')} className="text-[10px] text-[var(--accent-primary)] hover:underline">
                  Manage
                </button>
              </div>

              {activeGoals.length === 0 ? (
                <div className="text-[11px] text-[var(--text-muted)] text-center py-2">
                  No active goals set yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {activeGoals.slice(0, 2).map(g => (
                    <div key={g.id} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium truncate max-w-[160px]" style={{ color: 'var(--text-primary)' }}>
                          {g.title}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">{g.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden bg-[var(--border-subtle)]">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${g.progress}%`, backgroundColor: 'var(--accent-primary)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* PILLAR 3: PERSONAL INSIGHTS */}
          <section 
            className="p-5 rounded-3xl border space-y-4"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-[var(--accent-primary)]" />
                <h3 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  Personal Insights
                </h3>
              </div>
              <button
                onClick={() => setActivePage('analyzer')}
                className="text-[11px] text-[var(--accent-primary)] hover:underline flex items-center space-x-0.5"
              >
                <span>Analyzer</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Latest Pattern / Observation Card */}
            {latestInsight ? (
              <div className="p-3.5 rounded-2xl border space-y-2 text-xs" style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}>
                <div className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>
                  {latestInsight.observation}
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">
                  {latestInsight.recommendedAction}
                </p>
                <button
                  onClick={() => setActivePage('analyzer')}
                  className="text-[10px] font-bold text-[var(--accent-primary)] hover:underline inline-flex items-center space-x-1"
                >
                  <span>Read full analysis</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl border text-xs text-[var(--text-secondary)]" style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}>
                Bloom is analyzing your weekly rhythm and reflections.
              </div>
            )}

            {/* Quick Daily Reflection Links */}
            <div className="pt-2 border-t space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                Reflections
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActivePage('reflection')}
                  className="p-2.5 rounded-xl border text-left transition-all hover:bg-[var(--bg-card-subtle)]"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <Sun className="w-3.5 h-3.5" />
                    <span>Morning</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block">
                    {todayReflection?.morningSubmittedAt ? 'Completed' : 'Set intention'}
                  </span>
                </button>

                <button
                  onClick={() => setActivePage('reflection')}
                  className="p-2.5 rounded-xl border text-left transition-all hover:bg-[var(--bg-card-subtle)]"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <Moon className="w-3.5 h-3.5" />
                    <span>Night</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block">
                    {todayReflection?.nightSubmittedAt ? 'Completed' : 'Review day'}
                  </span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
