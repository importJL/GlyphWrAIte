interface CharacterInfo {
  character: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  definition: string;
  pronunciation?: string;
  synonyms: string[];
  antonyms: string[];
  usage: string;
  examples: string[];
  strokeOrder?: string[];
  culturalNotes?: string;
  relatedCharacters?: string[];
}

interface CharacterCategory {
  id: string;
  name: string;
  description: string;
  characters: CharacterInfo[];
}

class CharacterService {
  private characterData: { [language: string]: CharacterCategory[] } = {};

  constructor() {
    this.initializeCharacterData();
  }

  private initializeCharacterData() {
    this.characterData = {
      english: [
        {
          id: 'basic-letters',
          name: 'Basic Letters',
          description: 'Fundamental alphabet letters',
          characters: [
            {
              character: 'A',
              category: 'basic-letters',
              difficulty: 'beginner',
              definition: 'The first letter of the English alphabet',
              pronunciation: '/eɪ/',
              synonyms: ['Alpha'],
              antonyms: ['Z (last letter)'],
              usage: 'Used as the first letter in many words and as an indefinite article',
              examples: ['Apple', 'Amazing', 'A book'],
              culturalNotes: 'Represents excellence in grading systems'
            },
            {
              character: 'B',
              category: 'basic-letters',
              difficulty: 'beginner',
              definition: 'The second letter of the English alphabet',
              pronunciation: '/biː/',
              synonyms: ['Beta'],
              antonyms: ['A (previous letter)'],
              usage: 'Common starting letter for many words',
              examples: ['Book', 'Beautiful', 'Big'],
              culturalNotes: 'Often represents second place or grade B'
            }
          ]
        },
        {
          id: 'common-words',
          name: 'Common Words',
          description: 'Frequently used English words',
          characters: [
            {
              character: 'Hello',
              category: 'common-words',
              difficulty: 'beginner',
              definition: 'A greeting used when meeting someone',
              pronunciation: '/həˈloʊ/',
              synonyms: ['Hi', 'Hey', 'Greetings'],
              antonyms: ['Goodbye', 'Farewell'],
              usage: 'Used to greet someone or answer the phone',
              examples: ['Hello, how are you?', 'Hello world!'],
              culturalNotes: 'Universal greeting in English-speaking countries'
            },
            {
              character: 'World',
              category: 'common-words',
              difficulty: 'beginner',
              definition: 'The earth and all its inhabitants',
              pronunciation: '/wɜːrld/',
              synonyms: ['Earth', 'Globe', 'Planet'],
              antonyms: ['Universe (larger scope)'],
              usage: 'Refers to the planet Earth or global community',
              examples: ['Around the world', 'World peace'],
              culturalNotes: 'Often used in programming as "Hello World"'
            }
          ]
        }
      ],
      chinese: [
        {
          id: 'basic-characters',
          name: 'Basic Characters (基本字)',
          description: 'Fundamental Chinese characters for beginners',
          characters: [
            {
              character: '你',
              category: 'basic-characters',
              difficulty: 'beginner',
              definition: 'You (informal)',
              pronunciation: 'nǐ',
              synonyms: ['您 (formal you)'],
              antonyms: ['我 (I/me)'],
              usage: 'Used to address someone informally',
              examples: ['你好 (Hello)', '你是谁？(Who are you?)'],
              strokeOrder: ['丿', '亻', '小'],
              culturalNotes: 'Most common way to say "you" in Mandarin',
              relatedCharacters: ['您', '我', '他']
            },
            {
              character: '好',
              category: 'basic-characters',
              difficulty: 'beginner',
              definition: 'Good, well, fine',
              pronunciation: 'hǎo',
              synonyms: ['棒 (great)', '不错 (not bad)'],
              antonyms: ['坏 (bad)', '差 (poor)'],
              usage: 'Expresses positive quality or greeting',
              examples: ['你好 (Hello)', '很好 (Very good)'],
              strokeOrder: ['女', '子'],
              culturalNotes: 'Combines "woman" and "child" radicals meaning harmony',
              relatedCharacters: ['很', '非常', '太']
            },
            {
              character: '中',
              category: 'basic-characters',
              difficulty: 'beginner',
              definition: 'Middle, center, China',
              pronunciation: 'zhōng',
              synonyms: ['中间 (middle)', '中央 (center)'],
              antonyms: ['边 (side)', '外 (outside)'],
              usage: 'Indicates center position or refers to China',
              examples: ['中国 (China)', '中间 (middle)'],
              strokeOrder: ['丨', '口', '丨'],
              culturalNotes: 'Central to Chinese identity - "Middle Kingdom"',
              relatedCharacters: ['国', '心', '央']
            }
          ]
        },
        {
          id: 'numbers',
          name: 'Numbers (数字)',
          description: 'Chinese numerical characters',
          characters: [
            {
              character: '一',
              category: 'numbers',
              difficulty: 'beginner',
              definition: 'One',
              pronunciation: 'yī',
              synonyms: ['壹 (formal one)'],
              antonyms: ['多 (many)'],
              usage: 'The number one, also used in counting',
              examples: ['一个 (one piece)', '第一 (first)'],
              strokeOrder: ['一'],
              culturalNotes: 'Simplest Chinese character, represents unity',
              relatedCharacters: ['二', '三', '十']
            }
          ]
        }
      ],
      japanese: [
        {
          id: 'hiragana-basic',
          name: 'Basic Hiragana (ひらがな)',
          description: 'Fundamental hiragana characters',
          characters: [
            {
              character: 'あ',
              category: 'hiragana-basic',
              difficulty: 'beginner',
              definition: 'Hiragana character "a"',
              pronunciation: 'a',
              synonyms: ['ア (katakana a)'],
              antonyms: [],
              usage: 'Basic vowel sound, used in many words',
              examples: ['あり (ant)', 'あか (red)'],
              culturalNotes: 'First character in hiragana syllabary',
              relatedCharacters: ['い', 'う', 'え', 'お']
            },
            {
              character: 'か',
              category: 'hiragana-basic',
              difficulty: 'beginner',
              definition: 'Hiragana character "ka"',
              pronunciation: 'ka',
              synonyms: ['カ (katakana ka)'],
              antonyms: [],
              usage: 'Consonant-vowel combination, common in Japanese',
              examples: ['かき (persimmon)', 'かみ (paper/god)'],
              culturalNotes: 'Part of the ka-gyō (ka column) in hiragana',
              relatedCharacters: ['き', 'く', 'け', 'こ']
            }
          ]
        },
        {
          id: 'katakana-basic',
          name: 'Basic Katakana (カタカナ)',
          description: 'Fundamental katakana characters',
          characters: [
            {
              character: 'ア',
              category: 'katakana-basic',
              difficulty: 'beginner',
              definition: 'Katakana character "a"',
              pronunciation: 'a',
              synonyms: ['あ (hiragana a)'],
              antonyms: [],
              usage: 'Used for foreign words and emphasis',
              examples: ['アメリカ (America)', 'アイス (ice)'],
              culturalNotes: 'More angular than hiragana, used for loanwords',
              relatedCharacters: ['イ', 'ウ', 'エ', 'オ']
            }
          ]
        }
      ],
      korean: [
        {
          id: 'basic-consonants',
          name: 'Basic Consonants (자음)',
          description: 'Fundamental Korean consonants',
          characters: [
            {
              character: 'ㄱ',
              category: 'basic-consonants',
              difficulty: 'beginner',
              definition: 'Korean consonant "g/k"',
              pronunciation: 'g/k',
              synonyms: ['기역 (giyeok)'],
              antonyms: [],
              usage: 'Basic consonant, changes sound based on position',
              examples: ['가 (ga)', '국 (guk)'],
              culturalNotes: 'First consonant in Korean alphabet order',
              relatedCharacters: ['ㄴ', 'ㄷ', 'ㄹ']
            },
            {
              character: 'ㄴ',
              category: 'basic-consonants',
              difficulty: 'beginner',
              definition: 'Korean consonant "n"',
              pronunciation: 'n',
              synonyms: ['니은 (nieun)'],
              antonyms: [],
              usage: 'Nasal consonant, consistent sound',
              examples: ['나 (na)', '눈 (nun)'],
              culturalNotes: 'Represents the tongue touching the roof of mouth',
              relatedCharacters: ['ㄱ', 'ㄷ', 'ㅁ']
            }
          ]
        },
        {
          id: 'basic-vowels',
          name: 'Basic Vowels (모음)',
          description: 'Fundamental Korean vowels',
          characters: [
            {
              character: 'ㅏ',
              category: 'basic-vowels',
              difficulty: 'beginner',
              definition: 'Korean vowel "a"',
              pronunciation: 'a',
              synonyms: ['아 (a sound)'],
              antonyms: [],
              usage: 'Basic vowel sound, bright and open',
              examples: ['가 (ga)', '사 (sa)'],
              culturalNotes: 'Represents yang (positive) energy in Korean philosophy',
              relatedCharacters: ['ㅓ', 'ㅗ', 'ㅜ']
            }
          ]
        },
        {
          id: 'common-words',
          name: 'Common Words (일반 단어)',
          description: 'Frequently used Korean words',
          characters: [
            {
              character: '안',
              category: 'common-words',
              difficulty: 'intermediate',
              definition: 'Inside, peace, safety',
              pronunciation: 'an',
              synonyms: ['내부 (inside)', '평안 (peace)'],
              antonyms: ['밖 (outside)', '위험 (danger)'],
              usage: 'Used in greetings and to express safety',
              examples: ['안녕 (hello/goodbye)', '안전 (safety)'],
              culturalNotes: 'Essential part of Korean greetings',
              relatedCharacters: ['녕', '전', '심']
            }
          ]
        }
      ]
    };
  }

  public getCharactersByLanguage(language: string): CharacterCategory[] {
    return this.characterData[language] || [];
  }

  public getCharactersByCategory(language: string, categoryId: string): CharacterInfo[] {
    const categories = this.getCharactersByLanguage(language);
    const category = categories.find(cat => cat.id === categoryId);
    return category?.characters || [];
  }

  public getCharacterInfo(language: string, character: string): CharacterInfo | null {
    const categories = this.getCharactersByLanguage(language);
    for (const category of categories) {
      const charInfo = category.characters.find(char => char.character === character);
      if (charInfo) return charInfo;
    }
    return null;
  }

  public getCharactersByDifficulty(language: string, difficulty: 'beginner' | 'intermediate' | 'advanced'): CharacterInfo[] {
    const categories = this.getCharactersByLanguage(language);
    const characters: CharacterInfo[] = [];
    
    categories.forEach(category => {
      characters.push(...category.characters.filter(char => char.difficulty === difficulty));
    });
    
    return characters;
  }

  public searchCharacters(language: string, query: string): CharacterInfo[] {
    const categories = this.getCharactersByLanguage(language);
    const characters: CharacterInfo[] = [];
    const lowerQuery = query.toLowerCase();
    
    categories.forEach(category => {
      characters.push(...category.characters.filter(char => 
        char.character.includes(query) ||
        char.definition.toLowerCase().includes(lowerQuery) ||
        char.usage.toLowerCase().includes(lowerQuery) ||
        char.examples.some(example => example.toLowerCase().includes(lowerQuery))
      ));
    });
    
    return characters;
  }

  public getRandomCharacter(language: string, difficulty?: 'beginner' | 'intermediate' | 'advanced'): CharacterInfo | null {
    let characters: CharacterInfo[];
    
    if (difficulty) {
      characters = this.getCharactersByDifficulty(language, difficulty);
    } else {
      const categories = this.getCharactersByLanguage(language);
      characters = categories.flatMap(cat => cat.characters);
    }
    
    if (characters.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex];
  }

  public getRelatedCharacters(language: string, character: string): CharacterInfo[] {
    const charInfo = this.getCharacterInfo(language, character);
    if (!charInfo || !charInfo.relatedCharacters) return [];
    
    const related: CharacterInfo[] = [];
    charInfo.relatedCharacters.forEach(relatedChar => {
      const info = this.getCharacterInfo(language, relatedChar);
      if (info) related.push(info);
    });
    
    return related;
  }
}

export const characterService = new CharacterService();
export type { CharacterInfo, CharacterCategory };