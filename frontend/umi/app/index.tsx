import { Redirect } from 'expo-router';
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

// Redireciona baseado no estado de autenticação
export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return null; // Ou um componente de loading
  }
  
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/trilha" />;
  }
  
  return <Redirect href="/(tabs)/nivel" />;
}