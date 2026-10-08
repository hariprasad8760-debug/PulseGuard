import React, { useState, useEffect } from 'react';
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
  
  // Theme state ('light' | 'dark')
  const [theme, setTheme] = useState(() => localStorage.getItem('pg_theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('pg_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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

  const isInCall = currentScreen === 'call';

  return (
    <div className={`${
      isInCall ? 'h-screen w-screen overflow-hidden bg-slate-950' : 'min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200'
    } flex flex-col selection:bg-deepsea-100 selection:text-deepsea-900 font-sans`}>

      {/* Global Navigation Header — hidden during video call for true full-screen immersion */}
      {!isInCall && (
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigate}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      )}

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col ${isInCall ? 'overflow-hidden' : ''}`}>
        {isInCall && roomData ? (
          /* CallScreen takes 100% of the viewport with its own compact internal call bar */
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
              <SettingsPage theme={theme} onToggleTheme={handleToggleTheme} />
            )}
          </>
        )}
      </main>

      {/* Footer — hidden during call */}
      {!isInCall && <Footer />}
    </div>
  );
}
