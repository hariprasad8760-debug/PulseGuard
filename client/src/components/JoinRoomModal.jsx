import React, { useState } from 'react';
import { X, LogIn, User, KeyRound, AlertCircle } from 'lucide-react';
import { getSocket } from '../services/socket';

export default function JoinRoomModal({ isOpen, onClose, onRoomJoined }) {
  const [userName, setUserName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleJoin = (e) => {
    e?.preventDefault();
    const cleanName = userName.trim();
    const cleanCode = roomCode.trim().toUpperCase();

    if (!cleanName) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!cleanCode) {
      setErrorMessage('Please enter the room code.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    const socket = getSocket();
    socket.emit('join-room', { roomCode: cleanCode, userName: cleanName }, (response) => {
      setIsLoading(false);
      if (response && response.success) {
        onRoomJoined({
          roomCode: cleanCode,
          userName: cleanName,
          isHost: false,
          peer: response.peer
        });
      } else {
        // Specific error matching requirements:
        // "Invalid room code. Please check and try again."
        // "This room is already full."
        if (response?.error === 'room_full') {
          setErrorMessage('This room is already full.');
        } else if (response?.error === 'invalid_code') {
          setErrorMessage('Invalid room code. Please check and try again.');
        } else {
          setErrorMessage(response?.message || 'Invalid room code. Please check and try again.');
        }
      }
    });
  };

  const handleResetAndClose = () => {
    setUserName('');
    setRoomCode('');
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-deepsea-50 flex items-center justify-center text-deepsea-800">
            <LogIn className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-deepsea-900">Join Existing Room</h3>
            <p className="text-xs text-slate-500">Connect to a secure peer call session.</p>
          </div>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          {/* Enter Your Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Enter Your Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Alex Smith"
                maxLength={40}
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-deepsea-800/20 focus:border-deepsea-800 text-slate-900 placeholder:text-slate-400 text-sm font-medium transition-all"
              />
            </div>
          </div>

          {/* Enter Room Code */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Enter Room Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g. PG-7K4X92"
                maxLength={10}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-deepsea-800/20 focus:border-deepsea-800 text-slate-900 placeholder:text-slate-400 text-sm font-mono font-semibold uppercase tracking-wider transition-all"
              />
            </div>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-deepsea-800 hover:bg-deepsea-900 text-white text-sm font-semibold flex items-center space-x-2 shadow-md shadow-deepsea-800/15 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isLoading ? (
                <span>Validating...</span>
              ) : (
                <span>Join</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
