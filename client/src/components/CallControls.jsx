import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

export default function CallControls({
  isMuted,
  isCameraOff,
  onToggleMicrophone,
  onToggleCamera,
  onEndCall
}) {
  return (
    <div className="flex items-center justify-center space-x-4 bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-2xl shadow-call-controls border border-slate-200/90 z-20">
      
      {/* Microphone Control */}
      <button
        type="button"
        onClick={onToggleMicrophone}
        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xs cursor-pointer ${
          isMuted
            ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            : 'bg-deepsea-50 text-deepsea-900 border border-deepsea-200/80 hover:bg-deepsea-100'
        }`}
        title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
      >
        {isMuted ? (
          <>
            <MicOff className="w-5 h-5 text-rose-600" />
            <span>Unmute</span>
          </>
        ) : (
          <>
            <Mic className="w-5 h-5 text-deepsea-800" />
            <span>Mute</span>
          </>
        )}
      </button>

      {/* Camera Control */}
      <button
        type="button"
        onClick={onToggleCamera}
        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xs cursor-pointer ${
          isCameraOff
            ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
            : 'bg-deepsea-50 text-deepsea-900 border border-deepsea-200/80 hover:bg-deepsea-100'
        }`}
        title={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
      >
        {isCameraOff ? (
          <>
            <VideoOff className="w-5 h-5 text-amber-600" />
            <span>Camera On</span>
          </>
        ) : (
          <>
            <Video className="w-5 h-5 text-deepsea-800" />
            <span>Camera Off</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="h-6 w-px bg-slate-200 mx-1" />

      {/* End Call Control */}
      <button
        type="button"
        onClick={onEndCall}
        className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-600/20 transition-all cursor-pointer"
        title="End the current call"
      >
        <PhoneOff className="w-5 h-5" />
        <span>End Call</span>
      </button>

    </div>
  );
}
