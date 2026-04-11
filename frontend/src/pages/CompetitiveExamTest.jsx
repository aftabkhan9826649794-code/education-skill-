import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CompetitiveExamTest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { questions = [], examType = '', topic = '', subtopic = '' } = location.state || {};
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (questions.length === 0) {
      navigate('/competitive-exam-hub');
      return;
    }

    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [questions, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: answerIndex
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length < questions.length) {
      if (!window.confirm('You have unanswered questions. Do you want to submit anyway?')) {
        return;
      }
    }

    setLoading(true);
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      
      // Prepare student answers array
      const studentAnswers = questions.map((_, index) => selectedAnswers[index] ?? -1);
      
      const response = await fetch(`${API_URL}/api/competitive/submit-attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: 'demo_student_001', // In real app, get from auth
          exam_type: examType,
          topic: topic,
          questions: questions,
          student_answers: studentAnswers,
          time_taken_seconds: timeElapsed
        })
      });

      const data = await response.json();
      setResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Failed to submit exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (questions.length === 0) {
    return <div className="min-h-screen bg-midnight-black flex items-center justify-center">
      <p className="text-white text-xl">No questions available. Redirecting...</p>
    </div>;
  }

  if (showResults && results) {
    return (
      <div className="min-h-screen bg-midnight-black relative">
        <div className="fixed inset-0 z-0 opacity-20">
          <div className="absolute top-20 right-10 w-96 h-96 bg-royal-red/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-gold/30 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 py-12 px-4 md:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Results Header */}
            <div className="glass-strong rounded-2xl p-8 mb-8 border border-gold/20 text-center">
              <div className="mb-6">
                <i className="fas fa-check-circle text-green-400 text-6xl mb-4"></i>
                <h1 className="text-4xl font-black text-white mb-2">Exam Completed!</h1>
                <p className="text-gray-400">Your performance has been analyzed</p>
              </div>

              {/* Score Display */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="glass rounded-xl p-6 border border-green-500/30">
                  <h3 className="text-gray-400 text-sm mb-2">Your Score</h3>
                  <p className="text-4xl font-black text-green-400">{results.score}/{results.total_points}</p>
                  <p className="text-gold text-lg font-bold mt-2">{results.percentage.toFixed(1)}%</p>
                </div>

                <div className="glass rounded-xl p-6 border border-gold/30">
                  <h3 className="text-gray-400 text-sm mb-2">Job Readiness Score</h3>
                  <p className="text-4xl font-black text-gold">{results.job_readiness_score.toFixed(0)}</p>
                  <p className="text-white text-sm mt-2">Out of 100</p>
                </div>

                <div className="glass rounded-xl p-6 border border-blue-500/30">
                  <h3 className="text-gray-400 text-sm mb-2">Time Taken</h3>
                  <p className="text-4xl font-black text-blue-400">{formatTime(timeElapsed)}</p>
                  <p className="text-white text-sm mt-2">minutes</p>
                </div>
              </div>
            </div>

            {/* Weak Topics */}
            {results.weak_topics && results.weak_topics.length > 0 && (
              <div className="glass-strong rounded-2xl p-8 mb-8 border border-red-500/30">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <i className="fas fa-exclamation-triangle text-red-400"></i>
                  Areas for Improvement
                </h2>
                <div className="flex flex-wrap gap-3">
                  {results.weak_topics.map((topic, index) => (
                    <span key={index} className="glass px-4 py-2 rounded-full text-red-400 border border-red-500/30 font-semibold">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Question Review with Rationale */}
            <div className="glass-strong rounded-2xl p-8 border border-gold/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <i className="fas fa-lightbulb text-gold"></i>
                Smart Answer Key & Rationale
              </h2>

              {questions.map((question, index) => {
                const studentAnswer = selectedAnswers[index];
                const correctAnswer = question.correct_answer;
                const isCorrect = studentAnswer === correctAnswer;

                return (
                  <div key={index} className={`mb-8 p-6 rounded-xl border-2 ${
                    isCorrect ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'
                  }`}>
                    <div className="flex items-start gap-3 mb-4">
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-white font-semibold mb-2">{question.question}</p>
                        <div className="grid grid-cols-1 gap-2 mb-4">
                          {question.options.map((option, optIndex) => {
                            const isStudentAnswer = optIndex === studentAnswer;
                            const isCorrectOption = optIndex === correctAnswer;
                            
                            return (
                              <div
                                key={optIndex}
                                className={`p-3 rounded-lg border ${
                                  isCorrectOption 
                                    ? 'bg-green-500/20 border-green-500 text-green-400' 
                                    : isStudentAnswer 
                                    ? 'bg-red-500/20 border-red-500 text-red-400' 
                                    : 'bg-gray-800/50 border-gray-700 text-gray-400'
                                }`}
                              >
                                <span className="font-bold mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                                {option}
                                {isCorrectOption && <i className="fas fa-check-circle ml-2"></i>}
                                {isStudentAnswer && !isCorrectOption && <i className="fas fa-times-circle ml-2"></i>}
                              </div>
                            );
                          })}
                        </div>

                        {/* AI-Generated Rationale */}
                        <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 mt-4">
                          <h4 className="text-gold font-bold mb-2 flex items-center gap-2">
                            <i className="fas fa-brain"></i>
                            AI-Generated Rationale:
                          </h4>
                          <p className="text-white/90 leading-relaxed">{question.rationale}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => navigate('/competitive-exam-hub')}
                className="glass px-8 py-4 rounded-full text-gold font-bold hover:glow-gold transition-all"
              >
                <i className="fas fa-home mr-2"></i>
                Back to Hub
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-royal px-8 py-4 rounded-full text-white font-bold hover:glow-gold transition-all"
              >
                <i className="fas fa-chart-line mr-2"></i>
                View Progress
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-midnight-black relative">
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute top-20 right-10 w-96 h-96 bg-royal-red/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gold/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="glass-strong rounded-2xl p-6 mb-6 border border-gold/20">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">{examType} - {topic}</h1>
                {subtopic && <p className="text-gray-400">{subtopic}</p>}
              </div>
              <div className="flex items-center gap-4">
                <div className="glass px-4 py-2 rounded-full border border-gold/30">
                  <i className="fas fa-clock text-gold mr-2"></i>
                  <span className="text-white font-bold">{formatTime(timeElapsed)}</span>
                </div>
                <div className="glass px-4 py-2 rounded-full border border-gold/30">
                  <span className="text-gold font-bold">{currentQuestion + 1}</span>
                  <span className="text-white">/{questions.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">Progress</span>
              <span className="text-gold font-bold text-sm">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-royal-red to-gold h-full rounded-full transition-all duration-500"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="glass-strong rounded-2xl p-8 mb-6 border border-gold/20">
            <div className="mb-6">
              <span className="inline-block glass px-3 py-1 rounded-full text-gold text-sm font-bold mb-4">
                Question {currentQuestion + 1}
              </span>
              <h2 className="text-2xl font-bold text-white leading-relaxed whitespace-pre-line">
                {question.question}
              </h2>
            </div>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full glass p-4 rounded-xl text-left transition-all duration-300 border-2 ${
                    selectedAnswers[currentQuestion] === index
                      ? 'bg-gradient-royal border-gold glow-gold text-white'
                      : 'border-gold/30 hover:border-gold/70 text-white hover:bg-gold/10'
                  }`}
                >
                  <span className="font-bold text-gold mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="glass px-6 py-3 rounded-full text-gold font-bold hover:glow-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Previous
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-gradient-to-r from-royal-red to-gold px-8 py-3 rounded-full text-white font-bold hover:glow-gold transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check mr-2"></i>
                    Submit Exam
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="bg-gradient-royal px-6 py-3 rounded-full text-white font-bold hover:glow-gold transition-all"
              >
                Next
                <i className="fas fa-arrow-right ml-2"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitiveExamTest;
