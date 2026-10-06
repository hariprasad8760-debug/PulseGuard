import React from 'react';
import { Shield, Eye, RefreshCw, AlertTriangle, Cpu, Activity, ChevronRight } from 'lucide-react';

const threats = [
  {
    icon: Eye,
    title: 'Face Replay Attack',
    description: 'A face replay attack involves presenting a pre-recorded video or photograph of a legitimate user to bypass video verification. PulseGuard AI is being designed to detect temporal and motion inconsistencies that indicate replay.',
    technical: 'Motion analysis, optical flow, blinking detection',
  },
  {
    icon: RefreshCw,
    title: 'Face Swap / Deepfake',
    description: 'Face-swap deepfakes use generative AI models to overlay one person\'s face onto another\'s video in real time. PulseGuard AI is being designed to identify blending artifacts, edge boundaries, and facial landmark anomalies.',
    technical: 'CNN-based artifact detection, temporal consistency scoring',
  },
  {
    icon: Cpu,
    title: 'AI Avatar / Synthetic Face',
    description: 'Fully AI-generated faces (GAN or diffusion-based) that have never existed can be used to impersonate individuals. PulseGuard AI is designed to detect frequency-domain artifacts common in synthetic generation.',
    technical: 'Frequency analysis, GAN artifact classification',
  },
  {
    icon: AlertTriangle,
    title: 'Video Manipulation',
    description: 'Real-time video stream manipulation through filters, virtual backgrounds, or post-processing can conceal identity. PulseGuard AI will analyze visual consistency and natural lighting coherence.',
    technical: 'Lighting analysis, background segmentation consistency',
  },
  {
    icon: Shield,
    title: 'Presentation Attack (Spoof)',
    description: 'Presentation attacks involve using a physical artifact — printed photograph, screen display, or 3D mask — to spoof a live participant. Liveness analysis in PulseGuard AI will target these attack vectors.',
    technical: 'Texture analysis, 3D depth cues, micro-movement detection',
  },
  {
    icon: Activity,
    title: 'Physiological Verification',
    description: 'Remote Photoplethysmography (rPPG) measures subtle skin color changes caused by blood flow and heartbeat — visible only in genuine live faces. Absence of a detectable physiological signal can indicate a spoofed participant.',
    technical: 'rPPG (CHROM/POS algorithm), heart rate estimation',
  },
];

export default function SecurityPage() {
  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <section className="border-b border-slate-100 bg-slate-50/50 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-deepsea-50 border border-deepsea-200 text-deepsea-800 text-xs font-semibold mb-5">
            <Shield className="w-3.5 h-3.5" />
            <span>Security Threat Analysis</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-deepsea-900 mb-4">What PulseGuard AI Protects Against</h1>
          <p className="text-slate-600 text-base max-w-2xl mx-auto leading-relaxed">
            PulseGuard AI is designed as a multi-layered security analysis platform. The following threat categories are being addressed through ongoing AI research and development.
          </p>
          <div className="mt-5 inline-flex items-center space-x-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>These are capabilities under development — not guarantees of detection accuracy.</span>
          </div>
        </div>
      </section>

      {/* Threat Cards */}
      <section className="py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {threats.map((threat) => {
              const Icon = threat.icon;
              return (
                <div key={threat.title} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-deepsea-50 border border-deepsea-200/60 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-deepsea-700" />
                  </div>
                  <h3 className="text-base font-bold text-deepsea-900 mb-2">{threat.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed flex-1">{threat.description}</p>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-start space-x-2">
                      <Cpu className="w-3.5 h-3.5 text-deepsea-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-500 font-medium">{threat.technical}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Pipeline Preview */}
      <section className="bg-slate-50 border-t border-slate-100 py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-deepsea-900 mb-3">Analysis Pipeline Architecture</h2>
          <p className="text-slate-600 text-sm mb-8 max-w-xl mx-auto">The planned AI analysis pipeline processes participant video through multiple sequential stages.</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              'Face Detection', 'Face Tracking', 'Facial Landmarks',
              'Liveness Detection', 'Facial Behavior', 'rPPG Analysis',
              'Deepfake Detection', 'Temporal Consistency', 'Risk Decision Engine'
            ].map((step, i, arr) => (
              <React.Fragment key={step}>
                <div className="bg-white border border-deepsea-200 text-deepsea-800 text-xs font-semibold px-3 py-2 rounded-xl shadow-xs">
                  {step}
                </div>
                {i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
          <p className="mt-6 text-xs text-slate-400">This pipeline is under active development. No AI analysis is currently active during calls.</p>
        </div>
      </section>
    </div>
  );
}
