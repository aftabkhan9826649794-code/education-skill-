import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EducationHub = () => {
  const navigate = useNavigate();
  const [boards, setBoards] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/boards/all`);
      const data = await response.json();
      setBoards(data.boards || {});
      setLoading(false);
    } catch (error) {
      console.error('Error fetching boards:', error);
      setLoading(false);
    }
  };

  const handleBoardClick = (boardName) => {
    navigate('/education-board-selector', { state: { boardName, boardData: boards[boardName] } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-black flex items-center justify-center">
        <div className="text-gold text-2xl font-bold animate-pulse">
          <i className="fas fa-spinner fa-spin mr-3"></i>
          Loading Education Hub...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-midnight-black to-pink-900/20 relative">
      {/* Enhanced Cinematic Background */}
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute top-20 right-10 w-96 h-96 bg-royal-red/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gold/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl"></div>
        <div className="absolute top-40 left-20 w-64 h-64 bg-pink-600/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Header */}
          <div className="text-center mb-12">
            <div className="inline-block glass-strong rounded-2xl px-6 py-3 mb-6 border border-gold/30 animate-pulse">
              <span className="text-gold font-bold text-sm tracking-wider">🌍 GLOBAL EDUCATION HUB</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-gold bg-clip-text text-transparent">
                Choose Your Path
              </span>
            </h1>
            
            <p className="text-white/90 text-xl max-w-3xl mx-auto leading-relaxed">
              Select your <span className="text-gold font-bold">Education Board</span> and unlock personalized learning from <span className="text-pink-400 font-bold">Nursery to PhD</span>
            </p>
          </div>

          {/* Education Boards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {Object.keys(boards).map((boardName, index) => {
              const board = boards[boardName];
              const colors = [
                'from-purple-600/30 to-pink-600/30',
                'from-red-600/30 to-orange-600/30',
                'from-blue-600/30 to-purple-600/30',
                'from-green-600/30 to-teal-600/30',
                'from-gold/30 to-yellow-600/30'
              ];
              
              return (
                <div
                  key={boardName}
                  onClick={() => handleBoardClick(boardName)}
                  className="glass-strong rounded-2xl p-8 border-2 border-gold/20 hover:border-gold hover:glow-gold transition-all duration-300 cursor-pointer group relative overflow-hidden"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors[index % colors.length]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10">
                    {/* Board Icon */}
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-royal-red to-gold rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <i className="fas fa-graduation-cap text-white text-3xl"></i>
                    </div>

                    {/* Board Name */}
                    <h3 className="text-2xl font-black text-white mb-3 text-center group-hover:text-gold transition-colors">
                      {boardName}
                    </h3>

                    {/* Board Info */}
                    <div className="text-center mb-4">
                      <span className="inline-block glass px-3 py-1 rounded-full text-pink-400 text-sm font-bold mb-2">
                        {board.country}
                      </span>
                    </div>

                    {/* Modes */}
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      {board.modes && board.modes.map((mode) => (
                        <span key={mode} className="glass-strong px-3 py-1 rounded-full text-gold text-xs font-bold border border-gold/30">
                          {mode}
                        </span>
                      ))}
                    </div>

                    {/* Classes Info */}
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">
                        {Object.keys(board.classes || {}).length} Education Levels
                      </p>
                    </div>

                    {/* Hover Arrow */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <i className="fas fa-arrow-right text-gold text-xl"></i>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-strong rounded-xl p-6 border border-purple-500/30 hover:glow-gold transition-all">
              <div className="text-center">
                <div className="text-4xl font-black text-purple-400 mb-2">5</div>
                <p className="text-white font-semibold">Education Boards</p>
              </div>
            </div>

            <div className="glass-strong rounded-xl p-6 border border-pink-500/30 hover:glow-gold transition-all">
              <div className="text-center">
                <div className="text-4xl font-black text-pink-400 mb-2">3</div>
                <p className="text-white font-semibold">Learning Modes</p>
              </div>
            </div>

            <div className="glass-strong rounded-xl p-6 border border-gold/30 hover:glow-gold transition-all">
              <div className="text-center">
                <div className="text-4xl font-black text-gold mb-2">13</div>
                <p className="text-white font-semibold">Competitive Exams</p>
              </div>
            </div>

            <div className="glass-strong rounded-xl p-6 border border-royal-red/30 hover:glow-gold transition-all">
              <div className="text-center">
                <div className="text-4xl font-black text-royal-red mb-2">∞</div>
                <p className="text-white font-semibold">AI-Generated Content</p>
              </div>
            </div>
          </div>

          {/* Competitive Exams Shortcut */}
          <div className="mt-12 glass-strong rounded-2xl p-8 border-2 border-gold/30 hover:border-gold hover:glow-gold transition-all cursor-pointer" onClick={() => navigate('/competitive-exam-hub')}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-royal-red to-gold rounded-full flex items-center justify-center">
                  <i className="fas fa-trophy text-white text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Competitive Exam Hub</h3>
                  <p className="text-gray-400">Prepare for JEE, NEET, SAT, GRE, GMAT, UPSC & more</p>
                </div>
              </div>
              <button className="bg-gradient-royal px-6 py-3 rounded-full text-white font-bold hover:glow-gold transition-all">
                Explore Exams
                <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationHub;
