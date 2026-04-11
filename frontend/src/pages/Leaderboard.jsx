import React from 'react';
import { useNavigate } from 'react-router-dom';

const Leaderboard = () => {
  const navigate = useNavigate();

  const topThree = [
    { rank: 2, name: 'Aman Rai', xp: 950, badge: 'Silver Scholar', color: '#C0C0C0' },
    { rank: 1, name: 'Aryan Khan', xp: 1200, badge: 'Gold Scholar', color: '#FFD700' },
    { rank: 3, name: 'Sara Ali', xp: 890, badge: 'Bronze Star', color: '#CD7F32' }
  ];

  const otherRanks = [
    { rank: 4, name: 'Zaid Sheikh', location: 'Indore', xp: 850 },
    { rank: 5, name: 'Ishani Vyas', location: 'Vadodara', xp: 780 },
    { rank: 6, name: 'Rahul S.', location: 'Mumbai', xp: 720 }
  ];

  return (
    <div className="min-h-screen bg-midnight-black relative">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute top-20 right-10 w-96 h-96 bg-gold/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-royal-red/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-12 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="glass-strong rounded-2xl p-8 mb-8 border border-gold/20 text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              <i className="fas fa-trophy text-gold mr-3"></i>
              <span className="text-gradient">WINGS GLOBAL HUB</span>
            </h1>
            <p className="text-white/90 text-lg">
              Top Performing Students of the Week
            </p>
          </div>

          {/* Top 3 Podium */}
          <div className="flex justify-center items-end gap-4 mb-8 flex-wrap">
            {/* 2nd Place */}
            <div className="glass-strong rounded-2xl p-6 border-2 border-gray-300/50 text-center transform hover:scale-105 transition-all duration-300">
              <div 
                className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-white font-black text-2xl"
                style={{ background: topThree[0].color }}
              >
                2
              </div>
              <div className="w-20 h-20 mx-auto mb-3 rounded-full border-4 border-gray-300 overflow-hidden">
                <img 
                  src="https://via.placeholder.com/80/4a5568/ffffff?text=A.R." 
                  alt={topThree[0].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-white font-bold text-lg mb-1">{topThree[0].name}</h4>
              <p className="text-gray-300 font-bold text-xl">{topThree[0].xp} XP</p>
              <span className="text-xs text-gray-400">{topThree[0].badge}</span>
            </div>

            {/* 1st Place (Larger) */}
            <div className="glass-strong rounded-2xl p-8 border-2 border-gold/70 text-center transform hover:scale-105 transition-all duration-300 glow-gold">
              <div 
                className="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center text-white font-black text-3xl shadow-2xl"
                style={{ background: topThree[1].color }}
              >
                <i className="fas fa-crown"></i>
              </div>
              <div className="w-24 h-24 mx-auto mb-3 rounded-full border-4 border-gold overflow-hidden">
                <img 
                  src="https://via.placeholder.com/96/FFD700/000000?text=A.K." 
                  alt={topThree[1].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-gold font-black text-2xl mb-1">{topThree[1].name}</h3>
              <p className="text-gold font-black text-2xl mb-1">{topThree[1].xp} XP</p>
              <span className="text-sm text-gold">{topThree[1].badge}</span>
            </div>

            {/* 3rd Place */}
            <div className="glass-strong rounded-2xl p-6 border-2 border-amber-700/50 text-center transform hover:scale-105 transition-all duration-300">
              <div 
                className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-white font-black text-2xl"
                style={{ background: topThree[2].color }}
              >
                3
              </div>
              <div className="w-20 h-20 mx-auto mb-3 rounded-full border-4 border-amber-700 overflow-hidden">
                <img 
                  src="https://via.placeholder.com/80/CD7F32/ffffff?text=S.A." 
                  alt={topThree[2].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-white font-bold text-lg mb-1">{topThree[2].name}</h4>
              <p className="text-amber-700 font-bold text-xl">{topThree[2].xp} XP</p>
              <span className="text-xs text-gray-400">{topThree[2].badge}</span>
            </div>
          </div>

          {/* Rank List */}
          <div className="glass-strong rounded-2xl border border-gold/20 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-royal p-4 grid grid-cols-4 gap-4 items-center font-bold text-white">
              <span>#</span>
              <span>Avatar</span>
              <span>Name</span>
              <span className="text-right">XP Points</span>
            </div>

            {/* Rank Items */}
            {otherRanks.map((user) => (
              <div 
                key={user.rank}
                className="p-4 grid grid-cols-4 gap-4 items-center border-t border-gold/10 hover:bg-gold/5 transition-all"
              >
                <span className="text-gold font-bold text-lg">{user.rank}</span>
                <div className="w-12 h-12 rounded-full border-2 border-gold/30 overflow-hidden">
                  <img 
                    src={`https://via.placeholder.com/48/1a1a2e/FFD700?text=${user.name.charAt(0)}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-white font-semibold">
                  {user.name} {user.location && <span className="text-gray-400 text-sm">({user.location})</span>}
                </span>
                <span className="text-right text-gold font-bold text-lg">{user.xp}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="glass px-8 py-4 rounded-full text-gold font-bold hover:glow-gold transition-all inline-flex items-center gap-2"
            >
              <i className="fas fa-home"></i>
              MY DASHBOARD
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-royal px-8 py-4 rounded-full text-white font-bold hover:glow-gold transition-all inline-flex items-center gap-2"
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

export default Leaderboard;
