import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ExamHub = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeLeft, setTimeLeft] = useState({});

  // Mock data - will be replaced with backend in Phase 4
  const examCategories = [
    { id: 'jee', name: 'JEE (Main & Advanced)', icon: 'fa-atom', color: 'from-blue-600 to-blue-800', tests: 45 },
    { id: 'neet', name: 'NEET (Medical)', icon: 'fa-heartbeat', color: 'from-green-600 to-green-800', tests: 38 },
    { id: 'upsc', name: 'UPSC (IAS/IPS)', icon: 'fa-landmark', color: 'from-purple-600 to-purple-800', tests: 52 },
    { id: 'ssc', name: 'SSC (CGL/CHSL)', icon: 'fa-id-card', color: 'from-orange-600 to-orange-800', tests: 41 },
    { id: 'banking', name: 'Banking (IBPS/SBI)', icon: 'fa-university', color: 'from-teal-600 to-teal-800', tests: 35 },
    { id: 'gate', name: 'GATE (Engineering)', icon: 'fa-microchip', color: 'from-indigo-600 to-indigo-800', tests: 28 },
    { id: 'cat', name: 'CAT (MBA)', icon: 'fa-briefcase', color: 'from-pink-600 to-pink-800', tests: 24 },
    { id: 'railway', name: 'Railway Exams', icon: 'fa-train', color: 'from-red-600 to-red-800', tests: 31 }
  ];

  const liveExams = [
    { id: 1, title: 'JEE Main Mock Test - Physics', category: 'JEE', date: new Date(Date.now() + 2 * 60 * 60 * 1000), duration: '3 hours', participants: 1247 },
    { id: 2, title: 'NEET Biology - Chapter Wise', category: 'NEET', date: new Date(Date.now() + 5 * 60 * 60 * 1000), duration: '2 hours', participants: 892 },
    { id: 3, title: 'UPSC Prelims - General Studies', category: 'UPSC', date: new Date(Date.now() + 8 * 60 * 60 * 1000), duration: '4 hours', participants: 2134 }
  ];

  const practiceTests = [
    { id: 1, title: 'Mathematics - Calculus', difficulty: 'Hard', questions: 50, time: '90 min', category: 'JEE' },
    { id: 2, title: 'Physics - Mechanics', difficulty: 'Medium', questions: 40, time: '60 min', category: 'JEE' },
    { id: 3, title: 'Chemistry - Organic', difficulty: 'Hard', questions: 45, time: '75 min', category: 'JEE' },
    { id: 4, title: 'Biology - Human Anatomy', difficulty: 'Medium', questions: 60, time: '90 min', category: 'NEET' },
    { id: 5, title: 'Current Affairs 2026', difficulty: 'Easy', questions: 100, time: '120 min', category: 'UPSC' },
    { id: 6, title: 'Quantitative Aptitude', difficulty: 'Medium', questions: 50, time: '60 min', category: 'SSC' }
  ];

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = {};
      liveExams.forEach(exam => {
        const now = new Date();
        const diff = exam.date - now;
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          newTimeLeft[exam.id] = `${hours}h ${minutes}m ${seconds}s`;
        } else {
          newTimeLeft[exam.id] = 'Live Now!';
        }
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'Hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const filteredTests = selectedCategory === 'all' 
    ? practiceTests 
    : practiceTests.filter(test => test.category.toLowerCase() === selectedCategory);

  return (
    <div className="min-h-screen bg-midnight-black relative">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-900/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-600/30 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-16 px-4 md:px-8 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black mb-6 animate-slide-in">
            <span className="text-gradient">EXAM HUB</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-4 animate-slide-in" style={{animationDelay: '0.1s'}}>
            Ace Your Exams with AI-Powered Practice
          </p>
          <p className="text-gray-400 mb-8 animate-slide-in" style={{animationDelay: '0.2s'}}>
            Mock Tests • Previous Papers • Live Exams • Performance Analytics
          </p>

          {/* Search Bar */}
          <div className="glass-strong max-w-2xl mx-auto p-2 rounded-full flex items-center gap-3 animate-slide-in" style={{animationDelay: '0.3s'}}>
            <i className="fas fa-search text-gold ml-4"></i>
            <input
              type="text"
              placeholder="Search exams, subjects, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none py-3"
            />
            <button className="bg-gradient-royal px-6 py-3 rounded-full text-white font-bold hover:glow-gold transition-all">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Live Exams Section */}
      <section className="relative z-10 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                <i className="fas fa-circle text-red-500 text-sm mr-3 animate-pulse"></i>
                Live & Upcoming Exams
              </h2>
              <p className="text-gray-400">Join thousands of students testing now</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveExams.map((exam, index) => (
              <div
                key={exam.id}
                className="glass-strong rounded-2xl overflow-hidden border border-gold/20 hover:glow-gold transition-all duration-500 hover:-translate-y-2 animate-slide-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="bg-gradient-royal p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="glass px-3 py-1 rounded-full text-gold text-xs font-bold">{exam.category}</span>
                    <span className="text-white text-xs">
                      <i className="fas fa-users mr-1"></i>{exam.participants}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{exam.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-white/80">
                    <span><i className="fas fa-clock mr-1"></i>{exam.duration}</span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="text-center mb-4">
                    <p className="text-gray-400 text-xs mb-2">Starts in</p>
                    <p className="text-2xl font-black text-gold">{timeLeft[exam.id] || 'Loading...'}</p>
                  </div>
                  <button
                    onClick={() => navigate('/secure-exam')}
                    className="w-full bg-gradient-royal py-3 rounded-xl text-white font-bold hover:glow-gold transition-all"
                  >
                    <i className="fas fa-lock mr-2"></i>Join Secure Exam
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exam Categories */}
      <section className="relative z-10 py-12 px-4 md:px-8 bg-charcoal/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-12">
            <span className="text-gradient">Popular Exam Categories</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {examCategories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`glass-strong rounded-2xl p-6 text-center hover:glow-gold transition-all duration-500 hover:-translate-y-2 animate-slide-in ${
                  selectedCategory === category.id ? 'border-2 border-gold' : 'border border-gold/20'
                }`}
                style={{animationDelay: `${index * 0.05}s`}}
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center mx-auto mb-4 glow-gold-hover`}>
                  <i className={`fas ${category.icon} text-white text-2xl`}></i>
                </div>
                <h3 className="text-white font-bold text-sm mb-2">{category.name}</h3>
                <p className="text-gold text-xs">{category.tests} Tests Available</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Practice Tests */}
      <section className="relative z-10 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                Practice Tests
              </h2>
              <p className="text-gray-400">Master every topic with targeted practice</p>
            </div>
            <button 
              onClick={() => setSelectedCategory('all')}
              className="glass px-4 py-2 rounded-full text-gold hover:glow-gold transition-all"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test, index) => (
              <div
                key={test.id}
                className="glass-strong rounded-2xl p-6 border border-gold/20 hover:glow-gold transition-all duration-500 hover:-translate-y-2 animate-slide-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className="text-xs text-gray-500 mb-1 block">{test.category}</span>
                    <h3 className="text-white font-bold text-lg mb-2">{test.title}</h3>
                  </div>
                  <span className={`text-xs font-bold ${getDifficultyColor(test.difficulty)}`}>
                    {test.difficulty}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      <i className="fas fa-question-circle mr-2 text-gold"></i>Questions
                    </span>
                    <span className="text-white font-semibold">{test.questions}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      <i className="fas fa-clock mr-2 text-gold"></i>Duration
                    </span>
                    <span className="text-white font-semibold">{test.time}</span>
                  </div>
                </div>

                <button className="w-full bg-gradient-royal py-3 rounded-xl text-white font-bold hover:glow-gold transition-all">
                  <i className="fas fa-play mr-2"></i>Start Practice
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Dashboard Preview */}
      <section className="relative z-10 py-12 px-4 md:px-8 bg-charcoal/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-12">
            <span className="text-gradient">Your Performance</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass-strong rounded-2xl p-6 text-center border border-gold/20">
              <div className="text-4xl font-black text-gold mb-2">24</div>
              <p className="text-gray-400 text-sm">Tests Completed</p>
            </div>
            <div className="glass-strong rounded-2xl p-6 text-center border border-gold/20">
              <div className="text-4xl font-black text-green-400 mb-2">87%</div>
              <p className="text-gray-400 text-sm">Average Score</p>
            </div>
            <div className="glass-strong rounded-2xl p-6 text-center border border-gold/20">
              <div className="text-4xl font-black text-blue-400 mb-2">156</div>
              <p className="text-gray-400 text-sm">Hours Studied</p>
            </div>
            <div className="glass-strong rounded-2xl p-6 text-center border border-gold/20">
              <div className="text-4xl font-black text-purple-400 mb-2">#42</div>
              <p className="text-gray-400 text-sm">Global Rank</p>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <section className="relative z-10 py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <button
            onClick={() => navigate('/')}
            className="glass px-8 py-4 rounded-full text-gold font-bold hover:glow-gold transition-all inline-flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Home
          </button>
        </div>
      </section>
    </div>
  );
};

export default ExamHub;