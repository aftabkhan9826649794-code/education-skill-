import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const EducationBoardSelector = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { boardName, boardData } = location.state || {};
  
  const [selectedMode, setSelectedMode] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  if (!boardData) {
    return (
      <div className="min-h-screen bg-midnight-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Board not found</p>
          <button onClick={() => navigate('/education-hub')} className="bg-gradient-royal px-6 py-3 rounded-full text-white font-bold">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  const handleContinue = () => {
    if (!selectedMode || !selectedClass) {
      alert('Please select both education mode and class level');
      return;
    }
    
    navigate('/class-dashboard', {
      state: {
        boardName,
        educationMode: selectedMode,
        classLevel: selectedClass
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-midnight-black to-pink-900/20 relative">
      {/* Enhanced Background */}
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute top-20 right-10 w-96 h-96 bg-royal-red/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gold/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-12 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/education-hub')}
            className="glass px-6 py-3 rounded-full text-gold font-bold hover:glow-gold transition-all mb-8 inline-flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Hub
          </button>

          {/* Header */}
          <div className="glass-strong rounded-2xl p-8 mb-8 border border-gold/20 text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-gold bg-clip-text text-transparent">
                {boardName}
              </span>
            </h1>
            <p className="text-white/90 text-lg">
              Choose your <span className="text-gold font-bold">Education Mode</span> and <span className="text-pink-400 font-bold">Class Level</span>
            </p>
          </div>

          {/* Education Mode Selection */}
          <div className="glass-strong rounded-2xl p-8 mb-8 border border-gold/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <i className="fas fa-user-graduate text-gold"></i>
              Step 1: Select Education Mode
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {boardData.modes && boardData.modes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`p-6 rounded-xl transition-all duration-300 border-2 ${
                    selectedMode === mode
                      ? 'bg-gradient-to-br from-royal-red to-gold border-gold glow-gold'
                      : 'glass border-gold/30 hover:border-gold hover:bg-gold/10'
                  }`}
                >
                  <div className="text-center">
                    <i className={`fas ${
                      mode === 'Regular' ? 'fa-school' :
                      mode === 'Distance' ? 'fa-laptop-house' :
                      'fa-user-tie'
                    } text-3xl mb-3 ${selectedMode === mode ? 'text-white' : 'text-gold'}`}></i>
                    <h3 className={`text-xl font-bold mb-2 ${selectedMode === mode ? 'text-white' : 'text-white'}`}>
                      {mode}
                    </h3>
                    <p className={`text-sm ${selectedMode === mode ? 'text-white/90' : 'text-gray-400'}`}>
                      {mode === 'Regular' && 'Daily classroom attendance'}
                      {mode === 'Distance' && 'Online learning flexibility'}
                      {mode === 'Private' && 'Independent study path'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Class Level Selection */}
          {selectedMode && (
            <div className="glass-strong rounded-2xl p-8 mb-8 border border-pink-500/30 animate-fadeIn">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <i className="fas fa-layer-group text-pink-400"></i>
                Step 2: Select Class Level
              </h2>

              <div className="space-y-4">
                {boardData.classes && Object.keys(boardData.classes).map((level) => (
                  <div key={level} className="glass rounded-xl p-4 border border-gold/20">
                    <h3 className="text-lg font-bold text-gold mb-3">{level}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {boardData.classes[level].map((className) => (
                        <button
                          key={className}
                          onClick={() => setSelectedClass(className)}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            selectedClass === className
                              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold glow-gold'
                              : 'glass-strong text-white border border-pink-500/30 hover:border-pink-500 hover:bg-pink-500/20'
                          }`}
                        >
                          {className}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Continue Button */}
          {selectedMode && selectedClass && (
            <div className="text-center animate-fadeIn">
              <button
                onClick={handleContinue}
                className="bg-gradient-to-r from-royal-red via-gold to-pink-600 px-12 py-4 rounded-full text-white font-black text-xl hover:glow-gold transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <i className="fas fa-rocket"></i>
                  Continue to Dashboard
                  <i className="fas fa-arrow-right"></i>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
              
              <p className="text-gray-400 mt-4">
                {boardName} • {selectedMode} • {selectedClass}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducationBoardSelector;
