import React from 'react';
import { useNavigate } from 'react-router-dom';

const LearningHub = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-midnight-black relative">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute top-20 right-10 w-96 h-96 bg-royal-red/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-green-600/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* AI Monitoring Bar */}
          <div className="glass-strong rounded-full px-6 py-3 mb-8 border border-green-500/50 flex items-center justify-center gap-3 animate-pulse">
            <i className="fas fa-video text-green-400"></i>
            <span className="text-green-400 font-bold">AI MONITORING ACTIVE: INTEGRITY MODE ON</span>
          </div>

          {/* AI Mentor Section */}
          <div className="glass-strong rounded-2xl p-8 mb-8 border border-gold/20 text-center">
            <div className="flex flex-col items-center">
              {/* AI Speech Bubble */}
              <div className="glass mb-6 px-6 py-4 rounded-2xl border border-gold/30 relative">
                <p className="text-white text-lg font-semibold">
                  Welcome back! Ready for your Weekly Quiz?
                </p>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gold/30"></div>
              </div>

              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-rose-600 flex items-center justify-center border-4 border-gold shadow-2xl overflow-hidden">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_ai-learning-hub-363/artifacts/0z197gja_AI%20Mentor%20Sara.jpeg"
                    alt="AI Mentor"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 animate-pulse shadow-lg border-2 border-white">
                  <i className="fas fa-microphone text-white"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Main Hub Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Weekly Quiz Card */}
            <div className="glass-strong rounded-xl p-6 border border-blue-500/30 hover:glow-gold transition-all duration-300 cursor-pointer group">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
                  <i className="fas fa-stopwatch text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gold transition-colors">
                  Weekly Quiz
                </h3>
                <p className="text-gray-400 mb-3">
                  Self-assessment after your lessons.
                </p>
                <span className="text-xs text-blue-400 font-bold">
                  AUTO-GRADING ENABLED
                </span>
              </div>
            </div>

            {/* Science & Math Zone Card */}
            <div className="glass-strong rounded-xl p-6 border border-green-500/30 hover:glow-gold transition-all duration-300 cursor-pointer group">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center">
                  <i className="fas fa-atom text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gold transition-colors">
                  Science & Math Zone
                </h3>
                <p className="text-gray-400 mb-3">
                  Interactive STEM Learning
                </p>
                <span className="text-xs text-gold font-bold">
                  ADAPTIVE CONTENT
                </span>
              </div>
            </div>

            {/* Final Examination Card */}
            <div 
              className="glass-strong rounded-xl p-6 border border-red-500/30 hover:glow-gold transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/secure-exam')}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
                  <i className="fas fa-user-shield text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gold transition-colors">
                  Final Examination
                </h3>
                <p className="text-gray-400 mb-3">
                  End of session certification exam.
                </p>
                <span className="text-xs text-red-400 font-bold">
                  AI PROCTORING ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* Learning Analytics */}
          <div className="glass-strong rounded-2xl p-8 border border-gold/20">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-2xl font-bold text-white flex items-center gap-2">
                <i className="fas fa-chart-line text-gold"></i>
                Learning Analytics
              </h4>
              <span className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-2 rounded-full text-white font-black text-lg">
                Grade: A+
              </span>
            </div>

            {/* Attendance Progress */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-white font-semibold">Attendance</span>
                <span className="text-green-400 font-bold">95%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-1000"
                  style={{ width: '95%' }}
                ></div>
              </div>
            </div>

            {/* Course Progress */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-white font-semibold">Course Progress</span>
                <span className="text-gold font-bold">70%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-royal h-full rounded-full transition-all duration-1000"
                  style={{ width: '70%' }}
                ></div>
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

export default LearningHub;
