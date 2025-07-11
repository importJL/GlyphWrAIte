import React, { useState, useLayoutEffect } from 'react';
import { PenTool, BarChart3, Settings, Brain, BookOpen, Home, LogOut, User, Sun, Moon } from 'lucide-react';
import Dashboard from './components/Dashboard';
import PracticeCanvas from './components/PracticeCanvas';
import Analytics from './components/Analytics';
import GeneralSettings from './components/GeneralSettings';
import AISettings from './components/AISettings';
import KnowledgeBase from './components/KnowledgeBase';
import UserProfile from './components/profile/UserProfile';
import AuthPage from './components/auth/AuthPage';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import GoalSettingPage from './components/GoalSettingPage';

type TabType = 'dashboard' | 'practice' | 'analytics' | 'settings' | 'ai-settings' | 'knowledge' | 'profile' | 'goal-setting';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'practice', label: 'Practice', icon: PenTool },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'ai-settings', label: 'AI Settings', icon: Brain },
  { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'goal-setting', label: 'Goal Setting', icon: User },
] as const;

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const { state: authState, logout } = useAuth();
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });
  useLayoutEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'practice':
        return <PracticeCanvas />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <GeneralSettings />;
      case 'ai-settings':
        return <AISettings />;
      case 'knowledge':
        return <KnowledgeBase />;
      case 'profile':
        return <UserProfile />;
      case 'goal-setting':
        return <GoalSettingPage />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  if (!authState.isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Language Learning Platform
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-200">
              Welcome, {authState.user?.name}
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center hover:bg-primary-200 transition-colors"
              title="Go to Profile"
            >
              <span className="text-primary-600 font-semibold text-sm">
                {authState.user?.name.charAt(0).toUpperCase()}
              </span>
            </button>
            <button
              onClick={logout}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
            </div>
          </div>
      </header>
    </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-2">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-primary-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        <div className="fade-in">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;