import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      onClick={toggleTheme}
      title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      className={`relative inline-flex items-center gap-2 p-1.5 rounded-xl border transition-all duration-200 focus:outline-none ${
        isLight
          ? 'bg-white/80 hover:bg-white text-[#19353C] border-black/10 shadow-sm'
          : 'bg-white/5 hover:bg-white/10 text-[#92E6E0] border-white/5'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isLight ? (
          <Sun className="w-4 h-4 text-[#19353C] animate-scale-up" />
        ) : (
          <Moon className="w-4 h-4 text-[#92E6E0] animate-scale-up" />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-slate-300 dark:text-slate-300 light:text-slate-700">
          {isLight ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};
