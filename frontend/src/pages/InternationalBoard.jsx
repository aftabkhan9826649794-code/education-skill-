import React from 'react';
import { useNavigate } from 'react-router-dom';

const InternationalBoard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-midnight-black relative">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-red-600/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/hubs')}
            className="glass px-6 py-3 rounded-full text-gold font-bold hover:glow-gold transition-all inline-flex items-center gap-2 mb-8"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Edu-Hub
          </button>

          {/* Header */}
          <div className="glass-strong rounded-2xl p-8 mb-8 border border-gold/20 text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="text-white">GLOBAL </span>
              <span className="text-gradient">CURRICULUM</span>
              <span className="text-white"> HUB</span>
            </h2>
            <p className="text-white/90 text-lg">
              International Standards for Future Leaders (IB & Cambridge)
            </p>
          </div>

          {/* International Board Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* IB Board Card */}
            <div className="glass-strong rounded-2xl p-8 border-2 border-blue-500/50 hover:glow-gold transition-all duration-300 group">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-2xl">
                  <i className="fas fa-graduation-cap text-white text-3xl"></i>
                </div>
                <h3 className="text-3xl font-black text-white mb-2 group-hover:text-gold transition-colors">
                  IB BOARD
                </h3>
                <p className="text-gray-400 text-sm mb-1">(Geneva)</p>
                <p className="text-white font-semibold">
                  Focus: Critical Thinking & Research
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <span className="bg-blue-600/20 border border-blue-500/50 px-4 py-2 rounded-full text-blue-400 font-bold text-sm">
                  PYP
                </span>
                <span className="bg-blue-600/20 border border-blue-500/50 px-4 py-2 rounded-full text-blue-400 font-bold text-sm">
                  MYP
                </span>
                <span className="bg-blue-600/20 border border-blue-500/50 px-4 py-2 rounded-full text-blue-400 font-bold text-sm">
                  DP
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-white">
                  <i className="fas fa-check-circle text-green-400"></i>
                  <span>Theory of Knowledge (TOK)</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <i className="fas fa-check-circle text-green-400"></i>
                  <span>Extended Essay</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <i className="fas fa-check-circle text-green-400"></i>
                  <span>CAS Activities</span>
                </li>
              </ul>

              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 py-4 rounded-xl text-white font-bold hover:glow-gold transition-all duration-300">
                <i className="fas fa-book-open mr-2"></i>
                View Resources
              </button>
            </div>

            {/* Cambridge Board Card */}
            <div className="glass-strong rounded-2xl p-8 border-2 border-red-500/50 hover:glow-gold transition-all duration-300 group">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-2xl">
                  <i className="fas fa-microscope text-white text-3xl"></i>
                </div>
                <h3 className="text-3xl font-black text-white mb-2 group-hover:text-gold transition-colors">
                  CAMBRIDGE
                </h3>
                <p className="text-gray-400 text-sm mb-1">(UK)</p>
                <p className="text-white font-semibold">
                  Focus: Academic Depth & Global Flexibility
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <span className="bg-red-600/20 border border-red-500/50 px-4 py-2 rounded-full text-red-400 font-bold text-sm">
                  IGCSE
                </span>
                <span className="bg-red-600/20 border border-red-500/50 px-4 py-2 rounded-full text-red-400 font-bold text-sm">
                  A-LEVELS
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-white">
                  <i className="fas fa-check-circle text-green-400"></i>
                  <span>Subject Specialization</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <i className="fas fa-check-circle text-green-400"></i>
                  <span>Practical Assessments</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <i className="fas fa-check-circle text-green-400"></i>
                  <span>Global Recognition</span>
                </li>
              </ul>

              <button className="w-full bg-gradient-to-r from-red-600 to-red-700 py-4 rounded-xl text-white font-bold hover:glow-gold transition-all duration-300">
                <i className="fas fa-book-open mr-2"></i>
                View Resources
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="glass-strong rounded-2xl p-6 mt-8 border border-gold/20 text-center">
            <p className="text-white text-lg">
              <i className="fas fa-globe text-gold mr-2"></i>
              Access world-class curriculum resources tailored for international standards
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternationalBoard;
