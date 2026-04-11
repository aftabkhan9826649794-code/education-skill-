import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const InteractiveLesson = () => {
  const navigate = useNavigate();
  const [lessonStarted, setLessonStarted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [showSignLanguage, setShowSignLanguage] = useState(false);

  const quiz = {
    question: "What is the trajectory path of a projectile?",
    options: [
      { id: 1, text: "Straight line", correct: false },
      { id: 2, text: "Parabolic curve", correct: true },
      { id: 3, text: "Circular path", correct: false },
      { id: 4, text: "Zigzag pattern", correct: false }
    ]
  };

  const startLesson = () => {
    setLessonStarted(true);
    setTimeout(() => {
      setShowQuiz(true);
    }, 5000);
  };

  const handleAnswer = (option) => {
    setSelectedAnswer(option.id);
    if (option.correct) {
      setFeedback("✅ Excellent! SARA says: 'Perfect answer, champion!'");
    } else {
      setFeedback("❌ Not quite! SARA says: 'Think about gravity's effect on motion.'");
    }
  };

  return (
    <div className="min-h-screen bg-midnight-black relative">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute top-20 right-10 w-96 h-96 bg-royal-red/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-green-600/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="glass-strong rounded-2xl p-8 mb-8 border border-gold/20">
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              <span className="text-gradient">Physics: Projectile Motion</span>
            </h1>
            <p className="text-white/90 text-lg">
              <i className="fas fa-baseball-ball text-royal-red mr-2"></i>
              Interactive AI Tutor Lesson with Sign Language Support
            </p>
          </div>

          {/* Main Lesson Box */}
          <div className="glass-strong rounded-2xl p-8 border border-gold/20">
            {/* Video Player Area */}
            <div className="relative bg-black/50 rounded-xl border-2 border-gold/30 p-8 mb-6 min-h-[400px] flex flex-col items-center justify-center">
              {!lessonStarted ? (
                <div className="text-center">
                  <i className="fas fa-play-circle text-gold text-6xl mb-4 animate-pulse"></i>
                  <p className="text-white text-xl mb-6">
                    Ready to learn about Projectile Motion?
                  </p>
                  <button
                    onClick={startLesson}
                    className="bg-gradient-royal px-8 py-4 rounded-full text-white font-bold text-lg hover:glow-gold transition-all"
                  >
                    <i className="fas fa-rocket mr-2"></i>
                    Start Lesson
                  </button>
                </div>
              ) : (
                <>
                  {/* Captain explaining */}
                  <div className="text-center mb-6">
                    <i className="fas fa-baseball-ball text-gold text-4xl animate-spin mb-4"></i>
                    <p className="text-white text-xl">
                      Captain is explaining Projectile Motion...
                    </p>
                  </div>

                  {/* Projectile Diagram */}
                  <div className="border-2 border-dashed border-gold/30 rounded-xl p-6 mb-4 w-full max-w-lg">
                    <svg viewBox="0 0 400 200" className="w-full h-auto">
                      {/* Ground */}
                      <line x1="0" y1="180" x2="400" y2="180" stroke="#FFD700" strokeWidth="2"/>
                      {/* Parabolic trajectory */}
                      <path 
                        d="M 50 180 Q 200 50 350 180" 
                        stroke="#C41E3A" 
                        strokeWidth="3" 
                        fill="none"
                        strokeDasharray="5,5"
                      />
                      {/* Initial velocity vector */}
                      <line x1="50" y1="180" x2="100" y2="150" stroke="#00FF00" strokeWidth="2"/>
                      <text x="105" y="145" fill="#00FF00" fontSize="12">V₀</text>
                      {/* Angle */}
                      <path d="M 70 180 A 20 20 0 0 1 80 170" stroke="#FFD700" strokeWidth="1" fill="none"/>
                      <text x="85" y="185" fill="#FFD700" fontSize="12">θ</text>
                    </svg>
                  </div>

                  {/* Captain Mentor Image */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-gold overflow-hidden shadow-2xl">
                      <img 
                        src="https://customer-assets.emergentagent.com/job_ai-learning-hub-363/artifacts/0z197gja_AI%20Mentor%20Sara.jpeg"
                        alt="Captain Mentor"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 animate-pulse">
                      <i className="fas fa-volume-up text-white"></i>
                    </div>
                  </div>
                </>
              )}

              {/* Sign Language Window */}
              {showSignLanguage && (
                <div className="absolute bottom-4 right-4 glass-strong rounded-xl p-4 border border-gold/30 w-48">
                  <img 
                    src="https://via.placeholder.com/180x120/1a1a2e/FFD700?text=Sign+Language"
                    alt="Hayat Sign Language"
                    className="w-full rounded-lg mb-2"
                  />
                  <p className="text-gold text-xs font-bold text-center">HAYAT AI (Sign)</p>
                </div>
              )}
            </div>

            {/* Quiz Overlay */}
            {showQuiz && (
              <div className="glass-strong rounded-xl p-6 border border-gold/20">
                <h2 className="text-2xl font-bold text-white mb-4 text-center">
                  <i className="fas fa-question-circle text-gold mr-2"></i>
                  {quiz.question}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {quiz.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer(option)}
                      disabled={selectedAnswer !== null}
                      className={`glass p-4 rounded-xl text-white font-semibold transition-all duration-300 ${
                        selectedAnswer === option.id
                          ? option.correct
                            ? 'bg-green-600 border-2 border-green-400'
                            : 'bg-red-600 border-2 border-red-400'
                          : 'hover:bg-gold/20 border border-gold/30'
                      } disabled:cursor-not-allowed`}
                    >
                      <span className="text-gold mr-2">{String.fromCharCode(64 + option.id)}.</span>
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

                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowSignLanguage(!showSignLanguage)}
                    className="glass px-6 py-3 rounded-full text-gold font-bold hover:glow-gold transition-all inline-flex items-center gap-2"
                  >
                    <i className="fas fa-sign-language"></i>
                    {showSignLanguage ? 'Hide' : 'Show'} Hayat Sign Language
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/ai-tutor')}
              className="glass px-8 py-4 rounded-full text-gold font-bold hover:glow-gold transition-all inline-flex items-center gap-2"
            >
              <i className="fas fa-arrow-left"></i>
              Back to AI Tutor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveLesson;
