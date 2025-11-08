// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import React from 'react';

// Este componente diz: "Tudo aqui dentro terá abas na parte inferior"
export default function TabLayout() {
  return (
    <Tabs>
      {/* Rotas que você tem dentro de (tabs) */}
      <Tabs.Screen 
        name="index" 
        options={{ title: 'Home', headerShown: false }} 
      />
      {/* Adicione outras rotas de tabs aqui quando criar */}
    </Tabs>
  );
}