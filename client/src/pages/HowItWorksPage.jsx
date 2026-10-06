import React from 'react';
import { 
  KeyRound, 
  Lock, 
  Video, 
  Brain, 
  Sliders, 
  ShieldCheck, 
  ArrowRight, 
  ChevronDown, 
  Layers, 
  Activity, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

export default function HowItWorksPage({ onNavigate }) {
  const steps = [
    {
      step: '01',
      title: 'Room Creation & Authentication',
      desc: 'Create or join a secure room for up to 5 participants using an auto-generated, collision-free room code (e.g. PG-7K4X92). Room capacity is strictly capped at 5.',
      icon: KeyRound,
      badge: 'Active in Platform'
    },
    {
      step: '02',
      title: 'Direct Encrypted WebRTC Connection',
      desc: 'All participants establish encrypted peer-to-peer audio and video mesh transmission mediated through lightweight Socket.IO STUN signaling.',
      icon: Lock,
      badge: 'Active in Platform'
    },
    {
      step: '03',
      title: 'Video Stream Capture & Ingestion',
      desc: 'PulseGuard captures video frames locally in the browser buffer without routing raw video to external cloud servers, maintaining user privacy.',
      icon: Video,
      badge: 'Active in Platform'
    },
    {
      step: '04',
      title: 'AI Multi-Signal Extraction (Planned)',
      desc: 'Independent modular AI pipelines evaluate face presence, landmark micro-movements, temporal consistency, physiological rPPG pulse, and synthetic artifacts.',
      icon: Brain,
      badge: 'AI Security Phase'
    },
    {
      step: '05',
      title: 'Risk Decision Engine (Planned)',
      desc: 'The weighted decision engine aggregates individual anomaly confidence scores into an overall risk level (Secure, Warning, or Critical).',
      icon: Sliders,
      badge: 'AI Security Phase'
    },
    {
      step: '06',
      title: 'Real-Time Security Telemetry (Planned)',
      desc: 'The call interface displays transparent verification badges and liveness status directly to authorized participants during the conversation.',
      icon: ShieldCheck,
      badge: 'AI Security Phase'
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <section className="border-b border-slate-100 bg-slate-50/50 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-deepsea-50 border border-deepsea-200 text-deepsea-800 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5 text-deepsea-700" />
            <span>Process & Verification Workflow</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-deepsea-900 tracking-tight">
            How PulseGuard AI Works
          </h1>
          <p className="text-slate-600 text-base max-w-2xl mx-auto leading-relaxed">
            Understanding the end-to-end flow from encrypted WebRTC connection to modular AI security analysis.
          </p>
        </div>
      </section>

      {/* Step by Step Flow */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              const isActive = item.badge === 'Active in Platform';
              return (
                <div 
                  key={item.step} 
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between relative group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black font-mono text-deepsea-300 group-hover:text-deepsea-800 transition-colors">
                        {item.step}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isActive 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-deepsea-50 text-deepsea-700 border-deepsea-200'
                      }`}>
                        {item.badge}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-deepsea-50 border border-deepsea-100 flex items-center justify-center text-deepsea-800 mb-3">
                      <Icon className="w-5 h-5" />
                    </div>

                    <h3 className="text-base font-bold text-deepsea-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center text-[11px] font-medium text-slate-400">
                    <span>Stage {idx + 1} of 6</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architectural Flow Diagram Card */}
      <section className="bg-slate-50 border-t border-slate-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl font-bold text-deepsea-900">
              System Architecture Flow
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Visual overview of data flow from user hardware up to real-time security reporting.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-deepsea-800 text-white flex items-center justify-center mx-auto text-xs font-bold">1</div>
                <h4 className="text-xs font-bold text-slate-800">Browser Media</h4>
                <p className="text-[11px] text-slate-500 leading-snug">Webcam & Mic capture with local device permission validation.</p>
              </div>

              <div className="p-4 rounded-xl bg-deepsea-50 border border-deepsea-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-deepsea-800 text-white flex items-center justify-center mx-auto text-xs font-bold">2</div>
                <h4 className="text-xs font-bold text-deepsea-900">WebRTC Peer Connection</h4>
                <p className="text-[11px] text-slate-600 leading-snug">Real-time P2P transport with STUN signaling on Socket.IO.</p>
              </div>

              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center mx-auto text-xs font-bold">3</div>
                <h4 className="text-xs font-bold text-sky-950">Modular Security Panel</h4>
                <p className="text-[11px] text-sky-800 leading-snug">Liveness, deepfake, and rPPG analysis pipelines (Phase 2 ready).</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 flex items-start space-x-3">
              <Sparkles className="w-4 h-4 text-deepsea-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">Privacy & Performance Guarantee: </span>
                Video and audio streams are exchanged directly between participants. No video frames are sent to third-party databases.
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => onNavigate('home')}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-deepsea-800 hover:bg-deepsea-900 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <span>Launch Secure Room Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
