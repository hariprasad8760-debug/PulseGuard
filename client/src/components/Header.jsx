import React from 'react';
import { Shield, Settings, Info, Home } from 'lucide-react';

export default function Header({ onHomeClick, onSettingsClick, onAboutClick, currentScreen }) {
  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div 
          onClick={onHomeClick}
          className="flex items-center space-x-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-deepsea-900 flex items-center justify-center text-white shadow-md shadow-deepsea-900/10 group-hover:bg-deepsea-800 transition-colors">
            <Shield className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl text-deepsea-900 tracking-tight">PulseGuard AI</span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">Academic Video Security Platform</p>
          </div>
        </div>

        {/* Right navigation links */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={onHomeClick}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentScreen === 'home'
                ? 'text-deepsea-800 bg-deepsea-50 font-semibold'
                : 'text-slate-600 hover:text-deepsea-900 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4 text-deepsea-700" />
            <span>Home</span>
          </button>

          <button
            onClick={onSettingsClick}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-deepsea-900 hover:bg-slate-100 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Settings</span>
          </button>

          <button
            onClick={onAboutClick}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-deepsea-900 hover:bg-slate-100 transition-colors"
          >
            <Info className="w-4 h-4 text-slate-500" />
            <span>About</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
