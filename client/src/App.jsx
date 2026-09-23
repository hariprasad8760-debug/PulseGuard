import React, { useState } from 'react';
import Header from './components/Header';
import HomeScreen from './components/HomeScreen';
import CallScreen from './components/CallScreen';
import AboutModal from './components/AboutModal';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home' | 'call'
  const [roomData, setRoomData] = useState(null); // { roomCode, userName, isHost }
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleEnterRoom = (data) => {
    setRoomData(data);
    setCurrentScreen('call');
  };

  const handleLeaveCall = () => {
    setRoomData(null);
    setCurrentScreen('home');
  };

  const handleHomeClick = () => {
    if (currentScreen === 'call') {
      const confirmLeave = window.confirm('Are you sure you want to leave the ongoing call?');
      if (confirmLeave) {
        handleLeaveCall();
      }
    } else {
      setCurrentScreen('home');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-deepsea-100 selection:text-deepsea-900">
      {/* Top Header */}
      <Header
        currentScreen={currentScreen}
        onHomeClick={handleHomeClick}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onAboutClick={() => setIsAboutOpen(true)}
      />

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col">
        {currentScreen === 'home' && (
          <HomeScreen onEnterRoom={handleEnterRoom} />
        )}

        {currentScreen === 'call' && roomData && (
          <CallScreen
            roomData={roomData}
            onLeaveCall={handleLeaveCall}
          />
        )}
      </main>

      {/* Modals */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
