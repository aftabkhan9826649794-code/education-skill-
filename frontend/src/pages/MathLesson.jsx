import React from 'react';
import { useNavigate } from 'react-router-dom';

const MathLesson = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-midnight-black relative">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute top-20 right-10 w-96 h-96 bg-royal-red/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gold/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="glass-strong rounded-2xl p-8 mb-8 border border-gold/20">
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              <span className="text-gradient">Math Lesson</span>
            </h1>
            <p className="text-white/90 text-lg">
              <i className="fas fa-calculator text-gold mr-2"></i>
              Chapter 1 – Numbers
            </p>
          </div>

          {/* Video Player Section */}
          <div className="glass-strong rounded-2xl p-8 mb-8 border border-gold/20">
            <div className="aspect-video bg-black/50 rounded-xl overflow-hidden border-2 border-gold/30 mb-6">
              <video 
                controls 
                className="w-full h-full"
                poster="https://via.placeholder.com/800x450/1a1a2e/FFD700?text=Math+Chapter+1"
              >
                <source src="/videos/math1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Video Controls & Info */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 text-white">
                <i className="fas fa-play-circle text-gold text-2xl"></i>
                <span className="font-bold">Introduction to Numbers</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <i className="fas fa-clock"></i>
                <span>Duration: 15:30</span>
              </div>
            </div>
          </div>

          {/* Download Notes Section */}
          <div className="glass-strong rounded-2xl p-8 border border-gold/20">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <i className="fas fa-file-pdf text-royal-red"></i>
              Download Study Material
            </h2>
            
            <div className="space-y-4">
              <a 
                href="/notes/math1.pdf" 
                download="Math_Chapter_1_Notes.pdf"
                className="glass flex items-center justify-between p-4 rounded-xl border border-gold/30 hover:glow-gold transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-royal rounded-lg flex items-center justify-center">
                    <i className="fas fa-download text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-white font-bold group-hover:text-gold transition-colors">
                      Math Chapter 1 Notes
                    </h3>
                    <p className="text-gray-400 text-sm">PDF Format • 2.4 MB</p>
                  </div>
                </div>
                <i className="fas fa-arrow-down text-gold"></i>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => navigate(-1)}
              className="glass px-6 py-3 rounded-full text-gold font-bold hover:glow-gold transition-all inline-flex items-center gap-2"
            >
              <i className="fas fa-arrow-left"></i>
              Back
            </button>
            
            <button
              onClick={() => navigate('/classes')}
              className="bg-gradient-royal px-8 py-3 rounded-full text-white font-bold hover:glow-gold transition-all inline-flex items-center gap-2"
            >
              All Lessons
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathLesson;
