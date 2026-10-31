import React from 'react';
import { Sparkles, Trophy, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DailyGrowthTreeProps {
  completedCount?: number;
  totalCount?: number;
  isCompact?: boolean;
}

export const DailyGrowthTree: React.FC<DailyGrowthTreeProps> = ({
  completedCount: propCompletedCount,
  totalCount: propTotalCount,
  isCompact = false
}) => {
  const { tasks } = useAuth();
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.scheduledDate === todayStr || (!t.scheduledDate && t.status === 'completed'));
  
  const completedCount = propCompletedCount !== undefined ? propCompletedCount : todayTasks.filter(t => t.status === 'completed').length;
  const totalCount = propTotalCount !== undefined ? propTotalCount : todayTasks.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Determine stage
  let stage: 'seed' | 'sprout' | 'sapling' | 'young_tree' | 'fully_grown' = 'seed';
  let stageLabel = 'Resting Seed';
  let stageDesc = 'Plant your intentions for today by completing scheduled tasks.';

  if (totalCount === 0) {
    stage = 'seed';
    stageLabel = 'Nurturing Soil';
    stageDesc = 'No tasks scheduled yet. Add tasks to nourish today’s growth tree.';
  } else if (percentage === 100) {
    stage = 'fully_grown';
    stageLabel = 'Fully Grown Oak';
    stageDesc = 'All daily tasks completed! Tree saved to Your Forest.';
  } else if (percentage >= 60) {
    stage = 'young_tree';
    stageLabel = 'Young Tree';
    stageDesc = 'Branches expanding strong with great momentum.';
  } else if (percentage >= 25) {
    stage = 'sapling';
    stageLabel = 'Thriving Sapling';
    stageDesc = 'Deep roots anchoring your productive focus.';
  } else if (percentage > 0) {
    stage = 'sprout';
    stageLabel = 'Emerging Sprout';
    stageDesc = 'First breakthrough leaf unfurling today.';
  }

  // Render SVG tree based on stage
  const renderTreeSvg = () => {
    switch (stage) {
      case 'seed':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor">
            <ellipse cx="50" cy="85" rx="30" ry="6" className="fill-[var(--bg-accent-soft)] stroke-[var(--border-strong)]" strokeWidth="1.5" />
            <circle cx="50" cy="83" r="5" className="fill-[var(--accent-primary)]" />
            <path d="M50 78 Q50 75 51 72" stroke="var(--accent-sage)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'sprout':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor">
            <ellipse cx="50" cy="85" rx="30" ry="6" className="fill-[var(--bg-accent-soft)] stroke-[var(--border-strong)]" strokeWidth="1.5" />
            <path d="M50 85 V65" stroke="var(--accent-primary)" strokeWidth="3" strokeLinecap="round" />
            {/* Small leaves */}
            <path d="M50 70 Q40 68 42 60 Q48 64 50 70" className="fill-[var(--accent-sage)] stroke-[var(--accent-primary)]" strokeWidth="1.5" />
            <path d="M50 67 Q60 65 58 57 Q52 61 50 67" className="fill-[var(--accent-sage)] stroke-[var(--accent-primary)]" strokeWidth="1.5" />
          </svg>
        );
      case 'sapling':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor">
            <ellipse cx="50" cy="85" rx="32" ry="6" className="fill-[var(--bg-accent-soft)] stroke-[var(--border-strong)]" strokeWidth="1.5" />
            <path d="M50 85 V45" stroke="var(--accent-primary)" strokeWidth="3.5" strokeLinecap="round" />
            {/* Branches and leaves */}
            <path d="M50 65 Q35 58 32 50 Q42 52 50 62" className="fill-[var(--accent-sage)] stroke-[var(--accent-primary)]" strokeWidth="1.5" />
            <path d="M50 55 Q65 48 68 40 Q58 42 50 52" className="fill-[var(--accent-sage)] stroke-[var(--accent-primary)]" strokeWidth="1.5" />
            <circle cx="50" cy="42" r="8" className="fill-[var(--accent-secondary)] stroke-[var(--accent-primary)]" strokeWidth="1.5" />
          </svg>
        );
      case 'young_tree':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor">
            <ellipse cx="50" cy="88" rx="34" ry="6" className="fill-[var(--bg-accent-soft)] stroke-[var(--border-strong)]" strokeWidth="1.5" />
            {/* Trunk */}
            <path d="M47 88 L48 45 L52 45 L53 88 Z" className="fill-[var(--accent-primary)]" />
            {/* Lush canopy */}
            <circle cx="50" cy="40" r="18" className="fill-[var(--accent-secondary)] opacity-90" />
            <circle cx="38" cy="46" r="14" className="fill-[var(--accent-sage)]" />
            <circle cx="62" cy="46" r="14" className="fill-[var(--accent-sage)]" />
            <circle cx="50" cy="32" r="14" className="fill-[var(--accent-primary)] opacity-80" />
          </svg>
        );
      case 'fully_grown':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor">
            <ellipse cx="50" cy="90" rx="38" ry="7" className="fill-[var(--bg-accent-soft)] stroke-[var(--border-strong)]" strokeWidth="1.5" />
            {/* Grand Oak Trunk */}
            <path d="M45 90 C47 65 47 45 46 38 C54 45 53 65 55 90 Z" className="fill-[var(--accent-primary)]" />
            {/* Majestic Crown */}
            <circle cx="50" cy="38" r="24" className="fill-[var(--accent-primary)] opacity-95" />
            <circle cx="32" cy="44" r="18" className="fill-[var(--accent-secondary)]" />
            <circle cx="68" cy="44" r="18" className="fill-[var(--accent-secondary)]" />
            <circle cx="50" cy="24" r="18" className="fill-[var(--accent-sage)]" />
            <circle cx="40" cy="30" r="14" className="fill-[var(--bg-accent-soft)] opacity-40" />
            {/* Golden achievement bloom fruits */}
            <circle cx="36" cy="40" r="3" fill="#F59E0B" />
            <circle cx="64" cy="38" r="3" fill="#F59E0B" />
            <circle cx="50" cy="22" r="3" fill="#F59E0B" />
          </svg>
        );
    }
  };

  if (isCompact) {
    return (
      <div 
        className="flex items-center space-x-3 p-3.5 rounded-2xl border transition-all"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        <div className="w-14 h-14 flex-shrink-0 relative">
          {renderTreeSvg()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs truncate" style={{ color: 'var(--text-primary)' }}>
              {stageLabel}
            </span>
            <span className="text-[10px] font-semibold text-[var(--accent-primary)]">
              {percentage}%
            </span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
            {completedCount} of {totalCount} daily tasks finished
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden bg-[var(--border-subtle)] mt-1.5">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percentage}%`,
                backgroundColor: 'var(--accent-primary)'
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-6 sm:p-8 rounded-3xl border flex flex-col items-center text-center space-y-4"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-subtle)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <div className="w-36 h-36 relative">
        {renderTreeSvg()}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
            {stageLabel}
          </span>
          {percentage === 100 && (
            <span className="p-1 rounded-full bg-amber-100 text-amber-700" title="Completed!">
              <Trophy className="w-4 h-4" />
            </span>
          )}
        </div>
        <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
          {stageDesc}
        </p>
      </div>

      <div className="w-full max-w-xs space-y-1.5 pt-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span style={{ color: 'var(--text-muted)' }}>Daily Tasks</span>
          <span style={{ color: 'var(--accent-primary)' }}>{completedCount} / {totalCount} ({percentage}%)</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden bg-[var(--border-subtle)]">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percentage}%`,
              backgroundColor: 'var(--accent-primary)'
            }}
          />
        </div>
      </div>

      <p className="text-[10px] text-[var(--text-muted)] italic pt-1">
        No-pressure growth: partial progress is always honored. Missed days never penalize your forest.
      </p>
    </div>
  );
};
