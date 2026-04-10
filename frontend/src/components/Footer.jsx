import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 bg-charcoal/90 border-t border-gold/20 py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Brand Section */}
        <div className="text-center mb-8">
          <h3 className="text-3xl font-black mb-3">
            WINGS GLOBAL <span className="text-gradient">EDU-SKILL HUB</span>
          </h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Empowering Education through AI and Global Innovation. No Boundaries, No Countries—Just Learning.
          </p>
        </div>
        
        {/* Social Icons */}
        <div className="flex justify-center gap-4 mb-8">
          {['facebook-f', 'twitter', 'instagram', 'linkedin-in', 'youtube'].map((icon, index) => (
            <a
              key={index}
              href="#"
              className="w-12 h-12 glass rounded-full flex items-center justify-center text-gold hover:glow-gold transition-all duration-300 hover:scale-110"
              aria-label={icon}
            >
              <i className={`fab fa-${icon}`}></i>
            </a>
          ))}
        </div>
        
        {/* Bottom Section */}
        <div className="text-center border-t border-gold/10 pt-8">
          <p className="text-gray-500 mb-2">
            © {currentYear} Makhdum Ashraf Simnani Education Society. All Rights Reserved.
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <a href="#" className="text-gold hover:text-white transition-colors duration-300">Privacy Policy</a>
            <span className="text-gray-600">|</span>
            <a href="#" className="text-gold hover:text-white transition-colors duration-300">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;