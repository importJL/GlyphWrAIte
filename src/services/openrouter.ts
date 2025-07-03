// OpenRouter service for AI model integration
interface ModelInfo {
  id: string;
  name: string;
  description: string;
  costPerMToken: { input: number; output: number };
  context_length?: number;
  top_provider?: {
    max_completion_tokens?: number;
  };
}

interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  top_provider: {
    max_completion_tokens?: number;
  };
}

interface FeedbackRequest {
  character: string;
  language: string;
  level: string;
  canvasData: string;
  persona: string;
}

interface FeedbackResponse {
  score: number;
  feedback: string;
  suggestions: string[];
}

class OpenRouterService {
  private apiKey: string = '';
  private isConnected: boolean = false;
  private availableModels: {
    text: ModelInfo[];
    vision: ModelInfo[];
    audio: ModelInfo[];
  } = {
    text: [],
    vision: [],
    audio: []
  };

  // Fallback models when API is not available
  private readonly fallbackModels = {
    text: [
      {
        id: 'anthropic/claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        description: 'Most intelligent model, excellent for detailed language analysis',
        costPerMToken: { input: 3, output: 15 }
      },
      {
        id: 'openai/gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: 'Advanced reasoning with large context window',
        costPerMToken: { input: 10, output: 30 }
      },
      {
        id: 'openai/gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and cost-effective for general tasks',
        costPerMToken: { input: 0.5, output: 1.5 }
      },
      {
        id: 'google/gemini-pro',
        name: 'Gemini Pro',
        description: 'Google\'s advanced language model',
        costPerMToken: { input: 0.5, output: 1.5 }
      }
    ],
    vision: [
      {
        id: 'openai/gpt-4-vision-preview',
        name: 'GPT-4 Vision',
        description: 'Analyze handwriting and provide visual feedback',
        costPerMToken: { input: 10, output: 30 }
      },
      {
        id: 'anthropic/claude-3-opus',
        name: 'Claude 3 Opus',
        description: 'Advanced vision capabilities for detailed analysis',
        costPerMToken: { input: 15, output: 75 }
      }
    ],
    audio: [
      {
        id: 'openai/whisper-1',
        name: 'Whisper',
        description: 'Speech recognition and transcription',
        costPerMToken: { input: 6, output: 0 }
      }
    ]
  };

  constructor() {
    // Use env variable for OpenRouter API key
    const savedKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_OPENROUTER_API_KEY) ? import.meta.env.VITE_OPENROUTER_API_KEY : '';
    if (savedKey) {
      this.setApiKey(savedKey);
    }
  }

  public get models() {
    return this.availableModels.text.length > 0 ? this.availableModels : this.fallbackModels;
  }

  public setApiKey(apiKey: string): boolean {
    try {
      this.apiKey = apiKey;
      localStorage.setItem('openrouter_api_key', apiKey);
      this.isConnected = true;
      // Fetch available models when API key is set
      this.fetchAvailableModels();
      return true;
    } catch (error) {
      console.error('Failed to set API key:', error);
      this.isConnected = false;
      return false;
    }
  }

  public clearApiKey(): void {
    this.apiKey = '';
    this.isConnected = false;
    this.availableModels = { text: [], vision: [], audio: [] };
    localStorage.removeItem('openrouter_api_key');
  }

  public getConnectionStatus(): { connected: boolean; hasKey: boolean } {
    return {
      connected: this.isConnected,
      hasKey: !!this.apiKey
    };
  }

  public async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.apiKey) {
      return { success: false, error: 'No API key configured' };
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        await this.fetchAvailableModels();
        return { success: true };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Connection test failed' 
      };
    }
  }

  private async fetchAvailableModels(): Promise<void> {
    if (!this.apiKey) return;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Failed to fetch models, using fallback');
        return;
      }

      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        this.categorizeModels(data.data);
      }
    } catch (error) {
      console.warn('Error fetching models:', error);
      // Keep using fallback models
    }
  }

  private categorizeModels(models: OpenRouterModel[]): void {
    const textModels: ModelInfo[] = [];
    const visionModels: ModelInfo[] = [];
    const audioModels: ModelInfo[] = [];

    models.forEach(model => {
      const modelInfo: ModelInfo = {
        id: model.id,
        name: model.name,
        description: model.description || 'Advanced AI model',
        costPerMToken: {
          input: parseFloat(model.pricing.prompt) * 1000000,
          output: parseFloat(model.pricing.completion) * 1000000
        },
        context_length: model.context_length,
        top_provider: model.top_provider
      };

      // Categorize based on model ID and capabilities
      if (model.id.includes('vision') || model.id.includes('claude-3')) {
        visionModels.push(modelInfo);
      } else if (model.id.includes('whisper') || model.id.includes('audio')) {
        audioModels.push(modelInfo);
      } else {
        textModels.push(modelInfo);
      }
    });

    // Sort by cost (cheapest first) and filter popular models
    this.availableModels = {
      text: this.filterAndSortModels(textModels, [
        'gpt-3.5-turbo', 'gpt-4', 'claude', 'gemini', 'llama', 'mistral'
      ]),
      vision: this.filterAndSortModels(visionModels, [
        'gpt-4-vision', 'claude-3', 'gemini-pro-vision'
      ]),
      audio: this.filterAndSortModels(audioModels, [
        'whisper'
      ])
    };
  }

  private filterAndSortModels(models: ModelInfo[], preferredKeywords: string[]): ModelInfo[] {
    // Filter for popular/relevant models
    const filtered = models.filter(model => 
      preferredKeywords.some(keyword => 
        model.id.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    // Sort by cost (input + output) ascending
    return filtered.sort((a, b) => 
      (a.costPerMToken.input + a.costPerMToken.output) - 
      (b.costPerMToken.input + b.costPerMToken.output)
    ).slice(0, 8); // Limit to 8 models per category
  }

  public async analyzeHandwriting(request: FeedbackRequest): Promise<FeedbackResponse> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    try {
      // For now, simulate the analysis since we need to implement the actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const score = Math.floor(Math.random() * 30) + 70;
      const feedback = `Your handwriting of "${request.character}" shows good structure. Focus on stroke consistency.`;
      const suggestions = [
        'Practice proper stroke order',
        'Maintain consistent character size',
        'Focus on balanced proportions'
      ];

      return { score, feedback, suggestions };
    } catch (error: any) {
      throw new Error(`Handwriting analysis failed: ${error.message}`);
    }
  }

  public async generateTextFeedback(
    character: string,
    language: string,
    level: string,
    persona: string,
    model: string = 'anthropic/claude-3.5-sonnet'
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }
    try {
      const prompt = `Give feedback for practicing the character "${character}" in ${language} at ${level} level. Persona: ${persona}.`;
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
          'X-Title': typeof document !== 'undefined' ? document.title : 'AIWriteCharacterLearning',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are an expert language learning assistant. Give concise, actionable feedback for handwriting practice.' },
            { role: 'user', content: prompt }
          ]
        })
      });
      if (!response.ok) {
        // Try to parse error message from OpenRouter
        let errorMsg = `OpenRouter API error: ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData.error && errData.error.message) errorMsg = errData.error.message;
        } catch {}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
        throw new Error('No valid response from AI.');
      }
      return data.choices[0].message.content;
    } catch (error: any) {
      throw new Error(`Text feedback generation failed: ${error.message}`);
    }
  }

  public async  answerQuestion(
    question: string,
    context: { character: string; language: string; level: string },
    model: string = 'anthropic/claude-3.5-sonnet'
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          // 'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
          // 'X-Title': typeof document !== 'undefined' ? document.title : 'AIWriteCharacterLearning',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are an expert language learning assistant. Give concise, actionable tips.' },
            { role: 'user', content: question }
          ]
        })
      });
      if (!response.ok) throw new Error(`OpenRouter API error: ${response.statusText}`);
      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'No response from AI.';
    } catch (error: any) {
      throw new Error(`Question answering failed: ${error.message}`);
    }
  }

  public async refreshModels(): Promise<void> {
    if (this.apiKey) {
      await this.fetchAvailableModels();
    }
  }
}

declare global {
  interface ImportMeta {
    env: {
      VITE_OPENROUTER_API_KEY?: string;
      [key: string]: string | undefined;
    };
  }
}

export const openRouterService = new OpenRouterService();