import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    Dimensions,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';

import LogoUMISVG from '@assets/images/logo_umi.svg';

const { width, height } = Dimensions.get('window');

// imagens locais
const caminho = require('@assets/images/background.png');
const Nivellyrics = require('@assets/images/lyricsnivel.png');

const WelcomeScreen = () => {
    const router = useRouter();
    
    const handleBasicLevel = () => {
        router.replace('/(tabs)/trilha');
    };
    
    const handleIntermediateLevel = () => {
        router.replace('/(tabs)/trilha');
    };
    
    return (
        <SafeAreaView style={styles.container}>
            {/* Background Image fora do ScrollView para cobrir tudo */}
            <Image 
                style={styles.backgroundImage} 
                source={caminho} 
                resizeMode="cover"
            />
            <ScrollView 
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
                style={styles.scrollView}
            >
                {/* Main Content Container */}
                <View style={styles.contentContainer}>
                    
                    {/* Logo U.Mi */}
                    <View style={styles.logoContainer}>
                        <LogoUMISVG 
                            width={34} 
                            height={44} 
                        />
                        <Text style={styles.logoText}>U.Mi</Text>
                    </View>

                    {/* Main Illustration */}
                    <View style={styles.imageContainer}>
                        <Image 
                            style={styles.mainImage} 
                            source={Nivellyrics} 
                            resizeMode="contain"
                        />
                    </View>

                    {/* Sua Aventura Musical Aguarda! */}
                    <Text style={styles.heading}>
                        Sua Aventura Musical Aguarda!
                    </Text>

                    {/*  Aprenda, toque e domine... */}
                    <Text style={styles.subtext}>
                        Aprenda, toque e domine a música, uma nota de cada vez.
                    </Text>

                    {/* Buttons Container */}
                    <View style={styles.buttonsContainer}>
                        
                        {/* Button 1: Comece pelo Básico (Laranja) */}
                        <TouchableOpacity 
                            style={styles.buttonOrange}
                            onPress={handleBasicLevel}
                        >
                            <Text style={styles.buttonTitle}>
                                Comece pelo Básico
                            </Text>
                            <Text style={styles.buttonSubtitle}>
                                Perfeito para músicos iniciantes.
                            </Text>
                        </TouchableOpacity>

                        {/* Button 2: Eu conheço o básico (Roxo) */}
                        <TouchableOpacity 
                            style={styles.buttonPurple}
                            onPress={handleIntermediateLevel}
                        >
                            <Text style={styles.buttonTitleWhite}>
                                Eu conheço o básico
                            </Text>
                            <Text style={styles.buttonSubtitleWhite}>
                                Mergulhe direto na ação.
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FBF8FF',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 40,
        minHeight: height,
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        opacity: 0.90,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    
    // Logo U.Mi 
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    logoText: {
        color: 'black',
        fontSize: 30,
        fontFamily: 'Lexend',
        fontWeight: '700',
        lineHeight: 36,
        marginLeft: 6,
    },
    
    //Imagem Principal 
    imageContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 10,
    },
    mainImage: {
        width: width * 0.90,
        maxWidth: 380,
        height: 360,
        borderRadius: 50,
    },
    
    // Textos Principais 
    heading: {
        color: 'black',
        fontSize: 32,
        fontFamily: 'Lexend',
        fontWeight: '700',
        lineHeight: 40,
        textAlign: 'center',
        marginBottom: 6,
        paddingHorizontal: 20,
    },
    subtext: {
        color: 'rgba(78, 71, 113, 0.8)',
        fontSize: 16,
        fontFamily: 'Lexend',
        fontWeight: '400',
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: 6,
        paddingHorizontal: 20,
    },
    
    // Botões 
    buttonsContainer: {
        width: '100%',
        maxWidth: 358,
        gap: 16,
        marginTop: 0,
    },
    
    // Comece pelo Básico (Laranja)
    buttonOrange: {
        width: '100%',
        minHeight: 80,
        backgroundColor: '#FF9900',
        borderRadius: 32,
        paddingVertical: 16,
        paddingHorizontal: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonTitle: {
        color: 'black',
        fontSize: 18,
        fontFamily: 'Lexend',
        fontWeight: '700',
        lineHeight: 28,
        letterSpacing: 0.24,
        marginBottom: 4,
        textAlign: 'center',
    },
    buttonSubtitle: {
        color: 'black',
        fontSize: 14,
        fontFamily: 'Lexend',
        fontWeight: '400',
        lineHeight: 20,
        letterSpacing: 0.24,
        opacity: 0.80,
        textAlign: 'center',
    },
    
    // botão 2: Eu conheço o básico (Roxo)
    buttonPurple: {
        width: '100%',
        minHeight: 80,
        backgroundColor: '#7E22CE',
        borderRadius: 32,
        paddingVertical: 16,
        paddingHorizontal: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonTitleWhite: {
        color: '#FFFBFB',
        fontSize: 18,
        fontFamily: 'Lexend',
        fontWeight: '700',
        lineHeight: 28,
        letterSpacing: 0.24,
        marginBottom: 4,
        textAlign: 'center',
    },
    buttonSubtitleWhite: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Lexend',
        fontWeight: '400',
        lineHeight: 20,
        letterSpacing: 0.24,
        opacity: 0.80,
        textAlign: 'center',
    },
});

export default WelcomeScreen;