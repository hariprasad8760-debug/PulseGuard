import React from 'react';
import { X, Shield, Lock, Layers, Eye, Activity, Cpu } from 'lucide-react';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-deepsea-900 text-white flex items-center justify-center shadow-md">
            <Shield className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-deepsea-900">PulseGuard AI</h3>
            <p className="text-xs text-slate-500 font-medium">Academic AI Security Platform</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <p>
            <strong>PulseGuard AI</strong> is an academic real-time video and audio communication research project focused on deepfake defense, biometric integrity, and active security validation during video calls.
          </p>

          <div className="border-t border-slate-100 pt-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-deepsea-800">
              Platform Architecture
            </h4>

            <div className="bg-deepsea-50/70 border border-deepsea-200/80 rounded-xl p-3 space-y-1">
              <div className="flex items-center space-x-2 text-deepsea-900 font-semibold text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Real-Time Communication Foundation</span>
              </div>
              <p className="text-[11px] text-slate-600">
                WebRTC direct peer-to-peer audio/video calling, Socket.IO signaling, room validation, dual camera feeds, and robust permission management.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
              <div className="flex items-center space-x-2 text-slate-700 font-semibold text-xs">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>AI Security & Biological Pulse Analysis (Planned)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Remote Photoplethysmography (rPPG), facial landmark stability tracking, synthetic mask detection, and live biometric trust scoring.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-deepsea-700 shrink-0" />
              <span>STUN Signaling</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-deepsea-700 shrink-0" />
              <span>Zero Plugins</span>
            </div>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-deepsea-800 hover:bg-deepsea-900 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
