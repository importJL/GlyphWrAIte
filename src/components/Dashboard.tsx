import React from 'react';
import { TrendingUp, Clock, Target, Award, Globe, PenTool } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// Define TabType locally for prop typing
export type TabType = 'dashboard' | 'practice' | 'analytics' | 'settings' | 'ai-settings' | 'knowledge' | 'profile' | 'goal-setting';

interface DashboardProps {
  setActiveTab?: (tab: TabType) => void;
}

export default function Dashboard({ setActiveTab }: DashboardProps) {
  const { state } = useAppContext();
  const { sessions, currentLanguage, currentLevel } = state;

  const totalSessions = sessions.length;
  const totalPracticeTime = sessions.reduce((acc, session) => acc + session.duration, 0);
  const averageScore = sessions.length > 0 
    ? sessions.reduce((acc, session) => acc + session.score, 0) / sessions.length 
    : 0;
  
  const recentSessions = sessions.slice(-5).reverse();

  const stats = [
    {
      label: 'Total Sessions',
      value: totalSessions,
      icon: PenTool,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Practice Time',
      value: `${Math.floor(totalPracticeTime / 60)}m`,
      icon: Clock,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Average Score',
      value: `${Math.round(averageScore)}%`,
      icon: Target,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Current Streak',
      value: '7 days',
      icon: Award,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  const languages = [
    { code: 'english', name: 'English', flag: '🇺🇸', progress: 85 },
    { code: 'chinese', name: 'Chinese', flag: '🇨🇳', progress: 45 },
    { code: 'japanese', name: 'Japanese', flag: '🇯🇵', progress: 30 },
    { code: 'korean', name: 'Korean', flag: '🇰🇷', progress: 15 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back! 🎉
            </h2>
            <p className="text-gray-600">
              Currently learning <span className="font-semibold capitalize">{currentLanguage}</span> at{' '}
              <span className="font-semibold capitalize">{currentLevel}</span> level
            </p>
          </div>
          <Globe size={48} className="text-primary-500" />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon size={24} className={stat.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Progress */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Language Progress
          </h3>
          <div className="space-y-4">
            {languages.map((lang) => (
              <div key={lang.code} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-medium text-gray-900">{lang.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${lang.progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {lang.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Sessions
          </h3>
          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div 
                  key={session.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {session.language} - {session.character}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(session.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary-500">
                      {session.score}%
                    </p>
                    <p className="text-sm text-gray-600">
                      {Math.floor(session.duration / 60)}m {session.duration % 60}s
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-600">
              <PenTool size={48} className="mx-auto mb-2 text-gray-300" />
              <p>No practice sessions yet. Start practicing to see your progress!</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2"
            onClick={() => setActiveTab && setActiveTab('practice')}
          >
            <PenTool size={18} />
            <span>Start Practice</span>
          </button>
          <button
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            onClick={() => setActiveTab && setActiveTab('analytics')}
          >
            <TrendingUp size={18} />
            <span>View Analytics</span>
          </button>
          <button
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            onClick={() => setActiveTab && setActiveTab('goal-setting')}
          >
            <Target size={18} />
            <span>Set Goals</span>
          </button>
        </div>
      </div>
    </div>
  );
}