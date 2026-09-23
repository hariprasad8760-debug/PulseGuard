import React, { useState } from 'react';
import { X, Copy, Check, Video, ArrowRight, Sparkles, User, ShieldCheck } from 'lucide-react';
import { getSocket } from '../services/socket';

export default function CreateRoomModal({ isOpen, onClose, onRoomCreated }) {
  const [step, setStep] = useState(1); // 1: Enter Name, 2: Room Code Generated
  const [userName, setUserName] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleContinue = (e) => {
    e?.preventDefault();
    const cleanName = userName.trim();
    if (!cleanName) {
      setErrorMessage('Please enter your name to continue.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    const socket = getSocket();
    socket.emit('create-room', { userName: cleanName }, (response) => {
      setIsLoading(false);
      if (response && response.success) {
        setGeneratedCode(response.roomCode);
        setStep(2);
      } else {
        setErrorMessage(response?.message || 'Failed to create room. Please check backend connection.');
      }
    });
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  const handleStartCall = () => {
    onRoomCreated({
      roomCode: generatedCode,
      userName: userName.trim(),
      isHost: true
    });
  };

  const handleResetAndClose = () => {
    setStep(1);
    setUserName('');
    setGeneratedCode('');
    setIsCopied(false);
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

        {/* Step 1: Enter Name */}
        {step === 1 && (
          <form onSubmit={handleContinue} className="space-y-5">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-deepsea-50 flex items-center justify-center text-deepsea-800">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-deepsea-900">Create Private Room</h3>
                <p className="text-xs text-slate-500">You will be the Host of this secure session.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                  placeholder="e.g. Dr. Jane Doe"
                  maxLength={40}
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-deepsea-800/20 focus:border-deepsea-800 text-slate-900 placeholder:text-slate-400 text-sm font-medium transition-all"
                />
              </div>
              {errorMessage && (
                <p className="mt-2 text-xs font-medium text-rose-600">{errorMessage}</p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
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
                className="px-5 py-2.5 rounded-xl bg-deepsea-800 hover:bg-deepsea-900 text-white text-sm font-semibold flex items-center space-x-2 shadow-md shadow-deepsea-800/15 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span>Generating Code...</span>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Room Code Generated */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-deepsea-900">Room Ready</h3>
              <p className="text-xs text-slate-500">
                Share this code with the other participant.
              </p>
            </div>

            {/* Generated Code Display Box */}
            <div className="bg-slate-50 border-2 border-dashed border-deepsea-200 rounded-2xl p-5 text-center relative group">
              <span className="text-xs uppercase tracking-wider font-semibold text-deepsea-700 block mb-1">
                Room Code
              </span>
              <div className="font-mono text-3xl font-extrabold text-deepsea-900 tracking-wider">
                {generatedCode}
              </div>

              <div className="mt-4 flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                    isCopied
                      ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                      : 'bg-white border border-slate-300 text-deepsea-800 hover:bg-deepsea-50 hover:border-deepsea-300'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-3 text-xs text-sky-900 flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>
                As the <strong>Host</strong>, your camera and microphone will start once you enter the call room, awaiting your participant.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={handleStartCall}
                className="w-full py-3 rounded-xl bg-deepsea-800 hover:bg-deepsea-900 text-white font-semibold text-sm shadow-md shadow-deepsea-800/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>Enter Call Room</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
