import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from '../services/socket';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

export function useWebRTC({ roomCode, userName, isHost, onCallEnded }) {
  const socket = getSocket();

  // Streams
  const [localStream, setLocalStream] = useState(null);
  
  // Remote peers: Array of { peerId: string, peerName: string, stream: MediaStream }
  const [remotePeers, setRemotePeers] = useState([]);

  // Call status
  const [callStatus, setCallStatus] = useState('requesting-media');
  const [statusMessage, setStatusMessage] = useState('Requesting camera & microphone...');

  // Media track controls
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  // Permission handling
  const [permissionError, setPermissionError] = useState(null);

  // WebRTC mesh refs
  // Map of peerId -> RTCPeerConnection
  const peerConnectionsRef = useRef(new Map());
  // Map of peerId -> Array of queued RTCIceCandidate
  const iceCandidatesQueueRef = useRef(new Map());
  // Map of peerId -> peerName
  const peerNamesRef = useRef(new Map());
  const localStreamRef = useRef(null);

  // 1. Acquire Local Media (Camera & Mic)
  const initLocalMedia = useCallback(async () => {
    setPermissionError(null);
    setCallStatus('requesting-media');
    setStatusMessage('Requesting camera and microphone access...');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported on this browser or context.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      localStreamRef.current = stream;
      setLocalStream(stream);

      if (isHost) {
        setCallStatus('waiting-peer');
        setStatusMessage('Waiting for participants to join (up to 5)...');
      } else {
        setCallStatus('connecting');
        setStatusMessage('Connecting to room...');
      }

      return stream;
    } catch (err) {
      console.error('[WebRTC] Media access error:', err);
      let userFriendlyError = 'Could not access camera or microphone.';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        userFriendlyError = 'Camera and Microphone permissions were denied. Please allow device access in browser settings to continue.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        userFriendlyError = 'No camera or microphone found on your device. Please plug in a media device and try again.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        userFriendlyError = 'Camera or microphone is already in use by another application. Please close other apps and try again.';
      }

      setPermissionError(userFriendlyError);
      setCallStatus('failed');
      setStatusMessage('Permission Denied');
      return null;
    }
  }, [isHost]);

  // Helper to create or get an RTCPeerConnection for a given peer
  const getOrCreatePeerConnection = useCallback((targetPeerId, targetPeerName) => {
    if (peerConnectionsRef.current.has(targetPeerId)) {
      return peerConnectionsRef.current.get(targetPeerId);
    }

    if (targetPeerName) {
      peerNamesRef.current.set(targetPeerId, targetPeerName);
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionsRef.current.set(targetPeerId, pc);

    // Attach local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Remote track arrived
    pc.ontrack = (event) => {
      console.log(`[WebRTC] Remote track received from ${targetPeerId}:`, event.track.kind);
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        setRemotePeers((prev) => {
          const name = peerNamesRef.current.get(targetPeerId) || targetPeerName || 'Participant';
          const existingIndex = prev.findIndex((p) => p.peerId === targetPeerId);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = { peerId: targetPeerId, peerName: name, stream };
            return updated;
          }
          return [...prev, { peerId: targetPeerId, peerName: name, stream }];
        });
        setCallStatus('connected');
      }
    };

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && roomCode) {
        socket.emit('ice-candidate', {
          roomCode,
          targetId: targetPeerId,
          candidate: event.candidate
        });
      }
    };

    // Connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] PC state with ${targetPeerId}:`, pc.connectionState);
      if (pc.connectionState === 'connected') {
        setCallStatus('connected');
      } else if (pc.connectionState === 'failed') {
        console.warn(`[WebRTC] PC connection failed with ${targetPeerId}`);
      }
    };

    return pc;
  }, [roomCode, socket]);

  // 2. Initiate Call to existing peer (sent by joining participant to each existing peer)
  const initiateOfferToPeer = useCallback(async (targetPeerId, targetPeerName) => {
    try {
      let stream = localStreamRef.current;
      if (!stream) {
        stream = await initLocalMedia();
      }

      const pc = getOrCreatePeerConnection(targetPeerId, targetPeerName);
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await pc.setLocalDescription(offer);

      socket.emit('offer', {
        roomCode,
        targetId: targetPeerId,
        offer
      });
    } catch (err) {
      console.error(`[WebRTC] Error initiating offer to ${targetPeerId}:`, err);
    }
  }, [getOrCreatePeerConnection, initLocalMedia, roomCode, socket]);

  // 3. Socket Signaling Listeners
  useEffect(() => {
    if (!roomCode) return;

    // A. Existing peers list received when joining (or from socket callback)
    const handleJoinResponse = (data) => {
      if (data && data.existingPeers && Array.isArray(data.existingPeers)) {
        data.existingPeers.forEach((p) => {
          peerNamesRef.current.set(p.peerId, p.peerName);
          initiateOfferToPeer(p.peerId, p.peerName);
        });
      }
    };

    // B. Participant joins the room
    const handleUserJoined = ({ peerId, peerName }) => {
      console.log('[Socket] New participant joined:', peerName, peerId);
      peerNamesRef.current.set(peerId, peerName);
      // We wait for the joining peer to send the offer
    };

    // C. WebRTC Offer arrived
    const handleOffer = async ({ offer, senderId, senderName }) => {
      console.log(`[Socket] Received WebRTC offer from ${senderName} (${senderId})`);
      peerNamesRef.current.set(senderId, senderName);

      try {
        let stream = localStreamRef.current;
        if (!stream) {
          stream = await initLocalMedia();
        }

        const pc = getOrCreatePeerConnection(senderId, senderName);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // Process any queued ICE candidates for this peer
        const queue = iceCandidatesQueueRef.current.get(senderId) || [];
        while (queue.length > 0) {
          const candidate = queue.shift();
          try {
            await pc.addIceCandidate(candidate);
          } catch (e) {
            console.warn('[WebRTC] Error adding queued ICE candidate', e);
          }
        }
        iceCandidatesQueueRef.current.delete(senderId);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('answer', {
          roomCode,
          targetId: senderId,
          answer
        });
      } catch (err) {
        console.error(`[WebRTC] Error handling offer from ${senderId}:`, err);
      }
    };

    // D. WebRTC Answer arrived
    const handleAnswer = async ({ answer, senderId }) => {
      console.log(`[Socket] Received WebRTC answer from ${senderId}`);
      try {
        const pc = peerConnectionsRef.current.get(senderId);
        if (pc && pc.signalingState !== 'closed') {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));

          // Process any queued ICE candidates for this peer
          const queue = iceCandidatesQueueRef.current.get(senderId) || [];
          while (queue.length > 0) {
            const candidate = queue.shift();
            try {
              await pc.addIceCandidate(candidate);
            } catch (e) {
              console.warn('[WebRTC] Error adding queued ICE candidate', e);
            }
          }
          iceCandidatesQueueRef.current.delete(senderId);
        }
      } catch (err) {
        console.error(`[WebRTC] Error handling answer from ${senderId}:`, err);
      }
    };

    // E. ICE candidate arrived
    const handleIceCandidate = async ({ candidate, senderId }) => {
      const pc = peerConnectionsRef.current.get(senderId);
      const iceCandidate = new RTCIceCandidate(candidate);

      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        try {
          await pc.addIceCandidate(iceCandidate);
        } catch (err) {
          console.warn(`[WebRTC] Error adding ICE candidate from ${senderId}:`, err);
        }
      } else {
        if (!iceCandidatesQueueRef.current.has(senderId)) {
          iceCandidatesQueueRef.current.set(senderId, []);
        }
        iceCandidatesQueueRef.current.get(senderId).push(iceCandidate);
      }
    };

    // F. Participant left
    const handleUserLeft = ({ disconnectedId, userName: leftUser, totalParticipants }) => {
      console.log('[Socket] Participant left:', leftUser, disconnectedId);
      
      // Close and remove PC for this peer
      if (peerConnectionsRef.current.has(disconnectedId)) {
        try {
          peerConnectionsRef.current.get(disconnectedId).close();
        } catch (_) {}
        peerConnectionsRef.current.delete(disconnectedId);
      }
      iceCandidatesQueueRef.current.delete(disconnectedId);
      peerNamesRef.current.delete(disconnectedId);

      setRemotePeers((prev) => prev.filter((p) => p.peerId !== disconnectedId));

      if (totalParticipants !== undefined && totalParticipants <= 1) {
        setCallStatus('waiting-peer');
        setStatusMessage('Waiting for participants to join (up to 5)...');
      }
    };

    socket.on('user-joined', handleUserJoined);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('user-left', handleUserLeft);

    return () => {
      socket.off('user-joined', handleUserJoined);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('user-left', handleUserLeft);
    };
  }, [getOrCreatePeerConnection, initLocalMedia, initiateOfferToPeer, roomCode, socket]);

  // Initial media acquisition & join initiation
  useEffect(() => {
    let isCancelled = false;

    async function setup() {
      const stream = await initLocalMedia();
      if (isCancelled || !stream) return;

      // If joining user, emit join-room to get existingPeers
      if (!isHost) {
        socket.emit('join-room', { roomCode, userName }, (response) => {
          if (response && response.success && response.existingPeers) {
            response.existingPeers.forEach((p) => {
              peerNamesRef.current.set(p.peerId, p.peerName);
              initiateOfferToPeer(p.peerId, p.peerName);
            });
          }
        });
      }
    }

    setup();

    return () => {
      isCancelled = true;
      // Clean up all tracks on unmount
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      peerConnectionsRef.current.forEach((pc) => {
        try { pc.close(); } catch (_) {}
      });
      peerConnectionsRef.current.clear();
      iceCandidatesQueueRef.current.clear();
    };
  }, [initLocalMedia, initiateOfferToPeer, isHost, roomCode, socket, userName]);

  // Controls: Mute / Unmute Microphone
  const toggleMicrophone = useCallback(() => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  }, []);

  // Controls: Camera Off / Camera On
  const toggleCamera = useCallback(() => {
    if (!localStreamRef.current) return;
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOff(!videoTrack.enabled);
    }
  }, []);

  // Controls: End Call
  const endCall = useCallback(() => {
    console.log('[WebRTC] Ending call...');
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemotePeers([]);

    peerConnectionsRef.current.forEach((pc) => {
      try { pc.close(); } catch (_) {}
    });
    peerConnectionsRef.current.clear();
    iceCandidatesQueueRef.current.clear();

    socket.emit('leave-room');

    if (onCallEnded) {
      onCallEnded();
    }
  }, [onCallEnded, socket]);

  // Retry media acquisition if permission was denied
  const retryPermissions = useCallback(async () => {
    await initLocalMedia();
  }, [initLocalMedia]);

  return {
    localStream,
    remotePeers, // Array of { peerId, peerName, stream }
    remoteStream: remotePeers[0]?.stream || null, // legacy alias
    peerName: remotePeers[0]?.peerName || null,   // legacy alias
    participantCount: 1 + remotePeers.length,     // total active participants (1 to 5)
    callStatus,
    statusMessage,
    isMuted,
    isCameraOff,
    permissionError,
    toggleMicrophone,
    toggleCamera,
    endCall,
    retryPermissions
  };
}
