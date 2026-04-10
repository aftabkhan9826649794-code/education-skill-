import React, { useState, useEffect } from 'react';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1496065187959-7f07b8353c55',
      title: 'WINGS GLOBAL EDU-SKILL HUB',
      subtitle: 'Empowering Next-Gen Learners'
    },
    {
      image: 'https://images.unsplash.com/photo-1568952433726-3896e3881c65',
      title: 'Future Ready Skills',
      subtitle: 'AI Teacher • Live Classes • Skill Development'
    },
    {
      image: 'https://images.unsplash.com/photo-1767954561407-7014cb8fb16c',
      title: 'Skill Ready Future',
      subtitle: 'Robotics • Coding • Career Guidance'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="relative h-[75vh] w-full overflow-hidden bg-black">
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" />
          
          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4 z-10">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 animate-slide-in">
              <span className="text-gradient drop-shadow-2xl">{slide.title}</span>
            </h1>
            <p className="text-xl md:text-3xl font-semibold text-white/90 mb-8 animate-slide-in" style={{animationDelay: '0.2s'}}>
              {slide.subtitle}
            </p>
            
            {index === 2 && (
              <a
                href="#login"
                className="mt-6 px-8 py-4 bg-gradient-royal text-white rounded-full font-bold text-lg glow-gold-hover transition-all duration-300 animate-slide-in"
                style={{animationDelay: '0.4s'}}
              >
                GET STARTED
              </a>
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
                ? 'bg-gold w-8 glow-gold' 
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