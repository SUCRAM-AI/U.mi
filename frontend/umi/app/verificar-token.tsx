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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@contexts/AuthContext';

const Lyricsthink = require('@assets/images/thinklyrics.png');
import LogoUMISVG from '@assets/images/logo_umi.svg';

const { width, height } = Dimensions.get('window');

const VerifyTokenScreen = () => {
    const params = useLocalSearchParams();
    const email = (params.email as string) || '';
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { verifyPasswordResetToken } = useAuth();
    
    const handleVerifyToken = async () => {
        if (!token.trim()) {
            Alert.alert('Erro', 'Por favor, insira o token');
            return;
        }

        if (token.length !== 6) {
            Alert.alert('Erro', 'O token deve ter 6 dígitos');
            return;
        }
        
        setIsLoading(true);
        try {
            const isValid = await verifyPasswordResetToken(email, token.trim());
            if (isValid) {
                // Token válido, redirecionar para tela de nova senha
                router.push({
                    pathname: '/nova-senha',
                    params: { email: email, token: token.trim() }
                });
            } else {
                Alert.alert('Erro', 'Token inválido ou expirado. Tente novamente.');
            }
        } catch (error) {
            Alert.alert('Erro', 'Ocorreu um erro ao verificar o token');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.login3}>
                    <View style={styles.rectangle4} />

                    <View style={styles.umiContainer}>
                        <LogoUMISVG 
                            width={34} 
                            height={44} 
                        />
                        <Text style={styles.umi}>U.Mi</Text>
                    </View>

                    <View style={styles.container01}>
                        <Image
                            style={styles.recoveryImage}
                            source={Lyricsthink}
                        />
                        
                        <Text style={styles.heading1}>
                            Verificar Token
                        </Text>

                        <Text style={styles.instructionText}>
                            Digite o token de 6 dígitos que foi enviado para {email}
                        </Text>

                        <View style={styles.form}>
                            <Text style={styles.labelEmailOrUsername}>Token</Text>

                            <View style={styles.input}>
                                <TextInput
                                    style={styles.inputPlaceholderText}
                                    placeholder="000000"
                                    placeholderTextColor="#6B7280"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    value={token}
                                    onChangeText={setToken}
                                />
                            </View>

                            <TouchableOpacity 
                                style={[styles.button, isLoading && styles.buttonDisabled]}
                                onPress={handleVerifyToken}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.enviarLinkDeRecuperacao}>
                                        Verificar Token
                                    </Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.voltarAoLoginContainer}
                                onPress={() => router.push('/senha')}
                            >
                                <Text style={styles.voltarAoLogin}>
                                    Voltar
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
    container01: {
        width: '100%',
        paddingHorizontal: 24,
        alignItems: 'center',
        marginTop: 0,
    },
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
    inputPlaceholderText: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Lexend',
        fontWeight: '400',
        color: '#6B7280',
        textAlign: 'center',
        letterSpacing: 8,
    },
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

export default VerifyTokenScreen;

