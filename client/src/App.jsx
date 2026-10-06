import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutPage from './pages/AboutPage';
import SettingsPage from './pages/SettingsPage';
import CallScreen from './components/CallScreen';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'security' | 'how-it-works' | 'about' | 'settings'
  const [currentScreen, setCurrentScreen] = useState('page'); // 'page' | 'call'
  const [roomData, setRoomData] = useState(null); // { roomCode, userName, isHost }

  const handleEnterRoom = (data) => {
    setRoomData(data);
    setCurrentScreen('call');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLeaveCall = () => {
    setRoomData(null);
    setCurrentScreen('page');
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (pageId) => {
    if (currentScreen === 'call') {
      const confirmLeave = window.confirm('You are in an active video call. Are you sure you want to leave the room?');
      if (confirmLeave) {
        handleLeaveCall();
        setCurrentPage(pageId);
      }
    } else {
      setCurrentPage(pageId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={`${
      currentScreen === 'call' ? 'h-screen w-screen overflow-hidden bg-slate-950' : 'min-h-screen bg-white'
    } flex flex-col selection:bg-deepsea-100 selection:text-deepsea-900 font-sans text-slate-900`}>
      {/* Global Navigation Header (shown in video call and across pages) */}
      <Header
        currentPage={currentScreen === 'call' ? 'call' : currentPage}
        onNavigate={handleNavigate}
      />

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col ${currentScreen === 'call' ? 'overflow-hidden' : ''}`}>
        {currentScreen === 'call' && roomData ? (
          <CallScreen
            roomData={roomData}
            onLeaveCall={handleLeaveCall}
          />
        ) : (
          <>
            {currentPage === 'home' && (
              <HomePage onEnterRoom={handleEnterRoom} />
            )}
            {currentPage === 'how-it-works' && (
              <HowItWorksPage onNavigate={handleNavigate} />
            )}
            {(currentPage === 'about' || currentPage === 'security') && (
              <AboutPage />
            )}
            {currentPage === 'settings' && (
              <SettingsPage />
            )}
          </>
        )}
      </main>

      {/* Footer (hidden during active call for full screen video call) */}
      {currentScreen !== 'call' && <Footer />}
    </div>
  );
}
