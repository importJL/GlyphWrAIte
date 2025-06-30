import React, { useState } from 'react';
import { Search, BookOpen, Play, FileText, Lightbulb, ChevronRight, Star } from 'lucide-react';

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeContent, setActiveContent] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpen },
    { id: 'techniques', name: 'Writing Techniques', icon: FileText },
    { id: 'strategies', name: 'Learning Strategies', icon: Lightbulb },
    { id: 'cultural', name: 'Cultural Context', icon: Star },
  ];

  const knowledgeItems = [
    {
      id: '1',
      title: 'Proper Stroke Order for Chinese Characters',
      category: 'techniques',
      difficulty: 'beginner',
      duration: '5 min read',
      description: 'Learn the fundamental rules of Chinese character stroke order to improve your writing speed and accuracy.',
      content: `
        <h3>Basic Stroke Order Rules</h3>
        <p>Chinese characters follow specific stroke order rules that help with memorization and legible writing:</p>
        <ol>
          <li><strong>Top to bottom:</strong> Write the top part of a character before the bottom part</li>
          <li><strong>Left to right:</strong> Write the left part before the right part</li>
          <li><strong>Horizontal before vertical:</strong> When strokes cross, write horizontal strokes first</li>
          <li><strong>Center before sides:</strong> In symmetrical characters, write the center first</li>
        </ol>
        <h4>Practice Exercise</h4>
        <p>Try writing these characters following proper stroke order: 人 (person), 大 (big), 小 (small), 中 (middle)</p>
      `,
      tags: ['chinese', 'stroke-order', 'fundamentals'],
    },
    {
      id: '2',
      title: 'Memory Techniques for Japanese Hiragana',
      category: 'strategies',
      difficulty: 'beginner',
      duration: '8 min read',
      description: 'Effective mnemonics and visualization techniques to memorize all 46 hiragana characters quickly.',
      content: `
        <h3>Visual Association Method</h3>
        <p>Connect each hiragana character with a visual story or object that resembles its shape:</p>
        <ul>
          <li><strong>あ (a):</strong> Looks like a person with arms spread wide saying "Ahh!"</li>
          <li><strong>か (ka):</strong> Resembles a key (ka-y) hanging on a hook</li>
          <li><strong>さ (sa):</strong> Looks like a person saying "Sa-nta!" with arms up</li>
        </ul>
        <h4>Spaced Repetition Schedule</h4>
        <p>Review characters at increasing intervals: 1 day, 3 days, 1 week, 2 weeks, 1 month</p>
      `,
      tags: ['japanese', 'hiragana', 'memory', 'mnemonics'],
    },
    {
      id: '3',
      title: 'Korean Hangul Block Structure',
      category: 'techniques',
      difficulty: 'intermediate',
      duration: '6 min read',
      description: 'Understanding how Korean characters are composed in syllable blocks for proper spacing and alignment.',
      content: `
        <h3>Syllable Block Composition</h3>
        <p>Korean Hangul is unique in how individual letters combine into syllable blocks:</p>
        <h4>Basic Patterns:</h4>
        <ul>
          <li><strong>CV:</strong> Consonant + Vowel (가, 나, 다)</li>
          <li><strong>CVC:</strong> Consonant + Vowel + Consonant (간, 날, 달)</li>
          <li><strong>CVCC:</strong> Consonant + Vowel + Consonant + Consonant (갑, 닭)</li>
        </ul>
        <h4>Writing Tips:</h4>
        <p>Each block should be roughly square-shaped, with letters adjusted in size to fit proportionally.</p>
      `,
      tags: ['korean', 'hangul', 'structure', 'syllables'],
    },
  ];

  const filteredItems = knowledgeItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const difficultyColors = {
    beginner: 'text-green-600 bg-green-100',
    intermediate: 'text-yellow-600 bg-yellow-100',
    advanced: 'text-red-600 bg-red-100',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Knowledge Base</h2>
        <div className="text-sm text-gray-600">
          {filteredItems.length} articles available
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex space-x-2 overflow-x-auto">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === category.id 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={16} />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Article List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${difficultyColors[item.difficulty as keyof typeof difficultyColors]}`}>
                    {item.difficulty}
                  </span>
                  <span className="text-sm text-gray-600">{item.duration}</span>
                </div>
                <button
                  onClick={() => setActiveContent(activeContent === item.id ? null : item.id)}
                  className="text-primary-500 hover:text-primary-600"
                >
                  <ChevronRight 
                    size={20} 
                    className={`transform transition-transform ${activeContent === item.id ? 'rotate-90' : ''}`} 
                  />
                </button>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              
              <p className="text-gray-600 mb-3">
                {item.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {item.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Expanded Content */}
              {activeContent === item.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div 
                    className="prose prose-sm max-w-none text-gray-900"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                  <div className="flex space-x-2 mt-4">
                    <button className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2">
                      <Play size={16} />
                      <span>Start Practice</span>
                    </button>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">Bookmark</button>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">Share</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No articles found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms or category filter
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Tips */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Today's Tip
            </h3>
            <div className="p-3 bg-primary-50 border-l-4 border-primary-500 rounded">
              <p className="text-sm text-primary-700">
                Practice for just 15 minutes daily rather than long sessions once a week. 
                Consistent, short practice sessions are more effective for building muscle memory.
              </p>
            </div>
          </div>

          {/* Popular Articles */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔥 Popular Articles
            </h3>
            <div className="space-y-3">
              {knowledgeItems.slice(0, 3).map((item, index) => (
                <div key={item.id} className="flex items-start space-x-3">
                  <span className="text-lg font-bold text-primary-500">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-600">
                      {item.duration}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Study Reminder */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ⏰ Study Reminder
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              You haven't practiced today. Keep your streak going!
            </p>
            <button className="w-full bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors">
              Start 15-min Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}