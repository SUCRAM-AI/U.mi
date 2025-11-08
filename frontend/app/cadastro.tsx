import React, {useState} from "react";
import { View, ScrollView, ImageBackground, Image, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { register } from '../services/api';

import LogoUMISVG from '../assets/images/logo_umi.svg';
import UserIconSVG from '../assets/images/user_icon.svg';
import PasswordIconSVG from '../assets/images/passwordicon.svg';

//importações das imagens locais 
const lyricsbosque = require('../assets/images/lyrics2.png'); 


export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        // Validações
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Erro', 'As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            const response = await register({
                name,
                email,
                password,
                confirmPassword,
            });

            if (response.success) {
                // Mostrar mensagem de sucesso e redirecionar após 1 segundo
                Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
                setTimeout(() => {
                    router.replace('/login');
                }, 1000);
            } else {
                Alert.alert('Erro', response.error || 'Erro ao realizar cadastro');
            }
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao realizar cadastro. Verifique sua conexão.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                
                <Image 
                    source={lyricsbosque} // Imagem 
                    style={styles.headerBackground} 
                />

                <View style={styles.rectangleWhite} />
                
                 {/*Logo e Boas-Vindas*/}
                <View style={styles.contentArea}> 
                    
                    {/* Logo U.Mi (Vector e Text) */}
                    <View style={styles.logoContainer}>
                        <LogoUMISVG 
                            width={34} 
                            height={44} 
                        />
                        <Text style={styles.logoText}>U.Mi</Text>
                    </View>

                    <Text style={styles.welcomeText}>Vamos criar sua conta!</Text>
                    
                    {/* Formulário de Nome */}
                    <Text style={styles.label}>Nome</Text>
                    <View style={styles.inputContainer}>
                        <UserIconSVG 
                            width={24} // Define o tamanho exato do ícone
                            height={28}
                            style={styles.inputIcon} // estilo para dar o espaçamento correto
                        />
                       
                        <TextInput
                            placeholder="usuario123"
                            value={name}
                            onChangeText={setName}
                            style={styles.inputField}
                        />
                    </View>

                    {/* 4. Formulário de Email */}
                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputContainer}>
                        <UserIconSVG 
                            width={24} // Define o tamanho exato do ícone
                            height={28}
                            style={styles.inputIcon} // Estilo para dar o espaçamento correto
                        />
                        
                        <TextInput
                            placeholder="voce@exemplo.com"
                            value={email}
                            onChangeText={setEmail}
                            style={styles.inputField}
                            keyboardType="email-address"
                        />
                    </View>

                    {/* Formulário de Senha */}
                    <Text style={styles.label}>Senha</Text>
                    <View style={styles.inputContainer}>
                        <PasswordIconSVG

                            width={24} // Define o tamanho exato do ícone
                            height={28}
                            style={styles.inputIcon} 
                        /> 
                        <TextInput
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            style={styles.inputField}
                            secureTextEntry={true}
                        />
                    </View>

                    {/*Formulário de Confirmação de Senha */}
                    <Text style={styles.label}>Confirmar Senha</Text>
                    <View style={styles.inputContainer}>
                         <PasswordIconSVG
                         
                            width={24} // Define o tamanho exato do ícone
                            height={28}
                            style={styles.inputIcon} // Estilo para dar o espaçamento correto
                        /> 
                        <TextInput
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            style={styles.inputField}
                            secureTextEntry={true}
                        />
                    </View>

                    {/*Botão Cadastrar */}
                    <TouchableOpacity 
                        style={[styles.registerButton, loading && styles.buttonDisabled]} 
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.registerButtonText}>Cadastrar</Text>
                        )}
                    </TouchableOpacity>
                    
                    {/*Link para Login */}
                    <View style={styles.loginLinkContainer}>
                        <Text style={styles.loginLinkText}>Já tenho uma conta?</Text>
                        <TouchableOpacity onPress={() => router.push('/login')}>
                            <Text style={styles.loginLinkButton}>Entrar</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F6F8', // Cor de fundo do body
    },
    scrollViewContent: {
        paddingBottom: 50, // Espaço no final para que a ScrollView não corte o botão
    },
    
    // --- ELEMENTOS DE HEADER ABSOLUTO ---
    headerBackground: {
        width: '100%',
        height: 364, // Altura da imagem de fundo
        opacity: 0.30,
    },
    rectangleWhite: {
        width: '100%',
        height: 617,
        position: 'absolute',
        top: 299, // Posição onde a área branca começa a cobrir a imagem
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    
    contentArea: {
        
        position: 'absolute', 
        top: 180, // centralizar verticalmente o logo
        paddingHorizontal: 30,
        width: '100%',
    },

    // --- LOGO E TÍTULO ---
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    logoIconPlaceholder: {
        width: 34,
        height: 44,
        marginRight: 6,
        backgroundColor: 'transparent', // Substitua por seu ícone real
    },
    logoText: {
        color: '#20123C',
        fontSize: 30,
        fontWeight: '700', 
        fontFamily: 'Lexend', 
        lineHeight: 36,
    },
    welcomeText: {
        color: '#374053',
        fontSize: 16,
        fontFamily: 'Lexend',
        textAlign: 'center',
        marginBottom: 40,
    },
    
    // --- CAMPOS DE FORMULÁRIO ---
    label: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        marginTop: 15,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        height: 50,
        paddingHorizontal: 12,
    },
    inputIconPlaceholder: {
        width: 24,
        height: 28,
        marginRight: 10,
        backgroundColor: 'transparent',
    },
    inputField: {
        flex: 1,
        color: '#6B7280',
        fontSize: 16,
        paddingVertical: 10,
    },

    inputIcon: { 
    width: 24, 
    height: 28,
    marginRight: 10, 
},
    
    // --- BOTÕES E LINKS ---
    registerButton: {
        backgroundColor: '#7E22CE',
        borderRadius: 24,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20,
        shadowColor: '#6A3DE84D', 
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6, // Sombra para Android
    },
    registerButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 28,
    },
    loginLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    loginLinkText: {
        color: '#4B5563',
        fontSize: 16,
        marginRight: 5,
    },
    loginLinkButton: {
        color: '#FF9900', // Use uma cor diferente para o botão de 'Entrar'
        fontSize: 16,
        fontWeight: '700',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});

