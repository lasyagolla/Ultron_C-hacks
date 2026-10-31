import React from 'react';
import { 
  Home, 
  Calendar, 
  MessageSquare, 
  Compass, 
  Award, 
  BarChart3, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  BookOpen,
  Brain,
  TreePine,
  Shield,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NavigationPage } from '../../types';
import { GrowthSymbol } from '../common/GrowthSymbol';

interface SidebarProps {
  onOpenBloomGuide?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenBloomGuide }) => {
  const { 
    activePage, 
    setActivePage, 
    profile, 
    user, 
    signOut, 
    theme, 
    setTheme 
  } = useAuth();

  const navItems: { id: NavigationPage; label: string; icon: any; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'goals', label: 'Goal Tracker', icon: Calendar },
    { id: 'reflection', label: 'Daily Reflection', icon: BookOpen },
    { id: 'analyzer', label: 'Analyzer', icon: Brain },
    { id: 'progress', label: 'Progress & Forest', icon: TreePine },
    { id: 'blurt', label: 'Blurt', icon: MessageSquare },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'portfolio', label: 'Portfolio', icon: Award },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const toggleTheme = () => {
    if (theme === 'soft-focus') setTheme('midnight');
    else if (theme === 'midnight') setTheme('minimal');
    else if (theme === 'minimal') setTheme('system');
    else setTheme('soft-focus');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'A';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside 
      className="hidden md:flex flex-col w-64 h-screen border-r select-none transition-colors duration-200 sticky top-0"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Brand & Bloom Logo */}
      <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <button 
          onClick={() => setActivePage('home')}
          className="flex items-center space-x-3 text-left focus:outline-none group"
        >
          {/* Minimalist Growth Sprout Symbol */}
          <GrowthSymbol size="sm" />
          <div>
            <span className="font-extrabold text-base tracking-tight block" style={{ color: 'var(--text-primary)' }}>
              Bloom
            </span>
            <span className="text-[10px] font-medium tracking-wide block uppercase" style={{ color: 'var(--text-muted)' }}>
              Student Life &amp; Rest
            </span>
          </div>
        </button>

        {/* Quick Bloom Guide Trigger */}
        {onOpenBloomGuide && (
          <button
            onClick={onOpenBloomGuide}
            title="Open Bloom Personal Guide"
            className="p-1.5 rounded-xl hover:bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                isActive
                  ? 'shadow-sm'
                  : 'hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]'
              }`}
              style={{
                backgroundColor: isActive ? 'var(--bg-accent-soft)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : undefined,
              }}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && (
                <div 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Sustainable SDG 3 Badge */}
      <div className="px-4 py-2 mx-3 mb-2 rounded-xl bg-[var(--bg-card-subtle)] border text-[10px] text-[var(--text-muted)] flex items-center space-x-2" style={{ borderColor: 'var(--border-subtle)' }}>
        <Shield className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
        <span>UN SDG 3: Rest Protected</span>
      </div>

      {/* Footer User Profile & Theme Switcher */}
      <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white'
              }}
            >
              {getInitials(profile?.displayName)}
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-xs truncate block" style={{ color: 'var(--text-primary)' }}>
                {profile?.displayName || 'Student Alex'}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] truncate block">
                {user?.email || 'Logged in'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={toggleTheme}
              title={`Switch theme (Current: ${theme})`}
              className="p-1.5 rounded-xl hover:bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              {theme === 'midnight' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button
              onClick={signOut}
              title="Sign Out"
              className="p-1.5 rounded-xl hover:bg-rose-50 text-[var(--text-muted)] hover:text-rose-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
