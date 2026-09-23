import React from 'react';
import { AlertTriangle, Camera, Mic, RefreshCw, XCircle } from 'lucide-react';

export default function PermissionModal({ error, onRetry, onExit }) {
  if (!error) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-100 text-center space-y-6">
        
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">
            Device Permission Required
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {error}
          </p>
        </div>

        {/* Required Permissions Checklist */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-3">
          <div className="flex items-center space-x-3 text-sm text-slate-700">
            <div className="w-7 h-7 rounded-lg bg-deepsea-50 flex items-center justify-center text-deepsea-800">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-xs text-slate-900">Camera Access</p>
              <p className="text-[11px] text-slate-500">Required to stream your video feed to the room.</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-sm text-slate-700">
            <div className="w-7 h-7 rounded-lg bg-deepsea-50 flex items-center justify-center text-deepsea-800">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-xs text-slate-900">Microphone Access</p>
              <p className="text-[11px] text-slate-500">Required for two-way audio communication.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            type="button"
            onClick={onExit}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2"
          >
            <XCircle className="w-4 h-4 text-slate-500" />
            <span>Leave Call</span>
          </button>

          <button
            type="button"
            onClick={onRetry}
            className="flex-1 py-2.5 px-4 rounded-xl bg-deepsea-800 hover:bg-deepsea-900 text-white text-sm font-semibold shadow-md shadow-deepsea-800/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>

      </div>
    </div>
  );
}
