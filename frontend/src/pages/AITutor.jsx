import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SignLanguageDisplay from '../components/SignLanguageDisplay';

const AITutor = () => {
  const navigate = useNavigate();
  const [isLessonStarted, setIsLessonStarted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState('');
  
  // Voice & Sign Language States
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isSignLanguageMode, setIsSignLanguageMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceInput, setVoiceInput] = useState('');
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  const lessonText = "Welcome to Cell Biology. Today we will learn about cells, the basic unit of life. The cell has many parts including the nucleus, mitochondria, and cell membrane.";

  const quiz = {
    question: "What is the powerhouse of the cell?",
    options: [
      { id: 1, text: "Mitochondria", correct: true },
      { id: 2, text: "Nucleus", correct: false },
      { id: 3, text: "Ribosome", correct: false },
      { id: 4, text: "Chloroplast", correct: false }
    ]
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
        if (finalTranscript) {
          setVoiceInput(finalTranscript.trim());
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const startLesson = () => {
    setIsLessonStarted(true);
    if (isVoiceMode) {
      speakText(lessonText);
    }
    setTimeout(() => setShowQuiz(true), 5000);
  };

  const speakText = (text) => {
    if (synthRef.current && text) {
      // Cancel any ongoing speech
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleVoiceMode = () => {
    const newVoiceMode = !isVoiceMode;
    setIsVoiceMode(newVoiceMode);
    if (!newVoiceMode) {
      stopSpeaking();
    }
  };

  const toggleSignLanguageMode = () => {
    setIsSignLanguageMode(!isSignLanguageMode);
  };

  const startVoiceRecognition = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript('');
      setVoiceInput('');
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleAnswer = (option) => {
    setSelectedAnswer(option.id);
    const feedbackText = option.correct 
      ? '✅ Correct! Excellent understanding!' 
      : '❌ Not quite. The powerhouse of the cell is Mitochondria!';
    
    setFeedback(feedbackText);
    
    if (isVoiceMode) {
      speakText(feedbackText);
    }
  };

  // Convert voice input to sign language
  useEffect(() => {
    if (voiceInput && isSignLanguageMode) {
      // Voice input will be displayed in sign language
    }
  }, [voiceInput, isSignLanguageMode]);

  return (
    <div className="min-h-screen bg-midnight-black relative">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-900/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-green-600/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="glass-strong rounded-2xl p-8 mb-8 border border-gold/20">
            <div className="flex items-center gap-6 flex-wrap">
              {/* AI Mentor Avatar - Female AI Teacher */}
              <div className="relative">
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-rose-600 flex items-center justify-center border-4 border-gold shadow-2xl overflow-hidden">
                  {/* Female AI Avatar */}
                  <div className="text-6xl">👩‍🏫</div>
                  {/* Animated particles around avatar */}
                  <div className="absolute inset-0">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-gold rounded-full"
                        style={{
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                          animation: `float ${Math.random() * 3 + 2}s ease-in-out infinite`,
                          animationDelay: `${Math.random() * 2}s`,
                          opacity: Math.random() * 0.7 + 0.3
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full animate-ping opacity-30 border-2 border-gold"></div>
                <div className="absolute inset-0 rounded-full animate-pulse opacity-20 bg-gradient-to-r from-pink-500 to-purple-600"></div>
                {isSpeaking && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 animate-pulse shadow-lg">
                    <i className="fas fa-volume-up text-white"></i>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-[280px]">
                <h1 className="text-4xl font-black mb-3">
                  <span className="text-gradient">MATHS & SCIENCE ZONE</span>
                </h1>
                <p className="text-white/90 italic mb-4 text-lg">
                  "Science ball ki swing ki tarah hai, aur Maths scorecard ki tarah. Dono mein master bano!"
                </p>
                
                {/* Control Buttons */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    onClick={startLesson}
                    disabled={isLessonStarted}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-full font-bold hover:glow-gold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-play mr-2"></i>
                    {isLessonStarted ? 'Lesson in Progress...' : 'Start Lesson'}
                  </button>

                  <button
                    onClick={toggleVoiceMode}
                    className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                      isVoiceMode 
                        ? 'bg-gradient-royal text-white glow-gold' 
                        : 'glass text-gold border border-gold/30'
                    }`}
                  >
                    <i className={`fas ${isSpeaking ? 'fa-volume-up animate-pulse' : 'fa-microphone-alt'} mr-2`}></i>
                    {isVoiceMode ? 'Voice ON' : 'Enable Voice'}
                  </button>

                  <button
                    onClick={toggleSignLanguageMode}
                    className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                      isSignLanguageMode 
                        ? 'bg-gradient-royal text-white glow-gold' 
                        : 'glass text-gold border border-gold/30'
                    }`}
                  >
                    <i className="fas fa-hands mr-2"></i>
                    {isSignLanguageMode ? 'Sign Lang ON' : 'Enable Sign Language'}
                  </button>
                </div>

                {/* Voice Recognition Controls */}
                {isSignLanguageMode && (
                  <div className="flex gap-3">
                    <button
                      onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                      className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                        isListening 
                          ? 'bg-red-600 text-white animate-pulse' 
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'} mr-2`}></i>
                      {isListening ? 'Stop Recording' : 'Speak to Convert'}
                    </button>
                    
                    {isListening && (
                      <div className="glass px-4 py-3 rounded-full flex items-center gap-2 animate-slide-in">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-white text-sm font-semibold">Listening...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Live Transcript */}
            {transcript && (
              <div className="mt-4 glass p-4 rounded-xl border border-blue-500/30 animate-slide-in">
                <p className="text-blue-400 text-sm font-semibold mb-1">
                  <i className="fas fa-comment-dots mr-2"></i>
                  You said:
                </p>
                <p className="text-white text-lg">{transcript}</p>
              </div>
            )}
          </div>

          {/* Sign Language Display */}
          {isSignLanguageMode && voiceInput && (
            <div className="mb-8">
              <SignLanguageDisplay text={voiceInput} isActive={isSignLanguageMode} />
            </div>
          )}

          {/* Lesson Container */}
          <div className="glass-strong rounded-2xl p-6 border border-gold/20 mb-8">
            {/* Video Player */}
            <div className="relative w-full h-[400px] bg-black rounded-xl overflow-hidden mb-6">
              {!isLessonStarted ? (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <i className="fas fa-chalkboard-teacher text-6xl opacity-50 mb-4"></i>
                    <p className="text-lg font-light">[ Click "Start Lesson" to begin ]</p>
                    {isVoiceMode && (
                      <p className="text-gold mt-2">
                        <i className="fas fa-volume-up mr-2"></i>
                        Voice mode enabled - lesson will be narrated
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                    <div className="text-center px-6">
                      <div className="w-20 h-20 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                      <p className="text-white text-xl font-semibold mb-2">
                        {isSpeaking ? '🎙️ AI Teacher Speaking...' : 'AI Teacher Lesson Playing...'}
                      </p>
                      <p className="text-gray-300">Topic: Cell Biology Fundamentals</p>
                      {isVoiceMode && (
                        <button
                          onClick={stopSpeaking}
                          className="mt-4 glass px-6 py-2 rounded-full text-gold hover:glow-gold transition-all"
                        >
                          <i className="fas fa-stop mr-2"></i>
                          Stop Voice
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Quiz Overlay */}
            {showQuiz && (
              <div className="glass rounded-2xl p-6 border-2 border-blue-500 animate-slide-in">
                <h3 className="text-2xl font-bold text-gold mb-4">
                  <i className="fas fa-question-circle mr-2"></i>
                  Quick Check!
                </h3>
                <p className="text-white text-lg mb-6">{quiz.question}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {quiz.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer(option)}
                      disabled={selectedAnswer !== null}
                      className={`glass-strong p-4 rounded-xl text-white font-semibold text-left transition-all duration-300 ${
                        selectedAnswer === option.id
                          ? option.correct
                            ? 'bg-green-600 border-2 border-green-400'
                            : 'bg-red-600 border-2 border-red-400'
                          : 'hover:bg-gold/20 border border-gold/30'
                      } disabled:cursor-not-allowed`}
                    >
                      <span className="text-gold mr-2">{String.fromCharCode(65 + option.id - 1)}.</span>
                      {option.text}
                    </button>
                  ))}
                </div>

                {feedback && (
                  <div className={`p-4 rounded-xl text-center font-bold text-lg ${
                    feedback.includes('✅') ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                  }`}>
                    {feedback}
                  </div>
                )}
              </div>
            )}

            {/* Subject Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="glass-strong rounded-xl p-6 border border-red-500/30 hover:glow-gold transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
                    <i className="fas fa-flask text-white text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Science & Innovation</h3>
                    <p className="text-gray-400 text-sm">Explore the wonders of the physical world</p>
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center justify-between text-white">
                    <span>1. Solar System</span>
                    <i className="fas fa-play-circle text-green-400"></i>
                  </li>
                  <li className="flex items-center justify-between text-white">
                    <span>2. Human Body</span>
                    <i className="fas fa-play-circle text-green-400"></i>
                  </li>
                  <li className="flex items-center justify-between text-gray-500">
                    <span>3. Plant Life</span>
                    <i className="fas fa-lock"></i>
                  </li>
                </ul>
                <button className="w-full bg-gradient-royal py-3 rounded-xl text-white font-bold hover:glow-gold transition-all">
                  Open Subject Lab
                </button>
              </div>

              <div className="glass-strong rounded-xl p-6 border border-green-500/30 hover:glow-gold transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center">
                    <i className="fas fa-square-root-alt text-white text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Mathematics</h3>
                    <p className="text-gray-400 text-sm">Master numbers and problem-solving</p>
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center justify-between text-white">
                    <span>1. Algebra Basics</span>
                    <i className="fas fa-check-circle text-green-400"></i>
                  </li>
                  <li className="flex items-center justify-between text-white">
                    <span>2. Geometry</span>
                    <i className="fas fa-play-circle text-green-400"></i>
                  </li>
                  <li className="flex items-center justify-between text-gray-500">
                    <span>3. Calculus</span>
                    <i className="fas fa-lock"></i>
                  </li>
                </ul>
                <button className="w-full bg-gradient-royal py-3 rounded-xl text-white font-bold hover:glow-gold transition-all">
                  Open Subject Lab
                </button>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/')}
              className="glass px-8 py-4 rounded-full text-gold font-bold hover:glow-gold transition-all inline-flex items-center gap-2"
            >
              <i className="fas fa-arrow-left"></i>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
