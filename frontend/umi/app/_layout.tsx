// app/_layout.tsx

import { Stack } from 'expo-router';
import React from 'react';
import { AuthProvider } from '@contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> 
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro" options={{ headerShown: false }} />
        <Stack.Screen name="senha" options={{ headerShown: false }} />
        <Stack.Screen name="nivel" options={{ headerShown: false }} />
        <Stack.Screen name="lesson/[lessonId]" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}