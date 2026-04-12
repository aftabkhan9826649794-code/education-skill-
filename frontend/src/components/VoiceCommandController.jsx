// Global Voice Command System for WINGS Platform
// Supports: Navigation, Form filling, Button clicks, Multi-language

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const VoiceCommandController = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Voice Command Map
  const commands = {
    // Navigation Commands
    navigation: {
      'go home': '/',
      'home page': '/',
      'go to home': '/',
      'ai hub': '/ai-tutor',
      'open ai hub': '/ai-tutor',
      'ai teacher': '/ai-tutor',
      'sara': '/ai-tutor',
      'study hub': '/learning-hub',
      'open study hub': '/learning-hub',
      'learning hub': '/learning-hub',
      'skill lab': '/master-skill-hub',
      'open skill lab': '/master-skill-hub',
      'skill hub': '/master-skill-hub',
      'exam hub': '/exam-hub',
      'open exam hub': '/exam-hub',
      'education hub': '/education-hub',
      'open education hub': '/education-hub',
      'competitive': '/competitive-exam-hub',
      'competitive exam': '/competitive-exam-hub',
      'login': '/login',
      'open login': '/login',
      'log in': '/login',
      'admin portal': '/admin-portal',
      'open admin': '/admin-portal',
    },
    
    // Action Commands
    actions: {
      'scroll down': () => window.scrollBy(0, 500),
      'scroll up': () => window.scrollBy(0, -500),
      'go back': () => window.history.back(),
      'go forward': () => window.history.forward(),
      'refresh': () => window.location.reload(),
      'reload': () => window.location.reload(),
      'stop listening': () => setVoiceEnabled(false),
      'stop voice': () => setVoiceEnabled(false),
    },
    
    // Button Click Commands
    buttons: {
      'click start lesson': () => clickButton('Start Lesson'),
      'start lesson': () => clickButton('Start Lesson'),
      'click login': () => clickButton('Login', 'Secure Login'),
      'submit': () => clickButton('Submit'),
      'explore resources': () => clickButton('Explore Resources'),
      'start quiz': () => clickButton('Start AI Quiz', 'Start Quiz'),
      'open subject lab': () => clickButton('Open Subject Lab'),
    }
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech Recognition not supported');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US'; // Default English

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript.toLowerCase().trim();
          } else {
            interimTranscript += transcript.toLowerCase().trim();
          }
        }

        const currentTranscript = finalTranscript || interimTranscript;
        setTranscript(currentTranscript);

        if (finalTranscript) {
          processCommand(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Silently handle - user just wasn't speaking
          return;
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (voiceEnabled) {
          // Auto-restart if voice is still enabled
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Already started
          }
        } else {
          setIsListening(false);
        }
      };
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
    }

    return () => {
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  // Start/Stop Voice Recognition
  useEffect(() => {
    if (voiceEnabled && recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        speak('Voice commands activated');
      } catch (error) {
        if (error.message.includes('already started')) {
          // Already running, that's fine
          setIsListening(true);
        } else {
          console.error('Failed to start recognition:', error);
        }
      }
    } else if (!voiceEnabled && recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        speak('Voice commands deactivated');
      } catch (error) {
        console.error('Failed to stop recognition:', error);
      }
    }
  }, [voiceEnabled]);

  // Process Voice Command
  const processCommand = (command) => {
    console.log('Processing command:', command);
    setLastCommand(command);

    // Check Navigation Commands
    for (const [key, route] of Object.entries(commands.navigation)) {
      if (command.includes(key)) {
        navigate(route);
        speak(`Navigating to ${key}`);
        return;
      }
    }

    // Check Action Commands
    for (const [key, action] of Object.entries(commands.actions)) {
      if (command.includes(key)) {
        if (typeof action === 'function') {
          action();
          speak(`Executing ${key}`);
        }
        return;
      }
    }

    // Check Button Commands
    for (const [key, action] of Object.entries(commands.buttons)) {
      if (command.includes(key)) {
        action();
        speak(`Clicking ${key}`);
        return;
      }
    }

    // If no command matched
    speak('Command not recognized. Say help for available commands.');
  };

  // Text-to-Speech
  const speak = (text) => {
    if (synthRef.current && text) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      synthRef.current.speak(utterance);
    }
  };

  // Click Button by Text
  const clickButton = (...buttonTexts) => {
    for (const text of buttonTexts) {
      const button = Array.from(document.querySelectorAll('button, a')).find(
        (el) => el.textContent.toLowerCase().includes(text.toLowerCase())
      );
      if (button) {
        button.click();
        return;
      }
    }
    speak('Button not found on this page');
  };

  // Toggle Voice Commands
  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <>
      {/* Floating Voice Control Button */}
      <button
        onClick={toggleVoice}
        className={`fixed bottom-24 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
          voiceEnabled
            ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] animate-pulse'
            : 'bg-gradient-to-r from-[#C41E3A] to-[#8B0000]'
        }`}
        title={voiceEnabled ? 'Disable Voice Commands' : 'Enable Voice Commands'}
      >
        <i className={`fas ${voiceEnabled ? 'fa-microphone' : 'fa-microphone-slash'} text-2xl text-white`}></i>
      </button>

      {/* Listening Indicator - Golden Wave */}
      {isListening && (
        <div className="fixed bottom-0 left-0 right-0 z-40 h-2 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] animate-pulse">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
        </div>
      )}

      {/* Transcript Display */}
      {voiceEnabled && transcript && (
        <div className="fixed top-24 right-6 z-50 backdrop-blur-xl bg-black/60 rounded-xl p-4 max-w-md border border-[#FFD700]/50 shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-pulse"></div>
            <span className="text-[#FFD700] font-bold text-sm">LISTENING</span>
          </div>
          <p className="text-white text-sm">{transcript}</p>
          {lastCommand && (
            <p className="text-gray-400 text-xs mt-2">Last: {lastCommand}</p>
          )}
        </div>
      )}

      {/* Help Overlay - Show on "help" command */}
      {transcript.includes('help') && voiceEnabled && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="backdrop-blur-xl bg-gradient-to-br from-[#C41E3A]/90 to-[#8B0000]/90 rounded-2xl p-8 max-w-2xl border-2 border-[#FFD700] shadow-2xl">
            <h2 className="text-3xl font-bold text-[#FFD700] mb-6 text-center">🎤 Voice Commands</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-3">📍 Navigation</h3>
                <ul className="text-gray-200 text-sm space-y-1">
                  <li>• "Go home"</li>
                  <li>• "AI Hub"</li>
                  <li>• "Study Hub"</li>
                  <li>• "Skill Lab"</li>
                  <li>• "Exam Hub"</li>
                  <li>• "Login"</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-3">⚡ Actions</h3>
                <ul className="text-gray-200 text-sm space-y-1">
                  <li>• "Scroll down"</li>
                  <li>• "Scroll up"</li>
                  <li>• "Go back"</li>
                  <li>• "Refresh"</li>
                  <li>• "Stop voice"</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setTranscript('')}
              className="mt-6 w-full bg-[#FFD700] text-black font-bold py-3 rounded-lg hover:bg-[#FFA500] transition-colors"
            >
              Close Help
            </button>
          </div>
        </div>
      )}

      {/* CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </>
  );
};

export default VoiceCommandController;
