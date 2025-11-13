import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';

const  Lyricsthink = require('../../assets/images/thinklyrics.png');
import EmailIconSVG from '../../assets/images/user_icon.svg'; 
import LogoUMISVG from '../../assets/images/logo_umi.svg';

const { width, height } = Dimensions.get('window');

const PasswordRecoveryScreen = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    
    const handleRecovery = () => {
        if (!email.trim()) {
            Alert.alert('Erro', 'Por favor, insira seu email');
            return;
        }
        
        setIsLoading(true);
        // Simular envio de email
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert(
                'Email enviado!', 
                'Verifique sua caixa de entrada para redefinir sua senha.',
                [{ text: 'OK', onPress: () => router.push('/(tabs)/login') }]
            );
        }, 1500);
    };
    
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.login3}>
                    {/* ratangulo */}
                    <View style={styles.rectangle4} />

                    {/* U.Mi Seção Logo */}
                    <View style={styles.umiContainer}>
                        <LogoUMISVG 
                            width={34} 
                            height={44} 
                        />
                        <Text style={styles.umi}>U.Mi</Text>
                    </View>

                    {/* Main Content Container */}
                    <View style={styles.container01}>
                        <Image
                            style={styles.recoveryImage}
                            source={Lyricsthink}
                        />
                        
                        {/* Heading 1 (Esqueceu sua senha?) */}
                        <Text style={styles.heading1}>
                            Esqueceu sua senha?
                        </Text>

                        {/* Instructional Text */}
                        <Text style={styles.instructionText}>
                            Sem problemas! Insira seu e-mail abaixo e enviaremos um link para redefinir sua senha.
                        </Text>

                        {/* Form Container */}
                        <View style={styles.form}>
                            {/* Label E-mail */}
                            <Text style={styles.labelEmailOrUsername}>E-mail</Text>

                            {/* Input */}
                            <View style={styles.input}>
                                <EmailIconSVG 
                                    width={24} 
                                    height={28} 
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.inputPlaceholderText}
                                    placeholder="voce@exemplo.com"
                                    placeholderTextColor="#6B7280"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>

                            {/* Recovery Button */}
                            <TouchableOpacity 
                                style={[styles.button, isLoading && styles.buttonDisabled]}
                                onPress={handleRecovery}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.enviarLinkDeRecuperacao}>
                                        Enviar link de recuperação
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* Back to Login Link */}
                            <TouchableOpacity 
                                style={styles.voltarAoLoginContainer}
                                onPress={() => router.push('/(tabs)/login')}
                            >
                                <Text style={styles.voltarAoLogin}>
                                    Voltar ao login
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
        </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F6F8',
    },
    scrollViewContent: {
        paddingBottom: 50,
    },
    login3: {
        width: '100%',
        minHeight: height,
        position: 'relative',
        backgroundColor: '#F7F6F8', 
    },
    
    //  Top Section (U.Mi Logo) 
    umiContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,

        width: '100%',
    },
    umi: {
        color: '#20123C',
        fontSize: 30,
        fontFamily: 'Lexend', 
        fontWeight: '700',
        lineHeight: 36,
        marginLeft: 6,
    },

    // Main Container 
    container01: {
        width: '100%',
        paddingHorizontal: 24,
        alignItems: 'center',
        marginTop: 0,
    },
    
    //White Background Panel 
    rectangle4: {
        width: '100%',
        height: height * 0.6,
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },

    recoveryImage: {
        width: width * 0.75,
        height: 192,
        resizeMode: 'contain',
        marginTop: 56,
        marginBottom: 30,
    },
    heading1: {
        textAlign: 'center',
        color: 'black',
        fontSize: 32,
        fontFamily: 'Lexend',
        fontWeight: '700',
        lineHeight: 40,
        marginBottom: 16,
        paddingHorizontal: 0,
    },
    instructionText: {
        textAlign: 'center',
        color: '#374053',
        fontSize: 16,
        fontFamily: 'Lexend',
        fontWeight: '400',
        lineHeight: 24,
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    // Form Container 
    form: {
        width: '100%',
        maxWidth: 339,
        marginTop: 20,
    },
    labelEmailOrUsername: {
        color: '#374151',
        fontSize: 14,
        fontFamily: 'Lexend',
        fontWeight: '500',
        lineHeight: 20,
        marginBottom: 8,
        marginLeft: 2,
    },
    //Input Field 
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#F7F7F7',
        borderRadius: 24,
        borderWidth: 1, 
        borderColor: '#D1D5DB',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    inputIcon: {
        marginRight: 10,
    },
    inputPlaceholderText: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Lexend',
        fontWeight: '400',
        color: '#6B7280',
    },

    //  Button
    button: {
        width: '100%',
        height: 60,
        backgroundColor: '#7E22CE',
        borderRadius: 24,
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(106, 61, 232, 0.30)',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 6,
            },
            android: {
                elevation: 6,
            },
        }),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    enviarLinkDeRecuperacao: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'Lexend',
        fontWeight: '700',
        lineHeight: 28,
        textAlign: 'center',
    },
    
    // Back to Login Link 
    voltarAoLoginContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    voltarAoLogin: {
        color: '#4B5563',
        fontSize: 16,
        fontFamily: 'Lexend',
        fontWeight: '400',
        lineHeight: 24,
        textAlign: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});

export default PasswordRecoveryScreen;