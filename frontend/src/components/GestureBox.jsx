import React, { useState } from 'react';

const GestureBox = () => {
  const [isActive, setIsActive] = useState(false);

  const startSignLanguage = () => {
    setIsActive(true);
    console.log('📸 Sign Language camera activated');
    // Will implement MediaPipe in Phase 3
  };

  const stopSignLanguage = () => {
    setIsActive(false);
    console.log('📸 Sign Language camera deactivated');
  };

  if (!isActive) return null;

  return (
    <div className="fixed bottom-8 left-8 w-80 h-60 glass-strong rounded-2xl overflow-hidden z-50 border-2 border-gold">
      <button
        onClick={stopSignLanguage}
        className="absolute top-3 right-3 w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white font-bold z-10 transition-all duration-300 hover:scale-110"
        title="Close Sign Language"
        aria-label="Close Sign Language Window"
      >
        ✕
      </button>
      
      <div className="w-full h-full bg-black/80 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-video text-4xl text-gold mb-4"></i>
          <p className="text-white font-semibold">Sign Language Recognition</p>
          <p className="text-gray-400 text-sm">Camera initializing...</p>
        </div>
      </div>
      
      <div className="absolute bottom-3 left-3 glass px-4 py-2 rounded-lg">
        <span className="text-gold font-semibold text-sm">AI Sign Recognition: Ready</span>
      </div>
    </div>
  );
};

export default GestureBox;
