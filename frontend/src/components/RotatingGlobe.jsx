import React from 'react';

const RotatingGlobe = () => {
  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Globe Container */}
      <div className="globe-container">
        {/* Main Globe Circle */}
        <div className="globe-sphere"></div>
        
        {/* Latitude Lines */}
        <div className="globe-line lat-line-1"></div>
        <div className="globe-line lat-line-2"></div>
        <div className="globe-line lat-line-3"></div>
        <div className="globe-line lat-line-4"></div>
        <div className="globe-line lat-line-5"></div>
        
        {/* Longitude Lines */}
        <div className="globe-line lon-line-1"></div>
        <div className="globe-line lon-line-2"></div>
        <div className="globe-line lon-line-3"></div>
        <div className="globe-line lon-line-4"></div>
        
        {/* Glowing Dots (Cities) */}
        <div className="globe-dot" style={{ top: '20%', left: '30%' }}></div>
        <div className="globe-dot" style={{ top: '40%', left: '60%' }}></div>
        <div className="globe-dot" style={{ top: '60%', left: '40%' }}></div>
        <div className="globe-dot" style={{ top: '70%', left: '70%' }}></div>
        <div className="globe-dot" style={{ top: '35%', left: '80%' }}></div>
        
        {/* Orbital Ring */}
        <div className="globe-orbit"></div>
      </div>
      
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold/20 to-royal-red/20 blur-xl animate-pulse"></div>
      
      {/* CSS Animations */}
      <style jsx>{`
        .globe-container {
          position: relative;
          width: 100%;
          height: 100%;
          animation: rotate3d 20s linear infinite;
          transform-style: preserve-3d;
        }
        
        @keyframes rotate3d {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        
        .globe-sphere {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, 
            rgba(255, 215, 0, 0.2), 
            rgba(196, 30, 58, 0.1),
            rgba(0, 0, 0, 0.8)
          );
          border: 2px solid rgba(255, 215, 0, 0.3);
          box-shadow: 
            inset 0 0 50px rgba(255, 215, 0, 0.2),
            0 0 80px rgba(196, 30, 58, 0.4);
        }
        
        .globe-line {
          position: absolute;
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 50%;
        }
        
        /* Latitude Lines */
        .lat-line-1 { width: 100%; height: 20%; top: 10%; left: 0; }
        .lat-line-2 { width: 100%; height: 40%; top: 20%; left: 0; }
        .lat-line-3 { width: 100%; height: 60%; top: 30%; left: 0; }
        .lat-line-4 { width: 100%; height: 40%; top: 50%; left: 0; }
        .lat-line-5 { width: 100%; height: 20%; top: 70%; left: 0; }
        
        /* Longitude Lines */
        .lon-line-1 { width: 2px; height: 100%; top: 0; left: 25%; background: rgba(255, 215, 0, 0.2); border: none; }
        .lon-line-2 { width: 2px; height: 100%; top: 0; left: 50%; background: rgba(255, 215, 0, 0.2); border: none; }
        .lon-line-3 { width: 2px; height: 100%; top: 0; left: 75%; background: rgba(255, 215, 0, 0.2); border: none; }
        .lon-line-4 { width: 100%; height: 2px; top: 50%; left: 0; background: rgba(255, 215, 0, 0.3); border: none; }
        
        .globe-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #FFD700;
          border-radius: 50%;
          box-shadow: 0 0 10px #FFD700, 0 0 20px #FFD700;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        
        @keyframes pulse-dot {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.3);
            opacity: 0.7;
          }
        }
        
        .globe-orbit {
          position: absolute;
          inset: -20%;
          border: 2px solid rgba(196, 30, 58, 0.3);
          border-radius: 50%;
          animation: rotate-orbit 10s linear infinite;
        }
        
        @keyframes rotate-orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RotatingGlobe;
