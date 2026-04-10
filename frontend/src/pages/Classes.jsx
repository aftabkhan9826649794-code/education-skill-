import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Classes = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Pre-Primary');

  const filters = ['Pre-Primary', 'Class 6-10', 'Senior Secondary', 'Skill Hub'];

  const subjects = [
    {
      id: 1,
      title: 'Science & Innovation',
      description: 'Explore the wonders of the physical world',
      icon: 'fa-flask',
      color: 'from-red-600 to-red-800',
      borderColor: 'border-red-500/30',
      lessons: [
        { name: '1. Solar System', status: 'play', icon: 'fa-play-circle', color: 'text-green-400' },
        { name: '2. Human Body', status: 'play', icon: 'fa-play-circle', color: 'text-green-400' },
        { name: '3. Plant Life', status: 'locked', icon: 'fa-lock', color: 'text-gray-500' }
      ]
    },
    {
      id: 2,
      title: 'Language Lab (English)',
      description: 'Master Global Communication Skills',
      icon: 'fa-language',
      color: 'from-green-600 to-green-800',
      borderColor: 'border-green-500/30',
      lessons: [
        { name: '1. Basic Grammar', status: 'completed', icon: 'fa-check-circle', color: 'text-green-400' },
        { name: '2. AI Pronunciation', status: 'play', icon: 'fa-play-circle', color: 'text-green-400' },
        { name: '3. Business English', status: 'locked', icon: 'fa-lock', color: 'text-gray-500' }
      ]
    },
    {
      id: 3,
      title: 'Mathematics',
      description: 'Build strong numerical and analytical skills',
      icon: 'fa-calculator',
      color: 'from-blue-600 to-blue-800',
      borderColor: 'border-blue-500/30',
      lessons: [
        { name: '1. Algebra Basics', status: 'completed', icon: 'fa-check-circle', color: 'text-green-400' },
        { name: '2. Geometry', status: 'play', icon: 'fa-play-circle', color: 'text-green-400' },
        { name: '3. Trigonometry', status: 'locked', icon: 'fa-lock', color: 'text-gray-500' }
      ]
    },
    {
      id: 4,
      title: 'Social Studies',
      description: 'Understand history, geography and civics',
      icon: 'fa-globe-asia',
      color: 'from-purple-600 to-purple-800',
      borderColor: 'border-purple-500/30',
      lessons: [
        { name: '1. Ancient Civilizations', status: 'play', icon: 'fa-play-circle', color: 'text-green-400' },
        { name: '2. World Geography', status: 'play', icon: 'fa-play-circle', color: 'text-green-400' },
        { name: '3. Indian Constitution', status: 'locked', icon: 'fa-lock', color: 'text-gray-500' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-midnight-black relative">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-900/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black mb-4">
              <i className="fas fa-book-open text-gold mr-4"></i>
              <span className="text-gradient">Academic Streams</span>
            </h1>
            <p className="text-gray-400 text-lg">Choose your learning path and explore subjects</p>
          </div>

          {/* Class Selector */}
          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                  activeFilter === filter
                    ? 'bg-gradient-royal text-white glow-gold'
                    : 'glass-strong text-gold hover:glow-gold border border-gold/30'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Subject Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {subjects.map((subject, index) => (
              <div
                key={subject.id}
                className={`glass-strong rounded-2xl overflow-hidden border ${subject.borderColor} hover:glow-gold transition-all duration-500 hover:-translate-y-2 animate-slide-in`}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {/* Subject Banner */}
                <div className={`bg-gradient-to-r ${subject.color} p-6 flex items-center justify-center`}>
                  <i className={`fas ${subject.icon} text-white text-5xl`}></i>
                </div>

                {/* Subject Info */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{subject.title}</h3>
                  <p className="text-gray-400 text-sm mb-6">{subject.description}</p>

                  {/* Lesson List */}
                  <ul className="space-y-3 mb-6">
                    {subject.lessons.map((lesson, idx) => (
                      <li
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          lesson.status === 'locked' ? 'bg-charcoal/30' : 'glass hover:bg-gold/10'
                        } transition-all cursor-pointer`}
                      >
                        <span className={lesson.status === 'locked' ? 'text-gray-500' : 'text-white'}>
                          {lesson.name}
                        </span>
                        <i className={`fas ${lesson.icon} ${lesson.color}`}></i>
                      </li>
                    ))}
                  </ul>

                  <button className="w-full bg-gradient-royal py-3 rounded-xl text-white font-bold hover:glow-gold transition-all">
                    Open Subject Lab
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Back Button */}
          <div className="text-center mt-12">
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

export default Classes;