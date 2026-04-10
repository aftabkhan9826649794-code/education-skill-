import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 bg-charcoal/95 border-t border-gold/20 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black mb-3">
              WINGS GLOBAL <span className="text-gradient">EDU-SKILL HUB</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Empowering Education through AI and Global Innovation. 
              <span className="block text-gold font-semibold mt-2">
                No Boundaries, No Countries—Just Learning.
              </span>
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-3 justify-center md:justify-start">
              {['facebook-f', 'twitter', 'instagram', 'linkedin-in', 'youtube'].map((icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 glass rounded-full flex items-center justify-center text-gold hover:glow-gold transition-all duration-300 hover:scale-110"
                  aria-label={icon}
                >
                  <i className={`fab fa-${icon}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h4 className="text-gold font-bold text-lg mb-4">Quick Links</h4>
            <div className="space-y-2">
              <a href="#ai-hub" className="block text-gray-400 hover:text-gold transition-colors text-sm">AI Hub</a>
              <a href="#study-hub" className="block text-gray-400 hover:text-gold transition-colors text-sm">Study Hub</a>
              <a href="#skill-lab" className="block text-gray-400 hover:text-gold transition-colors text-sm">Skill Lab</a>
              <a href="#sign-language" className="block text-gray-400 hover:text-gold transition-colors text-sm">Sign Language Hub</a>
              <a href="#about-ngo" className="block text-gray-400 hover:text-gold transition-colors text-sm">About NGO</a>
            </div>
          </div>

          {/* NGO Credentials */}
          <div className="text-center md:text-right">
            <h4 className="text-gold font-bold text-lg mb-4">
              <i className="fas fa-certificate mr-2"></i>
              NGO Credentials
            </h4>
            <div className="glass p-4 rounded-xl border border-gold/30 inline-block">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 justify-center md:justify-end">
                  <i className="fas fa-id-card text-gold"></i>
                  <span className="text-gray-400">Registration No:</span>
                  <span className="text-white font-bold">10957/08</span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-end">
                  <i className="fas fa-landmark text-gold"></i>
                  <span className="text-gray-400">NITI Aayog ID:</span>
                  <span className="text-white font-bold">MP/2018/0220155</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gold/20">
                  <p className="text-gold text-xs font-semibold">
                    Makhdum Ashraf Simnani Education Society
                  </p>
                  <p className="text-gray-500 text-xs mt-1">Registered NGO</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-gold/10 pt-6 mb-6">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <i className="fas fa-shield-alt text-gold"></i>
              <span>Verified NGO</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <i className="fas fa-universal-access text-gold"></i>
              <span>Inclusive Education</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <i className="fas fa-globe text-gold"></i>
              <span>Global Reach</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <i className="fas fa-robot text-gold"></i>
              <span>AI-Powered Learning</span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="text-center border-t border-gold/10 pt-6">
          <p className="text-gray-500 mb-2 text-sm">
            © {currentYear} Makhdum Ashraf Simnani Education Society. All Rights Reserved.
          </p>
          <div className="flex justify-center gap-4 text-xs flex-wrap">
            <a href="#privacy" className="text-gold hover:text-white transition-colors">Privacy Policy</a>
            <span className="text-gray-600">|</span>
            <a href="#terms" className="text-gold hover:text-white transition-colors">Terms of Service</a>
            <span className="text-gray-600">|</span>
            <a href="#contact" className="text-gold hover:text-white transition-colors">Contact Us</a>
            <span className="text-gray-600">|</span>
            <a href="#donate" className="text-gold hover:text-white transition-colors">Donate</a>
          </div>
          
          <p className="text-gray-600 text-xs mt-4">
            Built with ❤️ for inclusive education • Powered by AI & Innovation
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
