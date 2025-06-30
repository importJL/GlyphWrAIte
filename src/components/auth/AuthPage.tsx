import React, { useState } from 'react';
import { Globe, BookOpen, PenTool, BarChart3 } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 text-white p-12 flex-col justify-center">
        <div className="max-w-md">
          <div className="flex items-center space-x-3 mb-8">
            <Globe size={48} className="text-primary-200" />
            <h1 className="text-3xl font-bold">Language Learning Platform</h1>
          </div>
          
          <h2 className="text-4xl font-bold mb-6">
            Master Languages with AI-Powered Writing Practice
          </h2>
          
          <p className="text-xl text-primary-100 mb-8">
            Learn English, Chinese, Japanese, and Korean through interactive writing exercises 
            with personalized AI feedback and guidance.
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <PenTool size={24} className="text-primary-200" />
              <span className="text-lg">Interactive writing canvas with real-time feedback</span>
            </div>
            <div className="flex items-center space-x-3">
              <BarChart3 size={24} className="text-primary-200" />
              <span className="text-lg">Detailed analytics and progress tracking</span>
            </div>
            <div className="flex items-center space-x-3">
              <BookOpen size={24} className="text-primary-200" />
              <span className="text-lg">Comprehensive knowledge base and learning strategies</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Globe size={32} className="text-primary-500" />
              <h1 className="text-2xl font-bold text-gray-900">Language Learning</h1>
            </div>
            <p className="text-gray-600">AI-Powered Writing Practice</p>
          </div>

          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
}