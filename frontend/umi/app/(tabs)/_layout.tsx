// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import React from 'react';

// Este componente diz: "Tudo aqui dentro terá abas na parte inferior"
export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen 
        name="cadastro" 
        options={{ title: 'Cadastro' }}
      />
      <Tabs.Screen 
        name="licao" 
        options={{ title: 'Lição' }}
      />
      <Tabs.Screen 
        name="login" 
        options={{ title: 'Login' }}
      />
      <Tabs.Screen 
        name="nivel" 
        options={{ title: 'Nível' }}
      />
      <Tabs.Screen 
        name="senha" 
        options={{ title: 'Senha' }}
      />
      <Tabs.Screen 
        name="trilha" 
        options={{ title: 'Trilha' }}
      />
    </Tabs>
  );
}