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
  const [remoteStream, setRemoteStream] = useState(null);

  // Participant info
  const [peerName, setPeerName] = useState(null);

  // Call status: 'idle' | 'requesting-media' | 'waiting-peer' | 'connecting' | 'connected' | 'peer-disconnected' | 'failed'
  const [callStatus, setCallStatus] = useState('requesting-media');
  const [statusMessage, setStatusMessage] = useState('Requesting camera & microphone...');

  // Media track controls
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  // Permission handling
  const [permissionError, setPermissionError] = useState(null);

  // WebRTC refs
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const iceCandidatesQueue = useRef([]);
  const hasNegotiatedOffer = useRef(false);

  // 1. Acquire Local Media (Camera & Mic)
  const initLocalMedia = useCallback(async () => {
    setPermissionError(null);
    setCallStatus('requesting-media');
    setStatusMessage('Requesting camera and microphone access...');

    try {
      // Check mediaDevices support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported on this browser or context (requires HTTPS or localhost).');
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
        setStatusMessage('Waiting for participant to join...');
      } else {
        setCallStatus('connecting');
        setStatusMessage('Connecting...');
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
        userFriendlyError = 'Camera or microphone is already in use by another application (e.g. Zoom, Teams). Please close other apps and try again.';
      }

      setPermissionError(userFriendlyError);
      setCallStatus('failed');
      setStatusMessage('Permission Denied');
      return null;
    }
  }, [isHost]);

  // 2. Initialize Peer Connection
  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    // Attach local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Remote stream arrival
    pc.ontrack = (event) => {
      console.log('[WebRTC] Remote track received:', event.track.kind);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && roomCode) {
        socket.emit('ice-candidate', {
          roomCode,
          candidate: event.candidate
        });
      }
    };

    // Connection state changes
    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState);
      switch (pc.connectionState) {
        case 'connecting':
          setCallStatus('connecting');
          setStatusMessage('Connecting...');
          break;
        case 'connected':
          setCallStatus('connected');
          setStatusMessage('2 Participants Connected');
          break;
        case 'disconnected':
        case 'closed':
          setCallStatus('peer-disconnected');
          setStatusMessage('Participant Disconnected');
          break;
        case 'failed':
          setCallStatus('failed');
          setStatusMessage('Connection Failed – Please try again');
          break;
        default:
          break;
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed') {
        setCallStatus('failed');
        setStatusMessage('Connection Failed – Please try again');
      }
    };

    return pc;
  }, [roomCode, socket]);

  // 3. Start Offer (initiated by Host when peer joins)
  const startCall = useCallback(async () => {
    try {
      if (!localStreamRef.current) {
        await initLocalMedia();
      }

      const pc = createPeerConnection();
      setCallStatus('connecting');
      setStatusMessage('Connecting...');

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await pc.setLocalDescription(offer);

      socket.emit('offer', {
        roomCode,
        offer
      });

      hasNegotiatedOffer.current = true;
    } catch (err) {
      console.error('[WebRTC] Error starting call offer:', err);
      setCallStatus('failed');
      setStatusMessage('Connection Failed – Please try again');
    }
  }, [createPeerConnection, initLocalMedia, roomCode, socket]);

  // 4. Socket Listeners for Signaling
  useEffect(() => {
    if (!roomCode) return;

    // A. Host receives notification that participant joined
    const handleUserJoined = async ({ peerName: joinedPeerName }) => {
      console.log('[Socket] Participant joined:', joinedPeerName);
      setPeerName(joinedPeerName);
      await startCall();
    };

    // B. Participant receives WebRTC Offer from Host
    const handleOffer = async ({ offer, senderName }) => {
      console.log('[Socket] Received WebRTC offer from:', senderName);
      setPeerName(senderName);

      try {
        let stream = localStreamRef.current;
        if (!stream) {
          stream = await initLocalMedia();
        }

        const pc = createPeerConnection();
        setCallStatus('connecting');
        setStatusMessage('Connecting...');

        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // Process any queued ICE candidates
        while (iceCandidatesQueue.current.length > 0) {
          const candidate = iceCandidatesQueue.current.shift();
          try {
            await pc.addIceCandidate(candidate);
          } catch (e) {
            console.warn('[WebRTC] Error adding queued ICE candidate', e);
          }
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('answer', {
          roomCode,
          answer
        });
      } catch (err) {
        console.error('[WebRTC] Error handling offer:', err);
        setCallStatus('failed');
        setStatusMessage('Connection Failed – Please try again');
      }
    };

    // C. Host receives Answer from Participant
    const handleAnswer = async ({ answer }) => {
      console.log('[Socket] Received WebRTC answer');
      try {
        const pc = peerConnectionRef.current;
        if (pc && pc.signalingState !== 'closed') {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));

          // Process any queued ICE candidates
          while (iceCandidatesQueue.current.length > 0) {
            const candidate = iceCandidatesQueue.current.shift();
            try {
              await pc.addIceCandidate(candidate);
            } catch (e) {
              console.warn('[WebRTC] Error adding queued ICE candidate', e);
            }
          }
        }
      } catch (err) {
        console.error('[WebRTC] Error handling answer:', err);
      }
    };

    // D. ICE Candidate arrived
    const handleIceCandidate = async ({ candidate }) => {
      const pc = peerConnectionRef.current;
      const iceCandidate = new RTCIceCandidate(candidate);

      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        try {
          await pc.addIceCandidate(iceCandidate);
        } catch (err) {
          console.warn('[WebRTC] Error adding ICE candidate:', err);
        }
      } else {
        // Queue candidates if remote description isn't set yet
        iceCandidatesQueue.current.push(iceCandidate);
      }
    };

    // E. Peer left
    const handleUserLeft = ({ message, userName: leftUser }) => {
      console.log('[Socket] Peer left:', leftUser, message);
      setCallStatus('peer-disconnected');
      setStatusMessage('Participant Disconnected');
      setRemoteStream(null);

      // Reset peer connection so a new participant can join if host remains
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
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
  }, [createPeerConnection, initLocalMedia, roomCode, socket, startCall]);

  // Initial media acquisition on mount
  useEffect(() => {
    initLocalMedia();

    return () => {
      // Clean up tracks on unmount
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [initLocalMedia]);

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
    // Stop local media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Notify server
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
  };
}
