import React from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';


import MenuIcon from '../../assets/images/config.svg'; // Menu Header (Configurações)
import IconeConfig from '../../assets/images/people.svg'; // Config Header (Amigos/Voltar)
import IconeCadeadoCinza from '../../assets/images/cadeadocinza.svg'; // Cadeado para conquistas bloqueadas
import Estrelaconquista from '../../assets/images/conquista.svg'; //estrelas
import IconeNotas from '../../assets/images/icongray.svg'; // para 'Música' na navegação
import Iconeloja from '../../assets/images/loja.svg'; // para 'Loja' na navegação
import Perfilp from '../../assets/images/perfilp.svg';// para 'Perfil' na navegação
import TrilhaIcon from '../../assets/images/trilhateorica.svg'; // para 'Trilha' na navegação
import BottomNav from '../../components/ui/bottom-nav';
const perfilImg = require('../../assets/images/perfil.png');

const Perfil = () => {

    const LockedIcon = IconeCadeadoCinza;

  return (
    <View style={styles.perfil}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.button2}>
            {/* BackIcon (IconeConfig) */}
            <MenuIcon width={45} height={45} style={styles.iconStyle} />
          </TouchableOpacity>
          <Text style={styles.heading2Profile}>Perfil</Text>
          <TouchableOpacity style={styles.button3}>
            {/* Ícone de Configurações */}
            <IconeConfig width={32} height={32} style={styles.iconStyle} />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <ScrollView contentContainerStyle={styles.mainContentContainer} style={styles.main}>
          <View style={styles.section}>
            <Image 
              style={styles.image} 
              source={perfilImg} 
            />
            <Text style={styles.nome}>Xandinho</Text>
            <View style={styles.backgroundBorder}>
              <Text style={styles._12}>12</Text>
            </View>
          </View>

          <View style={styles.section2}>
            <Text style={styles.nVel}>Nível</Text>
            <Text style={styles._12502000Xp}>1250 / 2000 XP</Text>
            <View style={styles.backgroundBar}>
                <View style={styles.progressBarFill} />
            </View>
          </View>

          <View style={styles.section3}>
            <View style={styles.paragraphBackground}>
              <Text style={styles.licoesFeitas}>Lições Feitas</Text>
              <Text style={styles._84}>84</Text>
            </View>
            <View style={styles.paragraphBackground2}>
              <Text style={styles.sequenciaDePratica}>Sequência de Prática</Text>
              <Text style={styles._12Dias}>12 Dias</Text>
            </View>
            <View style={styles.paragraphBackground3}>
              <Text style={styles.instrumento}>Instrumento</Text>
              <Text style={styles.violao}>Violão</Text>
            </View>
          </View>

          <View style={styles.section4}>
            <Text style={styles.heading3Achievements}>Conquistas</Text>
            <TouchableOpacity>
              <Text style={styles.linkViewAll}>Ver Tudo</Text>
            </TouchableOpacity>
            
            <ScrollView horizontal style={styles.container2} contentContainerStyle={styles.achievementsContainer}>
                {/* Conquista 1: Harmonia Domada */}
                <View style={styles.achievementItem}>
                    <View style={styles.background2}>
                        <View style={styles.background3}>
                            {/* conquistas  */}
                            <Estrelaconquista width={59} height={59} style={styles.Estrelaconquista} />
                        </View>
                    </View>
                    <Text style={styles.harmoniaDomada}>Harmonia{'\n'}Domada</Text>
                </View>

                {/* Conquista 2: Exploração de Acordes */}
                <View style={styles.achievementItem}>
                    <View style={styles.background4}>
                        <View style={styles.background3}>
                            <Estrelaconquista width={59} height={59} style={styles.Estrelaconquista} />
                        </View>
                    </View>
                    <Text style={styles.exploracaoDeAcordes}>Exploração de Acordes</Text>
                </View>

                {/* Conquista 3: Mestre do Ritmo */}
                <View style={styles.achievementItem}>
                    <View style={styles.background5}>
                        <View style={styles.background3}>
                            <Estrelaconquista width={59} height={59} style={styles.Estrelaconquista} />
                        </View>
                    </View>
                    <Text style={styles.mestreDoRitmo}>Mestre do Ritmo</Text>
                </View>

                {/* Conquista 4: Tom Perfeito */}
                <View style={styles.achievementItem}>
                    <View style={styles.background6}>
                        <View style={styles.background3}>
                            <Estrelaconquista width={59} height={59} style={styles.Estrelaconquista} />
                        </View>
                    </View>
                    <Text style={styles.tomPerfeito}>Tom Perfeito</Text>
                </View>

                {/* Conquista 5: Locked */}
                <View style={styles.achievementItem}>
                    <View style={styles.border}>
                        {/* Ícone de Bloqueio:IconeCadeadoCinza */}
                        <LockedIcon width={36} height={44} style={styles.lockedIconStyle} />
                    </View>
                    <Text style={styles.locked}>Locked</Text>
                </View>
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.iniciarDesafio}>Iniciar Desafio</Text>
          </TouchableOpacity>
        </ScrollView>

                {/* Bottom navigation*/}
                <BottomNav
                    TrilhaIcon={TrilhaIcon}
                    IconeNotas={IconeNotas}
                    Iconeloja={Iconeloja}
                    Perfilp={Perfilp}
                />
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  perfil: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  container: {
    flex: 1,
  },
  header: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(245, 245, 247, 0.8)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
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
  iconStyle: {
    // Estilo para SVGs do Header (MenuIcon, IconeConfig)
    color: '#333333', // Cor padrão (ajuste se o SVG não for monocromático)
  },
  heading2Profile: {
    color: '#333333',
    fontFamily: 'SplineSans-Bold', 
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22.5,
  },

  main: {
    flex: 1,
    marginTop: 72, 
    marginBottom: 85, 
    paddingHorizontal: 16,
  },
  mainContentContainer: {
    paddingBottom: 20, 
  },

  // User Info
  section: {
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 24,
  },
  image: {
    borderRadius: 9999,
    width: 128,
    height: 128,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 4,
    borderColor: '#ffffff',
    position: 'relative',
  },
  nome: {
    color: '#333333',
    fontFamily: 'Lexend-Bold',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
  },
  backgroundBorder: {
    backgroundColor: '#ffa500',
    borderRadius: 9999,
    borderWidth: 4,
    borderColor: '#f5f5f7',
    width: 40,
    height: 40,
    position: 'absolute',
    top: 96,
    right: 110, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  _12: {
    color: '#ffffff',
    fontFamily: 'SplineSans-Bold',
    fontSize: 18,
    fontWeight: '700',
  },

  // Nivel/XP
  section2: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    height: 100,
    padding: 24,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  nVel: {
    color: '#333333',
    fontFamily: 'SplineSans-Medium',
    fontSize: 16,
    fontWeight: '500',
  },
  _12502000Xp: {
    color: '#8a2be2',
    fontFamily: 'SplineSans-Bold',
    fontSize: 14,
    fontWeight: '700',
    position: 'absolute',
    right: 24,
    top: 24,
  },
  backgroundBar: {
    backgroundColor: '#e0e0e0',
    borderRadius: 9999,
    height: 16,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    backgroundColor: '#8a2be2',
    height: '100%',
    width: '62.5%', 
    borderRadius: 9999,
  },

  // Stats
  section3: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 110,
  },
  paragraphBackground: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '48%',
    height: 94,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paragraphBackground2: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '48%',
    height: 94,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paragraphBackground3: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '100%',
    height: 94,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  licoesFeitas: {
    color: '#333333',
    fontFamily: 'SplineSans-Medium',
    fontSize: 16,
    fontWeight: '500',
  },
  _84: {
    color: '#333333',
    fontFamily: 'SplineSans-Bold',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  sequenciaDePratica: {
    color: '#333333',
    fontFamily: 'SplineSans-Medium',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  _12Dias: {
    color: '#333333',
    fontFamily: 'SplineSans-Bold',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  instrumento: {
    color: '#2b2b2b',
    fontFamily: 'SplineSans-Medium',
    fontSize: 16,
    fontWeight: '500',
  },
  violao: {
    color: '#333333',
    fontFamily: 'SplineSans-Bold',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },

  // Section 4: Achievements
  section4: {
    marginBottom: 24,
  },
  heading3Achievements: {
    color: '#333333',
    fontFamily: 'SplineSans-Bold',
    fontSize: 18,
    fontWeight: '700',
  },
  linkViewAll: {
    color: '#8a2be2',
    fontFamily: 'SplineSans-Bold',
    fontSize: 14,
    fontWeight: '700',
    position: 'absolute',
    right: 0,
    top: -20,
  },
  container2: {
    marginTop: 16,
    marginHorizontal: -16,
  },
  achievementsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  achievementItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 96,
  },
  background2: { ...getAchievementBackgroundStyle(), backgroundColor: 'transparent' },
  background4: { ...getAchievementBackgroundStyle(), backgroundColor: 'transparent' },
  background5: { ...getAchievementBackgroundStyle(), backgroundColor: 'transparent' },
  background6: { ...getAchievementBackgroundStyle(), backgroundColor: 'transparent' },
  
  background3: {
    backgroundColor: '#ffffff',
    borderRadius: 9999,
    width: 80,
    height: 80,
    position: 'absolute',
    top: 8,
    left: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  Estrelaconquista: {

    width: 59,
    height: 59,
  },
  harmoniaDomada: { ...getAchievementTextStyle(), width: 96, },
  exploracaoDeAcordes: { ...getAchievementTextStyle(), },
  mestreDoRitmo: { ...getAchievementTextStyle(), },
  tomPerfeito: { ...getAchievementTextStyle(), },

  border: {
    borderWidth: 2,
    borderColor: '#eae0f5',
    borderStyle: 'dashed',
    borderRadius: 9999,
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedIconStyle: {
    // Estilo para o componente SVG IconeCadeadoCinza
    width: 36,
    height: 44,
  },
  locked: {
    ...getAchievementTextStyle(),
    color: 'rgba(51, 51, 51, 0.5)',
  },

  // Button: Iniciar desafio
  button: {
    backgroundColor: '#ffa500',
    borderRadius: 24,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffa500',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  iniciarDesafio: {
    color: '#ffffff',
    fontFamily: 'SplineSans-Bold',
    fontSize: 16,
    fontWeight: '700',
  },

  // botão de navegação
  nav: {
    height: 85,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
    opacity: 0.7,
  },
  link: { ...getNavLinkStyle(), width: 80 },
  link2: { ...getNavLinkStyle(), width: 50 },
  link3: { ...getNavLinkStyle(), width: 65 },
  link4: { ...getNavLinkStyle(), width: 55 },

  navIconStyle: {
    // Estilo para SVGs da Navegação
    textAlign: 'center',
    marginBottom: 4,
    color: 'rgba(51, 51, 51, 0.7)', // Cor padrão
  },
  trilhaTeorica: { ...getNavTextStyle() },
  musica: { ...getNavTextStyle() },
  loja: { ...getNavTextStyle() },
  perfil2: { ...getNavTextStyle() },
});

// Helper functions (mantidas)
function getNavLinkStyle() {
    return {
        alignItems: 'center',
    };
}

function getNavTextStyle() {
    return {
        color: 'rgba(51, 51, 51, 0.7)',
        fontFamily: 'SplineSans-Medium',
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 16,
        textAlign: 'center',
    };
}

function getAchievementBackgroundStyle() {
    return {
        borderRadius: 9999,
        width: 96,
        height: 96,
        alignItems: 'center',
        justifyContent: 'center',
    };
}

function getAchievementTextStyle() {
    return {
        color: '#333333',
        fontFamily: 'SplineSans-Medium',
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 16,
        textAlign: 'center',
        marginTop: 8,
    };
}


export default Perfil;