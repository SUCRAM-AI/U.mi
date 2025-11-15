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
  completedLessons: string[]; // Array de IDs de lições completadas (ex: ['1.1', '1.2', '2.1'])
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
  updateUserProgress?: (lessonId: string, xpReward: number) => Promise<void>;
  generatePasswordResetToken: (email: string) => Promise<string | null>;
  verifyPasswordResetToken: (email: string, token: string) => Promise<boolean>;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = '@umi_user';
const USERS_STORAGE_KEY = '@umi_users'; // Armazena todos os usuários cadastrados
const RESET_TOKENS_KEY = '@umi_reset_tokens'; // Armazena tokens de recuperação de senha
const DEFAULT_XP_TO_NEXT_LEVEL = 2000;

// Interface para usuário com senha (armazenado no banco)
interface UserWithPassword {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Hash da senha
  level: number;
  xp: number;
  xpToNextLevel: number;
  lessonsCompleted: number;
  completedLessons: string[];
  practiceStreak: number;
  instrument: string;
  achievements: string[];
}

// Função simples de hash para senhas (em produção, usar bcrypt ou similar)
const hashPassword = (password: string): string => {
  // Hash simples baseado em string (em produção, usar biblioteca de hash real)
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

// Carregar todos os usuários do storage
const loadAllUsers = async (): Promise<UserWithPassword[]> => {
  try {
    const storedUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
    return [];
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    return [];
  }
};

// Salvar todos os usuários no storage
const saveAllUsers = async (users: UserWithPassword[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Erro ao salvar usuários:', error);
  }
};

// Interface para tokens de recuperação de senha
interface ResetToken {
  email: string;
  token: string;
  expiresAt: number; // Timestamp de expiração (10 minutos)
}

// Carregar tokens de recuperação
const loadResetTokens = async (): Promise<ResetToken[]> => {
  try {
    const stored = await AsyncStorage.getItem(RESET_TOKENS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Erro ao carregar tokens:', error);
    return [];
  }
};

// Salvar tokens de recuperação
const saveResetTokens = async (tokens: ResetToken[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.error('Erro ao salvar tokens:', error);
  }
};

// Gerar token aleatório de 6 dígitos
const generateRandomToken = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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
        const userData = JSON.parse(storedUser);
        // Garantir compatibilidade com usuários antigos que não têm completedLessons
        if (!userData.completedLessons) {
          userData.completedLessons = [];
        }
        
        // Se o usuário não é convidado, carregar dados atualizados do banco
        if (!userData.id.startsWith('guest_')) {
          const allUsers = await loadAllUsers();
          const userInDb = allUsers.find((u) => u.id === userData.id || u.email.toLowerCase() === userData.email.toLowerCase());
          
          if (userInDb) {
            // Atualizar com dados do banco (progresso, XP, etc.)
            userData.level = userInDb.level;
            userData.xp = userInDb.xp;
            userData.xpToNextLevel = userInDb.xpToNextLevel;
            userData.lessonsCompleted = userInDb.lessonsCompleted;
            userData.completedLessons = userInDb.completedLessons || [];
            userData.practiceStreak = userInDb.practiceStreak;
            userData.instrument = userInDb.instrument;
            userData.achievements = userInDb.achievements;
            // Salvar dados atualizados
            await saveUser(userData);
          }
        }
        
        setUser(userData);
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
      // Se for modo convidado (sem senha), criar usuário convidado
      if (email === 'convidado@umi.com' || !password) {
        const guestUser: User = {
          id: `guest_${Date.now()}`,
          name: 'Convidado',
          email: email || 'convidado@umi.com',
          level: 1,
          xp: 0,
          xpToNextLevel: DEFAULT_XP_TO_NEXT_LEVEL,
          lessonsCompleted: 0,
          completedLessons: [],
          practiceStreak: 0,
          instrument: 'Violão',
          achievements: [],
        };
        await saveUser(guestUser);
        return true;
      }

      // Buscar usuário no banco de dados
      const allUsers = await loadAllUsers();
      const passwordHash = hashPassword(password);
      
      // Procurar usuário com email e senha corretos
      const foundUser = allUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === passwordHash
      );

      if (foundUser) {
        // Converter UserWithPassword para User (remover passwordHash)
        // Carregar dados atualizados do banco (progresso, XP, lições completadas, etc.)
        const userData: User = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          level: foundUser.level,
          xp: foundUser.xp,
          xpToNextLevel: foundUser.xpToNextLevel,
          lessonsCompleted: foundUser.lessonsCompleted,
          completedLessons: foundUser.completedLessons || [],
          practiceStreak: foundUser.practiceStreak,
          instrument: foundUser.instrument,
          achievements: foundUser.achievements || [],
        };
        await saveUser(userData);
        return true;
      }

      return false; // Email ou senha incorretos
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Validar entrada
      if (!name.trim() || !email.trim() || !password.trim()) {
        return false;
      }

      // Carregar todos os usuários
      const allUsers = await loadAllUsers();
      
      // Verificar se email já existe
      const emailExists = allUsers.some(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (emailExists) {
        return false; // Email já cadastrado
      }

      // Criar novo usuário com senha hash
      const passwordHash = hashPassword(password);
      const newUserWithPassword: UserWithPassword = {
        id: `user_${Date.now()}`,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: passwordHash,
        level: 1,
        xp: 0,
        xpToNextLevel: DEFAULT_XP_TO_NEXT_LEVEL,
        lessonsCompleted: 0,
        completedLessons: [],
        practiceStreak: 0,
        instrument: 'Violão',
        achievements: [],
      };

      // Adicionar ao banco de usuários
      allUsers.push(newUserWithPassword);
      await saveAllUsers(allUsers);

      // Criar User sem senha para salvar como usuário atual
      const newUser: User = {
        id: newUserWithPassword.id,
        name: newUserWithPassword.name,
        email: newUserWithPassword.email,
        level: newUserWithPassword.level,
        xp: newUserWithPassword.xp,
        xpToNextLevel: newUserWithPassword.xpToNextLevel,
        lessonsCompleted: newUserWithPassword.lessonsCompleted,
        completedLessons: newUserWithPassword.completedLessons,
        practiceStreak: newUserWithPassword.practiceStreak,
        instrument: newUserWithPassword.instrument,
        achievements: newUserWithPassword.achievements,
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
    
    // Também atualizar no banco de usuários (se o usuário estiver cadastrado)
    try {
      const allUsers = await loadAllUsers();
      const userIndex = allUsers.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        // Atualizar dados do usuário no banco (sem alterar senha)
        allUsers[userIndex] = {
          ...allUsers[userIndex],
          name: updatedUser.name,
          email: updatedUser.email,
          level: updatedUser.level,
          xp: updatedUser.xp,
          xpToNextLevel: updatedUser.xpToNextLevel,
          lessonsCompleted: updatedUser.lessonsCompleted,
          completedLessons: updatedUser.completedLessons || [],
          practiceStreak: updatedUser.practiceStreak,
          instrument: updatedUser.instrument,
          achievements: updatedUser.achievements,
        };
        await saveAllUsers(allUsers);
      } else if (!user.id.startsWith('guest_')) {
        // Se não encontrou mas não é convidado, pode ser um usuário antigo
        // Tentar encontrar por email
        const userByEmail = allUsers.find((u) => u.email.toLowerCase() === user.email.toLowerCase());
        if (userByEmail) {
          // Atualizar o usuário encontrado por email
          const emailIndex = allUsers.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
          allUsers[emailIndex] = {
            ...allUsers[emailIndex],
            name: updatedUser.name,
            email: updatedUser.email,
            level: updatedUser.level,
            xp: updatedUser.xp,
            xpToNextLevel: updatedUser.xpToNextLevel,
            lessonsCompleted: updatedUser.lessonsCompleted,
            completedLessons: updatedUser.completedLessons || [],
            practiceStreak: updatedUser.practiceStreak,
            instrument: updatedUser.instrument,
            achievements: updatedUser.achievements,
          };
          await saveAllUsers(allUsers);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário no banco:', error);
    }
  };

  const addXP = async (amount: number) => {
    if (!user) return;
    
    // Carregar dados mais recentes do banco antes de atualizar (para usuários cadastrados)
    let currentUser = user;
    if (!user.id.startsWith('guest_')) {
      try {
        const allUsers = await loadAllUsers();
        const userInDb = allUsers.find((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
        if (userInDb) {
          // Usar dados do banco para garantir sincronização
          currentUser = {
            ...user,
            level: userInDb.level,
            xp: userInDb.xp,
            xpToNextLevel: userInDb.xpToNextLevel,
          };
        }
      } catch (error) {
        console.error('Erro ao carregar dados do banco para addXP:', error);
      }
    }
    
    let newXP = currentUser.xp + amount;
    let newLevel = currentUser.level;
    let xpToNextLevel = currentUser.xpToNextLevel;

    // Calcular novo nível se necessário
    while (newXP >= xpToNextLevel) {
      newXP -= xpToNextLevel;
      newLevel += 1;
      xpToNextLevel = DEFAULT_XP_TO_NEXT_LEVEL * newLevel;
    }

    // Atualizar no banco de usuários e no usuário atual
    await updateUser({
      xp: newXP,
      level: newLevel,
      xpToNextLevel: xpToNextLevel,
    });
  };

  const completeLesson = async (lessonId: string) => {
    if (!user) return;
    
    // Verificar se a lição já foi completada
    const completedLessons = user.completedLessons || [];
    if (completedLessons.includes(lessonId)) {
      return; // Lição já foi completada
    }
    
    // Adicionar XP primeiro
    await addXP(150);
    
    // Aguardar um pouco para garantir que o estado foi atualizado
    // Carregar dados atualizados do banco se for usuário cadastrado
    let currentUser = user;
    if (!user.id.startsWith('guest_')) {
      try {
        const allUsers = await loadAllUsers();
        const userInDb = allUsers.find((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
        if (userInDb) {
          currentUser = {
            ...user,
            level: userInDb.level,
            xp: userInDb.xp,
            xpToNextLevel: userInDb.xpToNextLevel,
            lessonsCompleted: userInDb.lessonsCompleted,
            completedLessons: userInDb.completedLessons || [],
          };
        }
      } catch (error) {
        console.error('Erro ao carregar dados do banco:', error);
      }
    }
    
    // Atualizar usuário (updateUser já atualiza o banco de usuários)
    await updateUser({
      lessonsCompleted: currentUser.lessonsCompleted + 1,
      completedLessons: [...(currentUser.completedLessons || []), lessonId],
    });
  };

  const updateUserProgress = async (lessonId: string, xpReward: number) => {
    if (!user) return;
    
    // Verificar se a lição já foi completada
    const completedLessons = user.completedLessons || [];
    if (completedLessons.includes(lessonId)) {
      return; // Lição já foi completada
    }
    
    // Adicionar XP primeiro
    await addXP(xpReward);
    
    // Aguardar um pouco para garantir que o estado foi atualizado
    // Carregar dados atualizados do banco se for usuário cadastrado
    let currentUser = user;
    if (!user.id.startsWith('guest_')) {
      try {
        const allUsers = await loadAllUsers();
        const userInDb = allUsers.find((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
        if (userInDb) {
          currentUser = {
            ...user,
            level: userInDb.level,
            xp: userInDb.xp,
            xpToNextLevel: userInDb.xpToNextLevel,
            lessonsCompleted: userInDb.lessonsCompleted,
            completedLessons: userInDb.completedLessons || [],
          };
        }
      } catch (error) {
        console.error('Erro ao carregar dados do banco:', error);
      }
    }
    
    // Atualizar usuário (updateUser já atualiza o banco de usuários)
    await updateUser({
      lessonsCompleted: currentUser.lessonsCompleted + 1,
      completedLessons: [...(currentUser.completedLessons || []), lessonId],
    });
  };

  const generatePasswordResetToken = async (email: string): Promise<string | null> => {
    try {
      // Verificar se o email existe
      const allUsers = await loadAllUsers();
      const userExists = allUsers.some(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (!userExists) {
        return null; // Email não encontrado
      }

      // Gerar token
      const token = generateRandomToken();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutos

      // Carregar tokens existentes e remover tokens expirados
      let tokens = await loadResetTokens();
      tokens = tokens.filter((t) => t.expiresAt > Date.now());

      // Remover token antigo do mesmo email se existir
      tokens = tokens.filter((t) => t.email.toLowerCase() !== email.toLowerCase());

      // Adicionar novo token
      tokens.push({
        email: email.toLowerCase(),
        token,
        expiresAt,
      });

      await saveResetTokens(tokens);

      // Em produção, aqui enviaria o email com o token
      // Por enquanto, vamos apenas retornar o token (para desenvolvimento/teste)
      console.log(`[DEV] Token de recuperação para ${email}: ${token}`);
      
      return token;
    } catch (error) {
      console.error('Erro ao gerar token:', error);
      return null;
    }
  };

  const verifyPasswordResetToken = async (email: string, token: string): Promise<boolean> => {
    try {
      const tokens = await loadResetTokens();
      
      // Remover tokens expirados
      const validTokens = tokens.filter((t) => t.expiresAt > Date.now());
      await saveResetTokens(validTokens);

      // Verificar se o token existe e é válido
      const foundToken = validTokens.find(
        (t) => t.email.toLowerCase() === email.toLowerCase() && t.token === token
      );

      return !!foundToken;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return false;
    }
  };

  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    try {
      if (!newPassword.trim() || newPassword.length < 6) {
        return false;
      }

      const allUsers = await loadAllUsers();
      const userIndex = allUsers.findIndex(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (userIndex === -1) {
        return false; // Usuário não encontrado
      }

      // Atualizar senha
      const passwordHash = hashPassword(newPassword);
      allUsers[userIndex].passwordHash = passwordHash;

      await saveAllUsers(allUsers);

      // Remover token usado
      let tokens = await loadResetTokens();
      tokens = tokens.filter(
        (t) => !(t.email.toLowerCase() === email.toLowerCase())
      );
      await saveResetTokens(tokens);

      return true;
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      return false;
    }
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
        updateUserProgress,
        generatePasswordResetToken,
        verifyPasswordResetToken,
        resetPassword,
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

