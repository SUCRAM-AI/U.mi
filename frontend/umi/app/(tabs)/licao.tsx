import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    StatusBar,
    SafeAreaView,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@contexts/AuthContext';
import { Audio } from 'expo-av';

import VoltarSVG from '@assets/images/voltar.svg';
import Iconemusica from '@assets/images/iconmusic.svg';
import Estrela1 from '@assets/images/ystar.svg'
import Estrela2 from '@assets/images/star.svg'
import Play from '@assets/images/play.svg'
import ConcluirSVG from  '@assets/images/concluir.svg' 
const lyricslicao = require('@assets/images/lyricslicao.png');
const acordes = require('@assets/images/acordes.png');


const LicaoAcordesMaioresScreen = () => {
    const router = useRouter();
    const { completeLesson, addXP } = useAuth();
    
    // Estado do Quiz 1
    const [quiz1Answer, setQuiz1Answer] = useState<string | null>(null);
    const correctAnswer1 = 'Dó Maior';
    
    // Estado do Quiz 2 (Formar acorde)
    const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
    const correctNotes = ['Sol', 'Si', 'Ré']; // Sol Maior: Sol (fundamental), Si (terça), Ré (quinta)
    const [quiz2Complete, setQuiz2Complete] = useState(false);
    
    // Estado de conclusão
    const [isCompleted, setIsCompleted] = useState(false);
    
    const handleQuiz1Answer = (answer: string) => {
        setQuiz1Answer(answer);
        if (answer === correctAnswer1) {
            addXP(50);
        }
    };
    
    const handleNoteClick = (note: string) => {
        if (selectedNotes.includes(note)) {
            setSelectedNotes(selectedNotes.filter(n => n !== note));
        } else {
            const newSelection = [...selectedNotes, note];
            setSelectedNotes(newSelection);
            
            // Verificar se está correto
            if (newSelection.length === 3) {
                const isCorrect = 
                    newSelection.includes('Sol') && 
                    newSelection.includes('Si') && 
                    newSelection.includes('Ré');
                
                if (isCorrect) {
                    setQuiz2Complete(true);
                    addXP(50);
                    Alert.alert('Parabéns!', 'Você formou o acorde de Sol Maior corretamente!');
                } else {
                    Alert.alert('Ops!', 'Tente novamente. Lembre-se: Fundamental, Terça, Quinta.');
                    setSelectedNotes([]);
                }
            }
        }
    };
    
    const handleCompleteLesson = async () => {
        if (!quiz1Answer || !quiz2Complete) {
            Alert.alert('Atenção', 'Complete todos os exercícios antes de concluir a lição.');
            return;
        }
        
        await completeLesson('acordes-maiores');
        setIsCompleted(true);
        Alert.alert('Parabéns!', 'Lição concluída! Você ganhou 150 XP!', [
            { text: 'OK', onPress: () => router.push('/(tabs)/trilha') }
        ]);
    };
    
    const getButtonStyle = (answer: string) => {
        if (quiz1Answer === null) return styles.button01;
        if (answer === correctAnswer1) return styles.button03;
        if (answer === quiz1Answer && answer !== correctAnswer1) return styles.button02;
        return styles.button01;
    };
    
    const getNoteButtonStyle = (note: string) => {
        const isSelected = selectedNotes.includes(note);
        const isCorrect = correctNotes.includes(note);
        
        if (isSelected && isCorrect) {
            return styles.button06; // Verde (correto)
        } else if (isSelected && !isCorrect) {
            return styles.button09; // Vermelho (errado)
        }
        return styles.button04; // Cinza (neutro)
    };
    
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#7E22CE" />
            <ScrollView 
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
            >
                {/*Fundo Roxo*/}
                <View style={styles.header}>
                    <Image
                        style={styles.headerBackgroundImage}
                        source={lyricslicao}
                        resizeMode="cover"
                    />
                    <View style={styles.gradientoverlay} />
                    
                    <TouchableOpacity 
                        style={styles.button13} 
                        activeOpacity={0.7}
                        onPress={() => router.back()}
                    >
                        <VoltarSVG 
                            width={40}           
                            height={40}          
                        />          
                    </TouchableOpacity>

                    {/* Indicador de Nível*/}
                    <View style={styles.headerIcons}>
                        <View style={styles.icon03}><Estrela1 width={20} height={20} /></View>
                        <View style={styles.icon04}><Estrela1 width={20} height={20} /></View>
                        <View style={styles.icon05}><Estrela2 width={20} height={20} /></View>
                    </View>
                    
                    
                    <View style={styles.headerContentContainer}>
                        {/* Icone música */}
                        <View style={styles.overlay01}> 
                            <Iconemusica
                                width={48}           
                                height={48}          
                                fill="#FFFFFF"       
                            />
                        </View>
                        
                        {/* Título e Subtítulo */}
                        <View style={styles.headerContent}>
                            <Text style={styles.heading1LioAcordesMaioresSpan}>Lição: Acordes Maiores</Text>
                            <Text style={styles.aprendaAConstruirOsAcordesQueFormamABaseDaMsicaAlegreSpan}>
                                Aprenda a construir os acordes que formam a base da música alegre!
                            </Text>
                        </View>
                    </View>
                    
                    {/* Tags de Dificuldade/Tempo/XP */}
                    <View style={styles.tagsContainer}>
                        <View style={styles.overlay02}>
                            <Text style={styles.fcilSpan}>Fácil</Text>
                        </View>
                        <View style={styles.overlay03}>
                            <Text style={styles.f0MinSpan}>~10 min</Text>
                        </View>
                        <View style={styles.overlay04}>
                            <Text style={styles.f50XpSpan}>+150 XP</Text>
                        </View>
                    </View>
                </View>

                {/* 2. Main Content Area */}
                <View style={styles.main}>
                        
                    {/* O que são Acordes Maiores? */}
                    <View style={styles.paragraphbackgroundshadow}>
                        <Text style={styles.heading2OQueSoAcordesMaioresSpan}>O que são Acordes Maiores?</Text>
                        <Text style={styles.umAcordeMaior}>
                            Um acorde maior é um dos acordes mais comuns na música. É construído a partir de três notas: a{' '}
                            <Text style={styles.acordeMaiorTextBold}>fundamental</Text>
                            , a{' '}
                            <Text style={styles.acordeMaiorTextBold}>terça maior</Text>
                            {' '}e a{' '}
                            <Text style={styles.acordeMaiorTextBold}>quinta justa</Text>
                            . Essa combinação cria um som alegre e brilhante!
                        </Text>
                    </View>

                    {/* Exemplo Visual: Dó Maior */}
                    <View style={styles.backgroundshadow}>
                        <Text style={styles.heading3ExemploVisualDMaiorSpan}>Exemplo Visual: Dó Maior</Text>
                        <Image 
                            style={styles.imagena1} 
                            source={acordes} 
                            resizeMode="contain" 
                        />
                        
                        {/* Dica Prática Box */}
                        <View style={styles.overlayverticalborder}>
                            <Text style={styles.dicaPraticaSpan}>Dica Prática</Text>
                            <Text style={styles.dicaPraticaText}>
                                O acorde de Dó Maior (C) é formado pelas notas{' '}
                                <Text style={styles.dicaPraticaTextBold}>Dó (C)</Text>
                                ,{' '}
                                <Text style={styles.dicaPraticaTextBold}>Mi (E)</Text>
                                , e{' '}
                                <Text style={styles.dicaPraticaTextBold}>Sol (G)</Text>
                                . Tente encontrá-las em um violão!
                            </Text>
                        </View>
                    </View>

                    {/* Exercício: Qual acorde é este?  */}
                    <View style={styles.backgroundshadow01}>
                        <Text style={styles.heading3ExerccioQualAcordeEsteSpan}>Exercício: Qual acorde é este?</Text>
                        <View style={styles.overlay}>
                            <TouchableOpacity style={styles.button}>
                                <Play width={44} height={44} />
                            </TouchableOpacity>
                        </View>
                        
                        {/* Botões de Resposta */}
                        <View style={styles.quizButtonsContainer}>
                            <TouchableOpacity 
                                style={getButtonStyle('Sol Maior')}
                                onPress={() => handleQuiz1Answer('Sol Maior')}
                                disabled={quiz1Answer !== null}
                            >
                                <Text style={styles.solMaiorSpan}>Sol Maior</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={getButtonStyle('Fá Maior')}
                                onPress={() => handleQuiz1Answer('Fá Maior')}
                                disabled={quiz1Answer !== null}
                            >
                                <Text style={styles.fMaiorSpan}>Fá Maior</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={getButtonStyle('Dó Maior')}
                                onPress={() => handleQuiz1Answer('Dó Maior')}
                                disabled={quiz1Answer !== null}
                            >
                                <Text style={styles.dMaiorSpan}>Dó Maior</Text>
                            </TouchableOpacity>
                        </View>
                        {quiz1Answer && (
                            <Text style={[
                                styles.feedbackText,
                                quiz1Answer === correctAnswer1 ? styles.feedbackCorrect : styles.feedbackWrong
                            ]}>
                                {quiz1Answer === correctAnswer1 
                                    ? '✅ Correto! Você ganhou 50 XP!' 
                                    : '❌ Incorreto. A resposta correta é Dó Maior.'}
                            </Text>
                        )}
                    </View>

                    {/* Exercício: Forme o acorde de Sol Maior  */}
                    <View style={styles.backgroundshadow02}>
                        <Text style={styles.heading3ExerccioFormeOAcordeDeSolMaiorSpan}>
                            Exercício: Forme o acorde de Sol Maior
                        </Text>
                        <Text style={styles.cliqueNasNotasNaOrdemCorretaSpan}>
                            Clique nas notas na ordem correta: Fundamental, Terça, Quinta.
                        </Text>
                        
                        {/* Botões de Notas */}
                        <View style={styles.notesButtonsContainer}>
                            <View style={styles.notesRow}>
                                <TouchableOpacity 
                                    style={getNoteButtonStyle('Lá')}
                                    onPress={() => handleNoteClick('Lá')}
                                    disabled={quiz2Complete}
                                >
                                    <Text style={styles.lSpan}>Lá</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={getNoteButtonStyle('Si')}
                                    onPress={() => handleNoteClick('Si')}
                                    disabled={quiz2Complete}
                                >
                                    <Text style={styles.siSpan}>Si</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={getNoteButtonStyle('Sol')}
                                    onPress={() => handleNoteClick('Sol')}
                                    disabled={quiz2Complete}
                                >
                                    <Text style={styles.solSpan}>Sol</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={getNoteButtonStyle('Dó')}
                                    onPress={() => handleNoteClick('Dó')}
                                    disabled={quiz2Complete}
                                >
                                    <Text style={styles.dSpan}>Dó</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.notesRow}>
                                <TouchableOpacity 
                                    style={getNoteButtonStyle('Fá#')}
                                    onPress={() => handleNoteClick('Fá#')}
                                    disabled={quiz2Complete}
                                >
                                    <Text style={styles.fSpan}>Fá#</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={getNoteButtonStyle('Mi')}
                                    onPress={() => handleNoteClick('Mi')}
                                    disabled={quiz2Complete}
                                >
                                    <Text style={styles.mi01Span}>Mi</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={getNoteButtonStyle('Ré')}
                                    onPress={() => handleNoteClick('Ré')}
                                    disabled={quiz2Complete}
                                >
                                    <Text style={styles.rSpan}>Ré</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={getNoteButtonStyle('Si2')}
                                    onPress={() => handleNoteClick('Si2')}
                                    disabled={quiz2Complete}
                                >
                                    <Text style={styles.si01Span}>Si</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {quiz2Complete && (
                            <Text style={styles.feedbackText}>
                                ✅ Acorde formado corretamente! Você ganhou 50 XP!
                            </Text>
                        )}
                    </View>

                    {/* Botão Concluir) */}
                    <View style={styles.footer}>
                        <TouchableOpacity 
                            style={[styles.button12, (!quiz1Answer || !quiz2Complete) && styles.buttonDisabled]}
                            onPress={handleCompleteLesson}
                            disabled={!quiz1Answer || !quiz2Complete}
                        >
                            <View style={styles.icon01}>
                                <ConcluirSVG width={20} height={20}/>
                            </View>
                            <Text style={styles.concluirLioSpan}>Concluir Lição</Text>
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
        backgroundColor: '#F9FAFB',
    },
    scrollViewContent: {
        paddingBottom: 40,
    },
    
    //Header
    header: {
        width: '100%',
        minHeight: 232,
        backgroundColor: '#7E22CE',
        borderBottomRightRadius: 32,
        borderBottomLeftRadius: 32,
        overflow: 'hidden',
        paddingTop: 24,
        paddingHorizontal: 24,
        paddingBottom: 24,
        position: 'relative',
    },
    headerBackgroundImage: {
        position: 'absolute',
        width: '110%',
        height: '120%',
        left: -5,
        top: -14,
        opacity: 0.50,
    },
    gradientoverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.3,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
    },
    button13: {
        zIndex: 10,
        marginBottom: 16,
        padding: 4,
    },
    headerIcons: {
        position: 'absolute',
        right: 24,
        top: 30,
        flexDirection: 'row',
        gap: 8,
        zIndex: 10,
    },
    icon03: { width: 24, height: 24 },
    vector03: { width: 20, height: 18, backgroundColor: '#FBBF24' },
    icon04: { width: 24, height: 24 },
    vector04: { width: 20, height: 18, backgroundColor: '#FBBF24' },
    icon05: { width: 24, height: 24 },
    vector05: { width: 20, height: 18, backgroundColor: 'rgba(255, 255, 255, 0.5)' },
    
    headerContentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        zIndex: 10,
        marginTop: 8,
    },
    overlay01: {
        width: 64,
        height: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        flexShrink: 0,
    },
    icon06: { width: 36, height: 44 },
    vector06: { width: 18, height: 27, backgroundColor: 'white' },

    headerContent: {
        zIndex: 10,
        gap: 12,
        flex: 1,
    },
    heading1LioAcordesMaioresSpan: {
        color: 'white',
        fontSize: 24,
        fontFamily: 'Lexend',
        fontWeight: '700',
        lineHeight: 32,
    },
    aprendaAConstruirOsAcordesQueFormamABaseDaMsicaAlegreSpan: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Lexend',
        fontWeight: '400',
        lineHeight: 20,
        opacity: 0.9,
    },
    tagsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 16,
        width: '100%',
        zIndex: 10,
    },
    overlay02: {
        flex: 1,
        height: 32,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fcilSpan: { color: 'white', fontSize: 14, fontFamily: 'Lexend', fontWeight: '600', lineHeight: 20, },
    overlay03: {
        flex: 1,
        height: 32,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    f0MinSpan: { color: 'white', fontSize: 14, fontFamily: 'Lexend', fontWeight: '600', lineHeight: 20, },
    overlay04: {
        flex: 1,
        height: 32,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    f50XpSpan: { color: 'white', fontSize: 14, fontFamily: 'Lexend', fontWeight: '600', lineHeight: 20, },

    // Main Content Area 
    main: {
        width: '100%',
        paddingHorizontal: 16,
        marginTop: 20,
        gap: 20,
    },

    //O que são Acordes Maiores?
    paragraphbackgroundshadow: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 32,
        padding: 24,
        gap: 16,
        elevation: 2,
    },
    heading2OQueSoAcordesMaioresSpan: {
        color: '#7E22CE',
        fontSize: 20,
        fontFamily: 'Lexend',
        fontWeight: '700',
        lineHeight: 28,
    },
    umAcordeMaior: {
        color: '#6B7280',
        fontSize: 16,
        fontFamily: 'Lexend',
        fontWeight: '400',
        lineHeight: 26,
    },
    acordeMaiorTextBold: {
        color: '#111827',
        fontWeight: '600',
    },

    //Exemplo Visual: Dó Maior
    backgroundshadow: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 32,
        padding: 24,
        gap: 20,
        elevation: 2,
    },
    heading3ExemploVisualDMaiorSpan: {
        color: '#111827',
        fontSize: 18,
        fontFamily: 'Lexend',
        fontWeight: '700',
        lineHeight: 28,
    },
    imagena1: {
        width: '100%',
        height: 200,
        borderRadius: 30,
        alignSelf: 'center',
    },
    overlayverticalborder: {
        width: '100%',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderRadius: 24,
        borderLeftWidth: 4,
        borderLeftColor: '#7E22CE',
        padding: 16,
        gap: 12,
    },
    dicaPraticaSpan: {
        color: '#7E22CE',
        fontSize: 14,
        fontFamily: 'Lexend',
        fontWeight: '600',
        lineHeight: 20,
    },
    dicaPraticaText: {
        color: '#111827',
        fontSize: 16,
        fontFamily: 'Lexend',
        fontWeight: '400',
        lineHeight: 24,
    },
    dicaPraticaTextBold: {
        fontWeight: '600',
    },

    //  Qual acorde é este? 
    backgroundshadow01: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 32,
        padding: 24,
        gap: 20,
        elevation: 2,
    },
    heading3ExerccioQualAcordeEsteSpan: {
        color: '#111827',
        fontSize: 18,
        fontFamily: 'Lexend',
        fontWeight: '700',
        lineHeight: 28,
    },
    overlay: {
        width: '100%',
        height: 88,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        width: 56,
        height: 56,
        backgroundColor: '#F97316',
        borderRadius: 9999,
        elevation: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: { width: 36, height: 44 },
    vector: { width: 16.5, height: 21, backgroundColor: 'white' },
    
    // Botões de Resposta
    quizButtonsContainer: {
        width: '100%',
        gap: 12,
    },
    button01: {
        width: '100%',
        height: 60,
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    solMaiorSpan: { color: '#111827', fontSize: 16, fontFamily: 'Lexend', fontWeight: '500', lineHeight: 24, },
    button02: {
        width: '100%',
        height: 60,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#EF4444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fMaiorSpan: { color: '#EF4444', fontSize: 16, fontFamily: 'Lexend', fontWeight: '500', lineHeight: 24, },
    button03: {
        width: '100%',
        height: 60,
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#22C55E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dMaiorSpan: { color: '#22C55E', fontSize: 16, fontFamily: 'Lexend', fontWeight: '500', lineHeight: 24, },

    // Exercício: Forme o acorde de Sol Maior (Quiz 2)
    backgroundshadow02: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 32,
        padding: 24,
        gap: 20,
        elevation: 2,
    },
    heading3ExerccioFormeOAcordeDeSolMaiorSpan: {
        color: '#111827',
        fontSize: 18,
        fontFamily: 'Lexend',
        fontWeight: '700',
        lineHeight: 28,
    },
    cliqueNasNotasNaOrdemCorretaSpan: {
        color: '#6B7280',
        fontSize: 14,
        fontFamily: 'Lexend',
        fontWeight: '400',
        lineHeight: 20,
    },
    
    // Botões de Notas
    notesButtonsContainer: {
        width: '100%',
        gap: 12,
    },
    notesRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button04: {
        flex: 1,
        height: 60,
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lSpan: { color: '#111827', fontSize: 16, fontFamily: 'Lexend', fontWeight: '700', lineHeight: 24, },
    button05: {
        flex: 1,
        height: 60,
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    siSpan: { color: '#111827', fontSize: 16, fontFamily: 'Lexend', fontWeight: '700', lineHeight: 24, },
    button06: {
        flex: 1,
        height: 60,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#7E22CE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    solSpan: { color: '#7E22CE', fontSize: 16, fontFamily: 'Lexend', fontWeight: '700', lineHeight: 24, },
    button07: {
        flex: 1,
        height: 60,
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dSpan: { color: '#111827', fontSize: 16, fontFamily: 'Lexend', fontWeight: '700', lineHeight: 24, },
    button08: {
        flex: 1,
        height: 60,
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fSpan: { color: '#111827', fontSize: 16, fontFamily: 'Lexend', fontWeight: '700', lineHeight: 24, },
    button09: {
        flex: 1,
        height: 60,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#EF4444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mi01Span: { color: '#EF4444', fontSize: 16, fontFamily: 'Lexend', fontWeight: '700', lineHeight: 24, },
    button10: {
        flex: 1,
        height: 60,
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rSpan: { color: '#111827', fontSize: 16, fontFamily: 'Lexend', fontWeight: '700', lineHeight: 24, },
    button11: {
        flex: 1,
        height: 60,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#7E22CE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    si01Span: { color: '#7E22CE', fontSize: 16, fontFamily: 'Lexend', fontWeight: '700', lineHeight: 24, },

    // 
    footer: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginTop: 20,
    },
    button12: {
        width: '100%',
        height: 56,
        backgroundColor: '#7E22CE',
        borderRadius: 9999,
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    icon01: { width: 24, height: 24 },
    vector01: { width: 20, height: 20, backgroundColor: 'white' },
    concluirLioSpan: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'Lexend',
        fontWeight: '700',
        lineHeight: 28,
    },
    feedbackText: {
        marginTop: 12,
        fontSize: 14,
        fontFamily: 'Lexend',
        fontWeight: '600',
        textAlign: 'center',
    },
    feedbackCorrect: {
        color: '#22C55E',
    },
    feedbackWrong: {
        color: '#EF4444',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});

export default LicaoAcordesMaioresScreen;