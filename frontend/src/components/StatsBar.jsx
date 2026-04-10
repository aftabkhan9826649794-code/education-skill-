import React, { useState, useEffect, useRef } from 'react';

const StatsBar = () => {
  const [stats, setStats] = useState([
    { target: 10000, current: 0, label: 'EMPOWERED STUDENTS', suffix: '+' },
    { target: 80, current: 0, label: 'INTERACTIVE MODULES', suffix: '+' },
    { target: 15, current: 0, label: 'ADVANCED AI TOOLS', suffix: '+' },
    { target: 100, current: 0, label: 'SKILL-ORIENTED', suffix: '%' }
  ]);
  
  const [hasAnimated, setHasAnimated] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          animateCounters();
          setHasAnimated(true);
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAnimated]);

  const animateCounters = () => {
    stats.forEach((stat, index) => {
      let start = 0;
      const increment = stat.target / 100;
      const timer = setInterval(() => {
        start += increment;
        if (start >= stat.target) {
          start = stat.target;
          clearInterval(timer);
        }
        setStats(prev => {
          const newStats = [...prev];
          newStats[index] = { ...newStats[index], current: Math.floor(start) };
          return newStats;
        });
      }, 20);
    });
  };

  return (
    <section 
      ref={statsRef}
      className="relative z-10 bg-gradient-royal py-16 px-4 md:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center animate-slide-in"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <h2 className="text-4xl md:text-5xl font-black text-gold mb-2 counter-animate">
                {stat.current.toLocaleString()}{stat.suffix}
              </h2>
              <p className="text-sm md:text-base font-semibold text-white/90">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;