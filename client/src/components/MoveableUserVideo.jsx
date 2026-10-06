import React, { useState, useEffect, useRef } from 'react';
import { GripHorizontal, MicOff, VideoOff, User, Maximize2, Minimize2 } from 'lucide-react';

export default function MoveableUserVideo({
  stream,
  name,
  isMuted = false,
  isCameraOff = false,
  containerRef,
  isFullScreen = false,
  onToggleFullScreen
}) {
  const videoRef = useRef(null);
  const cardRef = useRef(null);

  // Position state: null initially until container size is known, then positioned at top-right
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, startX: 24, startY: 24 });

  // Attach media stream
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Initial positioning: snap to top-right of container on mount
  useEffect(() => {
    if (containerRef?.current && cardRef?.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const cardRect = cardRef.current.getBoundingClientRect();
      const initialX = Math.max(16, containerRect.width - cardRect.width - 24);
      const initialY = 24;
      setPosition({ x: initialX, y: initialY });
    }
  }, [containerRef]);

  // Mouse Drag Handlers
  const handleMouseDown = (e) => {
    // Prevent dragging when clicking interactive buttons
    if (e.target.closest('button')) return;
    e.preventDefault();

    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y
    };
  };

  // Touch Drag Handlers
  const handleTouchStart = (e) => {
    if (e.target.closest('button')) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      startX: position.x,
      startY: position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;

      let nextX = dragStartRef.current.startX + dx;
      let nextY = dragStartRef.current.startY + dy;

      if (containerRef?.current && cardRef?.current) {
        const cRect = containerRef.current.getBoundingClientRect();
        const wRect = cardRef.current.getBoundingClientRect();
        nextX = Math.max(12, Math.min(cRect.width - wRect.width - 12, nextX));
        nextY = Math.max(12, Math.min(cRect.height - wRect.height - 12, nextY));
      }

      setPosition({ x: nextX, y: nextY });
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.mouseX;
      const dy = touch.clientY - dragStartRef.current.mouseY;

      let nextX = dragStartRef.current.startX + dx;
      let nextY = dragStartRef.current.startY + dy;

      if (containerRef?.current && cardRef?.current) {
        const cRect = containerRef.current.getBoundingClientRect();
        const wRect = cardRef.current.getBoundingClientRect();
        nextX = Math.max(12, Math.min(cRect.width - wRect.width - 12, nextX));
        nextY = Math.max(12, Math.min(cRect.height - wRect.height - 12, nextY));
      }

      setPosition({ x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, containerRef]);

  const hasActiveVideo = stream && stream.getVideoTracks().length > 0 && !isCameraOff;

  return (
    <div
      ref={cardRef}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none'
      }}
      className={`absolute top-0 left-0 z-30 w-52 sm:w-64 aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-deepsea-700/80 transition-shadow select-none group ${
        isDragging ? 'cursor-grabbing shadow-sky-500/20 ring-2 ring-sky-400' : 'cursor-grab hover:border-sky-400/80'
      }`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Draggable Top Bar Handle */}
      <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-black/80 to-transparent z-20 flex items-center justify-between px-2.5">
        <div className="flex items-center space-x-1.5 pointer-events-none">
          <GripHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
            You
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {isMuted && (
            <span className="bg-rose-500/90 text-white p-0.5 rounded" title="Muted">
              <MicOff className="w-2.5 h-2.5" />
            </span>
          )}
          {isCameraOff && (
            <span className="bg-amber-500/90 text-white p-0.5 rounded" title="Camera off">
              <VideoOff className="w-2.5 h-2.5" />
            </span>
          )}
          {onToggleFullScreen && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFullScreen();
              }}
              className="p-1 rounded bg-slate-950/70 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer pointer-events-auto"
              title={isFullScreen ? "Exit Full Screen" : "Expand to Full Screen"}
            >
              {isFullScreen ? (
                <Minimize2 className="w-3 h-3 text-sky-400" />
              ) : (
                <Maximize2 className="w-3 h-3" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Actual Local Webcam Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={true}
        className={`w-full h-full object-cover mirror-video transition-opacity duration-200 ${
          hasActiveVideo ? 'opacity-100' : 'opacity-0 absolute'
        }`}
      />

      {/* Camera Off Placeholder */}
      {!hasActiveVideo && (
        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-slate-900">
          <div className="w-10 h-10 rounded-full bg-deepsea-800 border border-deepsea-600 flex items-center justify-center text-white mb-1">
            {isCameraOff ? (
              <VideoOff className="w-4 h-4 text-rose-400" />
            ) : (
              <User className="w-5 h-5 text-slate-300" />
            )}
          </div>
          <span className="text-[11px] text-slate-300 font-medium truncate max-w-[120px]">
            {name || 'You'}
          </span>
          <span className="text-[9px] text-slate-400">
            {isCameraOff ? 'Camera Off' : 'No Video'}
          </span>
        </div>
      )}

      {/* Bottom Name Tag */}
      <div className="absolute bottom-1.5 left-2 z-10 pointer-events-none">
        <span className="bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
          {name || 'You'}
        </span>
      </div>
    </div>
  );
}
