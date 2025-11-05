// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import React from 'react';

// Este componente diz: "Tudo aqui dentro terá abas na parte inferior"
export default function TabLayout() {
  return (
    <Tabs>
      {/* Rotas que você tem dentro de (tabs), ex:
        - app/(tabs)/index.tsx
        - app/(tabs)/explore.tsx 
      */}
      <Tabs.Screen 
        name="index" 
        options={{ title: 'Home' }} // Título do botão da aba
      />
      <Tabs.Screen 
        name="explore" 
        options={{ title: 'Explorar' }} // Título do botão da aba
      />
      {/* ⚠️ Remova o arquivo app/(tabs)/login.tsx se ele existir! 
        O login não deve estar dentro das abas.
      */}
    </Tabs>
  );
}