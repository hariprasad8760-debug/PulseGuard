import React, { useState, useRef } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import VideoPanel from './VideoPanel';
import MoveableUserVideo from './MoveableUserVideo';
import CallControls from './CallControls';
import PermissionModal from './PermissionModal';
import SecurityPanel from './SecurityPanel';
import SecurityIndicator from './SecurityIndicator';
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
  const [securityPanelOpen, setSecurityPanelOpen] = useState(true);
  
  // Choose which screen will be full screen: null (default grid) | 'local' | peerId
  const [focusedPeerId, setFocusedPeerId] = useState(null);
  
  const stageContainerRef = useRef(null);

  // Phase 2: Replace null with real result from RiskEngine.computeRisk()
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
          <SecurityIndicator analysisResult={analysisResult} />
          <button
            onClick={() => setSecurityPanelOpen(!securityPanelOpen)}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-deepsea-800 hover:bg-deepsea-50 hover:border-deepsea-200 transition-colors cursor-pointer"
            title={securityPanelOpen ? 'Hide security panel' : 'Show security panel'}
          >
            {securityPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Call Viewport (Full Screen video stage) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Primary Video Stage */}
        <div 
          ref={stageContainerRef}
          className="flex-1 relative flex flex-col p-3 sm:p-4 overflow-hidden bg-slate-900"
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

        {/* Security Panel — right sidebar */}
        {securityPanelOpen && (
          <div className="hidden lg:flex w-72 xl:w-80 flex-col border-l border-slate-200 shrink-0 bg-white">
            <SecurityPanel analysisResult={analysisResult} />
          </div>
        )}
      </div>

      {/* Mobile Security Panel (bottom sheet) */}
      {securityPanelOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white max-h-48 overflow-y-auto">
          <SecurityPanel analysisResult={analysisResult} isCollapsible={true} />
        </div>
      )}

      {/* Floating Bottom Controls */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <CallControls
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          onToggleMicrophone={toggleMicrophone}
          onToggleCamera={toggleCamera}
          onEndCall={endCall}
        />
      </div>

      {/* Permission Modal */}
      <PermissionModal
        error={permissionError}
        onRetry={retryPermissions}
        onExit={endCall}
      />
    </div>
  );
}
