import React, {useState, useEffect} from "react";
import { View, ScrollView, ImageBackground, Image, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { login, healthCheck } from '../services/api';

// importações das imagens locais
const HeaderBackground = require('../assets/images/header_bg.png');
const LogoImage = require('../assets/images/logo.png');
const EmailIcon = require('../assets/images/email_icon.png');
const PasswordIcon = require('../assets/images/password_icon.png');

export default () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Teste de conectividade ao carregar a tela
    useEffect(() => {
        const testConnection = async () => {
            try {
                console.log('🧪 Testando conexão com API...');
                const result = await healthCheck();
                console.log('✅ API está acessível:', result);
            } catch (error: any) {
                console.error('❌ Erro ao conectar com API:', error);
                Alert.alert(
                    'Aviso',
                    `Não foi possível conectar com o servidor.\n\nErro: ${error.message}\n\nVerifique se o backend está rodando.`,
                    [{ text: 'OK' }]
                );
            }
        };
        testConnection();
    }, []);
    
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        setLoading(true);
        try {
            const response = await login({ email, password });
            
            if (response.success) {
                // Redirecionar automaticamente após login bem-sucedido
                console.log('✅ Login bem-sucedido, redirecionando...');
                router.replace('/(tabs)');
            } else {
                Alert.alert('Erro', response.error || 'Credenciais inválidas');
            }
        } catch (error: any) {
            console.error('❌ Erro no login:', error);
            Alert.alert('Erro', error.message || 'Erro ao fazer login. Verifique sua conexão.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <ScrollView  style={styles.scrollView}>
                <View style={styles.column}>
                    <View style={styles.column2}>
                        <ImageBackground 
                            source={HeaderBackground} //imagem
                            resizeMode = {'stretch'}
                            >
                            <View style={styles.row}>
                                <Image
                                    source = {LogoImage} // imagem
                                    resizeMode = {"stretch"}
                                    style={styles.image}
                                />
                                <Text style={styles.text}>
                                    {"U.Mi"}
                                </Text>
                            </View>
                            <View style={styles.view}>
                                <Text style={styles.text}>
                                    {"Bem-vindo(a)!"}
                                </Text>
                            </View>
                            <View style={styles.view2}>
                                <Text style={styles.text2}>
                                    {"Vamos aprender música."}
                                </Text>
                            </View>
                            <Text style={styles.text3}>
                                {"Email or Username"}
                            </Text>
                            <View style={styles.row2}>
                                <Image
                                    source = {EmailIcon} // imagem 
                                    resizeMode = {"stretch"}
                                    style={styles.image2}
                                />
                                <TextInput
                                    placeholder={"voce@exemplo.com"}
                                    value={email}
                                    onChangeText={setEmail}
                                    style={styles.input}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            <Text style={styles.text4}>
                                {"Senha"}
                            </Text>
                        </ImageBackground>
                        <View style={styles.absoluteView}>
                            <View style={styles.row3}>
                                <Image
                                    source = {PasswordIcon} //imagem
                                    resizeMode = {"stretch"}
                                    style={styles.image3}
                                />
                                <TextInput
                                    placeholder={"••••••••"}
                                    value={password}
                                    onChangeText={setPassword}
                                    style={styles.passwordInput}
                                    secureTextEntry={true}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={styles.view3}>
                        <View style={styles.view4}>
                            <Text style={styles.text6}>
                                {"Esqueceu sua senha?"}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={[styles.button, loading && styles.buttonDisabled]} 
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.text7}>
                                {"Login"}
                            </Text>
                        )}
                    </TouchableOpacity>
                    <View style={styles.view5}>
                        <Text style={styles.text8}>
                            {"Não tem uma conta?"}
                        </Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.button2} 
                        onPress={() => router.push('/cadastro')}
                    >
                        <Text style={styles.text9}>
                            {"Cadastrar"}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.button3} 
                        onPress={() => {
                            Alert.alert('Convidado', 'Continuando como convidado...');
                            router.replace('/(tabs)');
                        }}
                    >
                        <Text style={styles.text10}>
                            {"Continuar como Convidado"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	absoluteView: {
		position: "absolute",
		bottom: -32,
		right: 17,
		left: 17,
		backgroundColor: "#FFFFFF",
		borderColor: "#D1D5DB",
		borderRadius: 24,
		borderWidth: 1,
		paddingVertical: 11,
		paddingLeft: 12,
	},
	button: {
		alignItems: "center",
		backgroundColor: "#7E22CE",
		borderRadius: 24,
		paddingVertical: 20,
		marginBottom: 60,
		marginHorizontal: 17,
		shadowColor: "#6A3DE84D",
		shadowOpacity: 0.3,
		shadowOffset: {
		    width: 0,
		    height: 4
		},
		shadowRadius: 6,
		elevation: 6,
	},
	button2: {
		alignItems: "center",
		backgroundColor: "#FF9900",
		borderRadius: 24,
		paddingVertical: 18,
		marginBottom: 16,
		marginHorizontal: 24,
		shadowColor: "#FF99004D",
		shadowOpacity: 0.3,
		shadowOffset: {
		    width: 0,
		    height: 4
		},
		shadowRadius: 6,
		elevation: 6,
	},
	button3: {
		alignItems: "center",
		backgroundColor: "#E5E7EB",
		borderRadius: 24,
		paddingVertical: 17,
		marginBottom: 50,
		marginHorizontal: 24,
	},
	column: {
		marginBottom: 111,
	},
	column2: {
		marginBottom: 52,
	},
	image: {
		width: 36,
		height: 44,
		marginRight: 6,
	},
	image2: {
		width: 24,
		height: 28,
		marginLeft: 12,
		marginRight: 5,
	},
	image3: {
		width: 24,
		height: 28,
		marginRight: 5,
	},
	input: {
		color: "#6B7280",
		fontSize: 16,
		marginRight: 4,
		flex: 1,
		paddingVertical: 18,
	},
	row: {
		alignSelf: "flex-start",
		flexDirection: "row",
		alignItems: "center",
		marginTop: 68,
		marginBottom: 34,
		marginLeft: 123,
	},
	row2: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		borderColor: "#D1D5DB",
		borderRadius: 24,
		borderWidth: 1,
		marginBottom: 20,
		marginHorizontal: 17,
	},
	row3: {
		alignSelf: "flex-start",
		flexDirection: "row",
		alignItems: "center",
	},
	scrollView: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	text: {
		color: "#1F113C",
		fontSize: 30,
		fontWeight: "bold",
	},
	text2: {
		color: "#364052",
		fontSize: 16,
	},
	text3: {
		color: "#374151",
		fontSize: 14,
		marginBottom: 8,
		marginLeft: 18,
	},
	text4: {
		color: "#374151",
		fontSize: 14,
		marginBottom: 27,
		marginLeft: 17,
	},
	text5: {
		color: "#6B7280",
		fontSize: 16,
	},
	text6: {
		color: "#7E22CE",
		fontSize: 14,
	},
	text7: {
		color: "#FFFFFF",
		fontSize: 18,
		fontWeight: "bold",
	},
	text8: {
		color: "#4B5563",
		fontSize: 16,
	},
	text9: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "bold",
	},
	text10: {
		color: "#374151",
		fontSize: 16,
		fontWeight: "bold",
	},
	passwordInput: {
		color: "#6B7280",
		fontSize: 16,
		flex: 1,
		paddingVertical: 10,
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	view: {
		alignItems: "center",
		marginBottom: 15,
	},
	view2: {
		alignItems: "center",
		marginBottom: 44,
	},
	view3: {
		alignItems: "flex-end",
		marginBottom: 19,
	},
	view4: {
		marginRight: 21,
	},
	view5: {
		alignItems: "center",
		marginBottom: 21,
	},
});

