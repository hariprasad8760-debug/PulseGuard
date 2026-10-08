import React, { useState } from 'react';
import { Shield, Menu, X, Home, HelpCircle, Info, Settings, ChevronRight, Sun, Moon } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home',         label: 'Home',             icon: Home },
  { id: 'how-it-works', label: 'How It Works',     icon: HelpCircle },
  { id: 'about',        label: 'About & Security', icon: Info },
  { id: 'settings',     label: 'Settings',         icon: Settings },
];

export default function Header({ currentPage, onNavigate, theme = 'light', onToggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center space-x-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-deepsea-900 dark:bg-deepsea-800 flex items-center justify-center shadow-md shadow-deepsea-900/15 group-hover:bg-deepsea-800 transition-colors">
            <Shield className="w-5 h-5 text-sky-400" />
          </div>
          <span className="font-bold text-xl text-deepsea-900 dark:text-white tracking-tight">PulseGuard AI</span>
        </button>

        {/* Desktop Nav + Dark Mode Toggle */}
        <div className="hidden md:flex items-center space-x-3">
          <nav className="flex items-center space-x-1">
            {NAV_ITEMS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  currentPage === id
                    ? 'text-deepsea-900 dark:text-sky-300 bg-deepsea-50 dark:bg-slate-800 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-deepsea-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-slate-600" />
              )}
            </button>
          )}
        </div>

        {/* Mobile menu & theme controls */}
        <div className="flex items-center space-x-2 md:hidden">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-slate-600" />
              )}
            </button>
          )}

          <button
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
          <nav className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  currentPage === id
                    ? 'bg-deepsea-50 dark:bg-slate-800 text-deepsea-900 dark:text-sky-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 text-deepsea-700 dark:text-sky-400" />
                  <span>{label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
