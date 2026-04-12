import React from 'react';

const HubsSection = () => {
  const hubs = [
    {
      title: 'AI Teacher SARA',
      description: '24/7 personalized learning with our Intelligent Assistant',
      image: 'https://customer-assets.emergentagent.com/job_ai-learning-hub-363/artifacts/ioxrs3my_ai-teacher.jpg',
      icon: 'fas fa-robot',
      link: '/ai-tutor'
    },
    {
      title: 'Robotic Lab',
      description: 'Hands-on training in Robotics, AI & Coding',
      image: 'https://images.unsplash.com/photo-1655393001768-d946c97d6fd1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxyb2JvdGljc3xlbnwwfHx8fDE3NzU4NTM4ODF8MA&ixlib=rb-4.1.0&q=85',
      icon: 'fas fa-microchip',
      link: '/master-skill-hub'
    },
    {
      title: 'Education Hub',
      description: 'CBSE, ICSE, IB, Cambridge - All boards available',
      image: 'https://customer-assets.emergentagent.com/job_ai-learning-hub-363/artifacts/m2jf0kgb_ai-councler.png',
      icon: 'fas fa-graduation-cap',
      link: '/education-hub'
    }
  ];

  return (
    <section id="hubs-section" className="relative z-10 py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-slide-in">
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            <span className="text-gradient">OUR SPECIALIZED LEARNING HUBS</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-gold to-gold-metallic mx-auto rounded-full glow-gold" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hubs.map((hub, index) => (
            <div
              key={index}
              className="group glass rounded-2xl overflow-hidden hover:glow-gold transition-all duration-500 hover:-translate-y-4 animate-slide-in"
              style={{animationDelay: `${index * 0.2}s`}}
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={hub.image}
                  alt={hub.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-70" />
                
                {/* Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <i className={`${hub.icon} text-6xl text-gold glow-gold`}></i>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-3">{hub.title}</h3>
                <p className="text-gray-300 mb-4">{hub.description}</p>
                <a
                  href={hub.link}
                  className="inline-flex items-center gap-2 text-gold font-semibold hover:gap-4 transition-all duration-300"
                >
                  ACCESS NOW <i className="fas fa-arrow-right"></i>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HubsSection;