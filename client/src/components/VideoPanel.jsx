import React, { useEffect, useRef } from 'react';
import { MicOff, VideoOff, User } from 'lucide-react';

export default function VideoPanel({
  stream,
  name,
  isLocal = false,
  isMuted = false,
  isCameraOff = false,
  isWaiting = false,
  statusLabel
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasActiveVideo = stream && stream.getVideoTracks().length > 0 && !isCameraOff && !isWaiting;

  return (
    <div className="relative w-full h-full min-h-[320px] sm:min-h-[420px] bg-slate-900 rounded-2xl overflow-hidden shadow-card border border-slate-800 flex items-center justify-center group">
      
      {/* Actual Live Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Always mute local video element to avoid audio feedback loops
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLocal ? 'mirror-video' : ''
        } ${hasActiveVideo ? 'opacity-100' : 'opacity-0 absolute'}`}
      />

      {/* Camera Off / Waiting Placeholder Screen */}
      {!hasActiveVideo && (
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-4 select-none">
          <div className="w-24 h-24 rounded-full bg-deepsea-800/80 border-2 border-deepsea-700/50 flex items-center justify-center text-white shadow-xl">
            {isCameraOff ? (
              <VideoOff className="w-10 h-10 text-rose-400" />
            ) : (
              <User className="w-12 h-12 text-slate-300" />
            )}
          </div>
          <div className="space-y-1">
            <h4 className="text-white text-lg font-semibold tracking-wide">
              {name || (isLocal ? 'You' : 'Remote Participant')}
            </h4>
            <p className="text-xs text-slate-400 font-medium">
              {isWaiting
                ? 'Waiting for participant to connect...'
                : isCameraOff
                ? 'Camera is turned off'
                : 'No incoming video feed'}
            </p>
          </div>
        </div>
      )}

      {/* Top Overlay: Name & Role Badge */}
      <div className="absolute top-4 left-4 flex items-center space-x-2 z-10">
        <div className="bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center space-x-2 text-white text-xs font-semibold shadow-md">
          <span className="truncate max-w-[150px]">{name || (isLocal ? 'You' : 'Remote Participant')}</span>
          {isLocal && (
            <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/50">
              You
            </span>
          )}
        </div>
        {statusLabel && (
          <div className="bg-deepsea-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 text-slate-300 text-xs font-medium">
            {statusLabel}
          </div>
        )}
      </div>

      {/* Top Right Overlay: Indicators (e.g. Muted badge) */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
        {isMuted && (
          <div className="bg-rose-500/90 text-white p-2 rounded-lg backdrop-blur-md shadow-md flex items-center space-x-1" title="Microphone is muted">
            <MicOff className="w-4 h-4" />
          </div>
        )}
        {isCameraOff && (
          <div className="bg-amber-500/90 text-white p-2 rounded-lg backdrop-blur-md shadow-md flex items-center space-x-1" title="Camera is disabled">
            <VideoOff className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Bottom Subtle Overlay Gradient */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
    </div>
  );
}
