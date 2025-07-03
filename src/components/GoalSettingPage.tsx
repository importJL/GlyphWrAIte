import React, { useState } from 'react';
import { Save, Sparkles, X } from 'lucide-react';
import { openRouterService } from '../services/openrouter';

interface Goal {
  title?: string;
  type: string;
  timeline: string;
  date: string;
  custom: string;
  aiPlan?: string;
}

const defaultGoalTypes = [
  'Master 50 new characters',
  'Achieve 90% accuracy',
  'Practice daily for 30 days',
  'Complete all beginner lessons',
  'Custom Input',
  'AI-Assisted Input',
];

const defaultTimelines = [
  '1 week',
  '2 weeks',
  '1 month',
  '3 months',
];

export default function GoalSettingPage({ onSave }: { onSave?: (goal: Goal) => void }) {
  const [goalTitle, setGoalTitle] = useState('');
  const [goalType, setGoalType] = useState('');
  const [timeline, setTimeline] = useState('');
  const [date, setDate] = useState('');
  const [customGoals, setCustomGoals] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiPlan, setAiPlan] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Goal[]>([]);
  const [showModal, setShowModal] = useState<{ open: boolean; plan: Goal | null }>({ open: false, plan: null });
  const [formError, setFormError] = useState('');

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
    setAiPlan('');
    try {
      const model = 'qwen/qwen3-8b:free';
      const apiKey = openRouterService['apiKey'];
      if (!apiKey) throw new Error('No OpenRouter API key configured.');
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': document.title || 'AIWriteCharacterLearning',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are an expert language learning assistant. Generate a concise, actionable goal plan.' },
            { role: 'user', content: aiPrompt }
          ]
        })
      });
      if (!response.ok) throw new Error(`OpenRouter API error: ${response.statusText}`);
      const data = await response.json();
      const plan = data.choices?.[0]?.message?.content || 'No response from AI.';
      setAiPlan(plan);
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate AI plan.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Input validation
  const validate = () => {
    if (!timeline) return 'Timeline is required.';
    if (!date) return 'Start Date is required.';
    if (goalType === 'Custom Input' && customGoals.length === 0) return 'At least one custom goal is required.';
    if (goalType === 'AI-Assisted Input' && !aiPlan.trim()) return 'AI-Assisted Goal Plan is required.';
    if (!goalType) return 'Goal Type is required.';
    return '';
  };

  // Save and reset
  const handleSave = () => {
    const error = validate();
    setFormError(error);
    if (error) return;
    const plan: Goal = {
      title: goalTitle,
      type: goalType,
      timeline,
      date,
      custom: customGoals.join('; '),
      aiPlan: goalType === 'AI-Assisted Input' ? aiPlan : undefined,
    };
    setPlans(prev => {
      const newPlans = [...prev, plan].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return newPlans;
    });
    if (onSave) onSave(plan);
    // Reset form
    setGoalTitle('');
    setGoalType('');
    setTimeline('');
    setDate('');
    setCustomGoals([]);
    setCustomInput('');
    setAiPrompt('');
    setAiPlan('');
    setFormError('');
  };

  return (
    <div className="flex">
      {/* Sidebar for saved plans */}
      <div className="w-64 min-w-[16rem] bg-gray-50 border-r border-gray-200 p-4 space-y-4 h-full sticky top-0">
        <h3 className="text-lg font-semibold mb-2">Saved Goal Plans</h3>
        {plans.length === 0 ? (
          <div className="text-gray-400 text-sm">No plans yet.</div>
        ) : (
          plans.map((plan, idx) => (
            <div key={idx} className="bg-white rounded shadow p-3 mb-2 cursor-pointer hover:bg-blue-50" onClick={() => setShowModal({ open: true, plan })}>
              <div className="font-medium text-primary-600 truncate">{plan.title || plan.type}</div>
              <div className="text-xs text-gray-500">{plan.timeline} • {plan.date}</div>
              <div className="text-xs text-gray-700 mt-1 truncate">{plan.custom || plan.aiPlan}</div>
            </div>
          ))
        )}
      </div>
      {/* Main form */}
      <div className="flex-1 max-w-2xl mx-auto bg-white rounded-lg shadow p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Your Learning Goals</h2>
        {formError && <div className="text-red-600 text-sm mb-2">{formError}</div>}
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Title of the Goal</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="Enter a short title for your goal..."
              value={goalTitle}
              onChange={e => setGoalTitle(e.target.value)}
            />
          </div>
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
            <label className="block font-medium mb-1">Start Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          {/* Conditional input for Custom or AI-Assisted */}
          {goalType === 'Custom Input' && (
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
                    >Remove</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {goalType === 'AI-Assisted Input' && (
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
          )}
        </div>
        <button
          className="w-full bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 flex items-center justify-center space-x-2"
          onClick={handleSave}
        >
          <Save size={18} />
          <span>Save Goal Plan</span>
        </button>
      </div>
      {/* Modal for expanded plan view */}
      {showModal.open && showModal.plan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setShowModal({ open: false, plan: null })}
        >
          <div
            className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] p-6 relative overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 bg-white rounded-full p-1 shadow"
              title="Close"
              onClick={() => setShowModal({ open: false, plan: null })}
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-2 text-primary-700">{showModal.plan.title || showModal.plan.type}</h3>
            <div className="mb-2"><span className="font-semibold">Type:</span> {showModal.plan.type}</div>
            <div className="mb-2"><span className="font-semibold">Timeline:</span> {showModal.plan.timeline}</div>
            <div className="mb-2"><span className="font-semibold">Start Date:</span> {showModal.plan.date}</div>
            {showModal.plan.type === 'Custom Input' && (
              <div className="mb-2"><span className="font-semibold">Custom Goals:</span>
                <ul className="list-disc pl-5 mt-1">
                  {showModal.plan.custom.split('; ').map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>
            )}
            {showModal.plan.type === 'AI-Assisted Input' && (
              <div className="mb-2"><span className="font-semibold">AI-Assisted Plan:</span>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-1 text-blue-900 whitespace-pre-line overflow-x-auto max-w-full max-h-60">
                  {showModal.plan.aiPlan}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
