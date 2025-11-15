// app/_layout.tsx

import { Stack } from 'expo-router';
import React from 'react';
import { AuthProvider, useAuth } from '@contexts/AuthContext';
import ChatBot from '@components/ChatBot';
import { usePathname } from 'expo-router';

function ChatBotWrapper() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  
  // Não mostrar chatbot em telas de autenticação
  const hideChatbot = pathname === '/login' || 
                      pathname === '/cadastro' || 
                      pathname === '/senha' ||
                      pathname === '/verificar-token' ||
                      pathname === '/nova-senha' ||
                      !isAuthenticated;
  
  if (hideChatbot) return null;
  
  return <ChatBot />;
}

function AppContent() {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> 
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro" options={{ headerShown: false }} />
        <Stack.Screen name="senha" options={{ headerShown: false }} />
        <Stack.Screen name="verificar-token" options={{ headerShown: false }} />
        <Stack.Screen name="nova-senha" options={{ headerShown: false }} />
        <Stack.Screen name="sections/[sectionId]" options={{ headerShown: false }} />
        <Stack.Screen name="lesson/[lessonId]" options={{ headerShown: false }} />
      </Stack>
      <ChatBotWrapper />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}