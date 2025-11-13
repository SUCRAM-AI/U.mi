/**
 * Tela de Música - Modo música com detecção de acordes
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '@contexts/AuthContext';
import MenuIcon from '@assets/images/config.svg';
import IconeConfig from '@assets/images/people.svg';
import IconeNotas from '@assets/images/icongray.svg';
import Iconeloja from '@assets/images/loja.svg';
import Perfilp from '@assets/images/perfilp.svg';
import TrilhaIcon from '@assets/images/trilhateorica.svg';
import BottomNav from '@components/ui/bottom-nav';

export default function Musica() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      {/* Header Fixo */}
      <View style={styles.header}>
        <View style={styles.button2}>
          <View style={styles.headerIconContainer}>
            <MenuIcon width={45} height={45} style={styles.headerIcon} />
          </View>
        </View>
        <Text style={styles.title}>Música</Text>
        <View style={styles.button3}>
          <View style={styles.headerIconContainer}>
            <IconeConfig width={32} height={32} style={styles.headerIcon} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.subtitle}>Modo Música</Text>
          <Text style={styles.description}>
            Faça upload de uma música e pratique tocando junto com ela!
          </Text>
        </View>
      </ScrollView>

      {/* Bottom navigation */}
      <BottomNav
        TrilhaIcon={TrilhaIcon}
        IconeNotas={IconeNotas}
        Iconeloja={Iconeloja}
        Perfilp={Perfilp}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfaff',
  },
  scrollContent: {
    paddingBottom: 100,
    flexGrow: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(245, 245, 247, 0.8)',
    zIndex: 10,
  },
  title: {
    color: '#333333',
    fontFamily: 'SplineSans-Bold',
    fontSize: 18,
    fontWeight: '700',
  },
  button2: {
    backgroundColor: '#ffffff',
    borderRadius: 9999,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button3: {
    backgroundColor: '#ffffff',
    borderRadius: 9999,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  headerIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  content: {
    marginTop: 100,
    padding: 20,
    gap: 16,
  },
  subtitle: {
    fontSize: 24,
    fontFamily: 'Lexend-Bold',
    fontWeight: '700',
    color: '#1F113C',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Lexend',
    color: '#6B7280',
    lineHeight: 24,
  },
});
