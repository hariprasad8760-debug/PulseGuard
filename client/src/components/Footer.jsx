import React from 'react';
import { Shield, Lock, Eye, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-deepsea-800 flex items-center justify-center">
                <Shield className="w-4 h-4 text-sky-400" />
              </div>
              <span className="text-white font-bold text-lg">PulseGuard AI</span>
            </div>
            <p className="text-sm leading-relaxed">
              A secure real-time video communication platform being developed with AI-powered liveness and deepfake analysis capabilities.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <Lock className="w-3 h-3" />
              <span>WebRTC Peer-to-Peer Communication</span>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>Real-Time Video Calling</li>
              <li>Secure Room Management</li>
              <li className="flex items-center space-x-1.5">
                <span>Liveness Detection</span>
                <span className="text-[10px] bg-deepsea-900/80 text-sky-400 px-1.5 py-0.5 rounded border border-deepsea-700/50 font-medium">Coming Soon</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span>Deepfake Analysis</span>
                <span className="text-[10px] bg-deepsea-900/80 text-sky-400 px-1.5 py-0.5 rounded border border-deepsea-700/50 font-medium">Coming Soon</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span>rPPG Biometrics</span>
                <span className="text-[10px] bg-deepsea-900/80 text-sky-400 px-1.5 py-0.5 rounded border border-deepsea-700/50 font-medium">Coming Soon</span>
              </li>
            </ul>
          </div>

          {/* Privacy Notice */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Privacy First</h4>
            <p className="text-sm leading-relaxed">
              PulseGuard AI is designed to analyze only the information required for security verification. AI analysis features will be activated according to configured privacy and consent settings.
            </p>
            <div className="flex items-center space-x-2 text-xs">
              <Eye className="w-3 h-3 text-sky-500" />
              <span>AI analysis features are under development and not yet active.</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} PulseGuard AI — Academic Research Platform
          </p>
          <div className="flex items-center space-x-1 text-xs text-slate-600">
            <Cpu className="w-3 h-3" />
            <span>WebRTC + Socket.IO + React</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
