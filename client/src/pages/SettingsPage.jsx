import React, { useState, useEffect } from 'react';
import { 
  User, 
  Camera, 
  Mic, 
  Volume2, 
  Shield, 
  Lock, 
  Eye, 
  Sun, 
  Moon, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sliders 
} from 'lucide-react';

export default function SettingsPage() {
  // Profile state
  const [profileName, setProfileName] = useState(() => localStorage.getItem('pg_user_name') || 'Guest User');
  const [roleTitle, setRoleTitle] = useState(() => localStorage.getItem('pg_user_role') || 'Candidate / Participant');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Hardware devices
  const [devices, setDevices] = useState({ video: [], audioIn: [], audioOut: [] });
  const [selectedVideo, setSelectedVideo] = useState('');
  const [selectedAudioIn, setSelectedAudioIn] = useState('');
  const [selectedAudioOut, setSelectedAudioOut] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Permissions state
  const [cameraPerm, setCameraPerm] = useState('checking');
  const [micPerm, setMicPerm] = useState('checking');

  // Privacy & Consent
  const [aiConsent, setAiConsent] = useState(true);
  const [rppgConsent, setRppgConsent] = useState(true);

  // Security preferences
  const [strictThreshold, setStrictThreshold] = useState(false);
  const [alertOnSuspicious, setAlertOnSuspicious] = useState(true);

  // Scan hardware devices
  const scanDevices = async () => {
    setIsScanning(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const allDevs = await navigator.mediaDevices.enumerateDevices();
        const video = allDevs.filter(d => d.kind === 'videoinput');
        const audioIn = allDevs.filter(d => d.kind === 'audioinput');
        const audioOut = allDevs.filter(d => d.kind === 'audiooutput');

        setDevices({ video, audioIn, audioOut });

        if (video.length > 0 && !selectedVideo) setSelectedVideo(video[0].deviceId);
        if (audioIn.length > 0 && !selectedAudioIn) setSelectedAudioIn(audioIn[0].deviceId);
        if (audioOut.length > 0 && !selectedAudioOut) setSelectedAudioOut(audioOut[0].deviceId);
      }

      // Check permission query if supported
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const camQuery = await navigator.permissions.query({ name: 'camera' });
          setCameraPerm(camQuery.state);
        } catch (_) {
          setCameraPerm('prompt');
        }
        try {
          const micQuery = await navigator.permissions.query({ name: 'microphone' });
          setMicPerm(micQuery.state);
        } catch (_) {
          setMicPerm('prompt');
        }
      } else {
        setCameraPerm('unknown');
        setMicPerm('unknown');
      }
    } catch (err) {
      console.warn('Device scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    scanDevices();
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem('pg_user_name', profileName);
    localStorage.setItem('pg_user_role', roleTitle);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <section className="border-b border-slate-100 bg-slate-50/50 py-10 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-deepsea-900 text-white flex items-center justify-center shadow-md">
              <Sliders className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-deepsea-900">Platform Settings</h1>
              <p className="text-xs text-slate-500 font-medium">Configure devices, privacy, and security parameters.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Settings Sections */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* 1. Profile Section */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-deepsea-700" />
            <h2 className="text-base font-bold text-deepsea-900">Profile Information</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Default Display Name</label>
              <input
                type="text"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                maxLength={40}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-deepsea-800/20 focus:border-deepsea-800 font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Professional Role / Title</label>
              <input
                type="text"
                value={roleTitle}
                onChange={e => setRoleTitle(e.target.value)}
                maxLength={60}
                placeholder="e.g. Candidate, Lead Researcher, Examiner"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-deepsea-800/20 focus:border-deepsea-800 font-medium text-slate-900"
              />
            </div>

            <div className="flex items-center space-x-3 pt-1">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-deepsea-800 hover:bg-deepsea-900 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                Save Profile
              </button>
              {savedSuccess && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile updated!</span>
                </span>
              )}
            </div>
          </form>
        </section>

        {/* 2. Communication & Hardware Section */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-deepsea-700" />
              <h2 className="text-base font-bold text-deepsea-900">Communication & Media Devices</h2>
            </div>
            <button
              onClick={scanDevices}
              disabled={isScanning}
              className="text-xs text-deepsea-700 hover:text-deepsea-900 flex items-center space-x-1 font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>Refresh Devices</span>
            </button>
          </div>

          <div className="space-y-4 max-w-xl">
            {/* Camera */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                <Camera className="w-3.5 h-3.5 text-deepsea-700" />
                <span>Camera Device ({devices.video.length} detected)</span>
              </label>
              <select
                value={selectedVideo}
                onChange={e => setSelectedVideo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-deepsea-800/20"
              >
                {devices.video.length > 0 ? (
                  devices.video.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Camera ${i + 1}`}
                    </option>
                  ))
                ) : (
                  <option value="">Default System Camera</option>
                )}
              </select>
            </div>

            {/* Microphone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                <Mic className="w-3.5 h-3.5 text-deepsea-700" />
                <span>Microphone Device ({devices.audioIn.length} detected)</span>
              </label>
              <select
                value={selectedAudioIn}
                onChange={e => setSelectedAudioIn(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-deepsea-800/20"
              >
                {devices.audioIn.length > 0 ? (
                  devices.audioIn.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Microphone ${i + 1}`}
                    </option>
                  ))
                ) : (
                  <option value="">Default System Microphone</option>
                )}
              </select>
            </div>

            {/* Speaker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                <Volume2 className="w-3.5 h-3.5 text-deepsea-700" />
                <span>Audio Output / Speaker ({devices.audioOut.length} detected)</span>
              </label>
              <select
                value={selectedAudioOut}
                onChange={e => setSelectedAudioOut(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-deepsea-800/20"
              >
                {devices.audioOut.length > 0 ? (
                  devices.audioOut.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Speaker ${i + 1}`}
                    </option>
                  ))
                ) : (
                  <option value="">Default System Speaker</option>
                )}
              </select>
            </div>
          </div>
        </section>

        {/* 3. Privacy & Permission Status */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Lock className="w-5 h-5 text-deepsea-700" />
            <h2 className="text-base font-bold text-deepsea-900">Privacy & Permissions</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Camera Permission</p>
                <p className="text-[11px] text-slate-500">Required for local video streaming.</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase text-[10px] ${
                cameraPerm === 'granted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {cameraPerm}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Microphone Permission</p>
                <p className="text-[11px] text-slate-500">Required for two-way audio.</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase text-[10px] ${
                micPerm === 'granted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {micPerm}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={aiConsent}
                onChange={e => setAiConsent(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-deepsea-800 focus:ring-deepsea-800"
              />
              <div>
                <p className="text-xs font-semibold text-slate-800">Consent for AI Security Analysis (Future Modules)</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Allow local in-browser algorithms to inspect facial cues and temporal frames for manipulation indicators. No raw frames are stored externally.
                </p>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={rppgConsent}
                onChange={e => setRppgConsent(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-deepsea-800 focus:ring-deepsea-800"
              />
              <div>
                <p className="text-xs font-semibold text-slate-800">Consent for rPPG Biological Pulse Estimation</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Allow biometric optical pulse estimation from subtle skin color variations during verification calls.
                </p>
              </div>
            </label>
          </div>
        </section>

        {/* 4. Security Preferences */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Shield className="w-5 h-5 text-deepsea-700" />
            <h2 className="text-base font-bold text-deepsea-900">Security Preferences</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <p className="text-xs font-semibold text-slate-800">Strict Detection Sensitivity</p>
                <p className="text-[11px] text-slate-500">Applies higher sensitivity thresholds for high-stakes interviews or online examinations.</p>
              </div>
              <input
                type="checkbox"
                checked={strictThreshold}
                onChange={e => setStrictThreshold(e.target.checked)}
                className="rounded border-slate-300 text-deepsea-800 focus:ring-deepsea-800"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <p className="text-xs font-semibold text-slate-800">Real-Time Anomaly Notifications</p>
                <p className="text-[11px] text-slate-500">Show subtle visual warning badge in the call header if face consistency falls below confidence threshold.</p>
              </div>
              <input
                type="checkbox"
                checked={alertOnSuspicious}
                onChange={e => setAlertOnSuspicious(e.target.checked)}
                className="rounded border-slate-300 text-deepsea-800 focus:ring-deepsea-800"
              />
            </div>
          </div>
        </section>

        {/* 5. Appearance */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Sun className="w-5 h-5 text-deepsea-700" />
            <h2 className="text-base font-bold text-deepsea-900">Appearance & Theme</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <button
              type="button"
              className="p-3 rounded-xl border-2 border-deepsea-800 bg-white text-deepsea-900 text-xs font-bold flex items-center justify-center space-x-2 shadow-xs"
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Light Mode (Active)</span>
            </button>

            <button
              type="button"
              disabled
              title="Dark Mode is planned for future releases"
              className="p-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-xs font-medium flex items-center justify-center space-x-2 cursor-not-allowed opacity-70"
            >
              <Moon className="w-4 h-4" />
              <span>Dark Mode (Coming)</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            PulseGuard AI currently defaults to the high-contrast academic security theme: Pure White canvas with Deep Sea Blue accents.
          </p>
        </section>

      </div>
    </div>
  );
}
