import React from 'react';
import { 
  Shield, 
  Cpu, 
  Eye, 
  Activity, 
  Lock, 
  GraduationCap, 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  ChevronRight,
  FileCheck2,
  Layers,
  Brain,
  Video
} from 'lucide-react';

const threats = [
  {
    icon: Eye,
    title: 'Face Replay Attack',
    description: 'A face replay attack involves presenting a pre-recorded video or photograph of a legitimate user to bypass video verification. PulseGuard AI is designed to detect temporal and motion inconsistencies that indicate replay.',
    technical: 'Motion analysis, optical flow, blinking & micro-movement detection',
  },
  {
    icon: RefreshCw,
    title: 'Face Swap / Deepfake',
    description: 'Face-swap deepfakes use generative AI models to overlay one person\'s face onto another\'s video in real time. PulseGuard AI identifies blending artifacts, edge boundaries, and facial landmark anomalies.',
    technical: 'CNN-based artifact detection, temporal consistency scoring',
  },
  {
    icon: Cpu,
    title: 'AI Avatar / Synthetic Face',
    description: 'Fully AI-generated faces (GAN or diffusion-based) that have never existed can be used to impersonate individuals. PulseGuard AI inspects frequency-domain artifacts common in synthetic generation.',
    technical: 'Frequency analysis, GAN artifact classification',
  },
  {
    icon: AlertTriangle,
    title: 'Video Manipulation',
    description: 'Real-time video stream manipulation through filters, virtual backgrounds, or post-processing can conceal identity. PulseGuard AI analyzes visual consistency and natural lighting coherence.',
    technical: 'Lighting analysis, background segmentation consistency',
  },
  {
    icon: Shield,
    title: 'Presentation Attack (Spoof)',
    description: 'Presentation attacks involve using a physical artifact — printed photograph, screen display, or 3D mask — to spoof a live participant. Liveness analysis in PulseGuard AI targets these physical attack vectors.',
    technical: 'Texture analysis, 3D depth cues, micro-movement detection',
  },
  {
    icon: Activity,
    title: 'Physiological Verification',
    description: 'Remote Photoplethysmography (rPPG) measures subtle skin color changes caused by blood flow and heartbeat — visible only in genuine live human faces. Absence of a physiological signal indicates a non-live participant.',
    technical: 'rPPG (CHROM/POS algorithm), heart rate estimation',
  },
];

const techAreas = [
  { title: 'WebRTC', desc: 'Real-time peer-to-peer browser video and audio transport with ultra-low latency.', category: 'Communication' },
  { title: 'Real-Time Communication', desc: 'Socket.IO event-driven signaling for rapid room matching and multi-peer SDP handshake.', category: 'Communication' },
  { title: 'Computer Vision', desc: 'Frame preprocessing, region-of-interest segmentation, and dynamic lighting normalization.', category: 'Vision' },
  { title: 'Deep Learning', desc: 'Neural network architectures for synthetic facial boundary and temporal artifact detection.', category: 'AI Models' },
  { title: 'Face Liveness', desc: 'Passive and active presentation attack detection (PAD) against print and replay spoofing.', category: 'Security' },
  { title: 'Deepfake Detection', desc: 'Detection of face-swapped, morphed, or GAN/diffusion synthesized facial video streams.', category: 'Security' },
  { title: 'rPPG Biometrics', desc: 'Remote photoplethysmography estimating blood volume pulse from facial pixel fluctuations.', category: 'Biometrics' },
  { title: 'Artificial Intelligence', desc: 'Multi-signal ensemble risk scoring engine computing holistic participant integrity.', category: 'AI Models' }
];

const pipelineSteps = [
  'Face Detection', 
  'Face Tracking', 
  'Facial Landmarks',
  'Liveness Detection', 
  'Facial Behavior', 
  'rPPG Analysis',
  'Deepfake Detection', 
  'Temporal Consistency', 
  'Risk Decision Engine'
];

export default function AboutPage() {
  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 transition-colors duration-200">
      {/* Header */}
      <section className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-deepsea-50 dark:bg-slate-800 border border-deepsea-200 dark:border-slate-700 text-deepsea-800 dark:text-sky-300 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5 text-deepsea-700 dark:text-sky-400" />
            <span>Academic AI Security Research Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-deepsea-900 dark:text-white tracking-tight">
            About PulseGuard AI
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-base max-w-2xl mx-auto leading-relaxed">
            A secure real-time communication platform combining high-performance multi-participant WebRTC calling with next-generation AI-based liveness, physiological, and deepfake verification.
          </p>
        </div>
      </section>

      {/* Mission & Purpose */}
      <section className="py-14 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-4">
            <div className="flex items-center space-x-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-deepsea-900 dark:bg-deepsea-800 text-white flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-deepsea-900 dark:text-white">Project Mission & Objectives</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Securing Remote Real-Time Interactions</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              With the rapid proliferation of real-time synthetic media, face swaps, and identity replay exploits, conventional video conferencing platforms are increasingly susceptible to social engineering, remote exam cheating, and recruitment impersonation.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>PulseGuard AI</strong> addresses this challenge through an academic security architecture. The platform supports encrypted video calls (for up to 5 participants), featuring active speaker priority, moveable user previews, and a modular architecture engineered to host multi-modal AI detection modules that inspect visual and biological cues in real time.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs font-medium text-deepsea-700 dark:text-sky-300">
              <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span>Engineered for privacy, zero cloud video retention, and low-latency client-side validation.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Security Threat Analysis (Integrated Security Details Content) */}
      <section className="py-16 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800" id="security-details">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-deepsea-50 dark:bg-slate-800 border border-deepsea-200 dark:border-slate-700 text-deepsea-800 dark:text-sky-300 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-deepsea-700 dark:text-sky-400" />
              <span>Security Threat Analysis</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-deepsea-900 dark:text-white">
              What PulseGuard AI Protects Against
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              PulseGuard AI is engineered as a multi-layered defense system. The following primary threat vectors are analyzed through our modular security pipelines.
            </p>
            <div className="inline-flex items-center space-x-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 px-4 py-1.5 rounded-xl">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>These capabilities are under ongoing development — presented for research and verification.</span>
            </div>
          </div>

          {/* 6 Threat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {threats.map((threat) => {
              const Icon = threat.icon;
              return (
                <div 
                  key={threat.title} 
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-deepsea-50 dark:bg-slate-800 border border-deepsea-200/60 dark:border-slate-700 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-deepsea-700 dark:text-sky-400" />
                    </div>
                    <h3 className="text-base font-bold text-deepsea-900 dark:text-white mb-2">{threat.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{threat.description}</p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-start space-x-2">
                    <Cpu className="w-3.5 h-3.5 text-deepsea-600 dark:text-sky-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{threat.technical}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Pipeline Architecture (Integrated Security Details Content) */}
      <section className="py-16 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-deepsea-900 dark:text-white">
              AI Analysis Pipeline Architecture
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Incoming video frames pass through a disciplined multi-stage inspection pipeline to evaluate authenticity.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {pipelineSteps.map((step, i) => (
                <React.Fragment key={step}>
                  <div className="bg-white dark:bg-slate-800 border border-deepsea-200 dark:border-slate-700 text-deepsea-900 dark:text-sky-300 text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow-xs">
                    {step}
                  </div>
                  {i < pipelineSteps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
                  )}
                </React.Fragment>
              ))}
            </div>
            <p className="mt-6 text-xs text-slate-400">
              Modular contracts are exposed in <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-700 dark:text-slate-300">src/ai/</code> ready for seamless model integration.
            </p>
          </div>
        </div>
      </section>

      {/* Core Technology Domains */}
      <section className="py-16 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-deepsea-900 dark:text-white">Core Technology Domains</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Interdisciplinary fields powering PulseGuard AI.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {techAreas.map((tech) => (
              <div key={tech.title} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:border-deepsea-300 dark:hover:border-sky-500 transition-colors">
                <span className="text-[10px] uppercase font-bold text-deepsea-700 dark:text-sky-400 bg-deepsea-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-deepsea-100 dark:border-slate-700">
                  {tech.category}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2.5 mb-1">{tech.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{tech.desc}</p>
              </div>
            ))}
          </div>

          {/* Development Status Disclosure */}
          <div className="bg-sky-50/80 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 rounded-2xl p-6 space-y-2">
            <div className="flex items-center space-x-2 text-sky-950 dark:text-sky-300 font-bold text-sm">
              <FileCheck2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Development Stage Disclosure</span>
            </div>
            <p className="text-xs text-sky-800 dark:text-sky-300 leading-relaxed">
              The communication platform (Mesh WebRTC video calling up to 5 people, Socket.IO signaling, room management, moveable user preview, and call controls) is active and functional. The deepfake, rPPG, and liveness algorithms are in modular research phases and will be integrated into the live stream pipeline in the next phase.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
