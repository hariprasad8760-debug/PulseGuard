import React, { useState } from 'react';
import { 
  Shield, 
  Menu, 
  X, 
  Home, 
  HelpCircle, 
  Info, 
  Settings, 
  ChevronRight, 
  Sun, 
  Moon,
  LogIn,
  LogOut,
  User
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home',         label: 'Home',             icon: Home },
  { id: 'how-it-works', label: 'How It Works',     icon: HelpCircle },
  { id: 'about',        label: 'About & Security', icon: Info },
  { id: 'settings',     label: 'Settings',         icon: Settings },
];

export default function Header({ 
  currentPage, 
  onNavigate, 
  theme = 'light', 
  onToggleTheme,
  currentUser = null,
  onLogout
}) {
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

        {/* Desktop Nav + Dark Mode Toggle + Auth Profile / Sign In */}
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

          {/* User Profile Pill or Sign In Button */}
          {currentUser ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <button
                onClick={() => handleNav('settings')}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-deepsea-50 dark:bg-slate-800 border border-deepsea-100 dark:border-slate-700 hover:bg-deepsea-100 dark:hover:bg-slate-700/80 transition-colors cursor-pointer text-left"
                title="View Account Settings"
              >
                <div className="w-6 h-6 rounded-lg bg-deepsea-900 dark:bg-sky-600 text-white flex items-center justify-center text-xs font-bold">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-bold text-deepsea-900 dark:text-white leading-tight truncate max-w-[110px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[110px]">
                    {currentUser.role || 'Participant'}
                  </p>
                </div>
              </button>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNav('login')}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer ${
                currentPage === 'login'
                  ? 'bg-deepsea-900 text-white shadow-md dark:bg-sky-600'
                  : 'bg-deepsea-800 hover:bg-deepsea-900 dark:bg-deepsea-700 dark:hover:bg-deepsea-600 text-white'
              }`}
            >
              <LogIn className="w-4 h-4 text-sky-400" />
              <span>Sign In</span>
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
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg animate-fadeIn">
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

            {/* Mobile Auth Item */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              {currentUser ? (
                <div className="p-2.5 rounded-xl bg-deepsea-50 dark:bg-slate-800 border border-deepsea-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-deepsea-900 dark:bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-deepsea-900 dark:text-white">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{currentUser.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { onLogout(); setMobileOpen(false); }}
                    className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleNav('login')}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-deepsea-800 hover:bg-deepsea-900 text-white font-bold text-sm shadow-md"
                >
                  <LogIn className="w-4 h-4 text-sky-400" />
                  <span>Sign In / Register</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
