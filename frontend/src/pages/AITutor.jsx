import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AITutor = () => {
  const navigate = useNavigate();
  const [isLessonStarted, setIsLessonStarted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState('');

  const quiz = {
    question: "What is the powerhouse of the cell?",
    options: [
      { id: 1, text: "Mitochondria", correct: true },
      { id: 2, text: "Nucleus", correct: false },
      { id: 3, text: "Ribosome", correct: false },
      { id: 4, text: "Chloroplast", correct: false }
    ]
  };

  const startLesson = () => {
    setIsLessonStarted(true);
    setTimeout(() => setShowQuiz(true), 5000);
  };

  const handleAnswer = (option) => {
    setSelectedAnswer(option.id);
    if (option.correct) {
      setFeedback('✅ Correct! Excellent understanding!');
    } else {
      setFeedback('❌ Not quite. The powerhouse of the cell is Mitochondria!');
    }
  };

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
              {/* AI Mentor Avatar */}
              <div className="relative">
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center border-4 border-gold animate-pulse">
                  <i className="fas fa-robot text-6xl text-gold"></i>
                </div>
                <div className="absolute inset-0 rounded-full animate-ping opacity-50 border-2 border-gold"></div>
              </div>

              <div className="flex-1 min-w-[280px]">
                <h1 className="text-4xl font-black mb-3">
                  <span className="text-gradient">MATHS & SCIENCE ZONE</span>
                </h1>
                <p className="text-white/90 italic mb-4 text-lg">
                  "Science ball ki swing ki tarah hai, aur Maths scorecard ki tarah. Dono mein master bano!"
                </p>
                <button
                  onClick={startLesson}
                  disabled={isLessonStarted}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-full font-bold hover:glow-gold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-play mr-2"></i>
                  {isLessonStarted ? 'Lesson in Progress...' : 'Start Lesson with AI Mentor'}
                </button>
              </div>
            </div>
          </div>

          {/* Lesson Container */}
          <div className="glass-strong rounded-2xl p-6 border border-gold/20">
            {/* Video Player */}
            <div className="relative w-full h-[400px] bg-black rounded-xl overflow-hidden mb-6">
              {!isLessonStarted ? (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <i className="fas fa-chalkboard-teacher text-6xl opacity-50 mb-4"></i>
                    <p className="text-lg font-light">[ Click "Start Lesson" to begin ]</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                      <p className="text-white text-xl font-semibold">AI Teacher Lesson Playing...</p>
                      <p className="text-gray-300 mt-2">Topic: Cell Biology Fundamentals</p>
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