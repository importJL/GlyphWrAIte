import React, { useState, useEffect } from 'react';
import { Search, Filter, Shuffle, BookOpen, Target } from 'lucide-react';
import { characterService, CharacterInfo, CharacterCategory } from '../services/characterService';

interface CharacterSelectorProps {
  language: string;
  currentCharacter: string;
  onCharacterSelect: (character: string) => void;
  onCharacterInfoChange: (info: CharacterInfo | null) => void;
}

export default function CharacterSelector({ 
  language, 
  currentCharacter, 
  onCharacterSelect, 
  onCharacterInfoChange 
}: CharacterSelectorProps) {
  const [categories, setCategories] = useState<CharacterCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCharacters, setFilteredCharacters] = useState<CharacterInfo[]>([]);

  useEffect(() => {
    const languageCategories = characterService.getCharactersByLanguage(language);
    setCategories(languageCategories);
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSearchQuery('');
  }, [language]);

  useEffect(() => {
    filterCharacters();
  }, [categories, selectedCategory, selectedDifficulty, searchQuery]);

  useEffect(() => {
    // Update character info when current character changes
    const charInfo = characterService.getCharacterInfo(language, currentCharacter);
    onCharacterInfoChange(charInfo);
  }, [currentCharacter, language, onCharacterInfoChange]);

  const filterCharacters = () => {
    let characters: CharacterInfo[] = [];

    if (searchQuery) {
      characters = characterService.searchCharacters(language, searchQuery);
    } else if (selectedCategory === 'all') {
      characters = categories.flatMap(cat => cat.characters);
    } else {
      characters = characterService.getCharactersByCategory(language, selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      characters = characters.filter(char => 
        char.difficulty === selectedDifficulty
      );
    }

    setFilteredCharacters(characters);
  };

  const handleRandomCharacter = () => {
    const difficulty = selectedDifficulty === 'all' ? undefined : selectedDifficulty as any;
    const randomChar = characterService.getRandomCharacter(language, difficulty);
    if (randomChar) {
      onCharacterSelect(randomChar.character);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLanguageInfo = (lang: string) => {
    switch (lang) {
      case 'chinese': return { name: 'Chinese', flag: '🇨🇳', total: categories.reduce((sum, cat) => sum + cat.characters.length, 0) };
      case 'japanese': return { name: 'Japanese', flag: '🇯🇵', total: categories.reduce((sum, cat) => sum + cat.characters.length, 0) };
      case 'korean': return { name: 'Korean', flag: '🇰🇷', total: categories.reduce((sum, cat) => sum + cat.characters.length, 0) };
      case 'english': return { name: 'English', flag: '🇺🇸', total: categories.reduce((sum, cat) => sum + cat.characters.length, 0) };
      default: return { name: 'Unknown', flag: '🌐', total: 0 };
    }
  };

  const languageInfo = getLanguageInfo(language);

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl">{languageInfo.flag}</span>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {languageInfo.name} Characters
            </h3>
            <p className="text-sm text-gray-600">
              {languageInfo.total} characters available
            </p>
          </div>
        </div>
        <button
          onClick={handleRandomCharacter}
          className="bg-primary-100 text-primary-700 px-3 py-2 rounded-lg hover:bg-primary-200 transition-colors flex items-center space-x-2"
        >
          <Shuffle size={16} />
          <span>Random</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search characters, definitions, or examples..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1">
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Target size={16} className="text-gray-400" />
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Character Grid */}
      <div className="max-h-96 overflow-y-auto">
        {filteredCharacters.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredCharacters.map((char, index) => (
              <button
                key={index}
                onClick={() => onCharacterSelect(char.character)}
                className={`p-3 border-2 rounded-lg transition-all hover:shadow-md ${
                  currentCharacter === char.character
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="text-xl font-bold text-center mb-2">
                  {char.character}
                </div>
                <div className="text-sm text-center space-y-2 min-h-0">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(char.difficulty)}`}>
                    {char.difficulty}
                  </div>
                  <div className="text-gray-600 text-xs leading-tight" title={char.definition}>
                    {char.definition}
                  </div>
                  {char.pronunciation && (
                    <div className="text-gray-500 font-mono text-xs">
                      {char.pronunciation}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              No Characters Found
            </h4>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Category Info */}
      {selectedCategory !== 'all' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
          <div className="flex items-center space-x-2 mb-1">
            <BookOpen size={16} className="text-blue-500" />
            <h4 className="font-medium text-blue-800 text-sm">
              {categories.find(cat => cat.id === selectedCategory)?.name}
            </h4>
          </div>
          <p className="text-xs text-blue-700">
            {categories.find(cat => cat.id === selectedCategory)?.description}
          </p>
        </div>
      )}
    </div>
  );
}