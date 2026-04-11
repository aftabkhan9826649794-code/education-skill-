import React, { useState, useEffect, useRef } from 'react';

const VoiceMonitor = ({ onSecurityAlert, isActive }) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceDetected, setVoiceDetected] = useState(false);
  const [speakerCount, setSpeakerCount] = useState(0);
  const [voicePrintVerified, setVoicePrintVerified] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      startVoiceMonitoring();
    } else {
      stopVoiceMonitoring();
    }

    return () => stopVoiceMonitoring();
  }, [isActive]);

  const startVoiceMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup Web Audio API
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      setIsListening(true);
      monitorAudioLevel();
      detectVoices();
    } catch (error) {
      console.error('Microphone access denied:', error);
      onSecurityAlert('mic_blocked', 'Microphone access is required for exam security');
    }
  };

  const stopVoiceMonitoring = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsListening(false);
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const checkLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(Math.round(average));
      
      // Detect voice activity
      if (average > 30) {
        setVoiceDetected(true);
      } else {
        setVoiceDetected(false);
      }

      requestAnimationFrame(checkLevel);
    };

    checkLevel();
  };

  const detectVoices = () => {
    // Simulated multi-speaker detection (in production, use advanced audio analysis)
    const interval = setInterval(() => {
      if (audioLevel > 30) {
        // Simulate speaker detection
        const speakers = Math.random() > 0.8 ? 2 : 1;
        setSpeakerCount(speakers);

        if (speakers > 1) {
          onSecurityAlert('multiple_voices', 'Multiple voices detected - possible assistance');
          setVoicePrintVerified(false);
        } else {
          // Simulate voice-print verification
          const isVerified = Math.random() > 0.2;
          setVoicePrintVerified(isVerified);
          
          if (!isVerified) {
            onSecurityAlert('voice_mismatch', 'Voice does not match enrolled voice-print');
          }
        }
      } else {
        setSpeakerCount(0);
      }
    }, 3000);

    return () => clearInterval(interval);
  };

  return (
    <div className="glass-strong rounded-2xl p-4 border-2 border-gold/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <i className="fas fa-microphone text-gold"></i>
          Voice Monitoring
        </h3>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          voicePrintVerified && speakerCount === 1
            ? 'bg-green-600 text-white' 
            : speakerCount > 1
            ? 'bg-red-600 text-white animate-pulse'
            : 'bg-yellow-600 text-white'
        }`}>
          {speakerCount > 1 ? '⚠ Multiple Voices' : 
           voicePrintVerified ? '✓ Voice Match' : 
           '◷ Monitoring...'}
        </div>
      </div>

      {/* Audio Level Visualizer */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-gray-400 text-sm">Audio Level:</span>
          <span className="text-white font-bold text-sm">{audioLevel}</span>
        </div>
        <div className="w-full bg-charcoal-light rounded-full h-4 overflow-hidden">
          <div 
            className={`h-full transition-all duration-200 ${
              audioLevel > 70 ? 'bg-red-500' : 
              audioLevel > 30 ? 'bg-green-500' : 
              'bg-gray-600'
            }`}
            style={{ width: `${Math.min(audioLevel, 100)}%` }}
          />
        </div>
      </div>

      {/* Voice Wave Visualization */}
      <div className="mb-4 h-20 bg-black rounded-xl flex items-center justify-center overflow-hidden">
        {voiceDetected ? (
          <div className="flex items-center gap-1">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="bg-gold"
                style={{
                  width: '4px',
                  height: `${Math.random() * (audioLevel / 2) + 10}px`,
                  animation: `pulse ${Math.random() * 0.5 + 0.3}s ease-in-out infinite`,
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>
        ) : (
          <span className="text-gray-600 text-sm">Waiting for voice...</span>
        )}
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="glass p-2 rounded-lg">
          <span className="text-gray-400">Microphone:</span>
          <span className={`ml-2 font-bold ${isListening ? 'text-green-400' : 'text-red-400'}`}>
            {isListening ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="glass p-2 rounded-lg">
          <span className="text-gray-400">Speakers:</span>
          <span className={`ml-2 font-bold ${
            speakerCount === 1 ? 'text-green-400' : 
            speakerCount > 1 ? 'text-red-400 animate-pulse' : 
            'text-gray-400'
          }`}>
            {speakerCount}
          </span>
        </div>
        <div className="glass p-2 rounded-lg col-span-2">
          <span className="text-gray-400">Voice Print:</span>
          <span className={`ml-2 font-bold ${voicePrintVerified ? 'text-green-400' : 'text-yellow-400'}`}>
            {voicePrintVerified ? '✓ Verified' : '◷ Verifying...'}
          </span>
        </div>
      </div>

      {/* Speaker Count Alert */}
      {speakerCount > 1 && (
        <div className="mt-3 bg-red-600/20 border border-red-500 rounded-lg p-3 animate-pulse">
          <p className="text-red-400 font-bold text-xs flex items-center gap-2">
            <i className="fas fa-exclamation-triangle"></i>
            {speakerCount} voices detected - Possible unauthorized assistance!
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceMonitor;
