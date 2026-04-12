import React, { useEffect, useState } from 'react';

const AchievementFireworks = ({ show, onComplete, message = "Correct! 🎉" }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (show) {
      // Generate particles
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
        duration: Math.random() * 2 + 1,
        delay: Math.random() * 0.3,
        color: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#C41E3A' : '#FFF'
      }));
      
      setParticles(newParticles);

      // Auto-hide after animation
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      {/* Success Message */}
      <div className="relative z-10 animate-bounce-in">
        <div className="glass-strong px-12 py-8 rounded-3xl border-4 border-gold shadow-2xl">
          <h2 className="text-5xl font-black text-gradient text-center mb-2">
            {message}
          </h2>
          <p className="text-gold text-center text-xl animate-pulse">
            Outstanding! Keep it up! 🌟
          </p>
        </div>
      </div>

      {/* Fireworks Particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="firework-particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>

      {/* Sparkle Stars */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="sparkle-star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`
            }}
          >
            ⭐
          </div>
        ))}
      </div>

      {/* Confetti */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={`confetti-${i}`}
            className="confetti-piece"
            style={{
              left: `${50 + (Math.random() - 0.5) * 40}%`,
              animationDelay: `${Math.random() * 0.3}s`,
              backgroundColor: i % 2 === 0 ? '#FFD700' : '#C41E3A',
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .firework-particle {
          position: absolute;
          border-radius: 50%;
          animation: firework-burst 2s ease-out forwards;
          box-shadow: 0 0 10px currentColor;
        }

        @keyframes firework-burst {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(
              calc((var(--rand-x, 0.5) - 0.5) * 400px),
              calc((var(--rand-y, 0.5) - 0.5) * 400px)
            ) scale(0);
            opacity: 0;
          }
        }

        .sparkle-star {
          position: absolute;
          font-size: 24px;
          animation: sparkle 1s ease-in-out forwards;
        }

        @keyframes sparkle {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(360deg);
            opacity: 0;
          }
        }

        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 20px;
          animation: confetti-fall 2s ease-out forwards;
        }

        @keyframes confetti-fall {
          0% {
            top: -10%;
            opacity: 1;
          }
          100% {
            top: 110%;
            opacity: 0;
            transform: translateX(100px) rotate(720deg);
          }
        }
      `}</style>
    </div>
  );
};

export default AchievementFireworks;
