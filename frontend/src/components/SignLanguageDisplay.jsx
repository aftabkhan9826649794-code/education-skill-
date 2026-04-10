import React, { useState, useEffect } from 'react';

const SignLanguageDisplay = ({ text, isActive }) => {
  const [currentGesture, setCurrentGesture] = useState(null);
  const [gestureSequence, setGestureSequence] = useState([]);

  // Sign language gesture mappings
  const signLanguageMap = {
    'hello': { gesture: '👋', description: 'Wave hand', color: '#FFD700' },
    'thank you': { gesture: '🙏', description: 'Hands together', color: '#48bb78' },
    'yes': { gesture: '👍', description: 'Thumbs up', color: '#4299e1' },
    'no': { gesture: '👎', description: 'Thumbs down', color: '#f56565' },
    'help': { gesture: '🆘', description: 'Help sign', color: '#ed8936' },
    'good': { gesture: '✌️', description: 'Peace sign', color: '#9f7aea' },
    'learn': { gesture: '📚', description: 'Learning gesture', color: '#38b2ac' },
    'understand': { gesture: '💡', description: 'Light bulb', color: '#ecc94b' },
    'question': { gesture: '❓', description: 'Question mark', color: '#fc8181' },
    'welcome': { gesture: '🤗', description: 'Open arms', color: '#f6ad55' }
  };

  useEffect(() => {
    if (isActive && text) {
      convertToSignLanguage(text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, isActive]);

  const convertToSignLanguage = (inputText) => {
    const lowerText = inputText.toLowerCase();
    const sequence = [];
    
    // Check for known phrases
    Object.keys(signLanguageMap).forEach(phrase => {
      if (lowerText.includes(phrase)) {
        sequence.push(signLanguageMap[phrase]);
      }
    });

    // If no matches, show letter-by-letter
    if (sequence.length === 0) {
      const words = inputText.split(' ');
      words.forEach((word, index) => {
        sequence.push({
          gesture: word.charAt(0).toUpperCase(),
          description: `Letter: ${word.charAt(0)}`,
          color: '#C41E3A'
        });
      });
    }

    setGestureSequence(sequence);
    animateGestures(sequence);
  };

  const animateGestures = (sequence) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < sequence.length) {
        setCurrentGesture(sequence[index]);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => setCurrentGesture(null), 2000);
      }
    }, 1500);
  };

  if (!isActive) return null;

  return (
    <div className="glass-strong rounded-2xl p-8 border-2 border-gold animate-slide-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gold">
          <i className="fas fa-hands mr-3"></i>
          Sign Language Translation
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-semibold">Live</span>
        </div>
      </div>

      {/* Current Gesture Display */}
      <div className="text-center mb-8">
        <div className="inline-block p-8 glass rounded-3xl border border-gold/30">
          {currentGesture ? (
            <>
              <div 
                className="text-9xl mb-4 animate-bounce"
                style={{ color: currentGesture.color }}
              >
                {currentGesture.gesture}
              </div>
              <p className="text-white text-xl font-semibold">{currentGesture.description}</p>
            </>
          ) : (
            <div className="text-6xl text-gray-500">
              <i className="fas fa-hand-peace"></i>
              <p className="text-lg mt-4">Waiting for input...</p>
            </div>
          )}
        </div>
      </div>

      {/* Gesture Sequence */}
      {gestureSequence.length > 0 && (
        <div>
          <p className="text-gray-400 text-sm mb-3">Gesture Sequence:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {gestureSequence.map((gesture, index) => (
              <div
                key={index}
                className="glass px-4 py-3 rounded-xl border border-gold/20 hover:glow-gold transition-all cursor-pointer"
              >
                <span className="text-3xl" style={{ color: gesture.color }}>
                  {gesture.gesture}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Reference */}
      <div className="mt-8 pt-6 border-t border-gold/20">
        <p className="text-gold font-semibold mb-4">
          <i className="fas fa-book-open mr-2"></i>
          Quick Reference Guide:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(signLanguageMap).slice(0, 5).map(([key, value]) => (
            <div key={key} className="glass p-3 rounded-lg text-center hover:bg-gold/10 transition-all cursor-pointer">
              <div className="text-2xl mb-1">{value.gesture}</div>
              <p className="text-white text-xs">{key}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignLanguageDisplay;
