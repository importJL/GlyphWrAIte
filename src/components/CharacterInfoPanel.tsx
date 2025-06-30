import React from 'react';
import { Book, Volume2, Lightbulb, Users, ArrowRight, Star, Globe } from 'lucide-react';
import { CharacterInfo } from '../services/characterService';

interface CharacterInfoPanelProps {
  characterInfo: CharacterInfo | null;
  language: string;
}

export default function CharacterInfoPanel({ characterInfo, language }: CharacterInfoPanelProps) {
  if (!characterInfo) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <Book size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Character Information
          </h3>
          <p className="text-gray-600">
            Select a character to see detailed information, usage examples, and cultural context.
          </p>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLanguageFlag = (lang: string) => {
    switch (lang) {
      case 'chinese': return '🇨🇳';
      case 'japanese': return '🇯🇵';
      case 'korean': return '🇰🇷';
      case 'english': return '🇺🇸';
      default: return '🌐';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Header */}
      <div className="text-center border-b border-gray-200 pb-4">
        <div className="text-6xl font-bold text-primary-500 mb-2">
          {characterInfo.character}
        </div>
        <div className="flex items-center justify-center space-x-2 mb-2">
          <span className="text-2xl">{getLanguageFlag(language)}</span>
          {characterInfo.pronunciation && (
            <div className="flex items-center space-x-1">
              <Volume2 size={16} className="text-gray-400" />
              <span className="text-lg text-gray-600 font-mono">
                {characterInfo.pronunciation}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center space-x-2">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(characterInfo.difficulty)}`}>
            {characterInfo.difficulty}
          </span>
          <span className="text-sm text-gray-500 capitalize">
            {characterInfo.category.replace('-', ' ')}
          </span>
        </div>
      </div>

      {/* Definition */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
          <Book size={16} className="text-primary-500" />
          <span>Definition</span>
        </h4>
        <p className="text-gray-700 leading-relaxed">
          {characterInfo.definition}
        </p>
      </div>

      {/* Usage */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
          <Lightbulb size={16} className="text-primary-500" />
          <span>Usage</span>
        </h4>
        <p className="text-gray-700 leading-relaxed">
          {characterInfo.usage}
        </p>
      </div>

      {/* Examples */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <Star size={16} className="text-primary-500" />
          <span>Examples</span>
        </h4>
        <div className="space-y-2">
          {characterInfo.examples.map((example, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
              <ArrowRight size={14} className="text-primary-500 flex-shrink-0" />
              <span className="text-gray-700">{example}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Synonyms and Antonyms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {characterInfo.synonyms.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Synonyms</h4>
            <div className="flex flex-wrap gap-1">
              {characterInfo.synonyms.map((synonym, index) => (
                <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  {synonym}
                </span>
              ))}
            </div>
          </div>
        )}

        {characterInfo.antonyms.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Antonyms</h4>
            <div className="flex flex-wrap gap-1">
              {characterInfo.antonyms.map((antonym, index) => (
                <span key={index} className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                  {antonym}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stroke Order (for Chinese/Japanese) */}
      {characterInfo.strokeOrder && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
            <Users size={16} className="text-primary-500" />
            <span>Stroke Order</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {characterInfo.strokeOrder.map((stroke, index) => (
              <div key={index} className="flex items-center space-x-1">
                <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <span className="text-lg font-mono">{stroke}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cultural Notes */}
      {characterInfo.culturalNotes && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
            <Globe size={16} className="text-primary-500" />
            <span>Cultural Notes</span>
          </h4>
          <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-blue-800 text-sm leading-relaxed">
              {characterInfo.culturalNotes}
            </p>
          </div>
        </div>
      )}

      {/* Related Characters */}
      {characterInfo.relatedCharacters && characterInfo.relatedCharacters.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
            <Users size={16} className="text-primary-500" />
            <span>Related Characters</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {characterInfo.relatedCharacters.map((related, index) => (
              <button
                key={index}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors text-lg font-medium"
              >
                {related}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Practice Tip */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">💡 Practice Tip</h4>
        <p className="text-yellow-700 text-sm">
          {language === 'chinese' || language === 'japanese' 
            ? 'Focus on stroke order and character balance. Practice writing slowly at first to build muscle memory.'
            : language === 'korean'
            ? 'Pay attention to how consonants and vowels combine in syllable blocks. Practice the individual components first.'
            : 'Practice letter formation and word spacing. Focus on consistent size and alignment.'
          }
        </p>
      </div>
    </div>
  );
}