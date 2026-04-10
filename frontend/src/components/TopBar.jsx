import React, { useState } from 'react';

const TopBar = () => {
  const [fontSize, setFontSize] = useState(16);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const changeFontSize = (delta) => {
    const newSize = Math.max(12, Math.min(24, fontSize + delta));
    setFontSize(newSize);
    document.documentElement.style.fontSize = newSize + 'px';
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Dark mode toggle logic (currently always dark for cinematic theme)
  };

  const startSpeechToText = () => {
    console.log('🎤 Speech to Text activated');
    // Will implement in Phase 3
  };

  return (
    <header className="glass-strong relative z-50 px-4 md:px-8 py-2">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.location.href = '#accessibility'}
            className="glass w-10 h-10 rounded-full flex items-center justify-center text-gold hover:glow-gold transition-all duration-300 hover:scale-110"
            title="Accessibility Center"
            aria-label="Accessibility Center"
          >
            <i className="fas fa-universal-access"></i>
          </button>
          
          <button
            onClick={() => window.location.href = '#sign-language'}
            className="glass w-10 h-10 rounded-full flex items-center justify-center text-gold hover:glow-gold transition-all duration-300 hover:scale-110"
            title="Sign Language Hub"
            aria-label="Sign Language Hub"
          >
            <i className="fas fa-hands-asl-interpreting"></i>
          </button>
          
          <button
            onClick={() => changeFontSize(1)}
            className="glass w-10 h-10 rounded-full flex items-center justify-center text-gold hover:glow-gold transition-all duration-300 hover:scale-110"
            title="Increase Font"
            aria-label="Increase Font Size"
          >
            <i className="fas fa-plus"></i>
          </button>
          
          <button
            onClick={() => changeFontSize(-1)}
            className="glass w-10 h-10 rounded-full flex items-center justify-center text-gold hover:glow-gold transition-all duration-300 hover:scale-110"
            title="Decrease Font"
            aria-label="Decrease Font Size"
          >
            <i className="fas fa-minus"></i>
          </button>
          
          <button
            onClick={startSpeechToText}
            className="glass w-10 h-10 rounded-full flex items-center justify-center text-gold hover:glow-gold transition-all duration-300 hover:scale-110"
            title="Speech to Text"
            aria-label="Start Speech to Text"
          >
            <i className="fas fa-microphone"></i>
          </button>
          
          <button
            onClick={toggleDarkMode}
            className="glass w-10 h-10 rounded-full flex items-center justify-center text-gold hover:glow-gold transition-all duration-300 hover:scale-110"
            title="Dark/Light Mode"
            aria-label="Toggle Dark or Light Mode"
          >
            <i className="fas fa-moon"></i>
          </button>
        </div>
        
        <div id="google_translate_element" className="translate-widget"></div>
      </div>
    </header>
  );
};

export default TopBar;