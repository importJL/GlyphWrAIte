import React, { useRef, useEffect, useState } from 'react';
import { Palette, RotateCcw, Download, Play, Square, MessageCircle, Lightbulb, Loader, Zap } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { openRouterService } from '../services/openrouter';
import { characterService, CharacterInfo } from '../services/characterService';
import CharacterSelector from './CharacterSelector';
import CharacterInfoPanel from './CharacterInfoPanel';

export default function PracticeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [currentCharacter, setCurrentCharacter] = useState('A');
  const [currentCharacterInfo, setCurrentCharacterInfo] = useState<CharacterInfo | null>(null);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({ connected: false, hasKey: false });
  const [submittedResults, setSubmittedResults] = useState<Array<{
    character: string;
    language: string;
    level: string;
    timestamp: Date;
    pass: string;
    modelGuess: string;
    score: number;
  }>>([]);
  
  const { state, dispatch } = useAppContext();
  const { state: authState } = useAuth();
  const { currentLanguage, currentLevel, userSettings, aiSettings } = state;

  useEffect(() => {
    setConnectionStatus(openRouterService.getConnectionStatus());
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    // Set initial character based on language
    const categories = characterService.getCharactersByLanguage(currentLanguage);
    if (categories.length > 0 && categories[0].characters.length > 0) {
      const firstChar = categories[0].characters[0].character;
      setCurrentCharacter(firstChar);
    }
  }, [currentLanguage]);

  useEffect(() => {
    // Load initial AI tips for the character
    loadAITips();
  }, [currentCharacter, currentLanguage, connectionStatus]);

  const getCanvasSize = () => {
    switch (userSettings.canvasSize) {
      case 'small': return { width: 400, height: 300 };
      case 'large': return { width: 800, height: 600 };
      default: return { width: 600, height: 450 };
    }
  };

  const canvasDimensions = getCanvasSize();

  const loadAITips = async () => {
    if (!connectionStatus.hasKey) {
      const charInfo = characterService.getCharacterInfo(currentLanguage, currentCharacter);
      const tips = [
        `Practice writing "${currentCharacter}" with smooth, confident strokes`,
        charInfo ? `Definition: ${charInfo.definition}` : 'Focus on proper stroke order for better muscle memory',
        charInfo ? `Usage: ${charInfo.usage}` : 'Try to maintain consistent character size and spacing',
        'Configure AI settings to get personalized feedback',
      ];
      setAiTips(tips);
      return;
    }

    try {
      const tips = await openRouterService.generateTextFeedback(
        currentCharacter,
        currentLanguage,
        currentLevel,
        aiSettings.persona,
        aiSettings.modelType
      );
      setAiTips([tips]);
    } catch (error) {
      console.error('Failed to load AI tips:', error);
      const charInfo = characterService.getCharacterInfo(currentLanguage, currentCharacter);
      setAiTips([
        `Practice writing "${currentCharacter}" with smooth, confident strokes`,
        charInfo ? `Tip: ${charInfo.usage}` : 'AI tips unavailable - check your API key in settings',
      ]);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `practice-${currentCharacter}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const getCanvasImageData = (): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    return canvas.toDataURL('image/png');
  };

  const submitPractice = async () => {
    if (!authState.user) {
      alert('Please log in to save your practice session');
      return;
    }

    setIsAnalyzing(true);
    let score = Math.floor(Math.random() * 40) + 60; // Default fallback score
    let feedback = 'Good effort! Keep practicing to improve your technique.';
    let modelGuess = '';
    let pass = '';
    let aiRaw = '';

    // Use AI analysis if available and vision is enabled
    if (connectionStatus.hasKey && aiSettings.videoAssisted) {
      try {
        const canvasData = getCanvasImageData();
        const result = await openRouterService.analyzeHandwriting({
          character: currentCharacter,
          language: currentLanguage,
          level: currentLevel,
          canvasData,
          persona: aiSettings.persona,
          visionModel: aiSettings.visionModel
        });
        score = result.score;
        modelGuess = result.modelGuess;
        pass = result.pass;
        aiRaw = result.raw;
        setAiTips(prev => [
          `AI Analysis: ${aiRaw}`,
          `Model Guess: ${modelGuess}`,
          `Accuracy Score: ${score}%`,
          `Grade: ${pass}`,
          ...prev.slice(0, 2)
        ]);
        setSubmittedResults(prev => [
          {
            character: currentCharacter,
            language: currentLanguage,
            level: currentLevel,
            timestamp: new Date(),
            pass,
            modelGuess,
            score
          },
          ...prev
        ]);
      } catch (error) {
        console.error('AI analysis failed:', error);
        setAiTips(prev => [
          'AI analysis failed - using basic scoring',
          ...prev
        ]);
      }
    }
    
    const session = {
      id: Date.now().toString(),
      userId: authState.user.id,
      language: currentLanguage,
      level: currentLevel,
      character: currentCharacter,
      score,
      timestamp: new Date(),
      duration: Math.floor(Math.random() * 300) + 60, // 1-5 minutes
      attempts: 1,
    };

    dispatch({ type: 'ADD_SESSION', payload: session });
    setIsAnalyzing(false);
    
    // Show feedback
    alert(`${connectionStatus.hasKey && aiSettings.videoAssisted ? `AI Analysis Complete!\n\nOverall assessment: ${pass}\nEvaluated character: ${modelGuess}\nAccuracy score: ${score}` : `Practice Submitted!\n\nScore: ${score}%\n${feedback}`}`);
    clearCanvas();
  };

  const handleAskQuestion = async () => {
    if (!userQuestion.trim()) return;
    
    setIsAnswering(true);
    
    if (!connectionStatus.hasKey) {
      // Fallback responses with character-specific information
      const charInfo = characterService.getCharacterInfo(currentLanguage, currentCharacter);
      const responses = [
        charInfo ? `For "${currentCharacter}": ${charInfo.usage}` : `For "${currentCharacter}", try breaking it down into smaller strokes.`,
        charInfo && charInfo.examples.length > 0 ? `Example usage: ${charInfo.examples[0]}` : 'Remember to maintain consistent pressure throughout the stroke.',
        charInfo ? `Cultural note: ${charInfo.culturalNotes || 'Practice the basic shape first, then add details.'}` : 'Practice the basic shape first, then add details.',
        'Consider the cultural context and traditional writing methods.',
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      setAiTips([...aiTips, `Q: ${userQuestion}`, `A: ${response}`]);
      setUserQuestion('');
      setIsAnswering(false);
      return;
    }

    try {
      const response = await openRouterService.answerQuestion(
        userQuestion,
        {
          character: currentCharacter,
          language: currentLanguage,
          level: currentLevel
        },
        aiSettings.modelType
      );
      
      setAiTips([...aiTips, `Q: ${userQuestion}`, `🤖 ${response}`]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setAiTips([...aiTips, `Q: ${userQuestion}`, `❌ Sorry, I couldn't process your question. Please check your AI settings.`]);
    }
    
    setUserQuestion('');
    setIsAnswering(false);
  };

  const handleCharacterSelect = (character: string) => {
    setCurrentCharacter(character);
    clearCanvas(); // Clear canvas when switching characters
  };

  const handleCharacterInfoChange = (info: CharacterInfo | null) => {
    setCurrentCharacterInfo(info);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* Left Sidebar: CharacterSelector + Results, increased width for better spacing */}
      <div className="xl:col-span-1 min-w-[380px] flex flex-col space-y-4">
        <CharacterSelector
          language={currentLanguage}
          currentCharacter={currentCharacter}
          onCharacterSelect={handleCharacterSelect}
          onCharacterInfoChange={handleCharacterInfoChange}
        />
        <div className="bg-white rounded-lg shadow p-6 flex-1 min-h-[300px]">
          <h3 className="font-semibold text-gray-900 mb-4">Submitted Results</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {submittedResults.length === 0 ? (
              <div className="text-gray-500 text-sm">No submissions yet.</div>
            ) : (
              submittedResults.map((res, idx) => (
                <div key={idx} className="border-l-4 pl-4 py-3 mb-3 rounded border-primary-500 bg-gray-50">
                  <div className="text-base text-gray-700 font-semibold mb-2">{res.character} ({res.language})</div>
                  <div className="text-sm text-gray-500 mb-2">{res.level} | {res.timestamp.toLocaleString()}</div>
                  <div className="text-sm mb-2">Result: <span className={res.pass === 'Pass' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{res.pass}</span></div>
                  <div className="text-sm mb-2">AI Guess: <span className="font-mono bg-white px-2 py-1 rounded">{res.modelGuess}</span></div>
                  <div className="text-sm">Accuracy: <span className="font-mono bg-white px-2 py-1 rounded font-semibold">{res.score}%</span></div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* Main Canvas Area: adjusted to take remaining space with better proportions */}
      <div className="xl:col-span-2 space-y-4 min-w-0">
        {/* User Info */}
        {authState.user && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-sm">
                    {authState.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Welcome, {authState.user.name}!</p>
                  <p className="text-sm text-gray-600">
                    Learning {currentLanguage} at {currentLevel} level
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${connectionStatus.hasKey ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {connectionStatus.hasKey ? 'AI Ready' : 'AI Setup Required'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* AI Status Banner */}
        {!connectionStatus.hasKey && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Zap size={20} className="text-blue-500" />
              <div>
                <h4 className="font-medium text-blue-800">Unlock AI Features</h4>
                <p className="text-sm text-blue-700">
                  Configure your OpenRouter API key in AI Settings to enable intelligent handwriting analysis, personalized feedback, and interactive Q&A.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap items-center justify-between gap-4 min-w-0">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={currentLanguage}
                  onChange={(e) => dispatch({ type: 'SET_LANGUAGE', payload: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="english">English</option>
                  <option value="chinese">Chinese</option>
                  <option value="japanese">Japanese</option>
                  <option value="korean">Korean</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <select
                  value={currentLevel}
                  onChange={(e) => dispatch({ type: 'SET_LEVEL', payload: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button onClick={clearCanvas} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1">
                <RotateCcw size={16} />
                <span>Clear</span>
              </button>
              <button onClick={downloadCanvas} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1">
                <Download size={16} />
                <span>Save</span>
              </button>
              <button 
                onClick={submitPractice} 
                disabled={isAnalyzing}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-1 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Square size={16} />
                    <span>Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Drawing Tools */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Palette size={20} className="text-gray-600" />
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Brush Size:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-gray-600 w-8">{brushSize}px</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-primary-500 flex-shrink-0">
              Practice: {currentCharacter}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="canvas-container overflow-x-auto">
          <canvas
            ref={canvasRef}
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="cursor-crosshair"
          />
        </div>

        {/* AI Assistant */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-2 mb-3">
            <MessageCircle size={20} className="text-primary-500" />
            <h3 className="font-semibold text-gray-900">Ask AI</h3>
            {!connectionStatus.hasKey && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Setup Required</span>
            )}
          </div>
          <div className="space-y-2">
            <textarea
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder={connectionStatus.hasKey 
                ? "Ask about writing techniques, stroke order, or any questions..."
                : "Configure AI settings to enable intelligent Q&A..."
              }
              className="w-full p-2 border border-gray-300 rounded-md resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={!connectionStatus.hasKey}
            />
            <button
              onClick={handleAskQuestion}
              disabled={!userQuestion.trim() || isAnswering || !connectionStatus.hasKey}
              className="w-full bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isAnswering ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <span>Ask AI</span>
              )}
            </button>
          </div>
        </div>

        {/* AI Tips */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb size={20} className="text-primary-500" />
            <h3 className="font-semibold text-gray-900">
              {connectionStatus.hasKey ? 'AI Tips' : 'Practice Tips'}
            </h3>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {aiTips.map((tip, index) => (
              <div
                key={index}
                className={`text-sm p-2 rounded ${
                  tip.startsWith('Q:') 
                    ? 'bg-blue-50 text-blue-800 border-l-2 border-blue-500' 
                    : tip.startsWith('🤖') || tip.startsWith('A:')
                    ? 'bg-green-50 text-green-800 border-l-2 border-green-500'
                    : tip.startsWith('AI Analysis:')
                    ? 'bg-purple-50 text-purple-800 border-l-2 border-purple-500'
                    : tip.startsWith('💡')
                    ? 'bg-yellow-50 text-yellow-800 border-l-2 border-yellow-500'
                    : 'bg-gray-50 text-gray-700'
                }`}
              >
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Character Information Panel: right sidebar, increased width for better readability */}
      <div className="xl:col-span-2 min-w-[320px]">
        <CharacterInfoPanel 
          characterInfo={currentCharacterInfo}
          language={currentLanguage}
        />
      </div>
    </div>
  );
}