import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      
      // Get current user first
      const userRes = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include'
      });
      
      if (!userRes.ok) {
        navigate('/login');
        return;
      }
      
      const user = await userRes.json();
      
      if (user.role !== 'parent') {
        navigate('/');
        return;
      }
      
      // Fetch dashboard data
      const res = await fetch(`${API_URL}/api/parent/dashboard/${user.id}`, {
        credentials: 'include'
      });
      
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      
      const data = await res.json();
      setDashboardData(data);
      
      if (data.students && data.students.length > 0) {
        setSelectedStudent(data.students[0]);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gold border-t-transparent mx-auto mb-4"></div>
          <p className="text-gold text-xl">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-midnight-black flex items-center justify-center">
        <div className="glass-strong p-8 rounded-2xl max-w-md text-center">
          <i className="fas fa-exclamation-circle text-royal-red text-5xl mb-4"></i>
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 bg-gradient-royal px-6 py-3 rounded-xl text-white font-bold hover:glow-gold transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const calculateAttendancePercentage = (studentId) => {
    const records = dashboardData?.attendance[studentId] || [];
    if (records.length === 0) return 0;
    const present = records.filter(r => r.status === 'present').length;
    return Math.round((present / records.length) * 100);
  };

  return (
    <div className="min-h-screen bg-midnight-black">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 opacity-10">
        <div className="absolute top-20 right-10 w-96 h-96 bg-royal-red/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gold/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-gradient mb-2">
              Parent Dashboard
            </h1>
            <p className="text-white/80">Welcome, {dashboardData?.parent?.name}!</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="glass px-6 py-3 rounded-xl text-gold font-bold border border-gold/30 hover:bg-gold/10 transition-all"
            >
              <i className="fas fa-home mr-2"></i>
              Home
            </button>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-[#C41E3A] to-[#8B0000] px-6 py-3 rounded-xl text-white font-bold hover:glow-gold transition-all"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Logout
            </button>
          </div>
        </div>

        {/* Students List */}
        {dashboardData?.students?.length === 0 ? (
          <div className="glass-strong p-8 rounded-2xl text-center mb-8">
            <i className="fas fa-user-plus text-gold text-5xl mb-4"></i>
            <h3 className="text-2xl font-bold text-white mb-2">No Students Linked</h3>
            <p className="text-gray-300 mb-4">
              Please contact school administration to link your children to your account.
            </p>
          </div>
        ) : (
          <>
            {/* Student Selector */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
              {dashboardData?.students?.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`flex-shrink-0 px-6 py-4 rounded-xl font-bold transition-all duration-300 ${
                    selectedStudent?.id === student.id
                      ? 'bg-gradient-royal text-white glow-gold'
                      : 'glass text-gold border border-gold/30 hover:bg-gold/10'
                  }`}
                >
                  <i className="fas fa-user-graduate mr-2"></i>
                  {student.name}
                  <div className="text-xs mt-1 opacity-80">{student.class_name}</div>
                </button>
              ))}
            </div>

            {selectedStudent && (
              <>
                {/* Overview Cards */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  {/* Attendance Card */}
                  <div className="glass-strong p-6 rounded-2xl border border-gold/20">
                    <div className="flex items-center justify-between mb-3">
                      <i className="fas fa-calendar-check text-3xl text-gold"></i>
                      <span className={`text-2xl font-black ${
                        calculateAttendancePercentage(selectedStudent.id) >= 75 
                          ? 'text-green-400' 
                          : 'text-royal-red'
                      }`}>
                        {calculateAttendancePercentage(selectedStudent.id)}%
                      </span>
                    </div>
                    <h3 className="text-white font-bold">Attendance</h3>
                    <p className="text-gray-400 text-sm">Last 30 days</p>
                  </div>

                  {/* Progress Card */}
                  <div className="glass-strong p-6 rounded-2xl border border-gold/20">
                    <div className="flex items-center justify-between mb-3">
                      <i className="fas fa-chart-line text-3xl text-gold"></i>
                      <span className="text-2xl font-black text-gold">
                        {dashboardData?.progress[selectedStudent.id]?.length || 0}
                      </span>
                    </div>
                    <h3 className="text-white font-bold">Progress Reports</h3>
                    <p className="text-gray-400 text-sm">Total records</p>
                  </div>

                  {/* Notifications Card */}
                  <div className="glass-strong p-6 rounded-2xl border border-gold/20">
                    <div className="flex items-center justify-between mb-3">
                      <i className="fas fa-bell text-3xl text-gold"></i>
                      <span className="text-2xl font-black text-gold">
                        {dashboardData?.notifications?.filter(n => !n.read).length || 0}
                      </span>
                    </div>
                    <h3 className="text-white font-bold">Notifications</h3>
                    <p className="text-gray-400 text-sm">Unread messages</p>
                  </div>

                  {/* Fee Status Card */}
                  <div className="glass-strong p-6 rounded-2xl border border-gold/20">
                    <div className="flex items-center justify-between mb-3">
                      <i className="fas fa-money-bill-wave text-3xl text-gold"></i>
                      <span className="text-2xl font-black text-green-400">
                        ₹{dashboardData?.fee_payments
                          ?.filter(p => p.student_id === selectedStudent.id)
                          ?.reduce((sum, p) => sum + p.amount, 0)
                          .toLocaleString() || 0}
                      </span>
                    </div>
                    <h3 className="text-white font-bold">Fees Paid</h3>
                    <p className="text-gray-400 text-sm">Total amount</p>
                  </div>
                </div>

                {/* Recent Attendance */}
                <div className="glass-strong p-6 rounded-2xl mb-8">
                  <h2 className="text-2xl font-bold text-gradient mb-4">
                    <i className="fas fa-calendar-check mr-2"></i>
                    Recent Attendance
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gold/20">
                          <th className="text-left py-3 px-4 text-gold font-bold">Date</th>
                          <th className="text-left py-3 px-4 text-gold font-bold">Course</th>
                          <th className="text-left py-3 px-4 text-gold font-bold">Status</th>
                          <th className="text-left py-3 px-4 text-gold font-bold">Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dashboardData?.attendance[selectedStudent.id] || []).slice(0, 10).map((record, idx) => (
                          <tr key={idx} className="border-b border-gold/10 hover:bg-gold/5 transition-colors">
                            <td className="py-3 px-4 text-white">
                              {new Date(record.timestamp).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-white">{record.course_name}</td>
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                record.status === 'present' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {record.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-white">
                              {(record.confidence * 100).toFixed(0)}%
                            </td>
                          </tr>
                        ))}
                        {(dashboardData?.attendance[selectedStudent.id]?.length || 0) === 0 && (
                          <tr>
                            <td colSpan="4" className="py-8 text-center text-gray-400">
                              No attendance records available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Progress Reports & Upcoming Exams */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Progress Reports */}
                  <div className="glass-strong p-6 rounded-2xl">
                    <h2 className="text-2xl font-bold text-gradient mb-4">
                      <i className="fas fa-chart-bar mr-2"></i>
                      Progress Reports
                    </h2>
                    <div className="space-y-3">
                      {(dashboardData?.progress[selectedStudent.id] || []).slice(0, 5).map((report, idx) => (
                        <div key={idx} className="glass p-4 rounded-xl border border-gold/20">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="text-white font-bold">{report.subject}</h4>
                              <p className="text-gray-400 text-sm">{report.topic}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-gold font-black text-xl">
                                {report.score}/{report.total}
                              </div>
                              <div className="text-xs text-gray-400">
                                {((report.score / report.total) * 100).toFixed(0)}%
                              </div>
                            </div>
                          </div>
                          {report.weak_areas && report.weak_areas.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {report.weak_areas.slice(0, 3).map((area, i) => (
                                <span key={i} className="text-xs bg-royal-red/20 text-red-300 px-2 py-1 rounded">
                                  {area}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {(dashboardData?.progress[selectedStudent.id]?.length || 0) === 0 && (
                        <p className="text-center text-gray-400 py-4">No progress reports available</p>
                      )}
                    </div>
                  </div>

                  {/* Upcoming Exams */}
                  <div className="glass-strong p-6 rounded-2xl">
                    <h2 className="text-2xl font-bold text-gradient mb-4">
                      <i className="fas fa-clipboard-list mr-2"></i>
                      Upcoming Exams
                    </h2>
                    <div className="space-y-3">
                      {(dashboardData?.upcoming_exams || []).slice(0, 5).map((exam, idx) => (
                        <div key={idx} className="glass p-4 rounded-xl border border-gold/20">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-white font-bold">{exam.subject}</h4>
                              <p className="text-gray-400 text-sm">{exam.class_name}</p>
                              <p className="text-gold text-sm mt-1">
                                <i className="far fa-calendar mr-1"></i>
                                {new Date(exam.scheduled_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-bold">{exam.exam_type}</div>
                              <div className="text-sm text-gray-400">{exam.duration_minutes} min</div>
                              <div className="text-sm text-gold">{exam.total_marks} marks</div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(dashboardData?.upcoming_exams?.length || 0) === 0 && (
                        <p className="text-center text-gray-400 py-4">No upcoming exams scheduled</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
