import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const VideoLessonCreator = () => {
  const navigate = useNavigate();
  const [lessonData, setLessonData] = useState({
    title: '',
    subject: 'Science',
    class: 'Class 6',
    slides: ['']
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [voiceSettings, setVoiceSettings] = useState({
    voice: 'female',
    speed: 1,
    pitch: 1
  });
  const canvasRef = useRef(null);

  const subjects = ['Science', 'Mathematics', 'English', 'Social Studies', 'Hindi', 'Computer Science'];
  const classes = ['Pre-Primary', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

  const handleInputChange = (field, value) => {
    setLessonData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSlideChange = (index, value) => {
    const newSlides = [...lessonData.slides];
    newSlides[index] = value;
    setLessonData(prev => ({
      ...prev,
      slides: newSlides
    }));
  };

  const addSlide = () => {
    setLessonData(prev => ({
      ...prev,
      slides: [...prev.slides, '']
    }));
  };

  const removeSlide = (index) => {
    if (lessonData.slides.length > 1) {
      const newSlides = lessonData.slides.filter((_, i) => i !== index);
      setLessonData(prev => ({
        ...prev,
        slides: newSlides
      }));
      if (currentSlide >= newSlides.length) {
        setCurrentSlide(newSlides.length - 1);
      }
    }
  };

  const generateVideoPreview = () => {
    setIsGenerating(true);
    
    // Simulate video generation (in production, this would call a backend API)
    setTimeout(() => {
      setGeneratedVideo({
        url: '#video-preview',
        duration: lessonData.slides.length * 10,
        size: '2.5 MB'
      });
      setIsGenerating(false);
    }, 3000);
  };

  const speakSlide = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceSettings.speed;
      utterance.pitch = voiceSettings.pitch;
      
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => voice.name.includes('Female') || voice.name.includes('Google'));
      if (femaleVoice && voiceSettings.voice === 'female') {
        utterance.voice = femaleVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const downloadVideo = () => {
    alert('Video download will be available after backend integration. The video would be rendered on the server and sent as MP4 file.');
    // In production: Trigger backend API to generate MP4 file
  };

  return (
    <div className="min-h-screen bg-midnight-black relative">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-900/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-600/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black mb-4">
              <i className="fas fa-video text-gold mr-4"></i>
              <span className="text-gradient">Video Lesson Creator</span>
            </h1>
            <p className="text-gray-400 text-lg">Transform text lessons into engaging MP4 videos</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - Lesson Input */}
            <div className="space-y-6">
              {/* Lesson Details */}
              <div className="glass-strong rounded-2xl p-6 border border-gold/20">
                <h2 className="text-2xl font-bold text-white mb-6">
                  <i className="fas fa-info-circle text-gold mr-2"></i>
                  Lesson Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gold font-semibold mb-2">Lesson Title</label>
                    <input
                      type="text"
                      value={lessonData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="E.g., Introduction to Photosynthesis"
                      className="w-full bg-charcoal-light border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gold font-semibold mb-2">Subject</label>
                      <select
                        value={lessonData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className="w-full bg-charcoal-light border border-gold/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors"
                      >
                        {subjects.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gold font-semibold mb-2">Class</label>
                      <select
                        value={lessonData.class}
                        onChange={(e) => handleInputChange('class', e.target.value)}
                        className="w-full bg-charcoal-light border border-gold/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors"
                      >
                        {classes.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide Creator */}
              <div className="glass-strong rounded-2xl p-6 border border-gold/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    <i className="fas fa-file-powerpoint text-gold mr-2"></i>
                    Slides ({lessonData.slides.length})
                  </h2>
                  <button
                    onClick={addSlide}
                    className="glass px-4 py-2 rounded-full text-gold hover:glow-gold transition-all border border-gold/30"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add Slide
                  </button>
                </div>

                <div className="space-y-4">
                  {lessonData.slides.map((slide, index) => (
                    <div key={index} className="glass p-4 rounded-xl border border-gold/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gold font-semibold">Slide {index + 1}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setCurrentSlide(index);
                              speakSlide(slide);
                            }}
                            className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                            title="Preview Audio"
                          >
                            <i className="fas fa-play text-xs"></i>
                          </button>
                          {lessonData.slides.length > 1 && (
                            <button
                              onClick={() => removeSlide(index)}
                              className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
                              title="Remove Slide"
                            >
                              <i className="fas fa-trash text-xs"></i>
                            </button>
                          )}
                        </div>
                      </div>
                      <textarea
                        value={slide}
                        onChange={(e) => handleSlideChange(index, e.target.value)}
                        placeholder="Enter slide content..."
                        rows="4"
                        className="w-full bg-charcoal-light border border-gold/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors resize-none"
                      />
                      <p className="text-gray-500 text-xs mt-2">
                        {slide.length} characters • ~{Math.ceil(slide.split(' ').length / 150)} min
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Voice Settings */}
              <div className="glass-strong rounded-2xl p-6 border border-gold/20">
                <h2 className="text-2xl font-bold text-white mb-6">
                  <i className="fas fa-microphone-alt text-gold mr-2"></i>
                  Voice Settings
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gold font-semibold mb-2">Voice Type</label>
                    <select
                      value={voiceSettings.voice}
                      onChange={(e) => setVoiceSettings(prev => ({...prev, voice: e.target.value}))}
                      className="w-full bg-charcoal-light border border-gold/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold"
                    >
                      <option value="female">Female (Default)</option>
                      <option value="male">Male</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gold font-semibold mb-2">Speed: {voiceSettings.speed}x</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={voiceSettings.speed}
                      onChange={(e) => setVoiceSettings(prev => ({...prev, speed: parseFloat(e.target.value)}))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-gold font-semibold mb-2">Pitch: {voiceSettings.pitch}</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={voiceSettings.pitch}
                      onChange={(e) => setVoiceSettings(prev => ({...prev, pitch: parseFloat(e.target.value)}))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Preview & Generate */}
            <div className="space-y-6">
              {/* Video Preview */}
              <div className="glass-strong rounded-2xl p-6 border border-gold/20">
                <h2 className="text-2xl font-bold text-white mb-6">
                  <i className="fas fa-eye text-gold mr-2"></i>
                  Video Preview
                </h2>

                <div className="bg-black rounded-xl overflow-hidden mb-6" style={{aspectRatio: '16/9'}}>
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                    style={{display: currentSlide !== null ? 'block' : 'none'}}
                  />
                  {currentSlide !== null ? (
                    <div className="w-full h-full flex items-center justify-center p-8 bg-gradient-to-br from-purple-900 to-blue-900">
                      <div className="text-center">
                        <h3 className="text-3xl font-black text-white mb-4">{lessonData.title || 'Untitled Lesson'}</h3>
                        <div className="glass p-6 rounded-xl max-w-2xl">
                          <p className="text-white text-lg leading-relaxed">
                            {lessonData.slides[currentSlide] || 'No content yet...'}
                          </p>
                        </div>
                        <p className="text-gold mt-4 font-semibold">Slide {currentSlide + 1} of {lessonData.slides.length}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <i className="fas fa-film text-6xl text-gray-600 mb-4"></i>
                        <p className="text-gray-400">Preview will appear here</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Slide Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                    disabled={currentSlide === 0}
                    className="glass px-6 py-3 rounded-full text-gold hover:glow-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-chevron-left mr-2"></i>
                    Previous
                  </button>
                  <span className="text-white font-semibold">
                    {currentSlide + 1} / {lessonData.slides.length}
                  </span>
                  <button
                    onClick={() => setCurrentSlide(Math.min(lessonData.slides.length - 1, currentSlide + 1))}
                    disabled={currentSlide === lessonData.slides.length - 1}
                    className="glass px-6 py-3 rounded-full text-gold hover:glow-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <i className="fas fa-chevron-right ml-2"></i>
                  </button>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateVideoPreview}
                  disabled={!lessonData.title || lessonData.slides.some(s => !s.trim()) || isGenerating}
                  className="w-full bg-gradient-royal py-4 rounded-xl text-white font-bold hover:glow-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic mr-2"></i>
                      Generate MP4 Video
                    </>
                  )}
                </button>
              </div>

              {/* Generated Video Info */}
              {generatedVideo && (
                <div className="glass-strong rounded-2xl p-6 border-2 border-green-500 animate-slide-in">
                  <h3 className="text-2xl font-bold text-green-400 mb-4">
                    <i className="fas fa-check-circle mr-2"></i>
                    Video Generated Successfully!
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white font-semibold">{generatedVideo.duration} seconds</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">File Size:</span>
                      <span className="text-white font-semibold">{generatedVideo.size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Format:</span>
                      <span className="text-white font-semibold">MP4 (1080p)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Slides:</span>
                      <span className="text-white font-semibold">{lessonData.slides.length}</span>
                    </div>
                  </div>

                  <button
                    onClick={downloadVideo}
                    className="w-full bg-green-600 py-4 rounded-xl text-white font-bold hover:bg-green-700 transition-all"
                  >
                    <i className="fas fa-download mr-2"></i>
                    Download MP4 Video
                  </button>
                </div>
              )}

              {/* Help Section */}
              <div className="glass-strong rounded-2xl p-6 border border-blue-500/30">
                <h3 className="text-xl font-bold text-blue-400 mb-4">
                  <i className="fas fa-lightbulb mr-2"></i>
                  Tips for Better Videos
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-green-400 mt-1"></i>
                    <span>Keep slides concise (2-3 sentences per slide)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-green-400 mt-1"></i>
                    <span>Use simple language for better narration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-green-400 mt-1"></i>
                    <span>Include 5-10 slides for optimal learning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-green-400 mt-1"></i>
                    <span>Test audio preview before generating</span>
                  </li>
                </ul>
              </div>
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

export default VideoLessonCreator;
