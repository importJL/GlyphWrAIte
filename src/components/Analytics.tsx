import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, Award, Target, Download, Share2, User, FileText, Database, Image } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Analytics() {
  const { state } = useAppContext();
  const { state: authState } = useAuth();
  const { sessions } = state;

  // Filter sessions for current user
  const userSessions = sessions.filter(session => 
    authState.user ? session.userId === authState.user.id : false
  );

  // Generate progress data from user sessions
  const generateProgressData = () => {
    if (userSessions.length === 0) {
      return [
        { day: 'Mon', score: 0, time: 0 },
        { day: 'Tue', score: 0, time: 0 },
        { day: 'Wed', score: 0, time: 0 },
        { day: 'Thu', score: 0, time: 0 },
        { day: 'Fri', score: 0, time: 0 },
        { day: 'Sat', score: 0, time: 0 },
        { day: 'Sun', score: 0, time: 0 },
      ];
    }

    // Group sessions by day of week
    const dayGroups: { [key: string]: { scores: number[], times: number[] } } = {
      'Sun': { scores: [], times: [] },
      'Mon': { scores: [], times: [] },
      'Tue': { scores: [], times: [] },
      'Wed': { scores: [], times: [] },
      'Thu': { scores: [], times: [] },
      'Fri': { scores: [], times: [] },
      'Sat': { scores: [], times: [] },
    };

    userSessions.forEach(session => {
      const dayName = new Date(session.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
      if (dayGroups[dayName]) {
        dayGroups[dayName].scores.push(session.score);
        dayGroups[dayName].times.push(session.duration);
      }
    });

    return Object.entries(dayGroups).map(([day, data]) => ({
      day,
      score: data.scores.length > 0 ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length) : 0,
      time: data.times.length > 0 ? Math.round(data.times.reduce((a, b) => a + b, 0) / data.times.length / 60) : 0,
    }));
  };

  const progressData = generateProgressData();

  // Generate language distribution from user sessions
  const generateLanguageData = () => {
    if (userSessions.length === 0) {
      return [
        { name: 'English', value: 25, color: '#3B82F6' },
        { name: 'Chinese', value: 25, color: '#10B981' },
        { name: 'Japanese', value: 25, color: '#F59E0B' },
        { name: 'Korean', value: 25, color: '#EF4444' },
      ];
    }

    const languageCounts: { [key: string]: number } = {};
    userSessions.forEach(session => {
      languageCounts[session.language] = (languageCounts[session.language] || 0) + 1;
    });

    const total = userSessions.length;
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];
    
    return Object.entries(languageCounts).map(([language, count], index) => ({
      name: language.charAt(0).toUpperCase() + language.slice(1),
      value: Math.round((count / total) * 100),
      color: colors[index % colors.length],
    }));
  };

  const languageData = generateLanguageData();

  const totalSessions = userSessions.length;
  const totalTime = userSessions.reduce((acc, s) => acc + s.duration, 0);
  const averageScore = userSessions.length > 0 
    ? userSessions.reduce((acc, s) => acc + s.score, 0) / userSessions.length 
    : 0;
  const bestStreak = 7; // This would be calculated based on consecutive days

  const downloadReport = async (format: 'pdf' | 'csv' | 'json' | 'png') => {
    if (!authState.user) {
      alert('Please log in to download your report');
      return;
    }

    const fileName = `${authState.user.name.replace(/\s+/g, '-')}-learning-report-${new Date().toISOString().split('T')[0]}`;
    
    const reportData = {
      user: {
        name: authState.user.name,
        email: authState.user.email,
      },
      summary: {
        totalSessions,
        totalTime: Math.floor(totalTime / 60),
        averageScore: Math.round(averageScore),
        bestStreak,
      },
      progressData,
      languageData,
      sessions: userSessions,
      generatedAt: new Date().toISOString(),
    };

    switch (format) {
      case 'json':
        const jsonBlob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        downloadFile(jsonBlob, `${fileName}.json`);
        break;
        
      case 'csv':
        const csvContent = generateCSV(reportData);
        const csvBlob = new Blob([csvContent], { type: 'text/csv' });
        downloadFile(csvBlob, `${fileName}.csv`);
        break;
        
      case 'pdf':
        await generatePDF(reportData, fileName);
        break;
        
      case 'png':
        await generatePNG(fileName);
        break;
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateCSV = (data: any) => {
    const headers = ['Date', 'Language', 'Character', 'Score', 'Duration (min)', 'Level'];
    const rows = data.sessions.map((session: any) => [
      new Date(session.timestamp).toLocaleDateString(),
      session.language,
      session.character,
      session.score,
      Math.floor(session.duration / 60),
      session.level
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generatePDF = async (data: any, fileName: string) => {
    const pdf = new jsPDF();
    
    // Title
    pdf.setFontSize(20);
    pdf.text('Language Learning Report', 20, 30);
    
    // User info
    pdf.setFontSize(12);
    pdf.text(`User: ${data.user.name}`, 20, 50);
    pdf.text(`Email: ${data.user.email}`, 20, 60);
    pdf.text(`Generated: ${new Date(data.generatedAt).toLocaleDateString()}`, 20, 70);
    
    // Summary
    pdf.setFontSize(16);
    pdf.text('Summary', 20, 90);
    pdf.setFontSize(12);
    pdf.text(`Total Sessions: ${data.summary.totalSessions}`, 20, 105);
    pdf.text(`Total Practice Time: ${data.summary.totalTime} hours`, 20, 115);
    pdf.text(`Average Score: ${data.summary.averageScore}%`, 20, 125);
    pdf.text(`Current Streak: ${data.summary.bestStreak} days`, 20, 135);
    
    // Sessions table
    pdf.setFontSize(16);
    pdf.text('Recent Sessions', 20, 155);
    
    let yPos = 170;
    pdf.setFontSize(10);
    data.sessions.slice(0, 10).forEach((session: any) => {
      const sessionText = `${new Date(session.timestamp).toLocaleDateString()} - ${session.language} - ${session.character} - ${session.score}%`;
      pdf.text(sessionText, 20, yPos);
      yPos += 10;
    });
    
    pdf.save(`${fileName}.pdf`);
  };

  const generatePNG = async (fileName: string) => {
    const element = document.getElementById('analytics-content');
    if (!element) return;
    
    const canvas = await html2canvas(element);
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const shareStats = () => {
    if (!authState.user) {
      alert('Please log in to share your stats');
      return;
    }

    const text = `🎯 My Language Learning Progress:\n📚 ${totalSessions} practice sessions\n⏱️ ${Math.floor(totalTime / 60)} hours practiced\n📈 ${Math.round(averageScore)}% average score\n🔥 ${bestStreak}-day streak\n\nKeep learning! #LanguageLearning`;
    
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert('Stats copied to clipboard!');
      });
    }
  };

  if (!authState.user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <User size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Please Log In
          </h3>
          <p className="text-gray-600">
            Log in to view your personalized learning analytics and progress tracking.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="analytics-content" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Learning Analytics</h2>
          <p className="text-gray-600">Personal progress for {authState.user.name}</p>
        </div>
        <div className="flex space-x-2">
          <div className="relative group">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
              <Download size={16} />
              <span>Download Report</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button onClick={() => downloadReport('pdf')} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <FileText size={16} className="mr-2" /> PDF Report
                </button>
                <button onClick={() => downloadReport('csv')} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Database size={16} className="mr-2" /> CSV Data
                </button>
                <button onClick={() => downloadReport('json')} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Database size={16} className="mr-2" /> JSON Data
                </button>
                <button onClick={() => downloadReport('png')} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Image size={16} className="mr-2" /> PNG Image
                </button>
              </div>
            </div>
          </div>
          <button onClick={shareStats} className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2">
            <Share2 size={16} />
            <span>Share Progress</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{totalSessions}</p>
              {totalSessions > 0 && (
                <p className="text-sm text-green-600">Personal record!</p>
              )}
            </div>
            <Target size={32} className="text-primary-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Practice Time</p>
              <p className="text-3xl font-bold text-gray-900">{Math.floor(totalTime / 60)}h</p>
              {totalTime > 0 && (
                <p className="text-sm text-green-600">{Math.round(totalTime / 60)} minutes total</p>
              )}
            </div>
            <Clock size={32} className="text-primary-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Score</p>
              <p className="text-3xl font-bold text-gray-900">{Math.round(averageScore)}%</p>
              {averageScore > 0 && (
                <p className="text-sm text-green-600">Keep improving!</p>
              )}
            </div>
            <TrendingUp size={32} className="text-primary-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Streak</p>
              <p className="text-3xl font-bold text-gray-900">{bestStreak}</p>
              <p className="text-sm text-gray-600">days</p>
            </div>
            <Award size={32} className="text-primary-500" />
          </div>
        </div>
      </div>

      {totalSessions === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Target size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Practice Sessions Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start practicing to see your personalized analytics and progress tracking.
          </p>
          <button className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors">
            Start Your First Session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Progress Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Language Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Practice Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {languageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Practice Time Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Practice Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="time" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Learning Insights */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Learning Insights</h3>
            <div className="space-y-4">
              {averageScore >= 80 && (
                <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <h4 className="font-medium text-blue-800 mb-1">Excellent Performance!</h4>
                  <p className="text-sm text-blue-700">You're maintaining high accuracy with {Math.round(averageScore)}% average score</p>
                </div>
              )}
              {totalSessions >= 10 && (
                <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                  <h4 className="font-medium text-green-800 mb-1">Consistent Learner</h4>
                  <p className="text-sm text-green-700">Great job completing {totalSessions} practice sessions!</p>
                </div>
              )}
              {totalTime >= 3600 && (
                <div className="p-3 bg-purple-50 border-l-4 border-purple-500 rounded">
                  <h4 className="font-medium text-purple-800 mb-1">Dedicated Practice</h4>
                  <p className="text-sm text-purple-700">You've invested {Math.floor(totalTime / 3600)} hours in learning - keep it up!</p>
                </div>
              )}
              {totalSessions < 5 && (
                <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                  <h4 className="font-medium text-yellow-800 mb-1">Getting Started</h4>
                  <p className="text-sm text-yellow-700">Try to practice regularly to build momentum and see faster progress</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}