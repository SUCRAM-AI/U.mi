import { Redirect } from 'expo-router';
import React from 'react';
import { useAuth } from '@contexts/AuthContext';

// Redireciona baseado no estado de autenticação
export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return null; // Ou um componente de loading
  }
  
  // Se autenticado, vai direto para a trilha teórica
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/trilha" />;
  }
  
  // Se não autenticado, vai para o login
  return <Redirect href="/login" />;
}