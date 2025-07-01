import React, { useState } from 'react';
import { Save, Sparkles } from 'lucide-react';
import { openRouterService } from '../services/openrouter';

interface Goal {
  type: string;
  timeline: string;
  date: string;
  custom: string;
}

const defaultGoalTypes = [
  'Master 50 new characters',
  'Achieve 90% accuracy',
  'Practice daily for 30 days',
  'Complete all beginner lessons',
];

const defaultTimelines = [
  '1 week',
  '2 weeks',
  '1 month',
  '3 months',
];

export default function GoalSettingPage({ onSave }: { onSave?: (goal: Goal) => void }) {
  const [goalType, setGoalType] = useState('');
  const [timeline, setTimeline] = useState('');
  const [date, setDate] = useState('');
  const [customGoals, setCustomGoals] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiPlan, setAiPlan] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAddCustomGoal = () => {
    if (customInput.trim()) {
      setCustomGoals([...customGoals, customInput.trim()]);
      setCustomInput('');
    }
  };

  const handleRemoveCustomGoal = (index: number) => {
    setCustomGoals(customGoals => customGoals.filter((_, i) => i !== index));
  };

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    setAiError(null);
    try {
      // Call OpenRouter API for AI plan generation
      const plan = await openRouterService.answerQuestion(
        aiPrompt,
        { character: '', language: '', level: '' }, // You can pass more context if needed
        undefined // Use default model or allow user to select
      );
      setAiPlan(plan);
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate AI plan.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        type: goalType,
        timeline,
        date,
        custom: customGoals.join('; '),
      });
    }
    // Save logic here (e.g., context, API, or localStorage)
    alert('Goal plan saved!');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Your Learning Goals</h2>
      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Goal Type</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={goalType}
            onChange={e => setGoalType(e.target.value)}
          >
            <option value="">Select a goal...</option>
            {defaultGoalTypes.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Timeline</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={timeline}
            onChange={e => setTimeline(e.target.value)}
          >
            <option value="">Select timeline...</option>
            {defaultTimelines.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Target Date</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Custom Goals</label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              className="flex-1 border rounded px-3 py-2"
              placeholder="Add your own goal..."
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCustomGoal()}
            />
            <button
              className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
              onClick={handleAddCustomGoal}
              type="button"
            >Add</button>
          </div>
          <ul className="list-disc pl-5 space-y-1">
            {customGoals.map((g, i) => (
              <li key={i} className="text-gray-700 flex items-center justify-between">
                <span>{g}</span>
                <button
                  type="button"
                  className="ml-2 text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded"
                  onClick={() => handleRemoveCustomGoal(i)}
                  aria-label={`Remove goal: ${g}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <label className="block font-medium mb-1">AI-Assisted Goal Plan</label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              className="flex-1 border rounded px-3 py-2"
              placeholder="Describe your goal or ask AI for a plan..."
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center space-x-1"
              onClick={handleAIGenerate}
              type="button"
              disabled={isGenerating || !aiPrompt.trim()}
            >
              <Sparkles size={16} />
              <span>{isGenerating ? 'Generating...' : 'AI Generate'}</span>
            </button>
          </div>
          {aiError && (
            <div className="text-red-600 text-sm mb-2">{aiError}</div>
          )}
          {aiPlan && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-2 text-blue-900 whitespace-pre-line">
              {aiPlan}
            </div>
          )}
        </div>
      </div>
      <button
        className="w-full bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 flex items-center justify-center space-x-2"
        onClick={handleSave}
      >
        <Save size={18} />
        <span>Save Goal Plan</span>
      </button>
    </div>
  );
}
