import React, { useState } from 'react';
import {
  Shield, Video, Users, ArrowRight, Lock, Cpu, Globe,
  Eye, Brain, Activity, CheckCircle, Zap, Copy, Check,
  KeyRound, User, AlertCircle, X, ShieldCheck, Sparkles, ChevronDown
} from 'lucide-react';
import { getSocket } from '../services/socket';

// ─── Create Room Inline Card ──────────────────────────────────────────────────
function CreateRoomCard({ onRoomCreated }) {
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(5);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = (e) => {
    e?.preventDefault();
    const name = userName.trim();
    if (!name) { setError('Please enter your name to continue.'); return; }
    setError('');
    setIsLoading(true);
    const socket = getSocket();
    socket.emit('create-room', { userName: name, maxParticipants }, (res) => {
      setIsLoading(false);
      if (res?.success) { setGeneratedCode(res.roomCode); setStep(2); }
      else setError(res?.message || 'Failed to create room. Please check server connection.');
    });
  };

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(generatedCode); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }
    catch (_) {}
  };

  const reset = () => { setStep(1); setUserName(''); setGeneratedCode(''); setError(''); };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8 flex flex-col h-full">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-deepsea-900 flex items-center justify-center shadow-md">
          <Video className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-deepsea-900">Create Secure Room</h3>
          <p className="text-xs text-slate-500">You will be the Host</p>
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handleContinue} className="space-y-4 flex-1 flex flex-col">
          <div className="flex-1 space-y-4">
            <p className="text-sm text-slate-600">Create a private room and set how many participants can join.</p>
            
            {/* Host Name Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text" value={userName} onChange={e => setUserName(e.target.value)}
                  placeholder="e.g. Dr. Jane Doe" maxLength={40} autoComplete="name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-deepsea-800/20 focus:border-deepsea-800 text-sm text-slate-900 placeholder:text-slate-400 transition-all"
                />
              </div>
            </div>

            {/* Down Arrow Dropdown for Max Participants: 1 to 5 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Maximum Participants</span>
                <span className="text-xs text-deepsea-800 font-bold bg-deepsea-50 px-2 py-0.5 rounded-full border border-deepsea-200">
                  {maxParticipants} People
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Users className="w-4 h-4 text-slate-400" />
                </div>
                <select
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-deepsea-800/20 focus:border-deepsea-800 text-sm text-slate-900 bg-white font-medium appearance-none cursor-pointer"
                >
                  <option value={1}>1 Participant (Solo / Device Test)</option>
                  <option value={2}>2 Participants (1-on-1 Call)</option>
                  <option value={3}>3 Participants</option>
                  <option value={4}>4 Participants</option>
                  <option value={5}>5 Participants (Maximum Allowed)</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Choose the participant limit for this call (1 to 5).
              </p>
            </div>

            {error && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>}
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full py-3 rounded-xl bg-deepsea-800 hover:bg-deepsea-900 text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-md disabled:opacity-50 transition-all cursor-pointer">
            {isLoading ? <span>Generating Code...</span> : <><span>Create Room</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-5 flex-1 flex flex-col">
          <div className="bg-slate-50 border-2 border-dashed border-deepsea-200 rounded-2xl p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-deepsea-700 block mb-1">Room Code</span>
            <div className="font-mono text-2xl font-extrabold text-deepsea-900 tracking-wider">{generatedCode}</div>
            <button onClick={handleCopy}
              className={`mt-3 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${isCopied ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 text-deepsea-800 hover:bg-deepsea-50'}`}>
              {isCopied ? <><Check className="w-3.5 h-3.5" /><span>Copied!</span></> : <><Copy className="w-3.5 h-3.5" /><span>Copy Code</span></>}
            </button>
          </div>
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-xs text-sky-800 flex items-start space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
            <span>Share this code with the other participant to start a secure session.</span>
          </div>
          <div className="flex space-x-2 mt-auto">
            <button onClick={reset} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Back</button>
            <button onClick={() => onRoomCreated({ roomCode: generatedCode, userName: userName.trim(), isHost: true, maxParticipants })}
              className="flex-1 py-2.5 rounded-xl bg-deepsea-800 hover:bg-deepsea-900 text-white text-sm font-semibold flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer">
              <span>Enter Room</span><ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Join Room Inline Card ────────────────────────────────────────────────────
function JoinRoomCard({ onRoomJoined }) {
  const [userName, setUserName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = (e) => {
    e?.preventDefault();
    const name = userName.trim();
    const code = roomCode.trim().toUpperCase();
    if (!name) { setError('Please enter your name.'); return; }
    if (!code) { setError('Please enter the room code.'); return; }
    setError('');
    setIsLoading(true);
    const socket = getSocket();
    socket.emit('join-room', { roomCode: code, userName: name }, (res) => {
      setIsLoading(false);
      if (res?.success) { 
        onRoomJoined({ 
          roomCode: code, 
          userName: name, 
          isHost: false, 
          peer: res.peer,
          maxParticipants: res.maxParticipants || 5
        }); 
      }
      else {
        if (res?.error === 'room_full') setError(res?.message || 'This room is already full (maximum 5 participants).');
        else if (res?.error === 'invalid_code') setError('Invalid room code. Please check and try again.');
        else setError(res?.message || 'Invalid room code. Please check and try again.');
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8 flex flex-col h-full">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center">
          <Users className="w-5 h-5 text-deepsea-800" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-deepsea-900">Join Secure Room</h3>
          <p className="text-xs text-slate-500">Connect as Participant</p>
        </div>
      </div>

      <form onSubmit={handleJoin} className="space-y-4 flex-1 flex flex-col">
        <div className="flex-1 space-y-4">
          <p className="text-sm text-slate-600">Join an existing room using the room code.</p>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <input type="text" value={userName} onChange={e => setUserName(e.target.value)}
                placeholder="e.g. Alex Smith" maxLength={40} autoComplete="name"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-deepsea-800/20 focus:border-deepsea-800 text-sm placeholder:text-slate-400 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Room Code</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <KeyRound className="w-4 h-4 text-slate-400" />
              </div>
              <input type="text" value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g. PG-7K4X92" maxLength={10}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-deepsea-800/20 focus:border-deepsea-800 text-sm font-mono uppercase tracking-wider placeholder:text-slate-400 transition-all" />
            </div>
          </div>
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="text-xs text-rose-700 font-semibold">{error}</span>
            </div>
          )}
        </div>
        <button type="submit" disabled={isLoading}
          className="w-full py-3 rounded-xl bg-white border-2 border-deepsea-800 text-deepsea-800 hover:bg-deepsea-50 font-semibold text-sm flex items-center justify-center space-x-2 shadow-xs disabled:opacity-50 transition-all cursor-pointer">
          {isLoading ? <span>Validating...</span> : <span>Join Secure Room</span>}
        </button>
      </form>
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, badge, color = 'deepsea' }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
        color === 'emerald' ? 'bg-emerald-50 border border-emerald-100' :
        color === 'deepsea' ? 'bg-deepsea-50 border border-deepsea-200/60' :
        'bg-slate-50 border border-slate-200'
      }`}>
        <Icon className={`w-6 h-6 ${color === 'emerald' ? 'text-emerald-600' : 'text-deepsea-700'}`} />
      </div>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-bold text-deepsea-900">{title}</h3>
        {badge && (
          <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider bg-deepsea-50 text-deepsea-700 px-2 py-0.5 rounded-full border border-deepsea-200/80 shrink-0">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────
export default function HomePage({ onEnterRoom }) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-deepsea-50 border border-deepsea-200/80 text-deepsea-800 text-xs font-semibold mb-6">
            <Shield className="w-3.5 h-3.5 text-deepsea-700" />
            <span>Academic AI Security Research Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-deepsea-900 tracking-tight max-w-4xl mx-auto leading-tight">
            DeepFake and Liveness{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-deepsea-700 to-sky-600">Detection</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Connect in real time while PulseGuard AI prepares to verify liveness, detect manipulation, and protect video communication.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#secure-room"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-deepsea-800 hover:bg-deepsea-900 text-white font-bold text-sm shadow-lg shadow-deepsea-800/20 flex items-center justify-center space-x-2 transition-all cursor-pointer">
              <Video className="w-4 h-4" />
              <span>Create Secure Room</span>
            </a>
            <a href="#secure-room"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white border-2 border-deepsea-800 text-deepsea-800 hover:bg-deepsea-50 font-bold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer">
              <Users className="w-4 h-4" />
              <span>Join Secure Room</span>
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            {[
              { icon: Lock, text: 'WebRTC P2P Encrypted' },
              { icon: Zap, text: 'Real-Time Communication' },
              { icon: Shield, text: 'AI Security Designed' },
              { icon: Globe, text: 'Up to 5 Participants' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <Icon className="w-3.5 h-3.5 text-deepsea-700" />
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="bg-slate-50/60 py-14 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-deepsea-900">Security-First Architecture</h2>
            <p className="mt-2 text-slate-600 text-sm max-w-xl mx-auto">Real-time communication built on a foundation designed for AI-powered security analysis.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard icon={Video} color="emerald" title="Real-Time Communication"
              description="Live multi-peer video and audio calling for up to 5 participants using WebRTC." />
            <FeatureCard icon={Eye} color="deepsea" title="Liveness Detection"
              badge="Coming Soon"
              description="Designed to analyze whether the participant is genuinely present during the call." />
            <FeatureCard icon={Brain} color="deepsea" title="Deepfake Detection"
              badge="Coming Soon"
              description="Designed to identify potential AI-generated or manipulated video streams." />
            <FeatureCard icon={Activity} color="deepsea" title="Privacy Protection"
              badge="Coming Soon"
              description="Security analysis designed with privacy-conscious processing and consent controls." />
          </div>
        </div>
      </section>

      {/* Secure Room Section */}
      <section id="secure-room" className="bg-white py-14 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-deepsea-900">Start a Secure Session</h2>
            <p className="mt-2 text-slate-600 text-sm max-w-xl mx-auto">Create or join a private room for a real-time video call with up to 5 participants.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CreateRoomCard onRoomCreated={onEnterRoom} />
            <JoinRoomCard onRoomJoined={onEnterRoom} />
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-slate-50/60 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-deepsea-900">Designed For</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              'Secure Interviews', 'Online Examinations', 'Remote Recruitment',
              'Business Meetings', 'Secure Consultations', 'Identity Verification'
            ].map(use => (
              <div key={use} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                <div className="w-8 h-8 rounded-lg bg-deepsea-50 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-4 h-4 text-deepsea-700" />
                </div>
                <p className="text-xs font-semibold text-slate-700">{use}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
