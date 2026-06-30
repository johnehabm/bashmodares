import { Moon, Sun } from 'lucide-react';
import { useApp } from '../store/AppContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useApp();
  return (
    <button
      onClick={toggleTheme}
      aria-label="تبديل الوضع الليلي"
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 bg-white/60 text-ink-700 transition-all hover:border-brand-300 hover:text-brand-600 dark:border-ink-700 dark:bg-ink-900/60 dark:text-ink-200 dark:hover:text-brand-400"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
}
