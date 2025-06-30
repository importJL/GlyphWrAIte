import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '../types/auth';

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return { ...state, isLoading: true, error: null };
    
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
}

const AuthContext = createContext<{
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  clearError: () => void;
} | null>(null);

// Initialize demo account and sample data
const initializeDemoData = () => {
  const existingUsers = localStorage.getItem('registeredUsers');
  if (!existingUsers) {
    const demoUser = {
      id: 'demo-user-123',
      email: 'demo@example.com',
      name: 'Demo User',
      password: 'demo123',
      createdAt: new Date('2024-01-01').toISOString(),
      lastLoginAt: new Date().toISOString(),
      preferences: {
        language: 'english',
        level: 'intermediate',
        timezone: 'UTC',
      },
    };

    localStorage.setItem('registeredUsers', JSON.stringify([demoUser]));

    // Add some sample sessions for the demo user
    const sampleSessions = [
      {
        id: 'session-1',
        userId: 'demo-user-123',
        language: 'english',
        level: 'intermediate',
        character: 'Hello',
        score: 85,
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        duration: 180,
        attempts: 1,
      },
      {
        id: 'session-2',
        userId: 'demo-user-123',
        language: 'chinese',
        level: 'beginner',
        character: '你',
        score: 78,
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        duration: 240,
        attempts: 2,
      },
      {
        id: 'session-3',
        userId: 'demo-user-123',
        language: 'japanese',
        level: 'beginner',
        character: 'あ',
        score: 92,
        timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        duration: 150,
        attempts: 1,
      },
      {
        id: 'session-4',
        userId: 'demo-user-123',
        language: 'english',
        level: 'intermediate',
        character: 'World',
        score: 88,
        timestamp: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        duration: 200,
        attempts: 1,
      },
      {
        id: 'session-5',
        userId: 'demo-user-123',
        language: 'korean',
        level: 'beginner',
        character: '안',
        score: 75,
        timestamp: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
        duration: 300,
        attempts: 3,
      },
    ];

    localStorage.setItem('sessions_demo-user-123', JSON.stringify(sampleSessions));

    // Add sample user settings for demo user
    const demoUserSettings = {
      handedness: 'right',
      language: 'english',
      difficulty: 'intermediate',
      theme: 'default',
      fontSize: 16,
      canvasSize: 'medium',
    };

    localStorage.setItem('userSettings_demo-user-123', JSON.stringify(demoUserSettings));

    // Add sample AI settings for demo user
    const demoAISettings = {
      modelType: 'gpt-4',
      persona: 'encouraging',
      audioAssisted: true,
      videoAssisted: false,
      realTimeCorrection: true,
      feedbackDelay: 1000,
    };

    localStorage.setItem('aiSettings_demo-user-123', JSON.stringify(demoAISettings));
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize demo data and check for existing session on mount
  useEffect(() => {
    initializeDemoData();
    
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        // Convert date strings back to Date objects
        user.createdAt = new Date(user.createdAt);
        user.lastLoginAt = new Date(user.lastLoginAt);
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get registered users
      const savedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const userRecord = savedUsers.find((u: any) => 
        u.email === credentials.email && u.password === credentials.password
      );
      
      if (!userRecord) {
        throw new Error('Invalid email or password. Try the demo account: demo@example.com / demo123');
      }
      
      const authenticatedUser: User = {
        id: userRecord.id,
        email: userRecord.email,
        name: userRecord.name,
        avatar: userRecord.avatar,
        createdAt: new Date(userRecord.createdAt),
        lastLoginAt: new Date(),
        preferences: userRecord.preferences || {
          language: 'english',
          level: 'beginner',
          timezone: 'UTC',
        },
      };
      
      // Update last login time in storage
      const updatedUsers = savedUsers.map((u: any) => 
        u.id === userRecord.id 
          ? { ...u, lastLoginAt: new Date().toISOString() }
          : u
      );
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: authenticatedUser });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: (error as Error).message });
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    dispatch({ type: 'REGISTER_START' });
    
    try {
      // Validate passwords match
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      if (credentials.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const savedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      if (savedUsers.some((u: any) => u.email === credentials.email)) {
        throw new Error('An account with this email already exists');
      }
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: credentials.email,
        name: credentials.name,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        preferences: {
          language: 'english',
          level: 'beginner',
          timezone: 'UTC',
        },
      };
      
      // Save to "database" (localStorage)
      const userWithPassword = { 
        ...newUser, 
        password: credentials.password,
        createdAt: newUser.createdAt.toISOString(),
        lastLoginAt: newUser.lastLoginAt.toISOString(),
      };
      savedUsers.push(userWithPassword);
      localStorage.setItem('registeredUsers', JSON.stringify(savedUsers));
      localStorage.setItem('user', JSON.stringify(newUser));
      
      dispatch({ type: 'REGISTER_SUCCESS', payload: newUser });
    } catch (error) {
      dispatch({ type: 'REGISTER_FAILURE', payload: (error as Error).message });
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = (updates: Partial<User>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Also update in registered users
      const savedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const updatedUsers = savedUsers.map((u: any) => 
        u.id === state.user!.id 
          ? { ...u, ...updates, lastLoginAt: new Date().toISOString() }
          : u
      );
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      
      dispatch({ type: 'UPDATE_PROFILE', payload: updates });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{
      state,
      login,
      register,
      logout,
      updateProfile,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}