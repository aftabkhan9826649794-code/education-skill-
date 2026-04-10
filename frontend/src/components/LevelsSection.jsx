import React from 'react';

const LevelsSection = () => {
  const levels = [
    { name: 'PRE-PRIMARY', icon: 'fas fa-shapes', value: 'Pre-Primary' },
    { name: 'PRIMARY HUB', icon: 'fas fa-child', value: 'Primary' },
    { name: 'MIDDLE HUB', icon: 'fas fa-laptop-code', value: 'Middle' },
    { name: 'HIGH SCHOOL', icon: 'fas fa-user-graduate', value: 'High School' },
    { name: 'UNIVERSITY', icon: 'fas fa-university', value: 'University' }
  ];

  const handleLevelSelect = (level) => {
    console.log('Level selected:', level);
    // Will store in backend in Phase 4
  };

  return (
    <section className="relative z-10 py-20 px-4 md:px-8 bg-charcoal/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-slide-in">
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            <span className="text-gradient">CHOOSE YOUR LEARNING LEVEL</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-gold to-gold-metallic mx-auto rounded-full glow-gold" />
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {levels.map((level, index) => (
            <a
              key={index}
              href="#hubs-section"
              onClick={() => handleLevelSelect(level.value)}
              className="group flex flex-col items-center justify-center w-40 h-40 glass rounded-full border-2 border-gold transition-all duration-500 hover:glow-gold hover:-translate-y-4 hover:scale-110 animate-slide-in"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <i className={`${level.icon} text-4xl mb-3 text-gold group-hover:text-white transition-colors duration-300`}></i>
              <span className="text-xs font-bold text-center px-2 text-white group-hover:text-gold transition-colors duration-300">
                {level.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LevelsSection;