import React, { useState } from 'react';

const SARAWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'sara', text: 'Hello! I am SARA, your AI Teacher. What would you like to learn today? 🤖' }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  const sendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: message }]);
    setMessage('');
    
    // Simulate SARA thinking
    setIsThinking(true);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { 
          sender: 'sara', 
          text: `Great question! I'm here to help you learn. This is a preview - full AI integration coming in Phase 3! 🚀` 
        }
      ]);
      setIsThinking(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating SARA Button */}
      <div className="fixed bottom-24 right-8 z-50" id="sara-widget">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-full bg-gradient-royal flex items-center justify-center text-white text-2xl transition-all duration-300 hover:scale-110 glow-gold shadow-2xl"
          title="Chat with AI Teacher SARA"
          aria-label="Open SARA Chat"
        >
          <i className="fas fa-robot"></i>
        </button>
        
        {/* Pulsing Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-gold animate-ping opacity-75"></div>
      </div>

      {/* SARA Chat Window */}
      {isOpen && (
        <div className="fixed bottom-44 right-8 w-96 max-w-[calc(100vw-2rem)] z-50 animate-slide-in">
          <div className="glass-strong rounded-2xl overflow-hidden border-2 border-gold shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-royal p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center text-royal-red text-2xl glow-gold overflow-hidden border-2 border-white shadow-lg">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_ai-learning-hub-363/artifacts/0z197gja_AI%20Mentor%20Sara.jpeg"
                    alt="AI Teacher SARA"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">AI Teacher SARA</h3>
                  <p className="text-gold text-xs">Smart Adaptive Robotic Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gold transition-colors"
                aria-label="Close SARA Chat"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Messages Area */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-charcoal/50">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-gold text-black rounded-br-none'
                        : 'glass border border-gold/30 text-white rounded-bl-none'
                    }`}
                  >
                    {msg.sender === 'sara' && (
                      <div className="flex items-center gap-2 mb-1">
                        <i className="fas fa-robot text-gold text-sm"></i>
                        <span className="text-gold text-xs font-bold">SARA</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              
              {isThinking && (
                <div className="flex justify-start">
                  <div className="glass border border-gold/30 p-3 rounded-2xl rounded-bl-none">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-robot text-gold text-sm"></i>
                      <span className="text-gold text-xs font-bold">SARA is thinking</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                      <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-charcoal border-t border-gold/20">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask SARA anything..."
                  className="flex-1 bg-charcoal-light border border-gold/30 rounded-full px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                />
                <button
                  onClick={sendMessage}
                  className="w-10 h-10 bg-gradient-royal rounded-full flex items-center justify-center text-white hover:glow-gold transition-all duration-300"
                  aria-label="Send Message"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                🎤 Voice input coming in Phase 3!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SARAWidget;