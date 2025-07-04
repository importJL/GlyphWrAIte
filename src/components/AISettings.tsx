import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Zap, Volume2, Video, AlertCircle, Key, TestTube, CheckCircle, XCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { openRouterService } from '../services/openrouter';

export default function AISettings() {
  const { state, dispatch } = useAppContext();
  const { aiSettings } = state;
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({ connected: false, hasKey: false });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isRefreshingModels, setIsRefreshingModels] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [lastSettings, setLastSettings] = useState(aiSettings);

  useEffect(() => {
    setConnectionStatus(openRouterService.getConnectionStatus());
  }, []);

  const handleSettingChange = (key: keyof typeof aiSettings, value: any) => {
    dispatch({
      type: 'UPDATE_AI_SETTINGS',
      payload: { [key]: value }
    });
  };

  const resetSettings = () => {
    dispatch({
      type: 'UPDATE_AI_SETTINGS',
      payload: {
        modelType: 'anthropic/claude-3.5-sonnet',
        visionModel: 'openai/gpt-4-vision-preview',
        audioModel: 'openai/whisper-1',
        persona: 'encouraging',
        audioAssisted: false,
        videoAssisted: false,
        realTimeCorrection: true,
        feedbackDelay: 1000,
      }
    });
  };

  const handleApiKeySubmit = () => {
    if (!apiKey.trim()) return;
    
    const success = openRouterService.setApiKey(apiKey.trim());
    if (success) {
      setConnectionStatus({ connected: true, hasKey: true });
      setApiKey(''); // Clear the input for security
      setTestResult(null);
    }
  };

  const handleClearApiKey = () => {
    openRouterService.clearApiKey();
    setConnectionStatus({ connected: false, hasKey: false });
    setApiKey('');
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    
    try {
      const result = await openRouterService.testConnection();
      setTestResult(result);
      if (result.success) {
        setConnectionStatus({ connected: true, hasKey: true });
      }
    } catch (error) {
      setTestResult({ success: false, error: 'Connection test failed' });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleRefreshModels = async () => {
    setIsRefreshingModels(true);
    try {
      await openRouterService.refreshModels();
      setTestResult({ success: true });
    } catch (error) {
      setTestResult({ success: false, error: 'Failed to refresh models' });
    } finally {
      setIsRefreshingModels(false);
    }
  };

  const handleSave = () => {
    setShowSaved(true);
    setLastSettings(aiSettings);
    setTimeout(() => setShowSaved(false), 1500);
  };

  const models = openRouterService.models;
  const textModels = [
    {
      id: 'qwen/qwen3-8b:free',
      name: 'Qwen3-8B (Free)',
      description: 'Alibaba Qwen3-8B, open/free model for general language tasks',
      costPerMToken: { input: 0, output: 0 },
      context_length: 128000,
    },
  ];
  const visionModels = models.vision;
  const audioModels = models.audio;

  // Add available audio models for OpenRouter
  const availableAudioModels = [
    { id: 'openai/whisper-1', name: 'OpenAI Whisper v1 (Recommended)' },
    { id: 'openai/whisper-large-v3', name: 'OpenAI Whisper Large v3' },
    { id: 'openai/whisper-medium', name: 'OpenAI Whisper Medium' },
    { id: 'openai/whisper-small', name: 'OpenAI Whisper Small' },
    { id: 'openai/whisper-base', name: 'OpenAI Whisper Base' },
    { id: 'deepgram/whisper-large', name: 'Deepgram Whisper Large' },
    { id: 'deepgram/whisper-tiny', name: 'Deepgram Whisper Tiny' },
  ];

  const personas = [
    { value: 'encouraging', name: 'Encouraging Teacher', description: 'Positive, supportive, celebrates progress' },
    { value: 'strict', name: 'Strict Tutor', description: 'Direct feedback, high standards, corrects mistakes immediately' },
    { value: 'neutral', name: 'Neutral Guide', description: 'Balanced approach, objective feedback, factual guidance' },
  ];

  // Vision model options (restricted to only the two requested models)
  const visionModelOptions = [
    {
      value: 'qwen/qwen2.5-vl-32b-instruct:free',
      label: 'Qwen: Qwen2.5 VL 32B Instruct (free)'
    },
    {
      value: 'mistral/mistral-small-3.2-24b:free',
      label: 'Mistral: Mistral Small 3.2 24B (free)'
    }
  ];

  // Provide fallback vision model descriptions and costs for UI rendering
  const visionModelDescriptions: Record<string, { description: string; costPerMToken: { input: number; output: number }; context_length?: number }> = {
    'qwen/qwen2.5-vl-32b-instruct:free': {
      description: 'Qwen2.5 VL 32B Instruct, open/free vision-language model for image analysis',
      costPerMToken: { input: 0, output: 0 },
      context_length: 128000,
    },
    'mistral/mistral-small-3.2-24b:free': {
      description: 'Mistral Small 3.2 24B, open/free vision model for image analysis',
      costPerMToken: { input: 0, output: 0 },
      context_length: 128000,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Settings</h2>
        <div className="flex space-x-2 items-center">
          <button
            onClick={resetSettings}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <RotateCcw size={16} />
            <span>Reset to Default</span>
          </button>
          <button
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
            onClick={handleSave}
            disabled={JSON.stringify(aiSettings) === JSON.stringify(lastSettings)}
          >
            <Save size={16} />
            <span>Save Changes</span>
          </button>
          {showSaved && (
            <span className="ml-2 text-green-600 font-medium">Saved!</span>
          )}
        </div>
      </div>

      {/* API Key Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Key size={20} className="text-primary-500" />
            <h3 className="text-lg font-semibold text-gray-900">OpenRouter API Configuration</h3>
          </div>
          {connectionStatus.hasKey && (
            <button
              onClick={handleRefreshModels}
              disabled={isRefreshingModels}
              className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50 flex items-center space-x-1"
            >
              <RefreshCw size={14} className={isRefreshingModels ? 'animate-spin' : ''} />
              <span>Refresh Models</span>
            </button>
          )}
        </div>
        
        {!connectionStatus.hasKey ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Setup Required</h4>
              <p className="text-sm text-blue-700 mb-3">
                To use AI features, you need an OpenRouter API key. OpenRouter provides access to multiple AI models including GPT-4, Claude, and Gemini.
              </p>
              <a 
                href="https://openrouter.ai/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline text-sm"
              >
                Get your API key from OpenRouter →
              </a>
            </div>
            
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your OpenRouter API key"
                  className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                onClick={handleApiKeySubmit}
                disabled={!apiKey.trim()}
                className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Key
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle size={20} className="text-green-500" />
                <div>
                  <h4 className="font-medium text-green-800">API Key Configured</h4>
                  <p className="text-sm text-green-700">
                    OpenRouter connection is ready • {textModels.length} text models available
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50 flex items-center space-x-1"
                >
                  <TestTube size={14} />
                  <span>{isTestingConnection ? 'Testing...' : 'Test'}</span>
                </button>
                <button
                  onClick={handleClearApiKey}
                  className="bg-red-100 text-red-700 px-3 py-1 rounded-md hover:bg-red-200 transition-colors"
                >
                  Clear Key
                </button>
              </div>
            </div>

            {testResult && (
              <div className={`p-3 rounded-lg border ${
                testResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {testResult.success ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <XCircle size={16} className="text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    testResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {testResult.success ? 'Connection successful!' : 'Connection failed'}
                  </span>
                </div>
                {testResult.error && (
                  <p className="text-sm text-red-700 mt-1">{testResult.error}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Text Model Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Text Analysis Model</h3>
            <span className="text-sm text-gray-500">{textModels.length} available</span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {textModels.map((model) => (
              <label key={model.id} className="block">
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  aiSettings.modelType === model.id 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-primary-300'
                }`}>
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="modelType"
                      value={model.id}
                      checked={aiSettings.modelType === model.id}
                      onChange={(e) => handleSettingChange('modelType', e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">{model.name}</h4>
                        {model.id.includes('claude') && <Zap size={16} className="text-purple-500" />}
                        {model.id.includes('gpt-4') && <Zap size={16} className="text-green-500" />}
                        {model.id.includes('gpt-3.5') && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Fast</span>}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{model.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex space-x-3">
                          <span>In: ${model.costPerMToken.input.toFixed(2)}/1M</span>
                          <span>Out: ${model.costPerMToken.output.toFixed(2)}/1M</span>
                        </div>
                        {model.context_length && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {(model.context_length / 1000).toFixed(0)}K ctx
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Vision Model Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Vision Analysis Model</h3>
            <span className="text-sm text-gray-500">{visionModelOptions.length} available</span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {visionModelOptions.map((model) => {
              const meta = visionModelDescriptions[model.value];
              return (
                <label key={model.value} className="block">
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    aiSettings.visionModel === model.value 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-primary-300'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="visionModel"
                        value={model.value}
                        checked={aiSettings.visionModel === model.value}
                        onChange={(e) => handleSettingChange('visionModel', e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900 truncate">{model.label}</h4>
                          <Video size={16} className="text-blue-500" />
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{meta?.description || ''}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex space-x-3">
                            <span>In: ${meta?.costPerMToken.input.toFixed(2)}/1M</span>
                            <span>Out: ${meta?.costPerMToken.output.toFixed(2)}/1M</span>
                          </div>
                          {meta?.context_length && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {(meta.context_length / 1000).toFixed(0)}K ctx
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Audio Model Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Audio Model</h3>
            <span className="text-sm text-gray-500">{availableAudioModels.length} available</span>
          </div>
          <div className="space-y-2">
            <label htmlFor="audio-model-select" className="block text-sm font-medium text-gray-700 mb-1">Select Audio Model for Speech-to-Text</label>
            <select
              id="audio-model-select"
              className="w-full border rounded px-3 py-2"
              value={aiSettings.audioModel}
              onChange={e => handleSettingChange('audioModel', e.target.value)}
              title="Audio Model"
            >
              {availableAudioModels.map((model) => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              These models are available via OpenRouter and can be used with your API key.
            </p>
          </div>
        </div>
      </div>

      {/* AI Persona */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Teaching Persona</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {personas.map((persona) => (
            <label key={persona.value} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="persona"
                value={persona.value}
                checked={aiSettings.persona === persona.value}
                onChange={(e) => handleSettingChange('persona', e.target.value)}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-gray-900">{persona.name}</p>
                <p className="text-sm text-gray-600">{persona.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* AI Features */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Volume2 size={20} className="text-primary-500" />
              <div>
                <p className="font-medium text-gray-900">Audio Assistance</p>
                <p className="text-sm text-gray-600">Spoken guidance and pronunciation help</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={aiSettings.audioAssisted}
                onChange={(e) => handleSettingChange('audioAssisted', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Video size={20} className="text-primary-500" />
              <div>
                <p className="font-medium text-gray-900">Vision Analysis</p>
                <p className="text-sm text-gray-600">AI analyzes your handwriting</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={aiSettings.videoAssisted}
                onChange={(e) => handleSettingChange('videoAssisted', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle size={20} className="text-primary-500" />
              <div>
                <p className="font-medium text-gray-900">Real-time Feedback</p>
                <p className="text-sm text-gray-600">Immediate AI corrections</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={aiSettings.realTimeCorrection}
                onChange={(e) => handleSettingChange('realTimeCorrection', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback Delay: {aiSettings.feedbackDelay}ms
            </label>
            <input
              type="range"
              min="0"
              max="3000"
              step="100"
              value={aiSettings.feedbackDelay}
              onChange={(e) => handleSettingChange('feedbackDelay', Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Instant (0ms)</span>
              <span>Delayed (3s)</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Adjust how quickly AI provides feedback after you finish writing
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio Model
            </label>
            <select 
              value={aiSettings.audioModel}
              onChange={(e) => handleSettingChange('audioModel', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {audioModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} - ${model.costPerMToken.input.toFixed(2)}/1M tokens
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Usage Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 AI Usage Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Cost Optimization:</h4>
            <ul className="space-y-1">
              <li>• Use GPT-3.5 for basic feedback (most cost-effective)</li>
              <li>• Use Claude or GPT-4 for detailed analysis</li>
              <li>• Vision models cost more due to image processing</li>
              <li>• Models are sorted by cost (cheapest first)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Best Practices:</h4>
            <ul className="space-y-1">
              <li>• Clear, well-lit handwriting gets better analysis</li>
              <li>• Adjust feedback delay to avoid interruptions</li>
              <li>• Test different personas to find your preference</li>
              <li>• Refresh models to see latest available options</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}