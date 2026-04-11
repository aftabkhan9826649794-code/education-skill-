import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CompetitiveExamHub = () => {
  const navigate = useNavigate();
  const [examTopics, setExamTopics] = useState({});
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSubtopic, setSelectedSubtopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionType, setQuestionType] = useState('objective');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExamTopics();
  }, []);

  const fetchExamTopics = async () => {
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/competitive/exams/topics`);
      const data = await response.json();
      setExamTopics(data.exam_topics || {});
    } catch (error) {
      console.error('Error fetching exam topics:', error);
    }
  };

  const startExam = async () => {
    if (!selectedExam || !selectedTopic) {
      alert('Please select exam type and topic');
      return;
    }

    setLoading(true);
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/competitive/generate-questions?exam_type=${selectedExam}&topic=${selectedTopic}&subtopic=${selectedSubtopic}&difficulty=${difficulty}&num_questions=10&question_type=${questionType}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      // Navigate to exam page with questions
      navigate('/competitive-exam-test', { 
        state: { 
          questions: data.questions,
          examType: selectedExam,
          topic: selectedTopic,
          subtopic: selectedSubtopic
        } 
      });
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('Failed to start exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight-black relative">
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute top-20 right-10 w-96 h-96 bg-royal-red/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gold/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Header */}
          <div className="text-center mb-12">
            <div className="inline-block glass-strong rounded-2xl px-6 py-3 mb-6 border border-gold/30 animate-pulse">
              <span className="text-gold font-bold text-sm tracking-wider">🏆 GLOBAL COMPETITIVE EXAM HUB</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              <span className="text-gradient">Master Your Future</span>
            </h1>
            
            <p className="text-white/90 text-xl max-w-3xl mx-auto leading-relaxed">
              Prepare for <span className="text-gold font-bold">SAT • JEE • GRE • GMAT • PhD</span> with AI-powered questions and instant feedback
            </p>
          </div>

          {/* Exam Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
            {Object.keys(examTopics).map((examType) => (
              <div
                key={examType}
                onClick={() => setSelectedExam(examType)}
                className={`glass-strong rounded-xl p-6 border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                  selectedExam === examType 
                    ? 'border-gold bg-gradient-royal glow-gold' 
                    : 'border-gold/20 hover:border-gold/50'
                }`}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    selectedExam === examType ? 'bg-gold/20' : 'bg-gradient-to-br from-royal-red to-gold/50'
                  }`}>
                    <i className="fas fa-trophy text-white text-2xl"></i>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${
                    selectedExam === examType ? 'text-white' : 'text-gold'
                  }`}>
                    {examType}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {Object.keys(examTopics[examType] || {}).length} Topics
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Topic Selection */}
          {selectedExam && (
            <div className="glass-strong rounded-2xl p-8 mb-8 border border-gold/20">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <i className="fas fa-book-open text-gold"></i>
                Select Your Challenge
              </h2>

              {/* Main Topic */}
              <div className="mb-6">
                <label className="block text-gold font-bold mb-3 text-lg">Main Topic</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.keys(examTopics[selectedExam] || {}).map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={`glass px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        selectedTopic === topic
                          ? 'bg-gradient-royal text-white border-2 border-gold glow-gold'
                          : 'text-white border border-gold/30 hover:border-gold hover:bg-gold/10'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtopic */}
              {selectedTopic && (
                <div className="mb-6">
                  <label className="block text-gold font-bold mb-3 text-lg">Subtopic (Optional)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(examTopics[selectedExam][selectedTopic] || []).map((subtopic) => (
                      <button
                        key={subtopic}
                        onClick={() => setSelectedSubtopic(subtopic)}
                        className={`glass px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                          selectedSubtopic === subtopic
                            ? 'bg-gold text-midnight-black'
                            : 'text-white border border-gold/30 hover:bg-gold/20'
                        }`}
                      >
                        {subtopic}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Difficulty & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-gold font-bold mb-3">Difficulty Level</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['easy', 'medium', 'hard', 'expert'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`px-4 py-3 rounded-xl font-bold capitalize transition-all ${
                          difficulty === level
                            ? 'bg-gradient-royal text-white glow-gold'
                            : 'glass text-white border border-gold/30 hover:bg-gold/10'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gold font-bold mb-3">Question Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setQuestionType('objective')}
                      className={`px-4 py-3 rounded-xl font-bold transition-all ${
                        questionType === 'objective'
                          ? 'bg-gradient-royal text-white glow-gold'
                          : 'glass text-white border border-gold/30 hover:bg-gold/10'
                      }`}
                    >
                      MCQ
                    </button>
                    <button
                      onClick={() => setQuestionType('scenario_based')}
                      className={`px-4 py-3 rounded-xl font-bold transition-all ${
                        questionType === 'scenario_based'
                          ? 'bg-gradient-royal text-white glow-gold'
                          : 'glass text-white border border-gold/30 hover:bg-gold/10'
                      }`}
                    >
                      Scenario
                    </button>
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={startExam}
                disabled={loading || !selectedTopic}
                className="w-full bg-gradient-to-r from-royal-red via-gold to-royal-red py-5 rounded-xl text-white font-black text-xl hover:glow-gold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Generating AI Questions...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-rocket"></i>
                      START HIGH-STAKES CHALLENGE
                      <i className="fas fa-arrow-right"></i>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </div>
          )}

          {/* Stats Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-strong rounded-xl p-6 border border-green-500/30 hover:glow-gold transition-all">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center">
                  <i className="fas fa-brain text-white text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">AI-Powered</h3>
                  <p className="text-gray-400">Real exam-level questions</p>
                </div>
              </div>
            </div>

            <div className="glass-strong rounded-xl p-6 border border-gold/30 hover:glow-gold transition-all">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-royal rounded-full flex items-center justify-center">
                  <i className="fas fa-graduation-cap text-white text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Smart Learning</h3>
                  <p className="text-gray-400">Detailed rationale for each answer</p>
                </div>
              </div>
            </div>

            <div className="glass-strong rounded-xl p-6 border border-royal-red/30 hover:glow-gold transition-all">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-royal-red to-red-800 rounded-full flex items-center justify-center">
                  <i className="fas fa-chart-line text-white text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Job Readiness</h3>
                  <p className="text-gray-400">Track your preparedness score</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitiveExamHub;
