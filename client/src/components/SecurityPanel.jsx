import React, { useState, useEffect } from 'react';
import {
  Shield, Eye, Cpu, Activity, Brain, ChevronDown, ChevronUp,
  X, Server, CheckCircle2, AlertTriangle, Clock, RefreshCw,
  Layers, Lock, Sparkles
} from 'lucide-react';
import { checkBackendHealth } from '../services/api';

/**
 * SecurityPanel — Slideable Right-Side AI Security Panel for Video Calls.
 *
 * Implements Step 2 requirements:
 * 1. Slide-in from right with smooth transition and accessible close trigger.
 * 2. Real Face Detection & 3D Landmark Tracking status from OpenCV & MediaPipe.
 * 3. Human Liveness Assessment (clearly stating liveness is not available yet).
 * 4. Deepfake Detection status (not available yet).
 * 5. Expandable Technical Details with real bounding box and landmark metrics.
 * 6. Overall Assessment explaining that face presence alone does not prove authenticity.
 */
export default function SecurityPanel({
  isOpen = false,
  onClose,
  analysisState = 'inconclusive', // 'analyzing' | 'available' | 'unavailable' | 'inconclusive'
  faceData = null,
  rppgData = null,
  rppgStatus = 'idle', // 'idle' | 'collecting' | 'analyzing' | 'available' | 'unavailable' | 'error'
  lastAnalyzedAt = null,
  isDocked = false
}) {
  const [technicalExpanded, setTechnicalExpanded] = useState(false);
  const [backendState, setBackendState] = useState('checking'); // 'checking' | 'connected' | 'unavailable'

  // Periodic health check
  useEffect(() => {
    let isMounted = true;
    async function verifyBackend() {
      const result = await checkBackendHealth();
      if (!isMounted) return;
      setBackendState(result.available ? 'connected' : 'unavailable');
    }

    verifyBackend();
    const interval = setInterval(verifyBackend, 12000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Keyboard accessibility: ESC closes panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const hasFace = Boolean(faceData && faceData.face_detected && faceData.face_count > 0);
  const faceCount = faceData?.face_count || 0;
  const primaryFace = faceData?.faces?.[0] || null;

  // Analysis State Badge
  const getAnalysisStateBadge = () => {
    if (backendState === 'unavailable') {
      return {
        label: 'Analysis unavailable',
        className: 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900',
        dot: 'bg-rose-500'
      };
    }
    switch (analysisState) {
      case 'analyzing':
        return {
          label: 'Analyzing',
          className: 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900',
          dot: 'bg-blue-500 animate-ping'
        };
      case 'available':
        return {
          label: 'Analysis available',
          className: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
          dot: 'bg-emerald-500'
        };
      case 'inconclusive':
      default:
        return {
          label: 'Inconclusive',
          className: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900',
          dot: 'bg-amber-500'
        };
    }
  };

  const stateBadge = getAnalysisStateBadge();

  return (
    <>
      {/* Mobile Backdrop Overlay (only when not docked side-by-side) */}
      {!isDocked && isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-30 sm:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Security Panel (Docked Column or Floating Drawer) */}
      <aside
        className={
          isDocked
            ? "w-full h-full bg-white dark:bg-slate-900 flex flex-col font-sans select-none overflow-hidden"
            : `fixed inset-y-0 right-0 z-40 w-full sm:w-96 md:w-[420px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out font-sans select-none ${
                isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
              }`
        }
        role="region"
        aria-label="PulseGuard Live Security Analysis Panel"
      >
        {/* Panel Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs sticky top-0 z-10 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-deepsea-900 dark:bg-deepsea-800 flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-deepsea-900 dark:text-white tracking-tight leading-tight">
                PulseGuard AI
              </h2>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Live Security Analysis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close security panel"
            title="Close Panel (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">

          {/* Analysis State & Timestamp Bar */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
            <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${stateBadge.className}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${stateBadge.dot}`} />
              <span>{stateBadge.label}</span>
            </div>

            <div className="flex items-center space-x-1 text-[11px] text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {lastAnalyzedAt ? new Date(lastAnalyzedAt).toLocaleTimeString() : 'Awaiting frames...'}
              </span>
            </div>
          </div>

          {/* Backend Connection Status */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex items-center space-x-2">
              <Server className="w-3.5 h-3.5 text-deepsea-700 dark:text-sky-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">AI Backend (FastAPI):</span>
            </div>
            <div className="flex items-center space-x-1.5 font-semibold text-[11px]">
              {backendState === 'connected' && (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Backend connected.</span>
                </span>
              )}
              {backendState === 'checking' && (
                <span className="text-amber-600 dark:text-amber-400 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Checking connection...</span>
                </span>
              )}
              {backendState === 'unavailable' && (
                <span className="text-rose-600 dark:text-rose-400 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Backend unavailable.</span>
                </span>
              )}
            </div>
          </div>

          {/* Section 1: Human Liveness Assessment */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-deepsea-700 dark:text-sky-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-deepsea-900 dark:text-white">
                  Human Liveness Assessment
                </h3>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                backendState === 'unavailable'
                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400'
                  : hasFace
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400'
              }`}>
                {backendState === 'unavailable'
                  ? 'ANALYSIS UNAVAILABLE'
                  : hasFace
                  ? 'FACE DETECTED'
                  : 'INCONCLUSIVE'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Face Detection Status:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {backendState === 'unavailable' ? 'Unavailable' : hasFace ? `Detected (${faceCount} Face${faceCount > 1 ? 's' : ''})` : 'No face in frame'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Facial Landmarks:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {hasFace && primaryFace ? `${primaryFace.landmark_count} 3D Mesh Points` : 'Tracking inactive'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Liveness Model Status:</span>
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  Liveness analysis is not available yet.
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-300 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <p className="leading-snug">
                <strong>Important:</strong> Face detection confirms facial presence and tracking points, but does <em>not</em> verify physical human liveness.
              </p>
            </div>
          </section>

          {/* Section 2: Remote Photoplethysmography (rPPG) Pulse Estimation */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-deepsea-900 dark:text-white">
                  rPPG Pulse Estimation (PhysNet)
                </h3>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                backendState === 'unavailable'
                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400'
                  : rppgData?.signal_available
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400'
                  : rppgStatus === 'collecting' || rppgStatus === 'analyzing'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400'
              }`}>
                {backendState === 'unavailable'
                  ? 'UNAVAILABLE'
                  : rppgData?.signal_available
                  ? 'AVAILABLE'
                  : rppgStatus === 'collecting'
                  ? 'COLLECTING'
                  : rppgStatus === 'analyzing'
                  ? 'PROCESSING'
                  : 'UNAVAILABLE'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Pulse Signal:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {backendState === 'unavailable'
                    ? 'Unavailable'
                    : rppgData?.signal_available
                    ? 'Available'
                    : rppgStatus === 'analyzing'
                    ? 'Processing 3D-CNN...'
                    : rppgStatus === 'collecting'
                    ? 'Collecting frames...'
                    : rppgData?.status === 'insufficient_data'
                    ? 'Collecting frames...'
                    : 'Unavailable'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Estimated Heart Rate:</span>
                <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-1">
                  {rppgData?.heart_rate_bpm ? (
                    <>
                      <span className="text-sm text-rose-600 dark:text-rose-400">{rppgData.heart_rate_bpm}</span>
                      <span className="text-[10px] text-slate-500">BPM</span>
                    </>
                  ) : (
                    <span className="font-normal text-slate-400 dark:text-slate-500">Not Available</span>
                  )}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Signal Quality:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                  {rppgData?.signal_quality && rppgData.signal_quality !== 'unavailable'
                    ? `${rppgData.signal_quality} ${rppgData.snr_db !== null ? `(${rppgData.snr_db} dB SNR)` : ''}`
                    : 'Insufficient Data'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Analysis Status:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                  {rppgStatus === 'analyzing'
                    ? 'Processing'
                    : rppgStatus === 'collecting'
                    ? 'Collecting sequence'
                    : rppgData?.status === 'success'
                    ? (rppgData.signal_available ? 'Completed (Pulse detected)' : 'Completed (Evaluating)')
                    : rppgData?.status === 'insufficient_data'
                    ? 'Collecting sequence'
                    : rppgStatus === 'error'
                    ? 'Error'
                    : 'Awaiting frames'}
                </span>
              </div>

              {rppgData?.message && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-0.5">
                  {rppgData.message}
                </div>
              )}
            </div>

            {/* Micro Waveform Preview if available */}
            {rppgData?.waveform && rppgData.waveform.length > 0 && (
              <div className="pt-1">
                <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                  <span>Normalized BVP Waveform (PhysNet)</span>
                  <span>{rppgData.frames_processed} Frames</span>
                </div>
                <div className="h-8 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg p-1 flex items-end justify-between space-x-0.5 overflow-hidden">
                  {rppgData.waveform.map((val, idx) => {
                    // scale val (approx -2 to +2) to height percentage
                    const clamped = Math.max(-2, Math.min(2, val));
                    const heightPct = Math.round(((clamped + 2) / 4) * 100);
                    return (
                      <div
                        key={idx}
                        className="flex-1 bg-rose-400/80 rounded-xs transition-all duration-150"
                        style={{ height: `${Math.max(10, heightPct)}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
              <strong>Scientific Limitation:</strong> An unavailable pulse signal does not mean the participant is fake, and an estimated pulse alone does not prove the participant is real.
            </div>
          </section>

          {/* Section 2: Deepfake Detection */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-deepsea-700 dark:text-sky-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-deepsea-900 dark:text-white">
                  Deepfake Detection
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                INCONCLUSIVE
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Detector Availability:</span>
                <span className="font-semibold text-slate-500 dark:text-slate-400">Not available yet</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">CNN Model Status:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Deepfake detection is not available yet.
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
              Pretrained CNN inference is scheduled for Step 4. Zero fabricated risk scores are displayed.
            </p>
          </section>

          {/* Section 3: Technical Details (Expandable) */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setTechnicalExpanded(!technicalExpanded)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-deepsea-700 dark:text-sky-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-deepsea-900 dark:text-white">
                  Technical Details
                </h3>
              </div>
              {technicalExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {technicalExpanded && (
              <div className="px-4 pb-4 pt-1 space-y-3 text-xs border-t border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Face Detection (OpenCV & MediaPipe):</h4>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                    <p>Status: {faceData ? faceData.status : 'Awaiting data'}</p>
                    <p>Detected Faces: {faceCount}</p>
                    {primaryFace?.bounding_box && (
                      <p>
                        Bounding Box: x={primaryFace.bounding_box.x}, y={primaryFace.bounding_box.y},
                        w={primaryFace.bounding_box.width}, h={primaryFace.bounding_box.height}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Facial Landmark Mesh:</h4>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                    <p>Mesh Model: MediaPipe Tasks FaceLandmarker</p>
                    <p>Tracked Landmarks: {primaryFace?.landmark_count || 0} 3D coordinates</p>
                    {primaryFace?.key_regions?.forehead && (
                      <p>Forehead ROI: x={primaryFace.key_regions.forehead.x}, y={primaryFace.key_regions.forehead.y}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1 pt-1 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">rPPG Model (PhysNet):</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {rppgData?.signal_available
                        ? `${rppgData.heart_rate_bpm || '--'} BPM (${rppgData.signal_quality})`
                        : rppgStatus === 'collecting'
                        ? 'Collecting buffer...'
                        : 'Active / Waiting frames'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Deepfake CNN:</span>
                    <span className="text-slate-400 italic">Not available yet.</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Temporal Analysis:</span>
                    <span className="text-slate-400 italic">Not available yet.</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Risk Assessment:</span>
                    <span className="text-slate-400 italic">Not fully implemented yet.</span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Section 4: Overall Assessment */}
          <section className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-deepsea-900 dark:text-white">
                Overall Assessment
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600">
                INCONCLUSIVE
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>Insufficient analysis data to assess authenticity.</strong>
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Detecting a face verifies camera visibility and landmark geometry, but does not prove genuine identity or lack of video manipulation. Full verification will be unlocked upon completing the rPPG and deepfake CNN stages.
            </p>
          </section>

        </div>
      </aside>
    </>
  );
}
