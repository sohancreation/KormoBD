import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'button' | 'switch' | 'compact';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'compact',
  className = ''
}) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { isBangla } = useLanguage();

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer text-xs font-semibold ${
          isDark
            ? 'bg-neutral-800 hover:bg-neutral-700 text-amber-300 border-neutral-700 shadow-sm'
            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-200 shadow-2xs'
        } ${className}`}
        aria-label={isDark 
          ? (isBangla ? 'লাইট মোডে পরিবর্তন করুন' : 'Switch to Light Mode')
          : (isBangla ? 'ডার্ক/নাইট মোডে পরিবর্তন করুন' : 'Switch to Dark Mode')}
        title={isDark 
          ? (isBangla ? 'লাইট মোড সক্রিয় করুন' : 'Switch to Light Mode')
          : (isBangla ? 'ডার্ক / নাইট মোড সক্রিয় করুন' : 'Switch to Night / Dark Mode')}
      >
        {isDark ? (
          <>
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <span>{isBangla ? 'লাইট মোড' : 'Light Mode'}</span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-indigo-600" />
            <span>{isBangla ? 'নাইট মোড' : 'Night Mode'}</span>
          </>
        )}
      </button>
    );
  }

  // Compact icon button for top headers and navbars
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl transition-all cursor-pointer relative group flex items-center justify-center ${
        isDark
          ? 'bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 hover:border-neutral-600 shadow-sm'
          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 hover:border-neutral-300'
      } ${className}`}
      aria-label={isDark 
        ? (isBangla ? 'লাইট মোড' : 'Switch to Light Mode')
        : (isBangla ? 'ডার্ক / নাইট মোড' : 'Switch to Night / Dark Mode')}
      title={isDark 
        ? (isBangla ? 'লাইট মোডে পরিবর্তন করুন' : 'Switch to Light Mode')
        : (isBangla ? 'নাইট / ডার্ক মোডে পরিবর্তন করুন' : 'Switch to Night Mode')}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-neutral-700 transition-transform duration-300 group-hover:-rotate-12" />
      )}
      <span className="sr-only">
        {isDark ? (isBangla ? 'লাইট মোড' : 'Light Mode') : (isBangla ? 'নাইট মোড' : 'Night Mode')}
      </span>
    </button>
  );
};
