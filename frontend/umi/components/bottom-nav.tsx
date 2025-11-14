import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
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
  return (
    <View style={styles.nav}>
      <View style={styles.container3}>
        <TouchableOpacity style={styles.link}>
          {TrilhaIcon ? <TrilhaIcon width={24} height={28} style={styles.navIconStyle} /> : <Text>📚</Text>}
          <Text style={styles.navText}>Trilha Teórica</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.link2}>
          {IconeNotas ? <IconeNotas width={24} height={28} style={styles.navIconStyle} /> : <Text>🎶</Text>}
          <Text style={styles.navText}>Música</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.link3}>
          {Iconeloja ? <Iconeloja width={24} height={28} style={styles.navIconStyle} /> : <Text>🛒</Text>}
          <Text style={styles.navText}>Loja</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.link4}>
          {Perfilp ? <Perfilp width={24} height={28} style={styles.navIconStyle} /> : <Text>👤</Text>}
          <Text style={styles.navText}>Perfil</Text>
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
  navText: { color: 'rgba(51, 51, 51, 0.7)', fontSize: 12, fontWeight: '500' },
  activeText: { color: '#8A2BE2' },
});
