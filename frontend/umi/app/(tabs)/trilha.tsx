import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@contexts/AuthContext';
import SettingsModal from '@components/settings-modal';
import { getLessonsBySection } from '@config/lessons';


// Recursos SVG (Importados como Componentes)
import MascoteProgresso from '@assets/images/trilhalyrics.svg';
import LinhaDaTrilha from '@assets/images/linhatrilha.svg';
import IconeNota from '@assets/images/iconmusic.svg';
import BadgeEstrela from '@assets/images/3star.svg'; // Badge de estrela unificado
import IconeIntervalos from '@assets/images/clock.svg';
import IconeEscalas from '@assets/images/escalas.svg';
import IconeAcordes from '@assets/images/acordesb.svg';
import IconeCadeadoCinza from '@assets/images/cadeadocinza.svg'; // Usado no círculo de acordes
import IconeHarmonia from '@assets/images/harmonia.svg';
import IconeCadeadoHarmonia from '@assets/images/cadeadocinza.svg'; // Usado no círculo de harmonia
import IconeProgresso from '@assets/images/progresso.svg'; // Lição 3
import MenuIcon from '@assets/images/people.svg'; // Menu Header
import IconeConfig from '@assets/images/config.svg'; // Config Header
import IconeNotas from '@assets/images/icongray.svg';
import Perfilp from '@assets/images/perfilp.svg';
import TrilhaIcon from '@assets/images/trilhateorica.svg'; 
import BottomNav from '@components/ui/bottom-nav';

const TrilhaTeoria = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [settingsVisible, setSettingsVisible] = useState(false);
  
  const progressPercentage = user ? (user.lessonsCompleted / 5) * 100 : 0;

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
  
  // Verificar se todas as lições de uma seção foram completadas
  const isSectionCompleted = (sectionNumber: number): boolean => {
    if (!user || !user.completedLessons) return false;
    
    const sectionLessons = getLessonsBySection(sectionNumber.toString());
    if (sectionLessons.length === 0) return false;
    
    // Verificar se todas as lições da seção foram completadas
    return sectionLessons.every((lesson: any) => 
      user.completedLessons.includes(lesson.id)
    );
  };

  // Determinar o estado de cada seção baseado no progresso
  const getSectionStatus = (sectionNumber: number) => {
    // Seção 1 sempre está disponível
    if (sectionNumber === 1) {
      const completed = isSectionCompleted(1);
      return completed ? 'completed' : 'in_progress';
    }
    
    // Verificar se a seção anterior foi concluída
    const previousSectionCompleted = isSectionCompleted(sectionNumber - 1);
    
    if (!previousSectionCompleted) {
      return 'locked'; // Bloqueada se a seção anterior não foi completada
    }
    
    // Se a seção anterior foi completada, esta seção está disponível
    const currentSectionCompleted = isSectionCompleted(sectionNumber);
    return currentSectionCompleted ? 'completed' : 'in_progress';
  };

  const handleSectionClick = (sectionNumber: number) => {
    const status = getSectionStatus(sectionNumber);
    if (status === 'locked') {
      return; // Não fazer nada se estiver bloqueada
    }
    // Navegar para a página da seção correspondente
    router.push(`/sections/${sectionNumber}` as any);
  };
  
  return (
    <View style={styles.trilha}>
      {/* Header Fixo */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.button2} onPress={handleSettingsPress}>
          <View style={styles.headerIconContainer}>
            <IconeConfig width={32} height={32} style={styles.headerIcon} />
          </View>
        </TouchableOpacity>
        <Text style={styles.trilhaTeoria}>Trilha Teórica</Text>
        <View style={styles.button3}>
          <View style={styles.headerIconContainer}>
            <MenuIcon width={32} height={32} style={styles.headerIcon} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.main}>
            {/* Bloco de Progresso */}
            <View style={styles.background}>
              <MascoteProgresso
                width={100}
                height={110}
                style={styles.unnamedRemovebgPreview1}
              />
              <View style={styles.progressTextContainer}>
                <Text style={styles.seuProgresso45}>
                  Seu Progresso: {Math.round(progressPercentage)}%
                </Text>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
                  </View>
                </View>
                <Text style={styles.cadaLicaoUmPassoEmDirecaoMaestria}>
                  Cada lição é um passo em direção à maestria!
                </Text>
              </View>
            </View>

            {/* Container da Trilha de Lições */}
            <View style={styles.container2}>
              {/* Linha da Trilha - Parte 1: do meio da bola 1 até o meio da bola 3 */}
              <LinhaDaTrilha width={80} height={424} style={styles.svg1} preserveAspectRatio="none" />
              {/* Linha da Trilha - Parte 2: do meio da bola 3 até o final */}
              <LinhaDaTrilha width={80} height={424} style={styles.svg2} preserveAspectRatio="none" />

              {/* Lição 1: Fundamentos Físicos (Em Progresso Cor Laranja) */}
              <TouchableOpacity onPress={() => handleSectionClick(1)}>
                <LinearGradient
                  colors={['rgba(251, 191, 36, 1)', 'rgba(249, 115, 22, 1)']}
                  start={{ x: 0.0, y: 0.0 }}
                  end={{ x: 1.0, y: 1.0 }}
                  style={[styles.lessonCircle, styles.pos1]}>
                  <IconeNota width={48} height={58} style={styles.icon} />
                </LinearGradient>
              </TouchableOpacity>
              <Text style={[styles.lessonText, styles.pos1Text, { color: '#f97316' }]}>Fundamentos Físicos</Text>
              <Text style={[styles.pos1SubText]}>Em Progresso</Text>


              {/* Lição 2: Base Harmônica (Bloqueada Cinza Opaco) */}
              <View style={[styles.backgroundShadow7, styles.pos2]}>
                <IconeIntervalos width={48} height={58} style={styles.icon} />
                <View style={styles.backgroundShadow8}>
                  <IconeCadeadoCinza width={30} height={36} />
                </View>
              </View>
              <Text style={[styles.lessonText, styles.pos2Text]}>Base Harmônica</Text>
              <Text style={[styles.pos2SubText]}>Fechado</Text>


              {/* Lição 3: O Motor Rítmico (Bloqueada Cinza Opaco) */}
              <View style={[styles.backgroundShadow7, styles.pos3]}>
                <IconeEscalas width={48} height={58} style={styles.icon} />
                <View style={styles.backgroundShadow8}>
                  <IconeCadeadoCinza width={30} height={36} />
                </View>
              </View>
              <Text style={[styles.lessonText, styles.pos3Text]}>O Motor Rítmico</Text>
              <Text style={[styles.pos3SubText]}>Fechado</Text>

              {/* Lição 4: Gigantes do PoP (Fechada Cinza Opaco) */}
              <View style={[styles.backgroundShadow7, styles.pos4]}>
                <IconeAcordes width={48} height={58} style={styles.icon} />
                <View style={styles.backgroundShadow8}>
                  <IconeCadeadoCinza width={30} height={36} />
                </View>
              </View>
              <Text style={[styles.lessonText, styles.pos4Text]}>Gigantes do PoP</Text>
              <Text style={[styles.pos4SubText]}>Fechado</Text>


              {/* Lição 5: Consolidar (Fechada Cinza Opaco) */}
              <View style={[styles.backgroundShadow7, styles.pos5]}>
                <IconeHarmonia width={48} height={58} style={styles.icon} />
                <View style={styles.backgroundShadow8}>
                  <IconeCadeadoHarmonia width={30} height={36} />
                </View>
              </View>
              <Text style={[styles.lessonText, styles.pos5Text]}>Consolidar</Text>
              <Text style={[styles.pos5SubText]}>Fechado</Text>

            </View>
          </View>
        </View>
      </ScrollView>
  {/* Bottom navigation */}
  <BottomNav TrilhaIcon={TrilhaIcon} IconeNotas={IconeNotas} Perfilp={Perfilp} />
      
      {/* Settings Modal */}
      <SettingsModal
        visible={settingsVisible}
        onClose={handleCloseSettings}
        onPressAbout={handleAbout}
        onPressLogout={handleLogout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // Base
  trilha: {
    flex: 1,
    backgroundColor: '#fbfaff',
  },
  scrollContent: {
    paddingBottom: 120, // Espaço após o último botão para permitir scroll completo
    flexGrow: 1,
  },
  container: {
    paddingTop: Platform.OS === 'ios' ? 116 : 96, // Espaço para o Header + Status Bar (iOS: 44+72, Android: 24+72)
  },
  main: {
    paddingHorizontal: 16,
    paddingTop: 16,
    alignItems: 'center',
    width: '100%',
  },

  // Header (Fixo no topo fora do ScrollView)
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 44 : 24, // Safe area para iOS, StatusBar para Android
    height: Platform.OS === 'ios' ? 116 : 96, // paddingTop + 72 (altura do header)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(245, 245, 247, 0.8)',
    zIndex: 10,
    ...(Platform.OS === 'ios' ? { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3 } : { elevation: 3 }),
  },
  trilhaTeoria: {
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
  icon21: { width: 24, height: 28, resizeMode: 'contain' },
  icon22: { width: 24, height: 28, resizeMode: 'contain' },
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

  // Bloco de Progresso
  background: {
    backgroundColor: '#f5f3ff',
    borderRadius: 32,
    minHeight: 55,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    overflow: 'hidden',
  },
  progressTextContainer: {
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingRight: 8,
  },
  seuProgresso45: {
    color: '#7e22ce',
    fontFamily: 'Lexend-Bold', 
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    width: '100%',
    lineHeight: 26,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 8,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#7e22ce',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  cadaLicaoUmPassoEmDirecaoMaestria: {
    color: '#4a4a68',
    fontFamily: 'Lexend-Regular', 
    fontSize: 15,
    fontWeight: '400',
    width: '100%',
    lineHeight: 22,
    marginTop: 4,
  },
  unnamedRemovebgPreview1: {
    width: 100,
    height: 110,
    resizeMode: 'contain',
    flexShrink: 0,
    marginLeft: 0,
  },

  // Container da Trilha
  container2: {
    minHeight: 1020, // Altura suficiente para incluir o último botão (pos5SubText em top: 960 + espaço)
    alignItems: 'center',
    paddingHorizontal: 0,
    position: 'relative',
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'flex-start',
    paddingBottom: 40, // Espaço extra após o último botão
  },
  svg1: {
    width: 80,
    height: 424, // Do meio da bola 1 (40px) até o meio da bola 3 (464px) = 424px
    position: 'absolute',
    left: '50%',
    marginLeft: -45, // Centraliza a linha 
    top: 40, // Inicia no meio da primeira bola (0 + 40)
    resizeMode: 'stretch',
  },
  svg2: {
    width: 80,
    height: 424, // Do meio da bola 3 (464px) até aproximadamente o meio da bola 5 (888px) = 424px
    position: 'absolute',
    left: '50%',
    marginLeft: -45, // Centraliza a linha 
    top: 464, // Inicia no meio da terceira bola (424 + 40)
    resizeMode: 'stretch',
  },

  // --- Estilos Comuns de Lições ---
  lessonCircle: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    position: 'absolute',
  },
  lessonText: {
    color: '#1e1b23',
    fontFamily: 'Lexend-SemiBold', 
    fontSize: 16,
    fontWeight: '600',
    position: 'absolute',
    textAlign: 'center',
    width: 150,
    zIndex: 10,
  },
  lessonRect: {
    backgroundColor: '#d9d9d9',
    borderRadius: 5,
    height: 18,
    position: 'absolute',
    width: 140,
    marginLeft: -70, // Centraliza o retângulo
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 9999,
    backgroundColor: '#ffc700',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: { width: 48, height: 58, resizeMode: 'contain', zIndex: 1 },
  badgeIcon: { 
    width: 24, 
    height: 24, 
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  icon18: { width: 16, height: 16, resizeMode: 'contain', alignSelf: 'center' },

  // Posições das Lições 
  // Lição 1: Notas Musicais
  backgroundShadow: { 
    width: 80,
    height: 80,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    position: 'absolute',
    backgroundColor: 'transparent' 
  },
  pos1: { top: 0, alignSelf: 'center' },
  pos1Text: { top: 88, textAlign: 'center', zIndex: 10, alignSelf: 'center', width: '100%', paddingHorizontal: 16 },
  pos1SubText: { position: 'absolute', top: 110, color: '#6b7280', fontSize: 14, fontWeight: '500', width: '100%', textAlign: 'center', zIndex: 10, alignSelf: 'center', paddingHorizontal: 16 },
  pos1Rect: { top: 91, left: '50%', marginLeft: -68, width: 136 },
  pos1Badge: { 
    width: 28, 
    height: 28, 
    borderRadius: 9999, 
    position: 'absolute', 
    right: -8, 
    top: -8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 10, // Para Android
  },

  // Lição 2: Intervalos
  backgroundShadow3: { 
    width: 80,
    height: 80,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    position: 'absolute',
    backgroundColor: 'transparent' 
  },
  pos2: { top: 212, left: '50%', marginLeft: -40, alignSelf: 'center' },
  pos2Text: { 
    color: '#4a4a68',
    fontFamily: 'Lexend-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    position: 'absolute',
    textAlign: 'center',
    width: 138,
    opacity: 0.6,
    top: 300, 
    left: '50%', 
    marginLeft: -69,
    alignSelf: 'center'
  },
  pos2SubText: { position: 'absolute', top: 324, left: '50%', marginLeft: -69, color: '#6b7280', opacity: 0.6, fontSize: 14, fontWeight: '500', width: 138, textAlign: 'center', zIndex: 10, alignSelf: 'center' },
  pos2Rect: { top: 303, left: '50%', marginLeft: -46.5, width: 93 },

  // Lição 3: Escolas Maiores (Em Progresso)
  backgroundShadow5: { 
    width: 80,
    height: 80,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    position: 'absolute',
    backgroundColor: 'transparent' 
  },
  pos3: { top: 424, left: '50%', marginLeft: -40, alignSelf: 'center' },
  pos3Text: { 
    color: '#4a4a68',
    fontFamily: 'Lexend-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    position: 'absolute',
    textAlign: 'center',
    width: 139,
    opacity: 0.6,
    top: 514, 
    left: '50%', 
    marginLeft: -69.5,
    alignSelf: 'center'
  },
  pos3SubText: { position: 'absolute', top: 536, left: '50%', marginLeft: -69.5, color: '#6b7280', opacity: 0.6, fontSize: 14, fontWeight: '500', width: 139, textAlign: 'center', zIndex: 10, alignSelf: 'center' },
  pos3Rect: { top: 517, left: '50%', marginLeft: -68, width: 136 },

  // Lição 4: Acordes Básicos (Fechada)
  backgroundShadow7: { 
    width: 80,
    height: 80,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    position: 'absolute',
    backgroundColor: '#cbd5e1'
  },
  backgroundShadow8: { 
    width: 40, 
    height: 40, 
    borderRadius: 9999, 
    backgroundColor: '#64748b', 
    position: 'absolute', 
    right: -12, 
    top: -12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  lockIcon: { width: 30, height: 36, resizeMode: 'contain' },
  pos4: { top: 636, left: '50%', marginLeft: -40, alignSelf: 'center' },
  pos4Text: { 
    color: '#4a4a68',
    fontFamily: 'Lexend-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    position: 'absolute',
    textAlign: 'center',
    width: 138,
    opacity: 0.6,
    top: 724, 
    left: '50%', 
    marginLeft: -69,
    alignSelf: 'center'
  },
  pos4SubText: { position: 'absolute', top: 748, left: '50%', marginLeft: -69, color: '#6b7280', opacity: 0.6, fontSize: 14, fontWeight: '500', width: 138, textAlign: 'center', zIndex: 10, alignSelf: 'center' },

  // Lição 5: Harmonia (Fechada)
  backgroundShadow9: { 
    width: 80,
    height: 80,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    position: 'absolute',
    backgroundColor: '#cbd5e1'
  },
  pos5: { top: 848, left: '50%', marginLeft: -40, alignSelf: 'center' },
  pos5Text: { 
    color: '#4a4a68',
    fontFamily: 'Lexend-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    position: 'absolute',
    textAlign: 'center',
    width: 131,
    opacity: 0.6,
    top: 936, 
    left: '50%', 
    marginLeft: -65.5,
    alignSelf: 'center'
  },
  pos5SubText: { position: 'absolute', top: 960, left: '50%', marginLeft: -65.5, color: '#6b7280', opacity: 0.6, fontSize: 14, fontWeight: '500', width: 131, textAlign: 'center', zIndex: 10, alignSelf: 'center' },
});

export default TrilhaTeoria;
