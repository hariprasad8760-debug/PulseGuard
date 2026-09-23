import React, { useState } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import VideoPanel from './VideoPanel';
import CallControls from './CallControls';
import PermissionModal from './PermissionModal';
import { Copy, Check, Shield, Wifi, WifiOff, Users } from 'lucide-react';

export default function CallScreen({ roomData, onLeaveCall }) {
  const { roomCode, userName, isHost } = roomData;
  const [isCopied, setIsCopied] = useState(false);

  const {
    localStream,
    remoteStream,
    peerName,
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

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  // Status badge styling helper
  const getStatusBadge = () => {
    switch (callStatus) {
      case 'connected':
        return (
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Users className="w-3.5 h-3.5" />
            <span>2 Participants Connected</span>
          </div>
        );
      case 'connecting':
        return (
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <Wifi className="w-3.5 h-3.5" />
            <span>Connecting...</span>
          </div>
        );
      case 'waiting-peer':
        return (
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-deepsea-50 border border-deepsea-200 text-deepsea-800 text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-deepsea-600 animate-soft-pulse" />
            <span>Waiting for Participant...</span>
          </div>
        );
      case 'peer-disconnected':
        return (
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs">
            <WifiOff className="w-3.5 h-3.5 text-slate-500" />
            <span>Participant Disconnected</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold shadow-xs">
            <WifiOff className="w-3.5 h-3.5 text-rose-500" />
            <span>Connection Failed – Please try again</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold">
            <span>{statusMessage}</span>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
      
      {/* Top Bar: Room Code & Status Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-2 border-b border-slate-200/80">
        
        {/* Room Information & Copy */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs">
            <Shield className="w-4 h-4 text-deepsea-700" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Room:</span>
            <span className="text-sm font-mono font-bold text-deepsea-900 tracking-wider">{roomCode}</span>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs ${
              isCopied
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-deepsea-900'
            }`}
            title="Copy room code to clipboard"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Real-Time Call Status Indicator */}
        <div className="flex items-center">
          {getStatusBadge()}
        </div>

      </div>

      {/* Main Video Stage: Two Panels (Local & Remote) */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 min-h-[400px] mb-20 items-stretch">
        
        {/* Panel 1: Local Participant */}
        <div className="w-full h-full">
          <VideoPanel
            stream={localStream}
            name={`${userName} (${isHost ? 'Host' : 'Participant'})`}
            isLocal={true}
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            statusLabel="Local Device"
          />
        </div>

        {/* Panel 2: Remote Participant */}
        <div className="w-full h-full">
          <VideoPanel
            stream={remoteStream}
            name={peerName || (isHost ? 'Waiting for participant...' : 'Host')}
            isLocal={false}
            isWaiting={!remoteStream && callStatus !== 'connected'}
            statusLabel="Remote Peer"
          />
        </div>

      </div>

      {/* Floating Bottom Center Call Controls */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
        <CallControls
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          onToggleMicrophone={toggleMicrophone}
          onToggleCamera={toggleCamera}
          onEndCall={endCall}
        />
      </div>

      {/* Permission Denied Modal */}
      <PermissionModal
        error={permissionError}
        onRetry={retryPermissions}
        onExit={endCall}
      />

    </div>
  );
}
