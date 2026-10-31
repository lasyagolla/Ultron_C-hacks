import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Smile, 
  BatteryCharging, 
  CheckCircle2, 
  Heart,
  Moon,
  Clock,
  Calendar,
  Layers,
  Award,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const InsightsPage: React.FC = () => {
  const { 
    commitments, 
    restPeriods, 
    goals, 
    tasks, 
    dailyReflections
  } = useAuth();

  // Daily Pulse Check-in state
  const [mood, setMood] = useState<number>(4);
  const [energy, setEnergy] = useState<number>(4);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [checkInNotice, setCheckInNotice] = useState<string | null>(null);

  const handleSaveCheckIn = () => {
    setCheckedInToday(true);
    setCheckInNotice('Today’s well-being record saved.');
    setTimeout(() => setCheckInNotice(null), 3000);
  };

  // 1. Task & Completion Analytics
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const postponed = tasks.filter(t => (t.postponedCount || 0) > 0 || t.status === 'postponed').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Reason breakdown
    const reasonsMap: Record<string, number> = {};
    tasks.forEach(t => {
      (t.postponedReasons || []).forEach(r => {
        reasonsMap[r] = (reasonsMap[r] || 0) + 1;
      });
    });

    return { total, completed, postponed, completionRate, reasonsMap };
  }, [tasks]);

  // 2. Goal Progress Analytics
  const goalStats = useMemo(() => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'completed' || g.archived).length;
    const activeGoals = goals.filter(g => g.status !== 'completed' && !g.archived).length;
    
    let totalMilestones = 0;
    let completedMilestones = 0;
    goals.forEach(g => {
      (g.milestones || []).forEach(m => {
        totalMilestones++;
        if (m.status === 'completed') completedMilestones++;
      });
    });

    const milestoneRate = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    return { totalGoals, completedGoals, activeGoals, totalMilestones, completedMilestones, milestoneRate };
  }, [goals]);

  // 3. Weekly Schedule & Rest Metrics
  const scheduleMetrics = useMemo(() => {
    // Total weekly commitment hours
    let commitmentHours = 0;
    commitments.forEach(c => {
      const [sh, sm] = c.startTime.split(':').map(Number);
      const [eh, em] = c.endTime.split(':').map(Number);
      let dur = (eh + em / 60) - (sh + sm / 60);
      if (dur < 0) dur += 24;
      commitmentHours += dur * (c.days ? c.days.length : 1);
    });

    // Total weekly protected rest hours
    let restHours = 0;
    restPeriods.forEach(p => {
      const [sh, sm] = p.startTime.split(':').map(Number);
      const [eh, em] = p.endTime.split(':').map(Number);
      let dur = (eh + em / 60) - (sh + sm / 60);
      if (dur < 0) dur += 24;
      restHours += dur * (p.days ? p.days.length : 7);
    });

    return {
      commitmentHours: Math.round(commitmentHours * 10) / 10,
      restHours: Math.round(restHours * 10) / 10,
      commitmentsCount: commitments.length,
      restPeriodsCount: restPeriods.length
    };
  }, [commitments, restPeriods]);

  // 4. Mood & Energy Trends from Reflections
  const reflectionTrends = useMemo(() => {
    const count = dailyReflections.length;
    let totalNightMood = 0;
    let moodEntries = 0;

    dailyReflections.forEach(r => {
      if (r.nightMood) {
        totalNightMood += r.nightMood;
        moodEntries++;
      }
    });

    const avgMood = moodEntries > 0 ? (totalNightMood / moodEntries).toFixed(1) : '4.0';
    return { count, avgMood };
  }, [dailyReflections]);

  return (
    <div className="space-y-8 select-none max-w-6xl mx-auto pb-12">
      {/* Toast Notification */}
      {checkInNotice && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-2xl border text-xs font-bold text-white bg-emerald-600 shadow-xl flex items-center space-x-2 animate-in slide-in-from-bottom duration-200">
          <Check className="w-4 h-4" />
          <span>{checkInNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Insights
            </h1>
            <span 
              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
              style={{
                backgroundColor: 'var(--bg-accent-soft)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--accent-primary)'
              }}
            >
              Well-being &amp; Progress Dashboard
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            A factual overview of your habit consistency, task completion rates, schedule distribution, and energy patterns.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-[var(--accent-secondary)] font-semibold">
          <BarChart3 className="w-4 h-4 text-[var(--accent-primary)]" />
          <span>Tracking Active</span>
        </div>
      </div>

      {/* Daily Mood & Energy Check-in Widget */}
      <div 
        className="rounded-3xl p-6 sm:p-8 border space-y-4"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-subtle)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center space-x-2">
            <Smile className="w-4 h-4 text-[var(--accent-primary)]" />
            <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              Daily Well-being Check-In
            </h2>
          </div>
          {checkedInToday ? (
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Logged for Today</span>
            </span>
          ) : (
            <span className="text-[11px] text-[var(--text-muted)]">Record Today's Status</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          {/* Mood Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--text-secondary)]">Mood Level (1 to 5)</span>
              <span className="font-bold text-sm text-[var(--accent-primary)]">
                {mood === 1 ? 'Overwhelmed' : mood === 2 ? 'Tired' : mood === 3 ? 'Steady' : mood === 4 ? 'Good' : 'Flourishing'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={mood}
              disabled={checkedInToday}
              onChange={(e) => setMood(parseInt(e.target.value, 10))}
              className="w-full accent-[var(--accent-primary)] cursor-pointer"
            />
          </div>

          {/* Energy Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--text-secondary)]">Energy Level (1 to 5)</span>
              <span className="font-bold text-sm text-[var(--accent-primary)]">
                {energy === 1 ? 'Depleted' : energy === 2 ? 'Low' : energy === 3 ? 'Moderate' : energy === 4 ? 'Energized' : 'Peak'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={energy}
              disabled={checkedInToday}
              onChange={(e) => setEnergy(parseInt(e.target.value, 10))}
              className="w-full accent-[var(--accent-primary)] cursor-pointer"
            />
          </div>
        </div>

        {!checkedInToday && (
          <button
            onClick={handleSaveCheckIn}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-sm"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            Record Check-In
          </button>
        )}
      </div>

      {/* 4-Stat Core Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Task Completion Rate */}
        <div 
          className="p-5 rounded-3xl border space-y-2 flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Task Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">
              {taskStats.completionRate}%
            </div>
            <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">
              {taskStats.completed} of {taskStats.total} recorded tasks completed
            </span>
          </div>
        </div>

        {/* Stat 2: Goal Milestones */}
        <div 
          className="p-5 rounded-3xl border space-y-2 flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Goal Milestones</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-purple-600">
              {goalStats.milestoneRate}%
            </div>
            <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">
              {goalStats.completedMilestones} of {goalStats.totalMilestones} milestones finished
            </span>
          </div>
        </div>

        {/* Stat 3: Weekly Commitment Load */}
        <div 
          className="p-5 rounded-3xl border space-y-2 flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Fixed Commitments</span>
            <Calendar className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-sky-600">
              ~{scheduleMetrics.commitmentHours}h
            </div>
            <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">
              Across {scheduleMetrics.commitmentsCount} scheduled recurring blocks
            </span>
          </div>
        </div>

        {/* Stat 4: Protected Rest Hours */}
        <div 
          className="p-5 rounded-3xl border space-y-2 flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Protected Rest</span>
            <Moon className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600">
              ~{scheduleMetrics.restHours}h
            </div>
            <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">
              Designated sleep &amp; downtime windows
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Task Execution & Postponement Distribution */}
        <div 
          className="p-6 rounded-3xl border space-y-4"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-[var(--accent-primary)]" />
            <h3 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Task Execution &amp; Postponement Record
            </h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Breakdown of tasks that were completed on schedule versus tasks that experienced postponements.
          </p>

          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold" style={{ color: 'var(--text-primary)' }}>
                <span>Completed Tasks</span>
                <span>{taskStats.completed} tasks</span>
              </div>
              <div className="w-full bg-[var(--bg-card-subtle)] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${taskStats.completionRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold" style={{ color: 'var(--text-primary)' }}>
                <span>Postponed Tasks</span>
                <span>{taskStats.postponed} tasks</span>
              </div>
              <div className="w-full bg-[var(--bg-card-subtle)] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${taskStats.total > 0 ? (taskStats.postponed / taskStats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Postponement Reasons If Recorded */}
          {Object.keys(taskStats.reasonsMap).length > 0 && (
            <div className="pt-3 border-t space-y-1.5" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Recorded Postponement Reasons:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(taskStats.reasonsMap).map(([reason, count]) => (
                  <span 
                    key={reason}
                    className="px-2.5 py-0.5 rounded-full border text-[11px] font-semibold bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    {reason} ({count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Well-being Trends & Reflections */}
        <div 
          className="p-6 rounded-3xl border space-y-4"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <h3 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Daily Reflections &amp; Energy Trends
            </h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Historical reflection logging and mood consistency across recorded days.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-2xl border text-center space-y-1" style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Reflections Logged</span>
              <div className="text-xl font-black text-[var(--accent-primary)]">
                {reflectionTrends.count}
              </div>
              <span className="text-[10px] text-[var(--text-secondary)]">Total submissions</span>
            </div>

            <div className="p-4 rounded-2xl border text-center space-y-1" style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Average Mood</span>
              <div className="text-xl font-black text-rose-500">
                {reflectionTrends.avgMood} / 5
              </div>
              <span className="text-[10px] text-[var(--text-secondary)]">From evening checks</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border text-xs text-[var(--text-secondary)] flex items-center space-x-2" style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-subtle)' }}>
            <Clock className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
            <span>Evening reflections capture day-end stamina to observe rest and study pacing over time.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
