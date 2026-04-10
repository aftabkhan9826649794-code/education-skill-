import React, { useState } from 'react';

const AccessibilitySidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: 16,
    highContrast: false,
    voiceCommands: false,
    screenReader: false,
    textToSpeech: false,
    brailleDisplay: false
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    console.log(`${key} ${!settings[key] ? 'enabled' : 'disabled'}`);
  };

  const adjustFontSize = (delta) => {
    const newSize = Math.max(12, Math.min(24, settings.fontSize + delta));
    setSettings(prev => ({ ...prev, fontSize: newSize }));
    document.documentElement.style.fontSize = newSize + 'px';
  };

  return (
    <>
      {/* Accessibility Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-0 top-1/2 transform -translate-y-1/2 z-50 bg-gradient-royal text-white px-3 py-6 rounded-r-xl hover:glow-gold transition-all duration-300 flex flex-col items-center gap-2 shadow-2xl"
        title="Accessibility Settings"
        aria-label="Open Accessibility Menu"
      >
        <i className="fas fa-universal-access text-2xl"></i>
        <span className="text-xs font-bold writing-mode-vertical" style={{writingMode: 'vertical-rl'}}>ACCESS</span>
      </button>

      {/* Accessibility Sidebar */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-slide-in"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sidebar Panel */}
          <div className="fixed left-0 top-0 h-full w-80 max-w-[90vw] glass-strong border-r-2 border-gold z-50 overflow-y-auto animate-slide-in">
            {/* Header */}
            <div className="bg-gradient-royal p-6 sticky top-0 z-10">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-white">Accessibility</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gold transition-colors"
                  aria-label="Close Accessibility Menu"
                >
                  <i className="fas fa-times text-2xl"></i>
                </button>
              </div>
              <p className="text-gold text-sm">Quick Access Settings</p>
            </div>

            {/* Settings */}
            <div className="p-6 space-y-6">
              {/* Font Size Control */}
              <div className="glass p-4 rounded-xl border border-gold/20">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <i className="fas fa-text-height text-gold"></i>
                  Text Size
                </h3>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => adjustFontSize(-1)}
                    className="w-10 h-10 glass rounded-lg text-gold hover:glow-gold transition-all"
                    aria-label="Decrease Font Size"
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <span className="text-white font-semibold">{settings.fontSize}px</span>
                  <button
                    onClick={() => adjustFontSize(1)}
                    className="w-10 h-10 glass rounded-lg text-gold hover:glow-gold transition-all"
                    aria-label="Increase Font Size"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>

              {/* Toggle Settings */}
              <div className="space-y-3">
                {/* High Contrast */}
                <div className="glass p-4 rounded-xl border border-gold/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-adjust text-gold text-xl"></i>
                    <div>
                      <p className="text-white font-semibold">High Contrast</p>
                      <p className="text-gray-400 text-xs">Better visibility</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSetting('highContrast')}
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${
                      settings.highContrast ? 'bg-gold' : 'bg-gray-600'
                    }`}
                    aria-label="Toggle High Contrast"
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                      settings.highContrast ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {/* Voice Commands */}
                <div className="glass p-4 rounded-xl border border-gold/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-microphone text-gold text-xl"></i>
                    <div>
                      <p className="text-white font-semibold">Voice Commands</p>
                      <p className="text-gray-400 text-xs">Hands-free control</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSetting('voiceCommands')}
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${
                      settings.voiceCommands ? 'bg-gold' : 'bg-gray-600'
                    }`}
                    aria-label="Toggle Voice Commands"
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                      settings.voiceCommands ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {/* Screen Reader */}
                <div className="glass p-4 rounded-xl border border-gold/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-eye text-gold text-xl"></i>
                    <div>
                      <p className="text-white font-semibold">Screen Reader</p>
                      <p className="text-gray-400 text-xs">Audio descriptions</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSetting('screenReader')}
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${
                      settings.screenReader ? 'bg-gold' : 'bg-gray-600'
                    }`}
                    aria-label="Toggle Screen Reader"
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                      settings.screenReader ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {/* Text to Speech */}
                <div className="glass p-4 rounded-xl border border-gold/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-volume-up text-gold text-xl"></i>
                    <div>
                      <p className="text-white font-semibold">Text to Speech</p>
                      <p className="text-gray-400 text-xs">Read content aloud</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSetting('textToSpeech')}
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${
                      settings.textToSpeech ? 'bg-gold' : 'bg-gray-600'
                    }`}
                    aria-label="Toggle Text to Speech"
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                      settings.textToSpeech ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {/* Braille Display */}
                <div className="glass p-4 rounded-xl border border-gold/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-braille text-gold text-xl"></i>
                    <div>
                      <p className="text-white font-semibold">Braille Display</p>
                      <p className="text-gray-400 text-xs">For visually impaired</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSetting('brailleDisplay')}
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${
                      settings.brailleDisplay ? 'bg-gold' : 'bg-gray-600'
                    }`}
                    aria-label="Toggle Braille Display"
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                      settings.brailleDisplay ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass p-4 rounded-xl border border-gold/20">
                <h3 className="text-white font-bold mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full glass py-3 rounded-lg text-gold hover:glow-gold transition-all text-left px-4">
                    <i className="fas fa-hands-asl-interpreting mr-2"></i>
                    Open Sign Language Hub
                  </button>
                  <button className="w-full glass py-3 rounded-lg text-gold hover:glow-gold transition-all text-left px-4">
                    <i className="fas fa-keyboard mr-2"></i>
                    Keyboard Shortcuts
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AccessibilitySidebar;