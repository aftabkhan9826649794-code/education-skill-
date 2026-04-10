import React, { useState } from 'react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="glass-strong sticky top-0 z-40 px-4 md:px-8 py-4 shadow-lg border-b border-gold/20">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl md:text-3xl font-bold text-gradient">WINGS</span>
          <span className="text-lg md:text-xl font-semibold text-white">Global Edu-Skill Hub</span>
        </a>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          <a href="/" className="text-sm font-semibold text-white hover:text-gold transition-colors duration-300 border-b-2 border-transparent hover:border-gold">HOME</a>
          <a href="#ai-hub" className="text-sm font-semibold text-white hover:text-gold transition-colors duration-300 border-b-2 border-transparent hover:border-gold">AI HUB</a>
          <a href="#study-hub" className="text-sm font-semibold text-white hover:text-gold transition-colors duration-300 border-b-2 border-transparent hover:border-gold">STUDY HUB</a>
          <a href="#skill-lab" className="text-sm font-semibold text-white hover:text-gold transition-colors duration-300 border-b-2 border-transparent hover:border-gold">SKILL LAB</a>
          <a href="#sign-language" className="text-sm font-semibold text-white hover:text-gold transition-colors duration-300 border-b-2 border-transparent hover:border-gold">SIGN LANGUAGE HUB</a>
          <a href="#about-ngo" className="text-sm font-semibold text-white hover:text-gold transition-colors duration-300 border-b-2 border-transparent hover:border-gold">ABOUT NGO</a>
        </div>
        
        {/* Login Button */}
        <a 
          href="#login" 
          className="hidden lg:block glass px-6 py-2 rounded-full text-gold font-bold hover:glow-gold transition-all duration-300 border border-gold"
        >
          LOGIN
        </a>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden glass w-10 h-10 rounded-lg flex items-center justify-center text-gold"
          aria-label="Toggle Menu"
        >
          <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-4 glass-strong rounded-lg p-4 space-y-3 animate-slide-in">
          <a href="/" className="block text-sm font-semibold text-white hover:text-gold transition-colors">HOME</a>
          <a href="#ai-hub" className="block text-sm font-semibold text-white hover:text-gold transition-colors">AI HUB</a>
          <a href="#study-hub" className="block text-sm font-semibold text-white hover:text-gold transition-colors">STUDY HUB</a>
          <a href="#skill-lab" className="block text-sm font-semibold text-white hover:text-gold transition-colors">SKILL LAB</a>
          <a href="#sign-language" className="block text-sm font-semibold text-white hover:text-gold transition-colors">SIGN LANGUAGE HUB</a>
          <a href="#about-ngo" className="block text-sm font-semibold text-white hover:text-gold transition-colors">ABOUT NGO</a>
          <a href="#login" className="block text-sm font-bold text-gold hover:text-white transition-colors border-t border-gold/20 pt-3 mt-3">LOGIN</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;