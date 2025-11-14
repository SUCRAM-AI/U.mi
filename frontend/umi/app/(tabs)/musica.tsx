/**
 * Tela de Música - Buscar e visualizar cifras do Cifra Club
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@contexts/AuthContext';
import MenuIcon from '@assets/images/config.svg';
import IconeConfig from '@assets/images/people.svg';
import IconeNotas from '@assets/images/icongray.svg';
import Iconeloja from '@assets/images/loja.svg';
import Perfilp from '@assets/images/perfilp.svg';
import TrilhaIcon from '@assets/images/trilhateorica.svg';
import BottomNav from '@components/ui/bottom-nav';
import { CifraSearch } from '@components/cifra-search';
import { CifraViewer } from '@components/cifra-viewer';
import { CifraClubResponse } from '@services/api';
import SettingsModal from '@components/settings-modal';

export default function Musica() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [cifra, setCifra] = useState<CifraClubResponse | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const handleCifraFound = (foundCifra: CifraClubResponse) => {
    setCifra(foundCifra);
  };

  const handleCloseCifra = () => {
    setCifra(null);
  };

  const handleSettingsPress = () => {
    setSettingsVisible(true);
  };

  const handleCloseSettings = () => {
    setSettingsVisible(false);
  };

  const handleAbout = () => {
    setSettingsVisible(false);
    Alert.alert('Sobre', 'U.Mi - Aplicativo de aprendizado musical');
  };

  const handleLogout = async () => {
    setSettingsVisible(false);
    await logout();
    router.replace('/login');
  };

  // Se há uma cifra carregada, mostrar o visualizador
  if (cifra) {
    return <CifraViewer cifra={cifra} onClose={handleCloseCifra} />;
  }

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
        <TouchableOpacity style={styles.button3} onPress={handleSettingsPress}>
          <View style={styles.headerIconContainer}>
            <IconeConfig width={32} height={32} style={styles.headerIcon} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CifraSearch onCifraFound={handleCifraFound} />
      </ScrollView>

      {/* Bottom navigation */}
      <BottomNav
        TrilhaIcon={TrilhaIcon}
        IconeNotas={IconeNotas}
        Iconeloja={Iconeloja}
        Perfilp={Perfilp}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={settingsVisible}
        onClose={handleCloseSettings}
        onPressAbout={handleAbout}
        onPressLogout={handleLogout}
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
    paddingTop: 80,
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
