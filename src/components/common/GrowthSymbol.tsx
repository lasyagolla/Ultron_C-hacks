import React from 'react';

interface GrowthSymbolProps {
  className?: string;
  size?: number | 'sm' | 'md' | 'lg' | 'hero';
  strokeWidth?: number;
}

export const GrowthSymbol: React.FC<GrowthSymbolProps> = ({
  className = '',
  size = 24,
  strokeWidth = 2,
}) => {
  const numericSize = 
    typeof size === 'number' ? size : 
    size === 'sm' ? 20 : 
    size === 'md' ? 28 : 
    size === 'lg' ? 36 : 
    size === 'hero' ? 48 : 24;
  return (
    <svg
      width={numericSize}
      height={numericSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Root stem curving upwards */}
      <path d="M12 21V11" />
      {/* Left budding leaf (representing reflection & rest) */}
      <path d="M12 15C9.5 15 7 13 7 9.5C9.5 9.5 11.5 11 12 13" />
      {/* Right blooming leaf (representing focus & ambitions) */}
      <path d="M12 12C14.5 12 17 10 17 6.5C14.5 6.5 12.5 8 12 10" />
      {/* Top mindful apex sprout */}
      <circle cx="12" cy="4" r="1.5" fill="currentColor" />
    </svg>
  );
};
