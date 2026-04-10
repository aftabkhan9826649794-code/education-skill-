import React from 'react';

const LevelsSection = () => {
  const levels = [
    { 
      name: 'PRE-PRIMARY', 
      icon: 'fas fa-shapes', 
      value: 'Pre-Primary',
      image: 'https://images.pexels.com/photos/14025659/pexels-photo-14025659.jpeg',
      gradient: 'from-pink-500 to-rose-600'
    },
    { 
      name: 'PRIMARY HUB', 
      icon: 'fas fa-child', 
      value: 'Primary',
      image: 'https://images.unsplash.com/photo-1588072432836-e10032774350',
      gradient: 'from-blue-500 to-cyan-600'
    },
    { 
      name: 'MIDDLE HUB', 
      icon: 'fas fa-laptop-code', 
      value: 'Middle',
      image: 'https://images.pexels.com/photos/8087865/pexels-photo-8087865.jpeg',
      gradient: 'from-green-500 to-emerald-600'
    },
    { 
      name: 'HIGH SCHOOL', 
      icon: 'fas fa-user-graduate', 
      value: 'High School',
      image: 'https://images.unsplash.com/photo-1758270703878-de80505b6714',
      gradient: 'from-purple-500 to-violet-600'
    },
    { 
      name: 'UNIVERSITY', 
      icon: 'fas fa-university', 
      value: 'University',
      image: 'https://images.unsplash.com/photo-1758270704524-596810e891b5',
      gradient: 'from-orange-500 to-red-600'
    }
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
          <p className="text-gray-400 mt-4">Select your educational journey</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {levels.map((level, index) => (
            <a
              key={index}
              href="#hubs-section"
              onClick={() => handleLevelSelect(level.value)}
              className="group relative overflow-hidden rounded-2xl hover:glow-gold transition-all duration-500 hover:-translate-y-4 hover:scale-105 animate-slide-in"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              {/* Image Background */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={`${level.image}?w=400&h=500&fit=crop`}
                  alt={level.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Dark Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${level.gradient} opacity-70 group-hover:opacity-60 transition-opacity duration-300`}></div>
                
                {/* Animated Border */}
                <div className="absolute inset-0 border-4 border-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Particle Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-gold rounded-full"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animation: `float ${Math.random() * 3 + 2}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 2}s`
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                {/* Icon */}
                <div className="mb-4 transform group-hover:scale-125 transition-transform duration-300">
                  <i className={`${level.icon} text-5xl text-gold drop-shadow-2xl`}></i>
                </div>
                
                {/* Name */}
                <h3 className="text-white font-black text-lg drop-shadow-2xl mb-2 group-hover:text-gold transition-colors duration-300">
                  {level.name}
                </h3>
                
                {/* Divider */}
                <div className="w-16 h-1 bg-gold rounded-full mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* CTA */}
                <span className="text-xs font-bold text-white/80 group-hover:text-white uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Explore →
                </span>
              </div>
              
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LevelsSection;
