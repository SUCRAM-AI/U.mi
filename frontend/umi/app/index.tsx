import { Redirect } from 'expo-router';
import React from 'react';
// "Vá imediatamente para a rota /login."
export default function Index() {
  // O Expo Router irá substituir a tela atual pela rota "/login"
  return <Redirect href="/cadastro" />;
}