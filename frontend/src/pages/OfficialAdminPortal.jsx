// Official Admin Portal - D.E.O. / Board Secretary Access
// Strict access isolation from Hidden Head Dashboard

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const OfficialAdminPortal = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [loginForm, setLoginForm] = useState({ admin_id: '', password: '' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [violations, setViolations] = useState([]);
  const [liveFeeds, setLiveFeeds] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const storedAdmin = localStorage.getItem('official_admin');
    if (storedAdmin) {
      setAdminData(JSON.parse(storedAdmin));
      setIsLoggedIn(true);
      loadDashboardData();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(
        `${API_URL}/api/admin/official/login?admin_id=${encodeURIComponent(loginForm.admin_id)}&password=${encodeURIComponent(loginForm.password)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Invalid credentials');
      }

      const data = await response.json();
      
      // Store admin data (NO financial access)
      const adminInfo = {
        id: data.admin_id,
        name: data.name,
        designation: data.designation,
        board: data.board_name,
        district: data.district,
        access_level: 'official'
      };

      localStorage.setItem('official_admin', JSON.stringify(adminInfo));
      setAdminData(adminInfo);
      setIsLoggedIn(true);
      loadDashboardData();

    } catch (error) {
      alert('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      const admin = JSON.parse(localStorage.getItem('official_admin'));

      // Load violations
      const violationsRes = await fetch(`${API_URL}/api/admin/violations?admin_id=${admin.id}`);
      const violationsData = await violationsRes.json();
      setViolations(violationsData.violations || []);

      // Load live feeds
      const feedsRes = await fetch(`${API_URL}/api/admin/live-feeds?admin_id=${admin.id}`);
      const feedsData = await feedsRes.json();
      setLiveFeeds(feedsData.feeds || []);

      // Load regional analytics
      const analyticsRes = await fetch(`${API_URL}/api/admin/analytics?admin_id=${admin.id}`);
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('official_admin');
    setIsLoggedIn(false);
    setAdminData(null);
    navigate('/admin-portal');
  };

  const viewViolation = async (violationId) => {
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      
      // Log audit
      await fetch(`${API_URL}/api/admin/audit-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_id: adminData.id,
          action: 'view_violation',
          resource_accessed: violationId
        })
      });

      // Open violation details
      window.open(`${API_URL}/api/admin/violation/${violationId}`, '_blank');
    } catch (error) {
      console.error('Error viewing violation:', error);
    }
  };

  const viewLiveFeed = async (feedId) => {
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      
      // Log audit
      await fetch(`${API_URL}/api/admin/audit-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_id: adminData.id,
          action: 'view_live_feed',
          resource_accessed: feedId
        })
      });

      // Open live feed
      window.open(`${API_URL}/api/admin/live-feed/${feedId}`, '_blank');
    } catch (error) {
      console.error('Error viewing feed:', error);
    }
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-[#FFD700] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#C41E3A] rounded-full blur-3xl"></div>
        </div>

        <Card className="relative z-10 w-full max-w-md backdrop-blur-xl bg-black/60 border-2 border-[#FFD700]/50">
          <CardHeader className="text-center">
            <div className="text-5xl mb-4">🏛️</div>
            <CardTitle className="text-3xl font-bold text-[#FFD700] mb-2">
              Official Admin Portal
            </CardTitle>
            <p className="text-gray-300 text-sm">
              D.E.O. / Board Secretary Access
            </p>
            <p className="text-gray-400 text-xs mt-2">
              WINGS GLOBAL EDU-SKILL HUB - Government Portal
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[#FFD700] text-sm font-bold mb-2 block">
                  Admin ID
                </label>
                <Input
                  type="text"
                  placeholder="DEO-001 / BOARD-XXX"
                  value={loginForm.admin_id}
                  onChange={(e) => setLoginForm({...loginForm, admin_id: e.target.value})}
                  className="bg-black/40 border-[#FFD700]/30 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[#FFD700] text-sm font-bold mb-2 block">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter secure password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="bg-black/40 border-[#FFD700]/30 text-white"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#C41E3A] to-[#8B0000] hover:from-[#FFD700] hover:to-[#FFA500] text-white font-bold py-3"
              >
                {loading ? '🔄 Authenticating...' : '🔐 Secure Login'}
              </Button>

              <div className="text-center mt-4">
                <p className="text-gray-400 text-xs">
                  ⚠️ All access is logged and monitored
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  For technical support: admin@wingsglobal.edu
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <div className="backdrop-blur-xl bg-black/40 rounded-2xl p-6 mb-6 border border-[#FFD700]/30">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#FFD700] mb-2">
              🏛️ Official Admin Dashboard
            </h1>
            <p className="text-gray-300">
              Welcome, <span className="text-white font-bold">{adminData?.name}</span>
            </p>
            <p className="text-sm text-gray-400">
              {adminData?.designation} | {adminData?.board} | {adminData?.district || 'State Level'}
            </p>
          </div>
          <div className="text-right">
            <Badge className="bg-green-600 text-white mb-2">🟢 Active Session</Badge>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="block ml-auto border-red-500 text-red-400 hover:bg-red-500/20"
            >
              🚪 Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-black/40 border border-[#FFD700]/30 mb-6">
          <TabsTrigger value="dashboard">📊 Overview</TabsTrigger>
          <TabsTrigger value="violations">🚨 Violation Inbox</TabsTrigger>
          <TabsTrigger value="live">📹 Live Inspection</TabsTrigger>
          <TabsTrigger value="analytics">📈 Regional Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="dashboard">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="backdrop-blur-xl bg-black/40 border-[#FFD700]/30">
              <CardHeader>
                <CardTitle className="text-[#FFD700]">🚨 Active Violations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-red-500">{violations.filter(v => v.status === 'pending').length}</div>
                <p className="text-gray-400 text-sm">Pending Review</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-black/40 border-[#FFD700]/30">
              <CardHeader>
                <CardTitle className="text-[#FFD700]">📹 Live Feeds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-500">{liveFeeds.length}</div>
                <p className="text-gray-400 text-sm">Active Exam Halls</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-black/40 border-[#FFD700]/30">
              <CardHeader>
                <CardTitle className="text-[#FFD700]">📊 Today's Exams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-500">{analytics.total_exams || 0}</div>
                <p className="text-gray-400 text-sm">Scheduled</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Violation Inbox Tab */}
        <TabsContent value="violations">
          <Card className="backdrop-blur-xl bg-black/40 border-[#FFD700]/30">
            <CardHeader>
              <CardTitle className="text-[#FFD700]">🚨 Violation Inbox</CardTitle>
              <p className="text-gray-400 text-sm">AI-detected red alerts with evidence</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {violations.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No violations detected</p>
                ) : (
                  violations.map((violation, idx) => (
                    <div
                      key={idx}
                      className="backdrop-blur-xl bg-white/5 rounded-xl p-4 border border-red-500/30 hover:border-red-500 transition-all cursor-pointer"
                      onClick={() => viewViolation(violation.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-white font-bold">{violation.student_name}</h4>
                          <p className="text-gray-400 text-sm">Exam: {violation.exam_id}</p>
                        </div>
                        <Badge className={`${
                          violation.severity === 'critical' ? 'bg-red-600' :
                          violation.severity === 'high' ? 'bg-orange-600' :
                          'bg-yellow-600'
                        } text-white`}>
                          {violation.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">
                        ⚠️ {violation.violation_type}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(violation.detected_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Inspection Tab */}
        <TabsContent value="live">
          <Card className="backdrop-blur-xl bg-black/40 border-[#FFD700]/30">
            <CardHeader>
              <CardTitle className="text-[#FFD700]">📹 Live Spot Inspection</CardTitle>
              <p className="text-gray-400 text-sm">View active exam hall feeds</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {liveFeeds.length === 0 ? (
                  <p className="text-gray-400 text-center py-8 col-span-2">No active feeds</p>
                ) : (
                  liveFeeds.map((feed, idx) => (
                    <div
                      key={idx}
                      className="backdrop-blur-xl bg-white/5 rounded-xl p-4 border border-[#FFD700]/30 hover:border-[#FFD700] transition-all cursor-pointer"
                      onClick={() => viewLiveFeed(feed.id)}
                    >
                      <div className="aspect-video bg-black rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-4xl">📹</span>
                      </div>
                      <h4 className="text-white font-bold mb-1">{feed.classroom_name}</h4>
                      <p className="text-gray-400 text-sm">
                        {feed.class_level} - {feed.section}
                      </p>
                      <Badge className="bg-green-600 text-white mt-2">🔴 LIVE</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card className="backdrop-blur-xl bg-black/40 border-[#FFD700]/30">
            <CardHeader>
              <CardTitle className="text-[#FFD700]">📈 Regional Analytics</CardTitle>
              <p className="text-gray-400 text-sm">
                Results and attendance for {adminData?.board} - {adminData?.district}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="backdrop-blur-xl bg-white/5 rounded-xl p-6">
                  <h4 className="text-[#FFD700] font-bold mb-4">📊 Attendance Overview</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Students:</span>
                      <span className="text-white font-bold">{analytics.total_students || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Present Today:</span>
                      <span className="text-green-400 font-bold">{analytics.present_today || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Attendance Rate:</span>
                      <span className="text-blue-400 font-bold">{analytics.attendance_rate || '0'}%</span>
                    </div>
                  </div>
                </div>

                <div className="backdrop-blur-xl bg-white/5 rounded-xl p-6">
                  <h4 className="text-[#FFD700] font-bold mb-4">📈 Exam Results</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Exams Conducted:</span>
                      <span className="text-white font-bold">{analytics.exams_conducted || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Average Score:</span>
                      <span className="text-green-400 font-bold">{analytics.avg_score || '0'}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Pass Rate:</span>
                      <span className="text-blue-400 font-bold">{analytics.pass_rate || '0'}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button className="bg-[#FFD700] text-black hover:bg-[#FFA500]">
                  📥 Download Full Report (PDF)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Notice */}
      <div className="mt-6 text-center">
        <p className="text-gray-500 text-xs">
          ⚠️ All actions are logged for security auditing | Financial data is restricted
        </p>
      </div>
    </div>
  );
};

export default OfficialAdminPortal;
