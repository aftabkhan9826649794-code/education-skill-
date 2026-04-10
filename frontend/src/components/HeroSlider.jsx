import React, { useState, useEffect } from 'react';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1496065187959-7f07b8353c55',
      title: 'WINGS GLOBAL EDU-SKILL HUB',
      subtitle: 'Education Without Boundaries, Countries, or Limitations',
      description: 'Empowering every student with AI, Skills & Global Opportunities'
    },
    {
      image: 'https://images.unsplash.com/photo-1568952433726-3896e3881c65',
      title: 'AI-Powered Learning for All',
      subtitle: 'Meet SARA - Your Personal AI Teacher',
      description: '24/7 Personalized Education • Sign Language • Voice Commands'
    },
    {
      image: 'https://images.unsplash.com/photo-1767954561407-7014cb8fb16c',
      title: 'Future-Ready Skills',
      subtitle: 'Robotics • Coding • Career Guidance',
      description: 'Building Tomorrow\'s Innovators Today',
      cta: true
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="relative h-[85vh] w-full overflow-hidden bg-black">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${slide.image}?w=1920&h=1080&fit=crop)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Dark Cinematic Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/90" />
          
          {/* Royal Red Accent Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-transparent" />
          
          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4 z-10 max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 animate-slide-in">
              <span className="text-gradient drop-shadow-2xl">{slide.title}</span>
            </h1>
            <p className="text-xl md:text-3xl font-bold text-white/95 mb-3 animate-slide-in" style={{animationDelay: '0.2s'}}>
              {slide.subtitle}
            </p>
            <p className="text-base md:text-xl font-medium text-gray-300 mb-8 animate-slide-in max-w-3xl" style={{animationDelay: '0.3s'}}>
              {slide.description}
            </p>
            
            {slide.cta && (
              <div className="flex flex-col sm:flex-row gap-4 animate-slide-in" style={{animationDelay: '0.4s'}}>
                <a
                  href="#sara-widget"
                  className="px-8 py-4 bg-gradient-royal text-white rounded-full font-bold text-lg glow-gold-hover transition-all duration-300 inline-flex items-center gap-2"
                >
                  <i className="fas fa-robot"></i>
                  MEET AI TEACHER SARA
                </a>
                <a
                  href="#hubs-section"
                  className="px-8 py-4 glass border-2 border-gold text-gold rounded-full font-bold text-lg hover:bg-gold hover:text-black transition-all duration-300"
                >
                  EXPLORE LEARNING HUBS
                </a>
              </div>
            )}

            {/* Vision Statement */}
            {index === 0 && (
              <div className="mt-12 glass-strong p-6 rounded-2xl max-w-3xl animate-slide-in" style={{animationDelay: '0.5s'}}>
                <p className="text-lg font-semibold text-gold mb-2">
                  <i className="fas fa-quote-left mr-2"></i>
                  OUR VISION
                </p>
                <p className="text-white/90 text-base leading-relaxed">
                  To provide <span className="text-gold font-bold">world-class education</span> to every student, 
                  regardless of physical ability, location, or economic status. 
                  We believe in <span className="text-gold font-bold">inclusive learning</span> powered by AI and innovation.
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
      
      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-gold w-10 glow-gold' 
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;