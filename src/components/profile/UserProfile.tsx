import React, { useState } from 'react';
import { User, Mail, Calendar, Globe, Edit2, Save, X, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function UserProfile() {
  const { state, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: state.user?.name || '',
    email: state.user?.email || '',
    preferences: {
      language: state.user?.preferences.language || 'english',
      level: state.user?.preferences.level || 'beginner',
      timezone: state.user?.preferences.timezone || 'UTC',
    },
  });

  const handleSave = () => {
    updateProfile({
      name: formData.name,
      email: formData.email,
      preferences: formData.preferences,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: state.user?.name || '',
      email: state.user?.email || '',
      preferences: {
        language: state.user?.preferences.language || 'english',
        level: state.user?.preferences.level || 'beginner',
        timezone: state.user?.preferences.timezone || 'UTC',
      },
    });
    setIsEditing(false);
  };

  if (!state.user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
          >
            <Edit2 size={16} />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-6 mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
              {state.user.avatar ? (
                <img
                  src={state.user.avatar}
                  alt={state.user.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <User size={40} className="text-primary-500" />
              )}
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full hover:bg-primary-600 transition-colors">
                <Camera size={16} />
              </button>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{state.user.name}</h3>
            <p className="text-gray-600">{state.user.email}</p>
            <p className="text-sm text-gray-500">
              Member since {state.user.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                <User size={16} className="text-gray-400" />
                <span>{state.user.name}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                <Mail size={16} className="text-gray-400" />
                <span>{state.user.email}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Language
            </label>
            {isEditing ? (
              <select
                value={formData.preferences.language}
                onChange={(e) => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, language: e.target.value }
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="english">English</option>
                <option value="chinese">Chinese</option>
                <option value="japanese">Japanese</option>
                <option value="korean">Korean</option>
              </select>
            ) : (
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                <Globe size={16} className="text-gray-400" />
                <span className="capitalize">{state.user.preferences.language}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Learning Level
            </label>
            {isEditing ? (
              <select
                value={formData.preferences.level}
                onChange={(e) => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, level: e.target.value }
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            ) : (
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                <Calendar size={16} className="text-gray-400" />
                <span className="capitalize">{state.user.preferences.level}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary-50 p-4 rounded-lg">
              <p className="text-sm text-primary-600 font-medium">Last Login</p>
              <p className="text-lg font-bold text-primary-800">
                {state.user.lastLoginAt.toLocaleDateString()}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Account Age</p>
              <p className="text-lg font-bold text-green-800">
                {Math.floor((Date.now() - state.user.createdAt.getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Profile Status</p>
              <p className="text-lg font-bold text-purple-800">Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}