import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Animated Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212, 175, 55, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 175, 55, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }}
      />
      
      {/* Floating Particles - More and Larger */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 6 + 3 + 'px',
              height: Math.random() * 6 + 3 + 'px',
              background: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#C41E3A' : '#FF69B4',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.6 + 0.3,
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: Math.random() * 5 + 's',
              boxShadow: `0 0 ${Math.random() * 20 + 10}px currentColor`,
            }}
          />
        ))}
      </div>
      
      {/* Glowing Orbs */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={`orb-${i}`}
            className="absolute rounded-full blur-3xl"
            style={{
              width: Math.random() * 300 + 200 + 'px',
              height: Math.random() * 300 + 200 + 'px',
              background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(255, 215, 0, 0.15)' : 'rgba(196, 30, 58, 0.15)'} 0%, transparent 70%)`,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `pulse ${Math.random() * 10 + 15}s ease-in-out infinite`,
              animationDelay: Math.random() * 5 + 's'
            }}
          />
        ))}
      </div>
      
      {/* Gradient Overlays with Animation */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-red-900/10 to-transparent rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-yellow-600/10 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
      <div className="absolute top-1/2 left-1/2 w-1/4 h-1/4 bg-gradient-to-r from-pink-500/10 to-purple-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
    </div>
  );
};

export default AnimatedBackground;