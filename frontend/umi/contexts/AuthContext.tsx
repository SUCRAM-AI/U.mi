/**
 * Contexto de Autenticação e Estado do Usuário
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  lessonsCompleted: number;
  practiceStreak: number;
  instrument: string;
  achievements: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  completeLesson: (lessonId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = '@umi_user';
const DEFAULT_XP_TO_NEXT_LEVEL = 2000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar usuário do storage ao iniciar
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simular verificação (em produção, isso seria uma chamada à API)
      const storedUser = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.email === email) {
          // Senha seria verificada em produção
          await saveUser(userData);
          return true;
        }
      }
      
      // Se não encontrou, criar usuário padrão (modo convidado)
      const guestUser: User = {
        id: `guest_${Date.now()}`,
        name: 'Convidado',
        email: email,
        level: 1,
        xp: 0,
        xpToNextLevel: DEFAULT_XP_TO_NEXT_LEVEL,
        lessonsCompleted: 0,
        practiceStreak: 0,
        instrument: 'Violão',
        achievements: [],
      };
      await saveUser(guestUser);
      return true;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Verificar se email já existe
      const storedUser = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedUser) {
        const existingUser = JSON.parse(storedUser);
        if (existingUser.email === email) {
          return false; // Email já existe
        }
      }

      const newUser: User = {
        id: `user_${Date.now()}`,
        name: name,
        email: email,
        level: 1,
        xp: 0,
        xpToNextLevel: DEFAULT_XP_TO_NEXT_LEVEL,
        lessonsCompleted: 0,
        practiceStreak: 0,
        instrument: 'Violão',
        achievements: [],
      };

      await saveUser(newUser);
      return true;
    } catch (error) {
      console.error('Erro ao registrar:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    await saveUser(updatedUser);
  };

  const addXP = async (amount: number) => {
    if (!user) return;
    
    let newXP = user.xp + amount;
    let newLevel = user.level;
    let xpToNextLevel = user.xpToNextLevel;

    // Calcular novo nível se necessário
    while (newXP >= xpToNextLevel) {
      newXP -= xpToNextLevel;
      newLevel += 1;
      xpToNextLevel = DEFAULT_XP_TO_NEXT_LEVEL * newLevel;
    }

    await updateUser({
      xp: newXP,
      level: newLevel,
      xpToNextLevel: xpToNextLevel,
    });
  };

  const completeLesson = async (lessonId: string) => {
    if (!user) return;
    
    // Adicionar XP e incrementar lições completadas
    await addXP(150);
    await updateUser({
      lessonsCompleted: user.lessonsCompleted + 1,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        addXP,
        completeLesson,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

