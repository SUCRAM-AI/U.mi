import { Redirect } from 'expo-router';
import React from 'react';

export default function Index() {
  // Redireciona para a tela de login
  return <Redirect href="/login" />;
}