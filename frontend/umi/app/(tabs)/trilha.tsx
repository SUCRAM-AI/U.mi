import React from 'react';
import { StyleSheet, View, Text, Image, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';


// Recursos SVG (Importados como Componentes)
import MascoteProgresso from '../../assets/images/trilhalyrics.svg';
import LinhaDaTrilha from '../../assets/images/linhatrilha.svg';
import IconeNota from '../../assets/images/iconmusic.svg';
import BadgeEstrela from '../../assets/images/3star.svg'; // Badge de estrela unificado
import IconeIntervalos from '../../assets/images/clock.svg';
import IconeEscalas from '../../assets/images/escalas.svg';
import IconeAcordes from '../../assets/images/acordesb.svg';
import IconeCadeadoCinza from '../../assets/images/cadeadocinza.svg'; // Usado no círculo de acordes
import IconeHarmonia from '../../assets/images/harmonia.svg';
import IconeCadeadoHarmonia from '../../assets/images/cadeadocinza.svg'; // Usado no círculo de harmonia
import IconeProgresso from '../../assets/images/progresso.svg'; // Lição 3
import IconeBloqueio from '../../assets/images/cadeadobranco.svg'; 
import MenuIcon from '../../assets/images/config.svg'; // Menu Header
import IconeConfig from '../../assets/images/people.svg'; // Config Header
import Iconeloja from '../../assets/images/loja.svg';
import IconeNotas from '../../assets/images/icongray.svg';
import Perfilp from '../../assets/images/perfilp.svg';
import TrilhaIcon from '../../assets/images/trilhateorica.svg'; 
import BottomNav from '../../components/ui/bottom-nav';

const TrilhaTeoria = () => {
  return (
    <View style={styles.trilha}>
      {/* Header Fixo */}
      <View style={styles.header}>
        <View style={styles.button2}>
          <View style={styles.headerIconContainer}>
            <MenuIcon width={45} height={45} style={styles.headerIcon} />
          </View>
        </View>
        <Text style={styles.trilhaTeoria}>Trilha Teórica</Text>
        <View style={styles.button3}>
          <View style={styles.headerIconContainer}>
            <IconeConfig width={32} height={32} style={styles.headerIcon} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.main}>
            {/* Bloco de Progresso */}
            <View style={styles.background}>
              <MascoteProgresso
                width={120}
                height={130}
                style={styles.unnamedRemovebgPreview1}
              />
              <View style={styles.progressTextContainer}>
                <Text style={styles.seuProgresso45}>Seu Progresso: 45%</Text>
                <Text style={styles.cadaLicaoUmPassoEmDirecaoMaestria}>
                  Cada lição é um passo em direção à maestria!
                </Text>
              </View>
            </View>

            {/* Container da Trilha de Lições */}
            <View style={styles.container2}>
              {/* Linha da Trilha */}
              <LinhaDaTrilha width={80} height={'100%'} style={styles.svg}preserveAspectRatio="none" />

              {/* Lição 1: Notas Musicais (Concluída Cor Verde) */}
              <LinearGradient
                colors={['rgba(74, 222, 128, 1)', 'rgba(16, 185, 129, 1)']}
                start={{ x: 0.0, y: 0.0 }}
                end={{ x: 1.0, y: 1.0 }}
                style={[styles.lessonCircle, styles.pos1]}>
                <IconeNota width={48} height={58} style={styles.icon} />
              </LinearGradient>
              <Text style={[styles.lessonText, styles.pos1Text]}>Notas Musicais</Text>
              <View style={[styles.lessonRect, styles.pos1Rect]} />

              {/* Badges de Conclusão para Lição 1 */}
              <BadgeEstrela width={24} height={24} style={[styles.badgeIcon, styles.pos1Badge1]} />
              <BadgeEstrela width={24} height={24} style={[styles.badgeIcon, styles.pos1Badge2]} />
              <BadgeEstrela width={24} height={24} style={[styles.badgeIcon, styles.pos1Badge3]} />


              {/* Lição 2: Intervalos (Concluída  Cor Verde) */}
              <LinearGradient
                colors={['rgba(74, 222, 128, 1)', 'rgba(16, 185, 129, 1)']}
                start={{ x: 0.0, y: 0.0 }}
                end={{ x: 1.0, y: 1.0 }}
                style={[styles.lessonCircle, styles.pos2]}>
                <IconeIntervalos width={48} height={58} style={styles.icon} />
              </LinearGradient>
              <Text style={[styles.lessonText, styles.pos2Text]}>Intervalos</Text>
              <View style={[styles.lessonRect, styles.pos2Rect]} />

              {/* Badges de Conclusão para Lição 2 */}
              <BadgeEstrela width={24} height={24} style={[styles.badgeIcon, styles.pos2Badge1]} />
              <BadgeEstrela width={24} height={24} style={[styles.badgeIcon, styles.pos2Badge2]} />
              <BadgeEstrela width={24} height={24} style={[styles.badgeIcon, styles.pos2Badge3]} />


              {/* Lição 3: Escolas Maiores (Em Progresso Cor Laranja) */}
              <LinearGradient
                colors={['rgba(251, 191, 36, 1)', 'rgba(249, 115, 22, 1)']}
                start={{ x: 0.0, y: 0.0 }}
                end={{ x: 1.0, y: 1.0 }}
                style={[styles.lessonCircle, styles.pos3]}>
                <IconeEscalas width={48} height={58} style={styles.icon} />
              </LinearGradient>
              <Text style={[styles.lessonText, styles.pos3Text]}>Escolas Maiores</Text>
              <Text style={[styles.pos3SubText]}>Avaliando</Text>
              <View style={[styles.lessonRect, styles.pos3Rect]} />

              {/* Ícone de Progresso/Status */}
              <View style={[styles.pos3Badge]}>
                <IconeProgresso width={16} height={16} style={styles.icon18} />
              </View>

              {/* Lição 4: Acordes Básicos (Fechada Cinza Opaco) */}
              <View style={[styles.backgroundShadow7, styles.pos4]}>
                <IconeAcordes width={48} height={58} style={styles.icon} />
                <View style={styles.backgroundShadow8}>
                  <IconeCadeadoCinza width={30} height={36} />
                </View>
              </View>
              <Text style={[styles.lessonText, styles.pos4Text]}>Acordes Básicos</Text>
              <Text style={[styles.pos4SubText]}>Fechado</Text>


              {/* Lição 5: Harmonia (Fechada Cinza Opaco) */}
              <View style={[styles.backgroundShadow9, styles.pos5]}>
                <IconeHarmonia width={48} height={58} style={styles.icon} />
                <View style={styles.backgroundShadow8}>
                  <IconeCadeadoHarmonia width={30} height={36} />
                </View>
              </View>
              <Text style={[styles.lessonText, styles.pos5Text]}>Harmonia</Text>
              <Text style={[styles.pos5SubText]}>Fechado</Text>

            </View>

            {/* Bloco Modo Música */}
            <View style={styles.modoMusicaContainer}>
              <LinearGradient
                colors={['rgba(147, 51, 234, 1)', 'rgba(192, 132, 252, 1)']}
                start={{ x: 0.0, y: 0.0 }}
                end={{ x: 1.0, y: 1.0 }}
                style={styles.button}>
                <Text style={styles.modoMusica}>Modo Música</Text>
                {/* Overlay de Bloqueio */}
                <View style={styles.overlayOverlayBlur}>
                  <IconeBloqueio width={36} height={36} style={styles.icon20} />
                  <Text style={styles._70ModoMusica}>70% → Modo Música.</Text>
                </View>
              </LinearGradient>
            </View>
          </View>
        </View>
      </ScrollView>
  {/* Bottom navigation */}
  <BottomNav TrilhaIcon={TrilhaIcon} IconeNotas={IconeNotas} Iconeloja={Iconeloja} Perfilp={Perfilp} />
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
    paddingBottom: 400,
    flexGrow: 1,
  },
  container: {
    paddingTop: 72, // Espaço para o Header
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
    height: 72,
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
    marginBottom: 6,
    width: '100%',
    lineHeight: 26,
  },
  cadaLicaoUmPassoEmDirecaoMaestria: {
    color: '#4a4a68',
    fontFamily: 'Lexend-Regular', 
    fontSize: 15,
    fontWeight: '400',
    width: '100%',
    lineHeight: 22,
  },
  unnamedRemovebgPreview1: {
    width: 72,
    height: 78,
    resizeMode: 'contain',
    flexShrink: 0,
    transform: [{ scaleX: -1 }],
    marginLeft: -20,
  },

  // Container da Trilha
  container2: {
    minHeight: 550, // Altura mínima, mas permite crescer
    alignItems: 'center',
    paddingHorizontal: 0,
    position: 'relative',
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'flex-start',
    paddingBottom: 50, // Espaço no final do container
  },
  svg: {
    width: 80,
    height: '100%',
    position: 'absolute',
    left: '50%',
    marginLeft: -45, // Centraliza a linha 
    top: 0, // Inicia no início (topo) da primeira bola
    resizeMode: 'stretch', // Para esticar a linha verticalmente
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
  pos1: { top: 0, left: '50%', marginLeft: -40, alignSelf: 'center' },
  pos1Text: { top: 88, left: '50%', marginLeft: -75, textAlign: 'center', zIndex: 10, alignSelf: 'center' },
  pos1Rect: { top: 91, left: '50%', marginLeft: -68, width: 136 },
  pos1Badge1: { 
    position: 'absolute',
    top: 58, 
    right: 114 
  },
  pos1Badge2: { 
    position: 'absolute',
    top: 58, 
    right: 94 
  },
  pos1Badge3: { 
    position: 'absolute',
    top: 58, 
    right: 134 
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
  pos2Text: { top: 300, left: '50%', marginLeft: -47.5, width: 95, textAlign: 'center', zIndex: 10, alignSelf: 'center' },
  pos2Rect: { top: 303, left: '50%', marginLeft: -46.5, width: 93 },
  pos2Badge1: { 
    position: 'absolute',
    top: 272, 
    right: 112 
  },
  pos2Badge2: { 
    position: 'absolute',
    top: 272, 
    right: 92 
  },
  pos2Badge3: { 
    position: 'absolute',
    top: 272, 
    right: 134 
  },

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
    color: '#f97316',
    fontFamily: 'Lexend-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    position: 'absolute',
    textAlign: 'center',
    width: 139,
    top: 514, 
    left: '50%', 
    marginLeft: -69.5,
    alignSelf: 'center'
  },
  pos3SubText: { position: 'absolute', top: 536, left: '50%', marginLeft: -69.5, color: '#6b7280', fontSize: 14, fontWeight: '500', width: 139, textAlign: 'center', zIndex: 10, alignSelf: 'center' },
  pos3Rect: { top: 517, left: '50%', marginLeft: -68, width: 136 },
  pos3Badge: { 
    width: 20, 
    height: 20, 
    borderRadius: 9999, 
    backgroundColor: '#000000', 
    position: 'absolute', 
    top: 481, 
    right: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },

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
    backgroundColor: '#cbd5e1', 
    opacity: 0.6 
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
    backgroundColor: '#cbd5e1', 
    opacity: 0.6 
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

  // Container do Modo Música
  modoMusicaContainer: {
    width: '100%',
    marginTop: 450,
    marginBottom: 50,
    paddingHorizontal: 16,
    alignSelf: 'stretch',
  },
  button: {
    borderRadius: 48,
    height: 84,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
    overflow: 'hidden',
  },
  modoMusica: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Lexend-Bold', 
    fontSize: 24,
    fontWeight: '700',
    position: 'absolute',
    left: 95,
    top: 17,
  },
  theUltimateChallenge: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'Lexend-Regular', 
    fontSize: 14,
    fontWeight: '400',
    position: 'absolute',
    left: 100,
    top: 49,
  },
  icon19: { width: 48, height: 58, position: 'absolute', left: 20, top: 13, transform: [{ scaleY: -1 }], resizeMode: 'contain' },

  // Overlay de Bloqueio
  overlayOverlayBlur: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon20: { width: 36, height: 44, position: 'absolute', top: 10, resizeMode: 'contain' },
  _70ModoMusica: {
    color: '#ffffff',
    fontFamily: 'Lexend-SemiBold', /
    fontSize: 16,
    fontWeight: '600',
    position: 'absolute',
    top: 50,
  },
});

export default TrilhaTeoria;