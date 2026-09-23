import React, { useState } from 'react';
import { Video, Users, Shield, Lock, Cpu, Globe } from 'lucide-react';
import CreateRoomModal from './CreateRoomModal';
import JoinRoomModal from './JoinRoomModal';

export default function HomeScreen({ onEnterRoom }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl w-full mx-auto text-center space-y-10">
        
        {/* Academic Project Badge & Title Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-deepsea-50 border border-deepsea-200/80 text-deepsea-800 text-xs font-semibold shadow-xs">
            <Shield className="w-3.5 h-3.5 text-deepsea-700" />
            <span>Academic AI Security Research Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-deepsea-900 tracking-tight">
            DeepFake and Liveness Detection
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto font-normal">
            Create or join a secure room to start a real-time call.
          </p>
        </div>

        {/* Two Large Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto">
          
          {/* Card 1: Create Room */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-deepsea-800 text-white flex items-center justify-center shadow-lg shadow-deepsea-900/10 group-hover:scale-105 transition-transform">
                <Video className="w-7 h-7 text-sky-300" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deepsea-900 tracking-tight">
                  Create Room
                </h2>
                <p className="text-sm text-slate-600 mt-2 font-medium leading-relaxed">
                  Create a private room and invite another participant.
                </p>
              </div>
            </div>

            <div className="pt-8">
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="w-full py-3.5 px-6 rounded-xl bg-deepsea-800 hover:bg-deepsea-900 text-white font-semibold text-sm shadow-md shadow-deepsea-800/15 flex items-center justify-center space-x-2 group-hover:bg-deepsea-950 transition-all cursor-pointer"
              >
                <span>Create Room</span>
              </button>
            </div>
          </div>

          {/* Card 2: Join Room */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 text-deepsea-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-7 h-7 text-deepsea-800" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deepsea-900 tracking-tight">
                  Join Room
                </h2>
                <p className="text-sm text-slate-600 mt-2 font-medium leading-relaxed">
                  Join an existing room using the room code.
                </p>
              </div>
            </div>

            <div className="pt-8">
              <button
                type="button"
                onClick={() => setIsJoinOpen(true)}
                className="w-full py-3.5 px-6 rounded-xl bg-white border-2 border-deepsea-800 text-deepsea-800 hover:bg-deepsea-50 font-semibold text-sm shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>Join Room</span>
              </button>
            </div>
          </div>

        </div>

        {/* Security & Architecture Features Strip */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-xs text-slate-500">
          <div className="flex items-center justify-center space-x-2 bg-slate-50/80 py-2.5 px-3 rounded-xl border border-slate-200/60">
            <Lock className="w-4 h-4 text-deepsea-700" />
            <span className="font-medium">Direct WebRTC P2P</span>
          </div>
          <div className="flex items-center justify-center space-x-2 bg-slate-50/80 py-2.5 px-3 rounded-xl border border-slate-200/60">
            <Cpu className="w-4 h-4 text-deepsea-700" />
            <span className="font-medium">Secure Communication</span>
          </div>
          <div className="flex items-center justify-center space-x-2 bg-slate-50/80 py-2.5 px-3 rounded-xl border border-slate-200/60">
            <Globe className="w-4 h-4 text-deepsea-700" />
            <span className="font-medium">Max 2 Participants</span>
          </div>
        </div>

      </div>

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onRoomCreated={(roomData) => {
          setIsCreateOpen(false);
          onEnterRoom(roomData);
        }}
      />

      <JoinRoomModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onRoomJoined={(roomData) => {
          setIsJoinOpen(false);
          onEnterRoom(roomData);
        }}
      />
    </div>
  );
}
