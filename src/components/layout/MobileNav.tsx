import React, { useState } from 'react';
import { 
  Home, 
  Calendar, 
  MessageSquare, 
  Compass, 
  Award, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  LogOut, 
  Sun, 
  Moon,
  Sparkles,
  BookOpen,
  Brain,
  TreePine
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NavigationPage } from '../../types';
import { GrowthSymbol } from '../common/GrowthSymbol';

interface MobileNavProps {
  onOpenBloomGuide?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenBloomGuide }) => {
  const { 
    activePage, 
    setActivePage, 
    profile, 
    signOut, 
    theme, 
    setTheme 
  } = useAuth();
  
  const [drawerOpen, setDrawerOpen] = useState(false);

  const mainTabs: { id: NavigationPage; label: string; icon: any }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'goals', label: 'Goals', icon: Calendar },
    { id: 'reflection', label: 'Reflection', icon: BookOpen },
    { id: 'analyzer', label: 'Analyzer', icon: Brain },
  ];

  const secondaryTabs: { id: NavigationPage; label: string; icon: any }[] = [
    { id: 'progress', label: 'Progress & Forest', icon: TreePine },
    { id: 'blurt', label: 'Blurt Vault', icon: MessageSquare },
    { id: 'explore', label: 'Explore Radar', icon: Compass },
    { id: 'portfolio', label: 'Portfolio', icon: Award },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelectPage = (page: NavigationPage) => {
    setActivePage(page);
    setDrawerOpen(false);
  };

  const toggleTheme = () => {
    if (theme === 'soft-focus') setTheme('midnight');
    else if (theme === 'midnight') setTheme('minimal');
    else if (theme === 'minimal') setTheme('system');
    else setTheme('soft-focus');
  };

  return (
    <>
      {/* Mobile Top App Bar */}
      <header 
        className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b select-none backdrop-blur-md"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <button 
          onClick={() => handleSelectPage('home')}
          className="flex items-center space-x-2"
        >
          <GrowthSymbol size="sm" />
          <span className="font-extrabold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Bloom
          </span>
        </button>

        <div className="flex items-center space-x-2">
          {onOpenBloomGuide && (
            <button
              onClick={onOpenBloomGuide}
              className="p-1.5 rounded-xl border text-xs flex items-center space-x-1"
              style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-accent-soft)', color: 'var(--accent-primary)' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-semibold text-[11px]">Guide</span>
            </button>
          )}

          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl border text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)]"
            style={{ borderColor: 'var(--border-subtle)' }}
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav 
        className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-center justify-around py-2 px-3 border-t select-none backdrop-blur-md"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-subtle)',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.05)'
        }}
      >
        {mainTabs.map((tab) => {
          const isActive = activePage === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectPage(tab.id)}
              className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
                isActive ? 'font-bold' : 'text-[var(--text-muted)]'
              }`}
              style={{
                color: isActive ? 'var(--accent-primary)' : undefined,
              }}
            >
              <div 
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-[var(--bg-accent-soft)]' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => setDrawerOpen(true)}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
            ['portfolio', 'insights', 'settings'].includes(activePage) ? 'font-bold text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'
          }`}
        >
          <div className="p-1 rounded-xl">
            <Menu className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </nav>

      {/* Expanded Menu Drawer */}
      {drawerOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="w-full rounded-t-3xl p-6 space-y-5 max-h-[80vh] overflow-y-auto shadow-2xl"
            style={{
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <h4 className="font-bold text-base">Menu &amp; Navigation</h4>
                <p className="text-xs text-[var(--text-muted)]">Signed in as {profile?.displayName || 'Alex'}</p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-full hover:bg-[var(--bg-card-subtle)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-3">
                Primary Pillars
              </span>
              {mainTabs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectPage(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold ${
                    activePage === item.id ? 'bg-[var(--bg-accent-soft)] text-[var(--accent-primary)]' : 'hover:bg-[var(--bg-card-subtle)]'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-3">
                Growth &amp; Settings
              </span>
              {secondaryTabs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectPage(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold ${
                    activePage === item.id ? 'bg-[var(--bg-accent-soft)] text-[var(--accent-primary)]' : 'hover:bg-[var(--bg-card-subtle)]'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                {theme === 'midnight' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                <span className="capitalize">{theme} Theme</span>
              </button>

              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-rose-600 border border-rose-200 text-xs hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
