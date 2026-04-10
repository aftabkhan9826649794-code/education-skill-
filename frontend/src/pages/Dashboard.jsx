import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [certData, setCertData] = useState({
    name: '',
    course: 'Global Language Proficiency'
  });

  const stats = [
    { label: 'Global Registrations', value: '10,247', icon: 'fa-users', color: 'from-blue-600 to-blue-800' },
    { label: 'Board Affiliations', value: '14', icon: 'fa-university', color: 'from-green-600 to-green-800' },
    { label: 'Latest Growth Region', value: 'Africa', icon: 'fa-map-marked-alt', color: 'from-purple-600 to-purple-800' }
  ];

  const streams = [
    { name: 'Pre-Primary', desc: 'LKG - Class 5', icon: 'fa-shapes', color: '#ff6b6b', bgColor: '#fff5f5', textColor: '#e53e3e' },
    { name: 'Senior Secondary', desc: '11th & 12th', icon: 'fa-user-graduate', color: '#4299e1', bgColor: '#ebf8ff', textColor: '#3182ce' },
    { name: 'Language Lab', desc: 'A1 - C2 Levels', icon: 'fa-language', color: '#48bb78', bgColor: '#f0fff4', textColor: '#38a169' }
  ];

  const students = [
    { name: 'Rahul Kumar', board: 'JEE Advanced', region: 'India - Delhi', status: 'Verified ✓' },
    { name: 'Aisha Mohammed', board: 'NEET Medical', region: 'Sudan - Khartoum', status: 'Verified ✓' },
    { name: 'Fatima Ali', board: 'Language Hub', region: 'Africa - Kenya', status: 'Pending' },
    { name: 'Arjun Singh', board: 'UPSC Prelims', region: 'India - Mumbai', status: 'Verified ✓' },
    { name: 'Hassan Ahmed', board: 'Skill Hub', region: 'Sudan', status: 'Verified ✓' }
  ];

  const courseOptions = [
    'Global Language Proficiency',
    'Advanced Senior Secondary',
    'Foundational Activity Level',
    'Professional AI & Skill Hub'
  ];

  const handleCertChange = (e) => {
    setCertData({
      ...certData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-midnight-black relative">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-900/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black mb-4">
              <span className="text-gradient">Super Admin Dashboard</span>
            </h1>
            <p className="text-gray-400 text-lg">Global Management & Analytics</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="glass-strong rounded-2xl p-6 border border-gold/20 hover:glow-gold transition-all duration-300 animate-slide-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center`}>
                    <i className={`fas ${stat.icon} text-white text-2xl`}></i>
                  </div>
                  <div className="text-right">
                    <h3 className="text-4xl font-black text-gold">{stat.value}</h3>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Unified Multi-Level Management */}
          <div className="glass-strong rounded-2xl p-8 mb-8 border border-gold/20">
            <h3 className="text-2xl font-bold text-white mb-6">
              <i className="fas fa-stream text-gold mr-3"></i>
              Unified Multi-Level Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {streams.map((stream, index) => (
                <div
                  key={index}
                  className="glass rounded-xl p-6 border-t-4 hover:glow-gold transition-all duration-300"
                  style={{borderTopColor: stream.color}}
                >
                  <i className={`fas ${stream.icon} text-4xl mb-4`} style={{color: stream.color}}></i>
                  <h4 className="text-xl font-bold text-white mb-2">{stream.name}</h4>
                  <span
                    className="inline-block px-4 py-2 rounded-full text-sm font-bold"
                    style={{background: stream.bgColor, color: stream.textColor}}
                  >
                    {stream.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Enrollment Feed */}
          <div className="glass-strong rounded-2xl p-8 mb-8 border border-gold/20">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h3 className="text-2xl font-bold text-white">
                <i className="fas fa-bolt text-yellow-400 mr-3"></i>
                Live Enrollment Feed
              </h3>
              <button className="glass px-6 py-2 rounded-full text-gold font-bold hover:glow-gold transition-all">
                <i className="fas fa-sync-alt mr-2"></i>
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold/20">
                    <th className="text-left py-4 px-4 text-gold font-bold">Student Name</th>
                    <th className="text-left py-4 px-4 text-gold font-bold">Board / Hub</th>
                    <th className="text-left py-4 px-4 text-gold font-bold">Region</th>
                    <th className="text-left py-4 px-4 text-gold font-bold">Identity Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr
                      key={index}
                      className="border-b border-gold/10 hover:bg-gold/5 transition-colors"
                    >
                      <td className="py-4 px-4 text-white">{student.name}</td>
                      <td className="py-4 px-4 text-gray-400">{student.board}</td>
                      <td className="py-4 px-4 text-gray-400">{student.region}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          student.status.includes('Verified')
                            ? 'bg-green-600/20 text-green-400'
                            : 'bg-yellow-600/20 text-yellow-400'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Certificate Issuance Engine */}
          <div className="glass-strong rounded-2xl p-8 border border-gold/20">
            <h3 className="text-2xl font-bold text-white mb-6">
              <i className="fas fa-award text-gold mr-3"></i>
              Certificate Issuance Engine
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <div>
                <div className="mb-4">
                  <label className="block text-gold font-semibold mb-2">Student Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={certData.name}
                    onChange={handleCertChange}
                    placeholder="Enter student name..."
                    className="w-full bg-charcoal-light border border-gold/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gold font-semibold mb-2">Category / Course</label>
                  <select
                    name="course"
                    value={certData.course}
                    onChange={handleCertChange}
                    className="w-full bg-charcoal-light border border-gold/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors"
                  >
                    {courseOptions.map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold hover:glow-gold transition-all">
                  <i className="fas fa-print mr-2"></i>
                  Print Authorized Certificate
                </button>
              </div>

              {/* Certificate Preview */}
              <div className="glass border-2 border-gold/30 rounded-2xl p-8 text-center">
                <h2 className="text-3xl font-black mb-2" style={{color: '#c5a059'}}>
                  WINGS EDU-SKILL GLOBAL HUB
                </h2>
                <p className="text-xs font-bold tracking-widest border-t border-b py-2 inline-block mb-6" style={{borderColor: '#c5a059', color: '#c5a059'}}>
                  OFFICIAL GLOBAL CERTIFICATION
                </p>

                <div className="my-8">
                  <p className="text-gray-400 italic text-sm mb-2">This is to certify that</p>
                  <h2
                    className="text-3xl font-bold py-2 px-4 inline-block"
                    style={{borderBottom: '2px solid #c5a059', color: '#1a2a3a', minWidth: '250px'}}
                  >
                    {certData.name || '[Student Name]'}
                  </h2>
                </div>

                <p className="text-gray-400 text-sm mb-2">has successfully attained the required standards in</p>
                <h4 className="text-2xl font-bold mb-8" style={{color: '#c5a059'}}>
                  {certData.course}
                </h4>

                <div className="flex justify-around mt-12 text-xs font-bold">
                  <div style={{borderTop: '1px solid #333', paddingTop: '8px', width: '100px'}}>
                    INSTITUTE HEAD
                  </div>
                  <div style={{borderTop: '1px solid #333', paddingTop: '8px', width: '100px'}}>
                    REGISTRAR
                  </div>
                </div>
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

export default Dashboard;
