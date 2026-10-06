import React, { useState } from 'react';
import { Shield, Menu, X, Home, Lock, HelpCircle, Info, Settings, ChevronRight } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home',         label: 'Home',             icon: Home },
  { id: 'how-it-works', label: 'How It Works',     icon: HelpCircle },
  { id: 'about',        label: 'About & Security', icon: Info },
  { id: 'settings',     label: 'Settings',         icon: Settings },
];

export default function Header({ currentPage, onNavigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center space-x-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-deepsea-900 flex items-center justify-center shadow-md shadow-deepsea-900/15 group-hover:bg-deepsea-800 transition-colors">
            <Shield className="w-5 h-5 text-sky-400" />
          </div>
          <span className="font-bold text-xl text-deepsea-900 tracking-tight">PulseGuard AI</span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-1">
          {NAV_ITEMS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === id
                  ? 'text-deepsea-900 bg-deepsea-50 font-semibold'
                  : 'text-slate-600 hover:text-deepsea-900 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white shadow-lg">
          <nav className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  currentPage === id
                    ? 'bg-deepsea-50 text-deepsea-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 text-deepsea-700" />
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
