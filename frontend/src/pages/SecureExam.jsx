import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FaceRecognitionMonitor from '../components/FaceRecognitionMonitor';
import VoiceMonitor from '../components/VoiceMonitor';

const SecureExam = () => {
  const navigate = useNavigate();
  const [examStarted, setExamStarted] = useState(false);
  const [securityVerified, setSecurityVerified] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(3600); // 1 hour
  const [violations, setViolations] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [fullScreenMode, setFullScreenMode] = useState(false);

  const questions = [
    {
      id: 1,
      question: 'What is the powerhouse of the cell?',
      options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Cell Membrane'],
      correct: 1
    },
    {
      id: 2,
      question: 'What is the chemical formula for water?',
      options: ['H2O', 'CO2', 'O2', 'NaCl'],
      correct: 0
    },
    {
      id: 3,
      question: 'Who wrote Romeo and Juliet?',
      options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
      correct: 1
    }
  ];

  useEffect(() => {
    if (examStarted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            submitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [examStarted]);

  useEffect(() => {
    // Detect tab switching
    const handleVisibilityChange = () => {
      if (document.hidden && examStarted) {
        handleSecurityAlert('tab_switch', 'Student switched tabs - possible cheating');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [examStarted]);

  const handleSecurityAlert = (type, message) => {
    const alert = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setViolations(prev => [...prev, alert]);
  };

  const startExam = () => {
    if (!securityVerified) {
      alert('Please wait for biometric verification to complete');
      return;
    }
    setExamStarted(true);
    enterFullScreen();
  };

  const enterFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
      setFullScreenMode(true);
    }
  };

  const submitExam = () => {
    setExamStarted(false);
    alert(`Exam submitted! Score: ${calculateScore()}/${questions.length}`);
    navigate('/exam-hub');
  };

  const calculateScore = () => {
    return questions.filter((q, i) => answers[i] === q.correct).length;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-midnight-black relative">
      {/* Background */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute top-20 right-10 w-96 h-96 bg-red-900/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gold/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="glass-strong rounded-2xl p-6 mb-6 border-2 border-gold">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-black text-gradient mb-2">
                  <i className="fas fa-lock text-gold mr-2"></i>
                  SECURE EXAM MODE
                </h1>
                <p className="text-gray-400">Advanced AI-Powered Proctoring System</p>
              </div>
              
              {examStarted && (
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Time Remaining</p>
                    <p className={`text-3xl font-black ${
                      timeRemaining < 300 ? 'text-red-500 animate-pulse' : 'text-gold'
                    }`}>
                      {formatTime(timeRemaining)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Question</p>
                    <p className="text-2xl font-bold text-white">
                      {currentQuestion + 1}/{questions.length}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Security Monitoring Panel (Left) */}
            <div className="lg:col-span-1 space-y-6">
              {/* Face Recognition */}
              <FaceRecognitionMonitor 
                onSecurityAlert={handleSecurityAlert}
                isActive={!examStarted || examStarted}
              />

              {/* Voice Monitoring */}
              <VoiceMonitor 
                onSecurityAlert={handleSecurityAlert}
                isActive={!examStarted || examStarted}
              />

              {/* Violations Log */}
              <div className="glass-strong rounded-2xl p-4 border-2 border-red-500/30">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <i className="fas fa-exclamation-triangle text-red-500"></i>
                  Security Alerts ({violations.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {violations.length === 0 ? (
                    <p className="text-green-400 text-sm">No violations detected ✓</p>
                  ) : (
                    violations.slice(-5).reverse().map(alert => (
                      <div key={alert.id} className="bg-red-600/20 border border-red-500 rounded-lg p-2">
                        <p className="text-red-400 font-bold text-xs">{alert.message}</p>
                        <p className="text-gray-500 text-xs mt-1">{alert.timestamp}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Exam Content (Right) */}
            <div className="lg:col-span-2">
              {!examStarted ? (
                /* Pre-Exam Verification */
                <div className="glass-strong rounded-2xl p-8 border-2 border-gold">
                  <h2 className="text-3xl font-black text-white mb-6">
                    Biometric Verification Required
                  </h2>
                  
                  <div className="space-y-6 mb-8">
                    <div className="flex items-center gap-4 p-4 glass rounded-xl">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                        <i className="fas fa-check text-white text-xl"></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold">Face Recognition</h3>
                        <p className="text-gray-400 text-sm">Verifying your identity...</p>
                      </div>
                      <button 
                        onClick={() => setSecurityVerified(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all"
                      >
                        Verify
                      </button>
                    </div>

                    <div className="flex items-center gap-4 p-4 glass rounded-xl">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <i className="fas fa-microphone text-white text-xl"></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold">Voice Print ID</h3>
                        <p className="text-gray-400 text-sm">Speak to enroll your voice</p>
                      </div>
                      <div className="text-green-400 font-bold">
                        {securityVerified ? '✓ Ready' : '◷ Waiting'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={startExam}
                    disabled={!securityVerified}
                    className="w-full bg-gradient-royal py-4 rounded-xl text-white font-bold text-xl hover:glow-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-play mr-2"></i>
                    Start Secure Exam
                  </button>

                  <div className="mt-6 bg-yellow-600/20 border border-yellow-500 rounded-xl p-4">
                    <h4 className="text-yellow-400 font-bold mb-2">
                      <i className="fas fa-info-circle mr-2"></i>
                      Security Features Active:
                    </h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>✓ Real-time face detection</li>
                      <li>✓ Voice-print verification</li>
                      <li>✓ Multiple speaker detection</li>
                      <li>✓ Tab switching monitor</li>
                      <li>✓ Full-screen enforcement</li>
                    </ul>
                  </div>
                </div>
              ) : (
                /* Exam Questions */
                <div className="glass-strong rounded-2xl p-8 border-2 border-gold">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Question {currentQuestion + 1}
                    </h2>
                    <p className="text-xl text-gray-300 mb-6">
                      {questions[currentQuestion].question}
                    </p>

                    <div className="space-y-3">
                      {questions[currentQuestion].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => setAnswers({...answers, [currentQuestion]: index})}
                          className={`w-full p-4 rounded-xl text-left transition-all ${
                            answers[currentQuestion] === index
                              ? 'bg-gold text-black border-2 border-gold'
                              : 'glass-strong border border-gold/30 text-white hover:border-gold'
                          }`}
                        >
                          <span className="font-bold mr-3">{String.fromCharCode(65 + index)}.</span>
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between gap-4">
                    <button
                      onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                      disabled={currentQuestion === 0}
                      className="px-6 py-3 glass rounded-xl text-gold font-bold hover:glow-gold transition-all disabled:opacity-50"
                    >
                      <i className="fas fa-chevron-left mr-2"></i>
                      Previous
                    </button>
                    
                    {currentQuestion === questions.length - 1 ? (
                      <button
                        onClick={submitExam}
                        className="px-8 py-3 bg-green-600 rounded-xl text-white font-bold hover:bg-green-700 transition-all"
                      >
                        <i className="fas fa-check mr-2"></i>
                        Submit Exam
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                        className="px-6 py-3 glass rounded-xl text-gold font-bold hover:glow-gold transition-all"
                      >
                        Next
                        <i className="fas fa-chevron-right ml-2"></i>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureExam;