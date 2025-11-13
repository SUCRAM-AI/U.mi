import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';

// botão de navegação
type IconComponent = React.ComponentType<any> | undefined;

export default function BottomNav({
  TrilhaIcon,
  IconeNotas,
  Iconeloja,
  Perfilp,
}: {
  TrilhaIcon?: IconComponent;
  IconeNotas?: IconComponent;
  Iconeloja?: IconComponent;
  Perfilp?: IconComponent;
}) {
  const router = useRouter();
  const segments = useSegments();

  const isActive = (path: string) => {
    const currentPath = `/${segments.join('/')}`;
    return currentPath.includes(path);
  };

  const getNavTextStyle = (path: string) => {
    return [styles.navText, isActive(path) && styles.activeText];
  };

  const getNavIconStyle = (path: string) => {
    return [styles.navIconStyle, isActive(path) && styles.activeIcon];
  };

  return (
    <View style={styles.nav}>
      <View style={styles.container3}>
        <TouchableOpacity 
          style={styles.link}
          onPress={() => router.push('/(tabs)/trilha')}
        >
          {TrilhaIcon ? (
            <TrilhaIcon 
              width={24} 
              height={28} 
              style={getNavIconStyle('/trilha')} 
            />
          ) : (
            <Text>📚</Text>
          )}
          <Text style={getNavTextStyle('/trilha')}>Trilha Teórica</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.link2}
          onPress={() => router.push('/(tabs)/musica')}
        >
          {IconeNotas ? (
            <IconeNotas 
              width={24} 
              height={28} 
              style={getNavIconStyle('/musica')} 
            />
          ) : (
            <Text>🎶</Text>
          )}
          <Text style={getNavTextStyle('/musica')}>Música</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.link3}
          onPress={() => router.push('/(tabs)/loja')}
        >
          {Iconeloja ? (
            <Iconeloja 
              width={24} 
              height={28} 
              style={getNavIconStyle('/loja')} 
            />
          ) : (
            <Text>🛒</Text>
          )}
          <Text style={getNavTextStyle('/loja')}>Loja</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.link4}
          onPress={() => router.push('/(tabs)/perfil')}
        >
          {Perfilp ? (
            <Perfilp 
              width={24} 
              height={28} 
              style={getNavIconStyle('/perfil')} 
            />
          ) : (
            <Text>👤</Text>
          )}
          <Text style={getNavTextStyle('/perfil')}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    height: 85,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff', // fundo opaco
    borderTopWidth: 1,
    borderTopColor: '#eae0f5',
    alignItems: 'center',
    paddingTop: 10,
  },
  container3: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
    opacity: 1,
  },
  link: { alignItems: 'center', width: 80 },
  link2: { alignItems: 'center', width: 50 },
  link3: { alignItems: 'center', width: 65 },
  link4: { alignItems: 'center', width: 55 },
  navIconStyle: { marginBottom: 4, color: 'rgba(51, 51, 51, 0.7)' },
  activeIcon: { color: '#7C3AED' },
  navText: { color: 'rgba(51, 51, 51, 0.7)', fontSize: 12, fontWeight: '500' },
  activeText: { color: '#7C3AED', fontWeight: '700' },
});
