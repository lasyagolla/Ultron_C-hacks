import React from 'react';

export type BloomOrbState = 'idle' | 'listening' | 'typing' | 'thinking' | 'speaking';

interface BloomOrbProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  onClick?: () => void;
  interactive?: boolean;
  className?: string;
  state?: BloomOrbState;
}

export const BloomOrb: React.FC<BloomOrbProps> = ({
  size = 'md',
  onClick,
  interactive = true,
  className = '',
  state = 'idle'
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
    hero: 'w-44 h-44 sm:w-52 sm:h-52'
  };

  const orbDimensions = sizeClasses[size];

  // Dynamic visual parameters based on current state
  const isListening = state === 'listening';
  const isTyping = state === 'typing';
  const isThinking = state === 'thinking';

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={`Bloom AI Personal Guide (${state})`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`relative group flex items-center justify-center select-none ${interactive ? 'cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-focus)] rounded-full' : ''} ${className}`}
    >
      {/* Dynamic Soundwave Rings when listening */}
      {isListening && (
        <>
          <div 
            className="absolute inset-[-28px] rounded-full border-2 border-[var(--accent-primary)]/40 animate-ping pointer-events-none" 
            style={{ animationDuration: '1.6s' }} 
          />
          <div 
            className="absolute inset-[-44px] rounded-full border border-[var(--accent-secondary)]/30 animate-ping pointer-events-none" 
            style={{ animationDuration: '2.4s', animationDelay: '0.4s' }} 
          />
        </>
      )}

      {/* Outer subtle glow ring */}
      <div 
        className={`absolute inset-[-18px] rounded-full blur-2xl transition-all duration-700 ${
          isListening 
            ? 'opacity-90 scale-125' 
            : isTyping 
              ? 'opacity-70 scale-110' 
              : isThinking 
                ? 'opacity-80 animate-pulse' 
                : 'opacity-40 group-hover:opacity-75'
        }`}
        style={{
          background: isListening 
            ? 'radial-gradient(circle, var(--accent-primary) 0%, var(--accent-secondary) 50%, transparent 80%)'
            : 'radial-gradient(circle, var(--orb-glow-1) 0%, var(--orb-glow-2) 50%, transparent 80%)'
        }}
      />

      {/* Pulsing breathing aura */}
      <div 
        className={`absolute inset-[-6px] rounded-full blur-lg transition-transform duration-500 ease-out ${
          isListening 
            ? 'scale-120 opacity-80' 
            : isTyping 
              ? 'scale-110 opacity-70' 
              : isThinking 
                ? 'scale-105 opacity-75' 
                : 'opacity-60 group-hover:scale-110'
        }`}
        style={{
          background: 'radial-gradient(circle, var(--orb-glow-2) 20%, var(--orb-glow-3) 70%, transparent 100%)'
        }}
      />

      {/* Main Glass Sphere with inner depth gradient */}
      <div
        className={`${orbDimensions} rounded-full relative flex items-center justify-center overflow-hidden transition-all duration-500 ease-out transform shadow-xl ${
          isListening 
            ? 'scale-110 shadow-2xl ring-2 ring-[var(--accent-primary)]/50' 
            : isTyping 
              ? 'scale-105 shadow-xl' 
              : 'group-hover:scale-105'
        }`}
        style={{
          background: `
            radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.75) 0%, transparent 45%),
            radial-gradient(circle at 65% 75%, var(--accent-sage) 0%, transparent 60%),
            linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 50%, var(--accent-dusty-blue) 100%)
          `,
          boxShadow: isListening 
            ? '0 12px 40px 0 rgba(41, 53, 47, 0.3), inset 0 2px 6px 0 rgba(255, 255, 255, 0.7)' 
            : '0 8px 32px 0 rgba(41, 53, 47, 0.18), inset 0 2px 4px 0 rgba(255, 255, 255, 0.5), inset 0 -4px 8px 0 rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Organic floating inner light core */}
        <div 
          className={`w-1/2 h-1/2 rounded-full filter blur-[4px] ${
            isThinking 
              ? 'opacity-90 animate-spin duration-1000' 
              : isListening 
                ? 'opacity-95 scale-125 transition-transform duration-300' 
                : 'opacity-80 animate-pulse'
          }`}
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, var(--orb-glow-3) 60%, transparent 100%)'
          }}
        />

        {/* Delicate specular highlight */}
        <div className="absolute top-2.5 left-3.5 w-1/4 h-1/5 rounded-full bg-white opacity-60 filter blur-[1px] transform -rotate-30" />
      </div>

      {interactive && (
        <span className="sr-only">Bloom Personal Guide ({state})</span>
      )}
    </div>
  );
};
