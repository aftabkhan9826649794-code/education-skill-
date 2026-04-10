import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({ name: '', phone: '', message: '' });
    }, 5000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-midnight-black relative">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gold/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-900/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black mb-4">
              <span className="text-gradient">Contact WINGS</span>
            </h1>
            <p className="text-gray-400 text-lg">We're here to help you on your learning journey</p>
          </div>

          {/* Contact Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Info Side */}
            <div className="glass-strong rounded-2xl p-8 border border-gold/20 animate-slide-in">
              <h2 className="text-3xl font-bold text-white mb-6">
                <i className="fas fa-info-circle text-gold mr-3"></i>
                Get in Touch
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-royal rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-building text-white"></i>
                  </div>
                  <div>
                    <p className="text-gold font-semibold mb-1">Managed by</p>
                    <p className="text-white">Makhdum Ashraf Simnani Education Society</p>
                    <p className="text-gray-400 text-sm mt-1">REG NO: 10957/08 • NITI Aayog ID: MP/2018/0220155</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-royal rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-envelope text-white"></i>
                  </div>
                  <div>
                    <p className="text-gold font-semibold mb-1">Email</p>
                    <a href="mailto:wings.global.edu@gmail.com" className="text-white hover:text-gold transition-colors">
                      wings.global.edu@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-royal rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-globe text-white"></i>
                  </div>
                  <div>
                    <p className="text-gold font-semibold mb-1">Global Support</p>
                    <p className="text-white">India • Sudan • Africa</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-royal rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-phone text-white"></i>
                  </div>
                  <div>
                    <p className="text-gold font-semibold mb-1">WhatsApp</p>
                    <p className="text-white">Available for quick inquiries</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gold/20">
                <p className="text-white italic text-center text-lg">
                  <i className="fas fa-quote-left text-gold mr-2"></i>
                  "Aapki shiksha, hamari zimmedari."
                  <i className="fas fa-quote-right text-gold ml-2"></i>
                </p>
                <p className="text-gray-400 text-center mt-2 text-sm">- Institute Head</p>
              </div>
            </div>

            {/* Form Side */}
            <div className="glass-strong rounded-2xl p-8 border border-gold/20 animate-slide-in" style={{animationDelay: '0.2s'}}>
              <h3 className="text-3xl font-bold text-white mb-6">
                <i className="fas fa-paper-plane text-gold mr-3"></i>
                Sawal Puchiye (Enquiry)
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gold font-semibold mb-2">
                    Aapka Naam (Your Name)
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-charcoal-light border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-gold font-semibold mb-2">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full bg-charcoal-light border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div>
                  <label className="block text-gold font-semibold mb-2">
                    Sawal / Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    className="w-full bg-charcoal-light border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors resize-none"
                    placeholder="Type your question or message here..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-royal py-4 rounded-xl text-white font-bold hover:glow-gold transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-paper-plane"></i>
                  Message Bhejein (Send Message)
                </button>
              </form>

              {showSuccess && (
                <div className="mt-6 bg-green-600/20 border border-green-400 rounded-xl p-4 text-center animate-slide-in">
                  <p className="text-green-400 font-bold">
                    ✅ Dhanyawad! Hum aapse jald hi contact karenge.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/')}
              className="glass px-8 py-4 rounded-full text-gold font-bold hover:glow-gold transition-all inline-flex items-center gap-2"
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

export default Contact;