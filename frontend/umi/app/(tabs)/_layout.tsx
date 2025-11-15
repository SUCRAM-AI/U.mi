// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

// Este componente diz: "Tudo aqui dentro terá abas na parte inferior"
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Esconder tab bar nativo (usamos BottomNav customizado)
      }}
    >
      <Tabs.Screen 
        name="trilha" 
        options={{ 
          title: 'Trilha',
          tabBarLabel: 'Trilha',
        }}
      />
      <Tabs.Screen 
        name="musica" 
        options={{ 
          title: 'Música',
          tabBarLabel: 'Música',
        }}
      />
      <Tabs.Screen 
        name="loja" 
        options={{ 
          title: 'Loja',
          tabBarLabel: 'Loja',
        }}
      />
      <Tabs.Screen 
        name="perfil" 
        options={{ 
          title: 'Perfil',
          tabBarLabel: 'Perfil',
        }}
      />
    </Tabs>
  );
}