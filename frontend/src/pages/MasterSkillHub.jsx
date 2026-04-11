import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';

const MasterSkillHub = () => {
  const navigate = useNavigate();
  const [skillModules, setSkillModules] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [resources, setResources] = useState([]);
  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    fetchSkillModules();
    fetchUserBadges();
  }, []);

  const fetchSkillModules = async () => {
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/skills/modules`);
      const data = await response.json();
      setSkillModules(data.modules || []);
    } catch (error) {
      console.error('Error fetching skill modules:', error);
    }
  };

  const fetchUserBadges = async () => {
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      // In production, use actual user_id from auth
      const response = await fetch(`${API_URL}/api/skills/badges/user123`);
      const data = await response.json();
      setBadges(data.badges || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const loadSkillResources = async (skillId) => {
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/skills/resources/${skillId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResources(data.resources || []);
      setSelectedSkill(skillModules.find(s => s.id === skillId));
    } catch (error) {
      console.error('Error loading resources:', error);
      alert('Failed to load resources. Please try again.');
    }
  };

  const startAIQuiz = async (skillId) => {
    setLoading(true);
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/skills/generate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill_id: skillId, num_questions: 10 })
      });
      
      const data = await response.json();
      setQuizQuestions(data.questions || []);
      setQuizActive(true);
      setCurrentQuestion(0);
      setAnswers([]);
      setQuizResult(null);
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = (answerIndex) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);
    
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers) => {
    setLoading(true);
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/skills/submit-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'user123', // In production, use actual user_id
          skill_id: selectedSkill.id,
          questions: quizQuestions,
          answers: finalAnswers
        })
      });
      
      const data = await response.json();
      setQuizResult(data);
      setQuizActive(false);
      
      if (data.badge_earned) {
        fetchUserBadges();
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const skillCards = [
    {
      id: 'computer-mastery',
      title: 'Computer Mastery',
      icon: '💻',
      description: 'Master operating systems, productivity tools, and digital workflows',
      color: 'from-blue-600 to-cyan-500',
      topics: ['Windows/Mac/Linux', 'MS Office Suite', 'File Management', 'Troubleshooting']
    },
    {
      id: 'coding-lab',
      title: 'Coding Lab',
      icon: '⚡',
      description: 'Learn programming from basics to advanced algorithms',
      color: 'from-purple-600 to-pink-500',
      topics: ['Python', 'JavaScript', 'Data Structures', 'Algorithms', 'Web Development']
    },
    {
      id: 'ai-specialist',
      title: 'AI-Tool Specialist',
      icon: '🤖',
      description: 'Harness the power of AI tools and machine learning',
      color: 'from-green-600 to-emerald-500',
      topics: ['ChatGPT', 'Midjourney', 'AI Automation', 'Prompt Engineering']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background - Glowing Gold Circuits */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-[#FFD700]/20 to-[#C41E3A]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Circuit Pattern Overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="2" fill="#FFD700" />
              <line x1="50" y1="50" x2="100" y2="50" stroke="#FFD700" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="50" y2="0" stroke="#FFD700" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
      </div>

      <div className="relative z-10 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Header */}
          <div className="text-center mb-12">
            <div className="inline-block backdrop-blur-xl bg-gradient-to-r from-[#C41E3A]/30 to-[#FFD700]/30 rounded-2xl px-6 py-3 mb-6 border-2 border-[#FFD700]/50 shadow-2xl shadow-[#FFD700]/20">
              <span className="text-[#FFD700] font-bold text-sm tracking-widest uppercase">✨ Master Skill Hub ✨</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4">
              <span className="bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#C41E3A] bg-clip-text text-transparent">
                Build Future-Ready Skills
              </span>
            </h1>
            
            <p className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto">
              Unlock your potential with interactive courses, expert resources, and AI-powered assessments.
              Earn <span className="text-[#FFD700] font-bold">Golden Badges</span> to showcase your mastery!
            </p>
          </div>

          {/* User Badges Section */}
          {badges.length > 0 && (
            <div className="mb-12">
              <div className="backdrop-blur-xl bg-black/40 rounded-3xl p-6 border border-[#FFD700]/30">
                <h3 className="text-2xl font-bold text-[#FFD700] mb-4 flex items-center gap-2">
                  🏆 Your Golden Badges
                </h3>
                <div className="flex flex-wrap gap-4">
                  {badges.map((badge, idx) => (
                    <div
                      key={idx}
                      className="group relative backdrop-blur-xl bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 rounded-xl p-4 border-2 border-[#FFD700] shadow-lg hover:shadow-[#FFD700]/50 transition-all"
                    >
                      <div className="text-4xl mb-2">🏅</div>
                      <p className="text-white font-bold text-sm">{badge.skill_name}</p>
                      <p className="text-[#FFD700] text-xs">Score: {badge.score}%</p>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center text-black text-xs font-bold">
                        ✓
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Skill Cards Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {skillCards.map((skill) => (
              <div
                key={skill.id}
                className="group cursor-pointer"
                onClick={() => loadSkillResources(skill.id)}
              >
                <div className="backdrop-blur-xl bg-black/40 rounded-3xl p-8 border-2 border-transparent hover:border-[#FFD700] transition-all duration-300 h-full shadow-2xl hover:shadow-[#FFD700]/30 hover:-translate-y-2">
                  {/* Icon with Gradient */}
                  <div className={`text-6xl mb-4 inline-block p-4 rounded-2xl bg-gradient-to-br ${skill.color} shadow-lg`}>
                    {skill.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#FFD700] transition-colors">
                    {skill.title}
                  </h3>
                  
                  <p className="text-gray-300 mb-4 text-sm">
                    {skill.description}
                  </p>
                  
                  {/* Topics */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skill.topics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-200 border border-white/20"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-[#C41E3A] to-[#8B0000] hover:from-[#FFD700] hover:to-[#FFA500] text-white font-bold">
                    Explore Resources →
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Skill India Portal Section */}
          <div className="mb-12">
            <div className="backdrop-blur-xl bg-gradient-to-br from-orange-600/20 to-green-600/20 rounded-3xl p-8 border-2 border-orange-500/50 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">🇮🇳</div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Skill India Portal</h2>
                  <p className="text-gray-200 text-sm">Powered by Government of India's National Skill Development Mission</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20">
                  <h4 className="font-bold text-orange-300 mb-2">🎓 Free Certifications</h4>
                  <p className="text-gray-300 text-xs mb-3">Access 200+ government-certified courses</p>
                  <a href="https://www.skillindiadigital.gov.in" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full border-orange-400 text-orange-300 hover:bg-orange-500/20">
                      Visit Portal →
                    </Button>
                  </a>
                </div>
                
                <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20">
                  <h4 className="font-bold text-green-300 mb-2">💼 Job Ready Programs</h4>
                  <p className="text-gray-300 text-xs mb-3">Industry-aligned training with placement support</p>
                  <a href="https://www.pmkvyofficial.org" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full border-green-400 text-green-300 hover:bg-green-500/20">
                      Explore PMKVY →
                    </Button>
                  </a>
                </div>
                
                <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20">
                  <h4 className="font-bold text-blue-300 mb-2">📜 Digital Credential</h4>
                  <p className="text-gray-300 text-xs mb-3">Get verified skills on National Skills Registry</p>
                  <a href="https://nsdcindia.org" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full border-blue-400 text-blue-300 hover:bg-blue-500/20">
                      Register Now →
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Resource Library Modal */}
          {selectedSkill && !quizActive && !quizResult && (
            <div className="backdrop-blur-xl bg-black/60 rounded-3xl p-8 border-2 border-[#FFD700]/50 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-[#FFD700]">
                  {selectedSkill.title} - Resources
                </h2>
                <Button
                  onClick={() => setSelectedSkill(null)}
                  variant="ghost"
                  className="text-gray-300 hover:text-white"
                >
                  ✕ Close
                </Button>
              </div>

              <Tabs defaultValue="videos" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/10">
                  <TabsTrigger value="videos">📹 Videos</TabsTrigger>
                  <TabsTrigger value="pdfs">📄 PDFs</TabsTrigger>
                  <TabsTrigger value="quiz">🏆 AI Quiz</TabsTrigger>
                </TabsList>

                <TabsContent value="videos" className="space-y-4">
                  {resources.filter(r => r.type === 'video').length > 0 ? (
                    resources.filter(r => r.type === 'video').map((resource, idx) => (
                      <div key={idx} className="backdrop-blur-xl bg-white/5 rounded-xl p-4 border border-white/20 hover:border-[#FFD700]/50 transition-all">
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">▶️</div>
                          <div className="flex-1">
                            <h4 className="text-white font-bold mb-1">{resource.title}</h4>
                            <p className="text-gray-400 text-xs mb-2">{resource.description}</p>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#FFD700] hover:text-[#FFA500] text-sm font-medium"
                            >
                              Watch on YouTube →
                            </a>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">No video resources available yet.</p>
                  )}
                </TabsContent>

                <TabsContent value="pdfs" className="space-y-4">
                  {resources.filter(r => r.type === 'pdf').length > 0 ? (
                    resources.filter(r => r.type === 'pdf').map((resource, idx) => (
                      <div key={idx} className="backdrop-blur-xl bg-white/5 rounded-xl p-4 border border-white/20 hover:border-[#FFD700]/50 transition-all">
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">📄</div>
                          <div className="flex-1">
                            <h4 className="text-white font-bold mb-1">{resource.title}</h4>
                            <p className="text-gray-400 text-xs mb-2">{resource.description}</p>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#FFD700] hover:text-[#FFA500] text-sm font-medium"
                            >
                              Download PDF →
                            </a>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">No PDF resources available yet.</p>
                  )}
                </TabsContent>

                <TabsContent value="quiz">
                  <div className="backdrop-blur-xl bg-gradient-to-br from-[#FFD700]/10 to-[#C41E3A]/10 rounded-2xl p-8 border-2 border-[#FFD700]/50 text-center">
                    <div className="text-6xl mb-4">🏅</div>
                    <h3 className="text-2xl font-bold text-[#FFD700] mb-3">Earn Your Golden Badge!</h3>
                    <p className="text-gray-300 mb-6">
                      Complete the AI-generated quiz to prove your mastery.<br />
                      <span className="text-white font-bold">Score 80%+ to earn the WINGS Certified Golden Badge!</span>
                    </p>
                    
                    <Button
                      onClick={() => startAIQuiz(selectedSkill.id)}
                      disabled={loading}
                      className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold text-lg px-8 py-6 hover:shadow-2xl hover:shadow-[#FFD700]/50 disabled:opacity-50"
                    >
                      {loading ? '🔄 Generating Quiz...' : '🚀 Start AI Quiz'}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* AI Quiz Interface */}
          {quizActive && quizQuestions.length > 0 && (
            <div className="backdrop-blur-xl bg-black/60 rounded-3xl p-8 border-2 border-[#FFD700]/50 shadow-2xl">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-[#FFD700]">
                    AI Quiz: {selectedSkill.title}
                  </h3>
                  <span className="text-gray-300">
                    Question {currentQuestion + 1} of {quizQuestions.length}
                  </span>
                </div>
                <Progress value={((currentQuestion + 1) / quizQuestions.length) * 100} className="h-2" />
              </div>

              <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 mb-6 border border-white/20">
                <p className="text-white text-lg mb-6 leading-relaxed">
                  {quizQuestions[currentQuestion].question}
                </p>
                
                <div className="space-y-3">
                  {quizQuestions[currentQuestion].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => submitAnswer(idx)}
                      className="w-full text-left p-4 rounded-xl bg-white/10 border-2 border-white/20 hover:border-[#FFD700] hover:bg-[#FFD700]/10 text-white transition-all"
                    >
                      <span className="font-bold text-[#FFD700] mr-3">{String.fromCharCode(65 + idx)}.</span>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quiz Result */}
          {quizResult && (
            <div className="backdrop-blur-xl bg-black/60 rounded-3xl p-8 border-2 border-[#FFD700]/50 shadow-2xl text-center">
              <div className="text-8xl mb-6">
                {quizResult.badge_earned ? '🏆' : '📊'}
              </div>
              
              <h2 className="text-4xl font-bold mb-4">
                <span className={quizResult.badge_earned ? 'text-[#FFD700]' : 'text-white'}>
                  {quizResult.badge_earned ? 'Congratulations!' : 'Quiz Complete'}
                </span>
              </h2>
              
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 mb-6 inline-block">
                <p className="text-6xl font-black text-[#FFD700] mb-2">
                  {quizResult.score_percentage}%
                </p>
                <p className="text-gray-300">
                  {quizResult.correct_answers} out of {quizResult.total_questions} correct
                </p>
              </div>

              {quizResult.badge_earned && (
                <div className="backdrop-blur-xl bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 rounded-2xl p-6 border-2 border-[#FFD700] mb-6">
                  <p className="text-2xl font-bold text-[#FFD700] mb-2">🏅 Golden Badge Earned!</p>
                  <p className="text-white">
                    You've proven mastery in <span className="font-bold">{selectedSkill.title}</span>
                  </p>
                  <p className="text-gray-300 text-sm mt-2">Badge added to your profile</p>
                </div>
              )}

              {!quizResult.badge_earned && (
                <p className="text-gray-300 mb-6">
                  Keep practicing! You need 80% to earn the Golden Badge.
                </p>
              )}

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => {
                    setQuizResult(null);
                    setSelectedSkill(null);
                  }}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Back to Skills
                </Button>
                <Button
                  onClick={() => startAIQuiz(selectedSkill.id)}
                  className="bg-gradient-to-r from-[#C41E3A] to-[#8B0000] hover:from-[#FFD700] hover:to-[#FFA500] text-white font-bold"
                >
                  Retry Quiz
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterSkillHub;
