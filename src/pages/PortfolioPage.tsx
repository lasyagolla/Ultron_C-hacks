import React, { useState } from 'react';
import { 
  Award, 
  Trophy, 
  CheckCircle, 
  BookOpen, 
  Briefcase, 
  Wrench, 
  HeartHandshake, 
  Activity, 
  Plus, 
  ExternalLink,
  Sparkles,
  RotateCcw,
  Calendar,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Goal } from '../types';

type PortfolioCategory = 
  | 'completed_goals'
  | 'awards' 
  | 'competitions' 
  | 'certifications' 
  | 'courses' 
  | 'projects' 
  | 'skills' 
  | 'volunteering' 
  | 'extracurriculars';

interface PortfolioItem {
  id: string;
  category: PortfolioCategory;
  title: string;
  description?: string;
  date?: string;
  skills?: string[];
  link?: string;
}

const TABS: { id: PortfolioCategory; label: string; icon: any }[] = [
  { id: 'completed_goals', label: 'Completed Goals', icon: CheckCircle },
  { id: 'awards', label: 'Awards', icon: Award },
  { id: 'competitions', label: 'Competitions', icon: Trophy },
  { id: 'certifications', label: 'Certifications', icon: CheckCircle2 },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'projects', label: 'Projects', icon: Briefcase },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'volunteering', label: 'Volunteering', icon: HeartHandshake },
  { id: 'extracurriculars', label: 'Extracurriculars', icon: Activity },
];

export const PortfolioPage: React.FC = () => {
  const { profile, completedGoals, restoreGoal, setActivePage, confirmedSkills } = useAuth();
  const [activeTab, setActiveTab] = useState<PortfolioCategory>('completed_goals');
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [restoredMsg, setRestoredMsg] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<PortfolioCategory>('awards');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formLink, setFormLink] = useState('');

  const currentTabConfig = TABS.find(t => t.id === activeTab) || TABS[0];
  const filteredItems = items.filter(i => i.category === activeTab);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    const newItem: PortfolioItem = {
      id: 'port_' + Math.random().toString(36).substring(2, 9),
      category: formCategory,
      title: formTitle.trim(),
      description: formDescription.trim(),
      date: formDate || new Date().toISOString().split('T')[0],
      link: formLink.trim()
    };
    setItems([newItem, ...items]);
    setFormTitle('');
    setFormDescription('');
    setFormLink('');
    setIsModalOpen(false);
  };

  const handleRestoreGoal = async (goalId: string, title: string) => {
    await restoreGoal(goalId);
    setRestoredMsg(`"${title}" restored back to Active Goals!`);
    setTimeout(() => setRestoredMsg(null), 3000);
  };

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Achievement Portfolio
            </h1>
            <span 
              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
              style={{
                backgroundColor: 'var(--bg-accent-soft)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--accent-primary)'
              }}
            >
              Verified Growth Archive
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Curate completed goals, awards, extracurriculars, and project milestones for college and internship applications.
          </p>
        </div>

        {activeTab !== 'completed_goals' && (
          <button
            onClick={() => {
              setFormCategory(activeTab);
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-semibold text-white shadow-sm"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </button>
        )}
      </div>

      {restoredMsg && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between">
          <span>{restoredMsg}</span>
          <button onClick={() => setActivePage('goals')} className="underline font-semibold ml-2">
            View in Goal Tracker
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const count = tab.id === 'completed_goals' 
            ? completedGoals.length 
            : tab.id === 'skills'
              ? (confirmedSkills.length + items.filter(i => i.category === 'skills').length)
              : items.filter(i => i.category === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-sm'
                  : 'hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)]'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: COMPLETED GOALS (Section 2) */}
      {activeTab === 'completed_goals' && (
        <div>
          {completedGoals.length === 0 ? (
            <div 
              className="p-10 rounded-3xl border text-center space-y-3"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-subtle)',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
                style={{ backgroundColor: 'var(--bg-accent-soft)', color: 'var(--accent-primary)' }}
              >
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                No completed goals archived yet
              </h3>
              <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
                When you reach 100% on a goal in Goal Tracker, it smoothly slides here into your permanent portfolio with all milestones and dates preserved.
              </p>
              <button
                onClick={() => setActivePage('goals')}
                className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                <span>Go to Goal Tracker</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-5 rounded-3xl border space-y-3 transition-all hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-subtle)',
                    boxShadow: 'var(--shadow-card)'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {goal.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          Completed
                        </span>
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">
                        {goal.category} • Completed on {goal.completedAt || 'Recently'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRestoreGoal(goal.id, goal.title)}
                      className="p-1.5 rounded-xl border hover:bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all flex items-center space-x-1 text-[11px]"
                      style={{ borderColor: 'var(--border-subtle)' }}
                      title="Restore goal back to Active Goals"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span className="hidden sm:inline">Restore</span>
                    </button>
                  </div>

                  {goal.description && (
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {goal.description}
                    </p>
                  )}

                  {/* Preserved Milestones */}
                  {goal.milestones && goal.milestones.length > 0 && (
                    <div className="pt-2 border-t space-y-1.5" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        Milestones Accomplished ({goal.milestones.length})
                      </span>
                      <div className="space-y-1">
                        {goal.milestones.map((m) => (
                          <div key={m.id} className="flex items-center space-x-2 text-xs text-[var(--text-secondary)]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span className="truncate">{m.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* OTHER PORTFOLIO TABS */}
      {activeTab !== 'completed_goals' && (
        <div className="space-y-4">
          {/* Confirmed Skills Banner when viewing Skills Tab */}
          {activeTab === 'skills' && confirmedSkills.length > 0 && (
            <div 
              className="p-5 rounded-3xl border space-y-3"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                    Confirmed Mastery Skills ({confirmedSkills.length})
                  </h3>
                </div>
                <button
                  onClick={() => setActivePage('explore')}
                  className="text-xs font-bold text-[var(--accent-primary)] hover:underline flex items-center space-x-1"
                >
                  <span>Explore Growth Map</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {confirmedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-2xl border text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      borderColor: 'rgba(16, 185, 129, 0.3)',
                      color: '#059669'
                    }}
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {filteredItems.length === 0 && !(activeTab === 'skills' && confirmedSkills.length > 0) ? (
            <div 
              className="p-10 rounded-3xl border text-center space-y-3"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-subtle)',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
                style={{ backgroundColor: 'var(--bg-accent-soft)', color: 'var(--accent-primary)' }}
              >
                <currentTabConfig.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                No {currentTabConfig.label} recorded yet
              </h3>
              <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Keep an authentic record of your student accomplishments. Completed achievements can be exported or linked to student CVs.
              </p>
              <button
                onClick={() => {
                  setFormCategory(activeTab);
                  setIsModalOpen(true);
                }}
                className="mt-2 inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold"
                style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card-subtle)' }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First {currentTabConfig.label.slice(0, -1)}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-3xl border space-y-2"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{item.title}</span>
                    {item.date && (
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">{item.date}</span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
                  )}
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-xs text-[var(--accent-primary)] hover:underline pt-1"
                    >
                      <span>Verification Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)'
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <h4 className="font-bold text-sm">Add Portfolio Achievement</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)]">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1st Place Regional Science Fair, Certified Python Developer"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-transparent"
                  style={{ borderColor: 'var(--border-strong)' }}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border bg-transparent capitalize"
                  style={{ borderColor: 'var(--border-strong)' }}
                >
                  {TABS.filter(t => t.id !== 'completed_goals').map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Description / Reflection</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe the significance or skills demonstrated..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-transparent resize-none"
                  style={{ borderColor: 'var(--border-strong)' }}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-transparent"
                  style={{ borderColor: 'var(--border-strong)' }}
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl font-semibold text-white"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
