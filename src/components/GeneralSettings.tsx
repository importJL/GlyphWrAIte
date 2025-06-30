import React from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function GeneralSettings() {
  const { state, dispatch } = useAppContext();
  const { userSettings } = state;

  const handleSettingChange = (key: keyof typeof userSettings, value: any) => {
    dispatch({
      type: 'UPDATE_USER_SETTINGS',
      payload: { [key]: value }
    });
  };

  const resetSettings = () => {
    dispatch({
      type: 'UPDATE_USER_SETTINGS',
      payload: {
        handedness: 'right',
        language: 'english',
        difficulty: 'beginner',
        theme: 'default',
        fontSize: 16,
        canvasSize: 'medium',
      }
    });
  };

  const themes = [
    { value: 'default', name: 'Default Blue', description: 'Clean and professional' },
    { value: 'zen', name: 'Zen Green', description: 'Calming and focused' },
    { value: 'focus', name: 'Focus Purple', description: 'Deep concentration' },
    { value: 'warm', name: 'Warm Orange', description: 'Energetic and motivating' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">General Settings</h2>
        <div className="flex space-x-2">
          <button onClick={resetSettings} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
            <RotateCcw size={16} />
            <span>Reset to Default</span>
          </button>
          <button className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2">
            <Save size={16} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Preferences */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Preferences</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Writing Hand
              </label>
              <select
                value={userSettings.handedness}
                onChange={(e) => handleSettingChange('handedness', e.target.value as 'left' | 'right')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="right">Right-handed</option>
                <option value="left">Left-handed</option>
              </select>
              <p className="text-xs text-gray-600 mt-1">
                Optimizes UI layout for your dominant hand
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Language
              </label>
              <select
                value={userSettings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="english">English</option>
                <option value="chinese">Chinese</option>
                <option value="japanese">Japanese</option>
                <option value="korean">Korean</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Difficulty
              </label>
              <select
                value={userSettings.difficulty}
                onChange={(e) => handleSettingChange('difficulty', e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <p className="text-xs text-gray-600 mt-1">
                Adjusts lesson complexity and AI feedback level
              </p>
            </div>
          </div>
        </div>

        {/* User Interface */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Interface</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <div className="grid grid-cols-1 gap-2">
                {themes.map((theme) => (
                  <label key={theme.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="theme"
                      value={theme.value}
                      checked={userSettings.theme === theme.value}
                      onChange={(e) => handleSettingChange('theme', e.target.value)}
                      className="text-primary-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{theme.name}</p>
                      <p className="text-sm text-gray-600">{theme.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size: {userSettings.fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="24"
                value={userSettings.fontSize}
                onChange={(e) => handleSettingChange('fontSize', Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Small (12px)</span>
                <span>Large (24px)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Canvas Size
              </label>
              <select
                value={userSettings.canvasSize}
                onChange={(e) => handleSettingChange('canvasSize', e.target.value as 'small' | 'medium' | 'large')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="small">Small (400×300)</option>
                <option value="medium">Medium (600×450)</option>
                <option value="large">Large (800×600)</option>
              </select>
              <p className="text-xs text-gray-600 mt-1">
                Larger canvases provide more writing space but require more screen real estate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Preferences */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Auto-save Practice</p>
              <p className="text-sm text-gray-600">Automatically save your writing practice</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Practice Reminders</p>
              <p className="text-sm text-gray-600">Get daily reminders to practice</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}