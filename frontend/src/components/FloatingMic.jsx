import React, { useState } from 'react';

const FloatingMic = () => {
  const [isListening, setIsListening] = useState(false);

  const startVoiceAction = () => {
    setIsListening(!isListening);
    console.log('🎤 Voice command', isListening ? 'stopped' : 'started');
    // Will implement full voice commands in Phase 3
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onClick={startVoiceAction}
        className={`w-16 h-16 rounded-full bg-gradient-royal flex items-center justify-center text-white text-2xl transition-all duration-300 hover:scale-110 ${
          isListening ? 'glow-gold animate-pulse' : 'hover:glow-gold'
        }`}
        title="Voice Command"
        aria-label="Start Voice Command"
      >
        <i className={`fas fa-microphone ${isListening ? 'animate-pulse' : ''}`}></i>
      </button>
    </div>
  );
};

export default FloatingMic;