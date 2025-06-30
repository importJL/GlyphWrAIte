import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface PracticeSession {
  id: string;
  userId: string;
  language: string;
  level: string;
  character: string;
  score: number;
  timestamp: Date;
  duration: number;
  attempts: number;
}

export interface UserSettings {
  handedness: 'left' | 'right';
  language: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  theme: 'default' | 'zen' | 'focus' | 'warm';
  fontSize: number;
  canvasSize: 'small' | 'medium' | 'large';
}

export interface AISettings {
  modelType: string;
  visionModel: string;
  audioModel: string;
  persona: 'encouraging' | 'strict' | 'neutral';
  audioAssisted: boolean;
  videoAssisted: boolean;
  realTimeCorrection: boolean;
  feedbackDelay: number;
}

interface AppState {
  currentLanguage: string;
  currentLevel: string;
  sessions: PracticeSession[];
  userSettings: UserSettings;
  aiSettings: AISettings;
  isConnected: boolean;
}

type AppAction = 
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_LEVEL'; payload: string }
  | { type: 'ADD_SESSION'; payload: PracticeSession }
  | { type: 'UPDATE_USER_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'UPDATE_AI_SETTINGS'; payload: Partial<AISettings> }
  | { type: 'SET_CONNECTION'; payload: boolean }
  | { type: 'LOAD_USER_DATA'; payload: { sessions: PracticeSession[]; userSettings: UserSettings; aiSettings: AISettings } }
  | { type: 'CLEAR_USER_DATA' };

const initialState: AppState = {
  currentLanguage: 'english',
  currentLevel: 'beginner',
  sessions: [],
  userSettings: {
    handedness: 'right',
    language: 'english',
    difficulty: 'beginner',
    theme: 'default',
    fontSize: 16,
    canvasSize: 'medium',
  },
  aiSettings: {
    modelType: 'anthropic/claude-3.5-sonnet',
    visionModel: 'openai/gpt-4-vision-preview',
    audioModel: 'openai/whisper-1',
    persona: 'encouraging',
    audioAssisted: false,
    videoAssisted: false,
    realTimeCorrection: true,
    feedbackDelay: 1000,
  },
  isConnected: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...state, currentLanguage: action.payload };
    case 'SET_LEVEL':
      return { ...state, currentLevel: action.payload };
    case 'ADD_SESSION':
      const newSessions = [...state.sessions, action.payload];
      // Save to localStorage for the current user
      if (action.payload.userId) {
        localStorage.setItem(`sessions_${action.payload.userId}`, JSON.stringify(newSessions));
      }
      return { ...state, sessions: newSessions };
    case 'UPDATE_USER_SETTINGS':
      const newUserSettings = { ...state.userSettings, ...action.payload };
      return { ...state, userSettings: newUserSettings };
    case 'UPDATE_AI_SETTINGS':
      const newAISettings = { ...state.aiSettings, ...action.payload };
      return { ...state, aiSettings: newAISettings };
    case 'SET_CONNECTION':
      return { ...state, isConnected: action.payload };
    case 'LOAD_USER_DATA':
      return {
        ...state,
        sessions: action.payload.sessions,
        userSettings: action.payload.userSettings,
        aiSettings: action.payload.aiSettings,
      };
    case 'CLEAR_USER_DATA':
      return {
        ...state,
        sessions: [],
        userSettings: initialState.userSettings,
        aiSettings: initialState.aiSettings,
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { state: authState } = useAuth();

  // Load user-specific data when user logs in
  useEffect(() => {
    if (authState.user) {
      const userId = authState.user.id;
      
      // Load sessions
      const savedSessions = localStorage.getItem(`sessions_${userId}`);
      const sessions = savedSessions ? JSON.parse(savedSessions) : [];
      
      // Load user settings
      const savedUserSettings = localStorage.getItem(`userSettings_${userId}`);
      const userSettings = savedUserSettings ? JSON.parse(savedUserSettings) : initialState.userSettings;
      
      // Load AI settings
      const savedAISettings = localStorage.getItem(`aiSettings_${userId}`);
      const aiSettings = savedAISettings ? JSON.parse(savedAISettings) : initialState.aiSettings;
      
      dispatch({
        type: 'LOAD_USER_DATA',
        payload: { sessions, userSettings, aiSettings }
      });
    } else {
      // Clear data when user logs out
      dispatch({ type: 'CLEAR_USER_DATA' });
    }
  }, [authState.user]);

  // Save settings when they change
  useEffect(() => {
    if (authState.user) {
      localStorage.setItem(`userSettings_${authState.user.id}`, JSON.stringify(state.userSettings));
    }
  }, [state.userSettings, authState.user]);

  useEffect(() => {
    if (authState.user) {
      localStorage.setItem(`aiSettings_${authState.user.id}`, JSON.stringify(state.aiSettings));
    }
  }, [state.aiSettings, authState.user]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}