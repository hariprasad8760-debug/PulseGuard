import React, { useState, useRef, useEffect } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import VideoPanel from './VideoPanel';
import MoveableUserVideo from './MoveableUserVideo';
import CallControls from './CallControls';
import PermissionModal from './PermissionModal';
import SecurityPanel from './SecurityPanel';
import SecurityIndicator from './SecurityIndicator';
import { detectFaceFromFrame } from '../services/api';
import { 
  Copy, 
  Check, 
  Shield, 
  Wifi, 
  WifiOff, 
  Users, 
  PanelRight, 
  PanelRightClose, 
  UserPlus, 
  Sparkles,
  Minimize2,
  Grid
} from 'lucide-react';

export default function CallScreen({ roomData, onLeaveCall }) {
  const { roomCode, userName, isHost, maxParticipants = 5 } = roomData;
  const [isCopied, setIsCopied] = useState(false);
  const [securityPanelOpen, setSecurityPanelOpen] = useState(false);
  
  // Real-time Face Detection & Security Analysis state
  const [faceData, setFaceData] = useState(null);
  const [analysisState, setAnalysisState] = useState('inconclusive'); // 'analyzing' | 'available' | 'unavailable' | 'inconclusive'
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState(null);

  const hiddenVideoRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  const isAnalyzingRef = useRef(false);
  
  // Choose which screen will be full screen: null (default grid) | 'local' | peerId
  const [focusedPeerId, setFocusedPeerId] = useState(null);
  
  const stageContainerRef = useRef(null);

  // Phase 2: Live face detection data passed into security indicators
  const analysisResult = null;

  const {
    localStream,
    remotePeers, // Array of { peerId, peerName, stream }
    participantCount,
    callStatus,
    statusMessage,
    isMuted,
    isCameraOff,
    permissionError,
    toggleMicrophone,
    toggleCamera,
    endCall,
    retryPermissions
  } = useWebRTC({
    roomCode,
    userName,
    isHost,
    onCallEnded: onLeaveCall
  });

  // Background Face Detection & Tracking loop (every 2.0s)
  useEffect(() => {
    if (!localStream || isCameraOff) {
      setFaceData(null);
      setAnalysisState('inconclusive');
      return;
    }

    const videoEl = hiddenVideoRef.current;
    if (videoEl && videoEl.srcObject !== localStream) {
      videoEl.srcObject = localStream;
      videoEl.play().catch(() => {});
    }

    const intervalId = setInterval(async () => {
      if (isAnalyzingRef.current) return;
      if (!hiddenVideoRef.current || !hiddenCanvasRef.current) return;
      if (hiddenVideoRef.current.readyState < 2) return;

      try {
        const video = hiddenVideoRef.current;
        const canvas = hiddenCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return;

        // Downscaled 320x240 frame for optimal network latency and memory efficiency
        canvas.width = 320;
        canvas.height = 240;
        ctx.drawImage(video, 0, 0, 320, 240);

        const frameBase64 = canvas.toDataURL('image/jpeg', 0.7);

        isAnalyzingRef.current = true;
        setAnalysisState('analyzing');

        const response = await detectFaceFromFrame(frameBase64, roomCode);

        if (response.success && response.data) {
          setFaceData(response.data);
          setLastAnalyzedAt(Date.now());
          setAnalysisState(response.data.face_detected ? 'available' : 'inconclusive');
        } else {
          setAnalysisState('unavailable');
        }
      } catch (err) {
        console.warn('Face detection frame capture error:', err);
        setAnalysisState('unavailable');
      } finally {
        isAnalyzingRef.current = false;
      }
    }, 2000);

    return () => {
      clearInterval(intervalId);
      isAnalyzingRef.current = false;
    };
  }, [localStream, isCameraOff, roomCode]);

  const maxCapacity = maxParticipants || 5;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  const getStatusBadge = () => {
    switch (callStatus) {
      case 'connected':
        return (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Users className="w-3.5 h-3.5" />
            <span>{participantCount} / {maxCapacity} Participants</span>
          </div>
        );
      case 'connecting':
        return (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <Wifi className="w-3.5 h-3.5" />
            <span>Connecting...</span>
          </div>
        );
      case 'waiting-peer':
        return (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-deepsea-50 border border-deepsea-200 text-deepsea-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-deepsea-600 animate-soft-pulse" />
            <span>{participantCount} / {maxCapacity} (Waiting for peers)</span>
          </div>
        );
      case 'peer-disconnected':
        return (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold">
            <WifiOff className="w-3.5 h-3.5 text-slate-500" />
            <span>Participant Disconnected</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            <WifiOff className="w-3.5 h-3.5 text-rose-500" />
            <span>Connection Failed – Please try again</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold">
            <span>{statusMessage}</span>
          </div>
        );
    }
  };

  // Helper to dynamically size remote participants grid in normal mode
  const getGridClasses = () => {
    const count = remotePeers.length;
    if (count <= 1) return 'grid-cols-1 grid-rows-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2';
  };

  // Find the peer that is currently focused in full screen (if any)
  const fullScreenRemotePeer = remotePeers.find((p) => p.peerId === focusedPeerId);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
      {/* Call Header Bar (shown clearly in video call) */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 z-20 shrink-0">
        {/* Room info & Status */}
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Shield className="w-4 h-4 text-deepsea-700" />
            <span className="text-xs font-medium text-slate-500">Room:</span>
            <span className="text-sm font-mono font-bold text-deepsea-900 tracking-wider">{roomCode}</span>
          </div>
          <button
            onClick={handleCopyCode}
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer ${
              isCopied ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isCopied ? <><Check className="w-3.5 h-3.5" /><span>Copied!</span></> : <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>}
          </button>
          {getStatusBadge()}

          {/* Reset to Grid button if a screen is currently full screen */}
          {focusedPeerId && (
            <button
              onClick={() => setFocusedPeerId(null)}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition-colors cursor-pointer"
              title="Reset to Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
          )}
        </div>

        {/* Right: Security indicator + panel toggle */}
        <div className="flex items-center space-x-2">
          <SecurityIndicator 
            analysisResult={analysisResult}
            faceData={faceData}
            analysisState={analysisState}
          />
          <button
            onClick={() => setSecurityPanelOpen(!securityPanelOpen)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              securityPanelOpen 
                ? 'bg-deepsea-900 text-white border-deepsea-900 shadow-xs' 
                : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-deepsea-900'
            }`}
            title={securityPanelOpen ? 'Hide AI Security Panel' : 'Show AI Security Panel'}
            aria-label="Toggle AI Security Panel"
          >
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">AI Security</span>
            {securityPanelOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Call Viewport (Auto-Adjusting Side-by-Side Layout) */}
      <div className="flex-1 flex flex-row overflow-hidden relative w-full h-full">
        {/* Primary Video Stage — Automatically resizes when AI Security screen opens */}
        <div 
          ref={stageContainerRef}
          className="flex-1 min-w-0 h-full relative flex flex-col p-3 sm:p-4 overflow-hidden bg-slate-900 transition-all duration-300 ease-in-out"
        >
          {/* STAGE CONTAINER */}
          <div className="flex-1 w-full h-full relative overflow-hidden rounded-2xl flex items-center justify-center">

            {/* ── MODE 1: A SPECIFIC REMOTE PARTICIPANT IS FULL SCREEN ── */}
            {fullScreenRemotePeer ? (
              <div className="w-full h-full relative">
                <VideoPanel
                  stream={fullScreenRemotePeer.stream}
                  name={fullScreenRemotePeer.peerName || 'Remote Participant'}
                  isLocal={false}
                  statusLabel="Full Screen"
                  isFullScreen={true}
                  onToggleFullScreen={() => setFocusedPeerId(null)}
                />

                {/* Strip of other participants at top for easy switching */}
                {remotePeers.length > 1 && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg max-w-full overflow-x-auto">
                    {remotePeers.map((p) => (
                      <button
                        key={p.peerId}
                        onClick={() => setFocusedPeerId(p.peerId === focusedPeerId ? null : p.peerId)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          p.peerId === focusedPeerId
                            ? 'bg-sky-500 text-white shadow-xs'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {p.peerName || 'Participant'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : focusedPeerId === 'local' ? (
              /* ── MODE 2: LOCAL USER SCREEN IS EXPANDED TO FULL SCREEN ── */
              <div className="w-full h-full relative">
                <VideoPanel
                  stream={localStream}
                  name={`${userName} (You)`}
                  isLocal={true}
                  isMuted={isMuted}
                  isCameraOff={isCameraOff}
                  statusLabel="Your Full Screen"
                  isFullScreen={true}
                  onToggleFullScreen={() => setFocusedPeerId(null)}
                />
              </div>
            ) : (
              /* ── MODE 3: DEFAULT PARTICIPANTS STAGE (BIG PARTICIPANTS GRID) ── */
              remotePeers.length === 0 ? (
                /* No remote participants yet -> Large waiting room screen */
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-5 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-800/80">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-deepsea-900 border-2 border-deepsea-700/60 flex items-center justify-center text-sky-400 shadow-2xl">
                      <UserPlus className="w-10 h-10 text-sky-400" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
                  </div>

                  <div className="space-y-2 max-w-md">
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Waiting for Participants to Join
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      This room accepts <strong className="text-sky-300">up to {maxCapacity} participants</strong>. Share the room code below to invite others into this secure session.
                    </p>
                  </div>

                  {/* Room Code Card */}
                  <div className="bg-slate-800/80 border border-slate-700 px-6 py-3 rounded-2xl flex items-center space-x-3 shadow-lg">
                    <span className="font-mono text-xl sm:text-2xl font-extrabold text-white tracking-wider">
                      {roomCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="p-2 rounded-xl bg-deepsea-700 hover:bg-deepsea-600 text-white transition-all cursor-pointer"
                      title="Copy Room Code"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="inline-flex items-center space-x-2 text-xs text-sky-400 bg-sky-950/60 border border-sky-800/40 px-3.5 py-1.5 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Your camera window is in the corner and can be dragged anywhere.</span>
                  </div>
                </div>
              ) : (
                /* Grid of Remote Participants (Big Screen) */
                <div className={`w-full h-full grid ${getGridClasses()} gap-3 items-stretch justify-items-stretch overflow-hidden`}>
                  {remotePeers.map((peer) => (
                    <div key={peer.peerId} className="w-full h-full min-h-0 min-w-0">
                      <VideoPanel
                        stream={peer.stream}
                        name={peer.peerName || 'Remote Participant'}
                        isLocal={false}
                        statusLabel="Participant"
                        isFullScreen={false}
                        onToggleFullScreen={() => setFocusedPeerId(peer.peerId)}
                      />
                    </div>
                  ))}
                </div>
              )
            )}

            {/* SHORT & MOVEABLE: Local User's Camera Screen (when not full screen) */}
            {focusedPeerId !== 'local' && (
              <MoveableUserVideo
                stream={localStream}
                name={`${userName}`}
                isMuted={isMuted}
                isCameraOff={isCameraOff}
                containerRef={stageContainerRef}
                isFullScreen={false}
                onToggleFullScreen={() => setFocusedPeerId('local')}
              />
            )}
          </div>

          {/* Spacer for floating bottom controls */}
          <div className="h-16" />
        </div>

        {/* Docked AI Security Screen (Auto-Adjusts Side-by-Side without overlaying) */}
        <div
          className={`h-full shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out flex flex-col z-20 ${
            securityPanelOpen
              ? 'w-full sm:w-80 md:w-96 xl:w-[420px] opacity-100'
              : 'w-0 overflow-hidden border-l-0 opacity-0 pointer-events-none'
          }`}
        >
          <SecurityPanel
            isOpen={securityPanelOpen}
            onClose={() => setSecurityPanelOpen(false)}
            analysisState={analysisState}
            faceData={faceData}
            lastAnalyzedAt={lastAnalyzedAt}
            isDocked={true}
          />
        </div>
      </div>

      {/* Floating Right-Edge Tab Trigger when closed */}
      {!securityPanelOpen && (
        <button
          onClick={() => setSecurityPanelOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-30 hidden sm:flex items-center space-x-1 py-3 px-2 rounded-l-xl bg-deepsea-900/90 hover:bg-deepsea-900 text-white shadow-xl backdrop-blur-xs border border-r-0 border-white/20 transition-all cursor-pointer group hover:pl-3"
          title="Open AI Security Panel"
          aria-label="Open AI Security Panel"
        >
          <Shield className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold [writing-mode:vertical-lr] rotate-180 tracking-wider">
            AI SECURITY
          </span>
        </button>
      )}

      {/* Floating Bottom Controls */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
        <CallControls
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          onToggleMicrophone={toggleMicrophone}
          onToggleCamera={toggleCamera}
          onEndCall={endCall}
        />
      </div>

      {/* Hidden elements for background frame analysis */}
      <video
        ref={hiddenVideoRef}
        autoPlay
        playsInline
        muted
        style={{ display: 'none' }}
        aria-hidden="true"
      />
      <canvas
        ref={hiddenCanvasRef}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      {/* Permission Modal */}
      <PermissionModal
        error={permissionError}
        onRetry={retryPermissions}
        onExit={endCall}
      />
    </div>
  );
}
