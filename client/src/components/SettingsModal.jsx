import React, { useState, useEffect } from 'react';
import { X, Camera, Mic, CheckCircle2, RefreshCw } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const [devices, setDevices] = useState({ video: [], audio: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDevices();
    }
  }, [isOpen]);

  const loadDevices = async () => {
    setLoading(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devList = await navigator.mediaDevices.enumerateDevices();
        const video = devList.filter((d) => d.kind === 'videoinput');
        const audio = devList.filter((d) => d.kind === 'audioinput');
        setDevices({ video, audio });
      }
    } catch (err) {
      console.warn('Failed to enumerate devices:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-deepsea-900">Device Settings</h3>
          <button
            onClick={loadDevices}
            disabled={loading}
            className="text-xs text-deepsea-700 hover:text-deepsea-900 flex items-center space-x-1 font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Scan Devices</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Camera devices */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-2">
              <Camera className="w-4 h-4 text-deepsea-800" />
              <span>Camera Devices ({devices.video.length})</span>
            </label>
            <div className="space-y-1.5">
              {devices.video.length > 0 ? (
                devices.video.map((dev, idx) => (
                  <div
                    key={dev.deviceId || idx}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 flex items-center justify-between"
                  >
                    <span className="truncate">{dev.label || `Camera ${idx + 1}`}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                  </div>
                ))
              ) : (
                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 italic">
                  No camera devices found or permission not yet granted.
                </div>
              )}
            </div>
          </div>

          {/* Microphone devices */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-2">
              <Mic className="w-4 h-4 text-deepsea-800" />
              <span>Microphone Devices ({devices.audio.length})</span>
            </label>
            <div className="space-y-1.5">
              {devices.audio.length > 0 ? (
                devices.audio.map((dev, idx) => (
                  <div
                    key={dev.deviceId || idx}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 flex items-center justify-between"
                  >
                    <span className="truncate">{dev.label || `Microphone ${idx + 1}`}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                  </div>
                ))
              ) : (
                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 italic">
                  No microphone devices found or permission not yet granted.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-deepsea-800 hover:bg-deepsea-900 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
