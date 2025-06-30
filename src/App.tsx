import React, { useState } from 'react';
import { PenTool, BarChart3, Settings, Brain, BookOpen, Home, LogOut, User } from 'lucide-react';
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

type TabType = 'dashboard' | 'practice' | 'analytics' | 'settings' | 'ai-settings' | 'knowledge' | 'profile';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'practice', label: 'Practice', icon: PenTool },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'ai-settings', label: 'AI Settings', icon: Brain },
  { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
  { id: 'profile', label: 'Profile', icon: User },
] as const;

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const { state: authState, logout } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
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
      default:
        return <Dashboard />;
    }
  };

  if (!authState.isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Language Learning Platform
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Welcome, {authState.user?.name}
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-sm">
                  {authState.user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
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