import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    studentEmail: '',
    studentPass: '',
    parentEmail: '',
    parentPass: '',
    adminInstitution: '',
    adminEmail: '',
    adminPass: ''
  });

  const tabs = ['Student', 'Parents', 'Institution / Admin'];

  const handleLogin = async (role) => {
    setError('');
    setLoading(true);

    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      let email = '';
      let password = '';

      if (role === 'Student') {
        email = formData.studentEmail;
        password = formData.studentPass;
      } else if (role === 'Parent') {
        email = formData.parentEmail;
        password = formData.parentPass;
      } else if (role === 'Admin') {
        email = formData.adminEmail;
        password = formData.adminPass;
      }

      if (!email || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // Redirect based on role
      if (data.user.role === 'parent') {
        navigate('/parent-dashboard');
      } else if (data.user.role === 'student') {
        navigate('/dashboard');
      } else if (data.user.role === 'admin') {
        navigate('/admin-portal');
      } else {
        navigate('/');
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight-black relative flex items-center justify-center">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute top-20 right-10 w-96 h-96 bg-royal-red/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gold/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Login Container */}
        <div className="glass-strong rounded-3xl p-8 border border-gold/20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-2">
              <span className="text-gradient">Welcome Back</span>
            </h1>
            <p className="text-white/80 text-lg">
              Login to continue your learning journey
            </p>
          </div>

          {/* Tab Buttons */}
          <div className="flex gap-2 mb-6">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`flex-1 py-3 px-2 rounded-xl font-bold text-sm transition-all duration-300 ${
                  activeTab === index
                    ? 'bg-gradient-royal text-white glow-gold'
                    : 'glass text-gold border border-gold/30 hover:bg-gold/10'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 glass-strong border border-royal-red/50 rounded-xl p-4">
              <p className="text-royal-red text-center">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </p>
            </div>
          )}

          {/* Forms */}
          <div className="space-y-4">
            {/* Student Login */}
            {activeTab === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-gold font-semibold mb-2 text-sm">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="student@test.com"
                    value={formData.studentEmail}
                    onChange={(e) => setFormData({...formData, studentEmail: e.target.value})}
                    disabled={loading}
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-all disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-gold font-semibold mb-2 text-sm">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter Password"
                    value={formData.studentPass}
                    onChange={(e) => setFormData({...formData, studentPass: e.target.value})}
                    disabled={loading}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin('Student')}
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-all disabled:opacity-50"
                  />
                </div>
                <button
                  onClick={() => handleLogin('Student')}
                  disabled={loading}
                  className="w-full bg-gradient-royal py-4 rounded-xl text-white font-bold text-lg hover:glow-gold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Logging in...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt mr-2"></i>
                      Login as Student
                    </>
                  )}
                </button>
                <p className="text-center text-gray-400 text-xs mt-2">
                  Test: student@test.com / Student@123
                </p>
              </div>
            )}

            {/* Parents Login */}
            {activeTab === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-gold font-semibold mb-2 text-sm">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="parent@test.com"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({...formData, parentEmail: e.target.value})}
                    disabled={loading}
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-all disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-gold font-semibold mb-2 text-sm">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter Password"
                    value={formData.parentPass}
                    onChange={(e) => setFormData({...formData, parentPass: e.target.value})}
                    disabled={loading}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin('Parent')}
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-all disabled:opacity-50"
                  />
                </div>
                <button
                  onClick={() => handleLogin('Parent')}
                  disabled={loading}
                  className="w-full bg-gradient-royal py-4 rounded-xl text-white font-bold text-lg hover:glow-gold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Logging in...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt mr-2"></i>
                      Login as Parent
                    </>
                  )}
                </button>
                <p className="text-center text-gray-400 text-xs mt-2">
                  Test: parent@test.com / Parent@123
                </p>
              </div>
            )}

            {/* Institution / Admin Login */}
            {activeTab === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-gold font-semibold mb-2 text-sm">
                    Institution / Board / University Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CBSE, MP Board, IGNOU, Your School Name"
                    value={formData.adminInstitution}
                    onChange={(e) => setFormData({...formData, adminInstitution: e.target.value})}
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gold font-semibold mb-2 text-sm">
                    Admin ID / Email
                  </label>
                  <input
                    type="text"
                    placeholder="Admin Email or ID"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gold font-semibold mb-2 text-sm">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter Password"
                    value={formData.adminPass}
                    onChange={(e) => setFormData({...formData, adminPass: e.target.value})}
                    className="w-full glass border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-all"
                  />
                </div>
                <button
                  onClick={() => handleLogin('Admin')}
                  className="w-full bg-gradient-royal py-4 rounded-xl text-white font-bold text-lg hover:glow-gold transition-all duration-300"
                >
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Login as Institution Admin
                </button>
                <p className="text-center text-gray-400 text-xs mt-2">
                  For Schools, Open Schools, International/National Boards, Universities & Open Universities
                </p>
              </div>
            )}
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gold hover:text-white transition-colors font-semibold"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
