import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const HiddenCommandCenter = () => {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [authLayer, setAuthLayer] = useState(1);
  const [voiceCommand, setVoiceCommand] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [listening, setListening] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const inactivityTimer = useRef(null);

  // Long-press detection
  const longPressTimer = useRef(null);
  const [pressStart, setPressStart] = useState(0);

  // Stealth mode - no console logs
  const secretLog = () => {}; // Replace console.log in production

  // Auto-logout after 5 minutes of inactivity
  useEffect(() => {
    if (isAuthenticated) {
      const checkInactivity = () => {
        const now = Date.now();
        const inactiveTime = now - lastActivity;
        
        if (inactiveTime > 5 * 60 * 1000) { // 5 minutes
          handleLogout();
        }
      };

      inactivityTimer.current = setInterval(checkInactivity, 10000); // Check every 10 seconds

      const resetTimer = () => setLastActivity(Date.now());
      
      // Track user activity
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keypress', resetTimer);
      window.addEventListener('click', resetTimer);

      return () => {
        clearInterval(inactivityTimer.current);
        window.removeEventListener('mousemove', resetTimer);
        window.removeEventListener('keypress', resetTimer);
        window.removeEventListener('click', resetTimer);
      };
    }
  }, [isAuthenticated, lastActivity]);

  const handleLogoLongPress = () => {
    const pressDuration = Date.now() - pressStart;
    
    if (pressDuration >= 3000) { // 3 seconds
      setShowAuth(true);
      secretLog('Hidden auth triggered');
    }
  };

  const handleMouseDown = () => {
    setPressStart(Date.now());
    longPressTimer.current = setTimeout(() => {
      handleLogoLongPress();
    }, 3000);
  };

  const handleMouseUp = () => {
    clearTimeout(longPressTimer.current);
  };

  // Voice verification
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    setListening(true);

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      setVoiceCommand(command);
      setListening(false);

      // Secret voice command: "wings master access"
      if (command.includes('wings') && command.includes('master') && command.includes('access')) {
        setAuthLayer(2);
      } else {
        alert('Voice verification failed');
        setVoiceCommand('');
      }
    };

    recognition.onerror = () => {
      setListening(false);
      alert('Voice recognition error');
    };

    recognition.start();
  };

  // Password verification
  const verifyPassword = () => {
    // Secret password: "WINGS_GLOBAL_2025"
    if (password === 'WINGS_GLOBAL_2025') {
      setAuthLayer(3);
    } else {
      alert('Password incorrect');
      setPassword('');
    }
  };

  // PIN verification
  const handlePinInput = (digit) => {
    if (pin.length < 6) {
      setPin(pin + digit);
    }
  };

  const verifyPin = () => {
    // Secret PIN: 777888
    if (pin === '777888') {
      setIsAuthenticated(true);
      setShowAuth(false);
      setShowDashboard(true);
      setLastActivity(Date.now());
    } else {
      alert('PIN incorrect');
      setPin('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowDashboard(false);
    setShowAuth(false);
    setAuthLayer(1);
    setVoiceCommand('');
    setPassword('');
    setPin('');
    clearInterval(inactivityTimer.current);
  };

  if (showDashboard && isAuthenticated) {
    return <CommandCenterDashboard onLogout={handleLogout} />;
  }

  return (
    <>
      {/* Logo - Normal click goes home, long-press triggers auth */}
      <div
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        onClick={(e) => {
          if (Date.now() - pressStart < 3000) {
            navigate('/');
          }
        }}
        className="cursor-pointer"
        style={{ userSelect: 'none' }}
      >
        <h1 className="text-2xl font-black">
          <span className="text-gradient">WINGS GLOBAL</span>
        </h1>
      </div>

      {/* Hidden Authentication Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg">
          <div className="w-full max-w-md mx-4">
            {/* Layer 1: Voice Verification */}
            {authLayer === 1 && (
              <div className="glass-strong rounded-2xl p-8 border-2 border-royal-red/50 animate-fadeIn">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-royal-red to-gold rounded-full flex items-center justify-center animate-pulse">
                    <i className="fas fa-microphone text-white text-3xl"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Voice Verification</h2>
                  <p className="text-gray-400 text-sm">Layer 1 of 3</p>
                </div>

                <button
                  onClick={startVoiceRecognition}
                  disabled={listening}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    listening
                      ? 'bg-royal-red/50 text-white cursor-not-allowed'
                      : 'bg-gradient-royal text-white hover:glow-gold'
                  }`}
                >
                  {listening ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Listening...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-microphone mr-2"></i>
                      Speak Command
                    </>
                  )}
                </button>

                {voiceCommand && (
                  <p className="text-gold text-sm mt-4 text-center">
                    Detected: "{voiceCommand}"
                  </p>
                )}

                <button
                  onClick={() => setShowAuth(false)}
                  className="w-full mt-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Layer 2: Password */}
            {authLayer === 2 && (
              <div className="glass-strong rounded-2xl p-8 border-2 border-gold/50 animate-fadeIn">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gold to-yellow-600 rounded-full flex items-center justify-center animate-pulse">
                    <i className="fas fa-lock text-white text-3xl"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Secure Password</h2>
                  <p className="text-gray-400 text-sm">Layer 2 of 3</p>
                </div>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && verifyPassword()}
                  placeholder="Enter master password"
                  className="w-full glass border-2 border-gold/30 rounded-xl px-4 py-4 text-white text-center text-lg font-mono tracking-widest placeholder-gray-500 focus:outline-none focus:border-gold transition-all mb-4"
                  autoFocus
                />

                <button
                  onClick={verifyPassword}
                  className="w-full bg-gradient-to-r from-gold to-yellow-600 py-4 rounded-xl text-white font-bold text-lg hover:glow-gold transition-all"
                >
                  <i className="fas fa-arrow-right mr-2"></i>
                  Verify Password
                </button>

                <button
                  onClick={() => setShowAuth(false)}
                  className="w-full mt-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Layer 3: PIN Pad */}
            {authLayer === 3 && (
              <div className="glass-strong rounded-2xl p-8 border-2 border-green-500/50 animate-fadeIn">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center animate-pulse">
                    <i className="fas fa-shield-alt text-white text-3xl"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Master PIN</h2>
                  <p className="text-gray-400 text-sm">Layer 3 of 3</p>
                </div>

                {/* PIN Display */}
                <div className="flex justify-center gap-2 mb-6">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center ${
                        i < pin.length ? 'bg-gold border-gold' : 'bg-gray-800 border-gray-600'
                      }`}
                    >
                      {i < pin.length && <i className="fas fa-circle text-white text-xs"></i>}
                    </div>
                  ))}
                </div>

                {/* PIN Pad */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                    <button
                      key={digit}
                      onClick={() => handlePinInput(digit.toString())}
                      className="glass-strong border border-green-500/30 py-4 rounded-xl text-white font-bold text-xl hover:bg-green-500/20 hover:border-green-500 transition-all"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    onClick={() => setPin('')}
                    className="glass-strong border border-red-500/30 py-4 rounded-xl text-red-400 font-bold hover:bg-red-500/20 transition-all"
                  >
                    <i className="fas fa-backspace"></i>
                  </button>
                  <button
                    onClick={() => handlePinInput('0')}
                    className="glass-strong border border-green-500/30 py-4 rounded-xl text-white font-bold text-xl hover:bg-green-500/20 hover:border-green-500 transition-all"
                  >
                    0
                  </button>
                  <button
                    onClick={verifyPin}
                    disabled={pin.length !== 6}
                    className="glass-strong border border-green-500/30 py-4 rounded-xl text-green-400 font-bold hover:bg-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-check"></i>
                  </button>
                </div>

                <button
                  onClick={() => setShowAuth(false)}
                  className="w-full py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Command Center Dashboard Component
const CommandCenterDashboard = ({ onLogout }) => {
  const [finance, setFinance] = useState({ income: 1250000, expenses: 450000 });
  const [globalUsers, setGlobalUsers] = useState(12543);
  const [activeBoards, setActiveBoards] = useState({
    CBSE: true,
    ICSE: true,
    State: true,
    IB: false,
    Cambridge: true,
    NIOS: true,
    IGNOU: false
  });

  const toggleBoard = (board) => {
    setActiveBoards({ ...activeBoards, [board]: !activeBoards[board] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900/30 via-black to-gold/20 relative overflow-hidden">
      {/* Premium Control Room Background */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(196,30,58,0.3),transparent_50%)]"></div>
        <div className="absolute top-20 right-10 w-96 h-96 bg-gold/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-royal-red/40 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="glass-strong rounded-2xl p-6 mb-6 border-2 border-gold/30">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black mb-2">
                <span className="bg-gradient-to-r from-gold via-yellow-400 to-gold bg-clip-text text-transparent">
                  🔐 COMMAND CENTER
                </span>
              </h1>
              <p className="text-gray-400">Master Control Dashboard</p>
            </div>
            <button
              onClick={onLogout}
              className="bg-royal-red px-6 py-3 rounded-full text-white font-bold hover:glow-gold transition-all"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Secure Logout
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Finance */}
          <div className="glass-strong rounded-xl p-6 border-2 border-green-500/30">
            <h3 className="text-gold font-bold mb-2 flex items-center gap-2">
              <i className="fas fa-dollar-sign"></i>
              Income
            </h3>
            <p className="text-3xl font-black text-green-400">₹{(finance.income / 100000).toFixed(1)}L</p>
          </div>

          <div className="glass-strong rounded-xl p-6 border-2 border-red-500/30">
            <h3 className="text-gold font-bold mb-2 flex items-center gap-2">
              <i className="fas fa-minus-circle"></i>
              Expenses
            </h3>
            <p className="text-3xl font-black text-red-400">₹{(finance.expenses / 100000).toFixed(1)}L</p>
          </div>

          <div className="glass-strong rounded-xl p-6 border-2 border-gold/30">
            <h3 className="text-gold font-bold mb-2 flex items-center gap-2">
              <i className="fas fa-users"></i>
              Active Users
            </h3>
            <p className="text-3xl font-black text-gold">{globalUsers.toLocaleString()}</p>
          </div>

          <div className="glass-strong rounded-xl p-6 border-2 border-purple-500/30">
            <h3 className="text-gold font-bold mb-2 flex items-center gap-2">
              <i className="fas fa-globe"></i>
              Countries
            </h3>
            <p className="text-3xl font-black text-purple-400">15</p>
          </div>
        </div>

        {/* Master Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Board Controls */}
          <div className="glass-strong rounded-xl p-6 border-2 border-gold/30">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <i className="fas fa-sliders-h text-gold"></i>
              Board Controls
            </h2>
            <div className="space-y-3">
              {Object.keys(activeBoards).map((board) => (
                <div key={board} className="flex justify-between items-center glass rounded-lg p-3">
                  <span className="text-white font-semibold">{board}</span>
                  <button
                    onClick={() => toggleBoard(board)}
                    className={`relative w-16 h-8 rounded-full transition-colors ${
                      activeBoards[board] ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        activeBoards[board] ? 'translate-x-8' : 'translate-x-0'
                      }`}
                    ></span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Global Map */}
          <div className="glass-strong rounded-xl p-6 border-2 border-gold/30">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <i className="fas fa-map-marker-alt text-gold"></i>
              Live Global Map
            </h2>
            <div className="relative h-64 bg-black/50 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-globe-asia text-gold text-6xl mb-4 animate-pulse"></i>
                  <p className="text-white font-bold">Active in 15+ Countries</p>
                  <p className="text-gray-400 text-sm">Assam • Sudan • UAE • USA • UK</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HiddenCommandCenter;
