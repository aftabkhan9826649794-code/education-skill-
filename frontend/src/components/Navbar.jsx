import React from 'react';

const Navbar = () => {
  return (
    <nav className="glass-strong sticky top-0 z-40 px-4 md:px-8 py-4 shadow-lg">
      <div className="flex justify-between items-center">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl md:text-3xl font-bold text-gradient">WINGS</span>
          <span className="text-xl md:text-2xl font-semibold text-white">Global Edu-Skill Hub</span>
        </a>
        
        <div className="hidden lg:flex items-center gap-6">
          <a href="/" className="text-sm font-semibold text-white hover:text-gold transition-colors duration-300">HOME</a>
          <a href="#about" className="text-sm font-semibold text-white hover:text-gold transition-colors duration-300">ABOUT</a>
          <a href="#edu-hub" className="text-sm font-semibold text-white hover:text-gold transition-colors duration-300">EDU HUB</a>
          <a href="#study-hub" className="text-sm font-semibold text-white hover:text-gold transition-colors duration-300">STUDY HUB</a>
          <a href="#skill-hub" className="text-sm font-semibold text-white hover:text-gold transition-colors duration-300">SKILL HUB</a>
          <a href="#exam-hub" className="text-sm font-bold text-gold glow-gold-hover transition-all duration-300 border-b-2 border-gold">EXAM-HUB</a>
          <a href="#ngo-portal" className="text-sm font-semibold text-white hover:text-gold transition-colors duration-300">NGO PORTAL</a>
        </div>
        
        <a 
          href="#login" 
          className="glass px-6 py-2 rounded-full text-gold font-bold hover:glow-gold transition-all duration-300 border border-gold"
        >
          LOGIN
        </a>
      </div>
    </nav>
  );
};

export default Navbar;