import React, { useState } from 'react';
import { 
  TreePine, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Award, 
  ArrowRight, 
  Layers, 
  Heart,
  ChevronRight,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DailyGrowthTree } from '../components/progress/DailyGrowthTree';

export const ProgressPage: React.FC = () => {
  const { 
    tasks, 
    forestRecords, 
    checkAndRecordDailyTree, 
    setActivePage,
    goals 
  } = useAuth();

  const [savedSuccessMsg, setSavedSuccessMsg] = useState(false);

  // Today's tasks statistics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.scheduledDate === todayStr || (!t.scheduledDate && t.status === 'completed'));
  const completedToday = todayTasks.filter(t => t.status === 'completed').length;
  const totalToday = todayTasks.length;
  const completionPercentage = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  const handleManualSaveTree = async () => {
    await checkAndRecordDailyTree();
    setSavedSuccessMsg(true);
    setTimeout(() => setSavedSuccessMsg(false), 3000);
  };

  return (
    <div className="space-y-8 select-none">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-secondary)]">
              Personal Progress &amp; Growth
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1" style={{ color: 'var(--text-primary)' }}>
            Growth Tree &amp; Your Forest
          </h1>
          <p className="text-xs sm:text-sm mt-1 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            Every step forward nurtures your tree. Completed days join Your Forest as permanent reminders of your resilience, with zero guilt or streak penalties.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActivePage('goals')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)'
            }}
          >
            <span>Goal Tracker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Today's Living Growth Tree Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tree Interactive Visualizer (2 Cols) */}
        <div className="lg:col-span-2">
          <DailyGrowthTree isCompact={false} />
        </div>

        {/* Tree Status & Guilt-Free Philosophy (1 Col) */}
        <div className="space-y-6">
          {/* Day Status Card */}
          <div 
            className="p-6 rounded-3xl border space-y-4"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-secondary)]">
                Today's Growth Metric
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-accent-soft)', color: 'var(--accent-primary)' }}>
                {completionPercentage}% complete
              </span>
            </div>

            <div>
              <div className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                {completedToday} of {totalToday}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Tasks completed today
              </p>
            </div>

            {/* Quick manual archive button */}
            <div className="pt-2 border-t space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
              {savedSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 text-xs border border-emerald-200 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Tree planted into Your Forest!</span>
                </div>
              )}

              <button
                onClick={handleManualSaveTree}
                disabled={completedToday === 0}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2 text-white disabled:opacity-40"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                <TreePine className="w-4 h-4" />
                <span>Save Today to Your Forest</span>
              </button>
              <p className="text-[11px] text-[var(--text-muted)] text-center">
                Trees are also automatically harvested and planted at midnight.
              </p>
            </div>
          </div>

          {/* Zero Guilt Principle Card */}
          <div 
            className="p-5 rounded-3xl border space-y-3"
            style={{
              backgroundColor: 'var(--bg-card-subtle)',
              borderColor: 'var(--border-subtle)'
            }}
          >
            <div className="flex items-center space-x-2 text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>
              <Heart className="w-4 h-4" />
              <span>Zero-Guilt Progression</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Bloom does not penalize missed days or broken streaks. Rest days are healthy biological necessities, not failures. Every tree you plant remains forever in your forest.
            </p>
          </div>
        </div>
      </section>

      {/* 3. "Your Forest" Gallery */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TreePine className="w-5 h-5 text-[var(--accent-primary)]" />
            <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Your Forest ({forestRecords.length} Trees Planted)
            </h2>
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            Every preserved milestone of progress
          </span>
        </div>

        {forestRecords.length === 0 ? (
          <div 
            className="p-12 text-center rounded-3xl border border-dashed space-y-3"
            style={{
              borderColor: 'var(--border-strong)',
              backgroundColor: 'var(--bg-card-subtle)'
            }}
          >
            <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-[var(--bg-accent-soft)] text-[var(--accent-primary)]">
              <TreePine className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Your Forest is waiting for its first sapling
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-md mx-auto">
                Complete your daily tasks in Goal Tracker today to watch your seed sprout into a full canopy and join Your Forest.
              </p>
            </div>
            <button
              onClick={() => setActivePage('goals')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white mt-2"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              Open Goal Tracker
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {forestRecords.map((record) => (
              <div
                key={record.id}
                className="p-5 rounded-3xl border transition-all hover:shadow-md space-y-3"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-subtle)',
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      <TreePine className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs block" style={{ color: 'var(--text-primary)' }}>
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] capitalize">
                        {record.stage.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--bg-accent-soft)] text-[var(--accent-primary)]">
                    {record.percentage}%
                  </span>
                </div>

                <div className="text-xs space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    <span>Tasks Completed</span>
                    <span className="font-semibold">{record.completedTaskCount} tasks</span>
                  </div>
                  {record.treeTitle && (
                    <p className="text-[11px] text-[var(--text-muted)] italic line-clamp-2">
                      "{record.treeTitle}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
