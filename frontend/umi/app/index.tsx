import { Redirect } from 'expo-router';
import React from 'react';
import { useAuth } from '@contexts/AuthContext';

// Redireciona baseado no estado de autenticação
export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return null; // Ou um componente de loading
  }
  
  // Sempre começa na tela de login (primeira tela)
  return <Redirect href="/login" />;
}