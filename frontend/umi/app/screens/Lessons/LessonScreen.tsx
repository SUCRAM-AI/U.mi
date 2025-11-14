/**
 * Tela genérica que carrega dados do JSON e renderiza o componente apropriado
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@contexts/AuthContext';
import { getLesson } from '@config/lessons';

// Componentes de input
import { MicrophoneInput } from '@components/inputs/MicrophoneInput';
import { DragAndDrop } from '@components/inputs/DragAndDrop';
import { AudioQuiz } from '@components/inputs/AudioQuiz';
import { Flashcard } from '@components/inputs/Flashcard';
import { SequencePractice } from '@components/inputs/SequencePractice';
import { RhythmPractice } from '@components/inputs/RhythmPractice';
import { DiagramReader } from '@components/inputs/DiagramReader';
import { TouchPractice } from '@components/inputs/TouchPractice';
import { TheoryCard } from '@components/inputs/TheoryCard';

// Mapeamento de imagens de cabeçalho
const headerImages: Record<string, any> = {
  'assets/images/lyricslicao.png': require('@assets/images/lyricslicao.png'),
};

interface LessonData {
  id: string;
  section: string;
  unit: string;
  lesson: string;
  title: string;
  description: string;
  type: string;
  asset?: string;
  successCriteria: string;
  xpReward?: number;
  expectedFrequencies?: number[];
  tolerance?: number;
  items?: any[];
  dropZones?: any[];
  sequence?: string[];
  expectedChords?: string[];
  expectedChord?: string;
  quiz?: any;
  diagram?: any;
  pattern?: string[];
  tempo?: number;
  targetBPM?: number;
  content?: string | string[];
  headerImage?: string;
  [key: string]: any;
}

export default function LessonScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { addXP, completeLesson } = useAuth();
  
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(10);
  const [completed, setCompleted] = useState(false);
  const [currentChordImage, setCurrentChordImage] = useState<string | undefined>(undefined);
  const [detectedChordImage, setDetectedChordImage] = useState<string | undefined>(undefined);

  // Mapeamento de acordes para imagens
  const chordImageMap: Record<string, string> = {
    'Em': 'assets/images/acorde_em.png',
    'Am': 'assets/images/acorde_am.png',
    'E': 'assets/images/acorde_e.png',
    'A': 'assets/images/acorde_am.png', // Pode usar Am como fallback
    'D': 'assets/images/acorde_d.png',
    'G': 'assets/images/acorde_g.png',
    'C': 'assets/images/acorde_c.png',
  };

  // Garantir que lessonId seja string (pode vir como array do useLocalSearchParams)
  const lessonId = Array.isArray(params.lessonId) ? params.lessonId[0] : (params.lessonId as string);

  useEffect(() => {
    loadLessonData();
  }, [lessonId]);

  const loadLessonData = async () => {
    try {
      setLoading(true);
      
      if (!lessonId) {
        throw new Error('ID da lição não fornecido');
      }
      
      // Carregar JSON usando o índice de lições
      const data = getLesson(lessonId);
      
      if (!data) {
        throw new Error(`Lição ${lessonId} não encontrada`);
      }
      
      setLessonData(data);
      setProgress(10);
      // Inicializar imagem do primeiro acorde se for sequência
      if (data.type === 'pratica-sequencia' && data.sequence && data.sequence.length > 0) {
        const firstChord = data.sequence[0];
        const imagePath = chordImageMap[firstChord];
        if (imagePath) {
          setCurrentChordImage(imagePath);
        }
      } else {
        setCurrentChordImage(undefined);
      }
      // Resetar imagem detectada ao carregar nova lição
      setDetectedChordImage(undefined);
    } catch (error) {
      console.error('Erro ao carregar lição:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lição');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (correct: boolean = true) => {
    if (completed || !correct) return;

    setCompleted(true);
    setProgress(100);

    if (lessonData?.xpReward) {
      await addXP(lessonData.xpReward);
    }

    await completeLesson(lessonData?.id || '');

    Alert.alert(
      'Parabéns!',
      `Lição concluída! Você ganhou ${lessonData?.xpReward || 0} XP!`,
      [
        { text: 'OK', onPress: () => router.back() }
      ]
    );
  };

  const renderContent = () => {
    if (!lessonData) return null;

    const { type } = lessonData;

    switch (type) {
      case 'quiz-arrastar':
        return (
          <DragAndDrop
            items={lessonData.items || []}
            dropZones={lessonData.dropZones || []}
            onComplete={handleComplete}
            title={lessonData.title}
            instruction={lessonData.description}
          />
        );

      case 'quiz-audio':
        // Suporta tanto quiz.questions (array) quanto quiz (objeto único)
        if (lessonData.quiz) {
          if (Array.isArray(lessonData.quiz.questions) && lessonData.quiz.questions.length > 0) {
            // Se for array de perguntas, pega a primeira
            const firstQuestion = lessonData.quiz.questions[0];
            return (
              <AudioQuiz
                question={firstQuestion.question || ''}
                options={firstQuestion.options || []}
                correctAnswer={firstQuestion.correctAnswer || ''}
                audioUri={firstQuestion.audioUri}
                image={lessonData.asset}
                onComplete={handleComplete}
              />
            );
          } else {
            // Se for objeto único (estrutura antiga)
            return (
              <AudioQuiz
                question={lessonData.quiz.question || ''}
                options={lessonData.quiz.options || []}
                correctAnswer={lessonData.quiz.correctAnswer || ''}
                audioUri={lessonData.quiz.audioUri}
                image={lessonData.asset}
                onComplete={handleComplete}
              />
            );
          }
        }
        return null;

      case 'teoria':
        return (
          <TheoryCard
            title={lessonData.title}
            content={lessonData.content || lessonData.description}
            image={lessonData.asset}
          />
        );

      case 'pratica-microfone':
        return (
          <View style={styles.practiceContainer}>
            <TheoryCard
              title={lessonData.title}
              content={lessonData.description}
              image={detectedChordImage || lessonData.asset}
            />
            <MicrophoneInput
              expectedChord={lessonData.expectedChord}
              onDetect={(result: { chord: string; success: boolean }) => {
                // Atualizar imagem baseada no acorde detectado
                if (result.chord) {
                  const imagePath = chordImageMap[result.chord];
                  if (imagePath) {
                    setDetectedChordImage(imagePath);
                  }
                }
                handleComplete(result.success);
              }}
              label="Grave o acorde/nota"
              buttonText={lessonData.expectedChord ? `Tocar ${lessonData.expectedChord}` : 'Gravar'}
            />
          </View>
        );

      case 'pratica-sequencia':
        return (
          <View style={styles.practiceContainer}>
            <TheoryCard
              title={lessonData.title}
              content={lessonData.description}
              image={currentChordImage || lessonData.asset}
            />
            <SequencePractice
              sequence={lessonData.sequence || []}
              onComplete={(results) => {
                const allCorrect = results.every(r => r.correct);
                handleComplete(allCorrect);
              }}
              onCurrentChordChange={(chord: string, index: number) => {
                // Atualizar imagem baseada no acorde atual
                const imagePath = chordImageMap[chord];
                if (imagePath) {
                  setCurrentChordImage(imagePath);
                }
              }}
              title="Sequência de Acordes"
              instruction="Toque cada acorde na ordem exibida"
            />
          </View>
        );

      case 'pratica-ritmo':
        return (
          <View style={styles.practiceContainer}>
            <TheoryCard
              title={lessonData.title}
              content={lessonData.description}
              image={lessonData.asset}
            />
            <RhythmPractice
              pattern={lessonData.pattern || []}
              tempo={lessonData.tempo || 120}
              onComplete={(accuracy) => handleComplete(accuracy >= 80)}
              title="Prática de Ritmo"
              instruction="Siga o padrão rítmico"
            />
          </View>
        );

      case 'strumming':
        return (
          <View style={styles.practiceContainer}>
            <TheoryCard
              title={lessonData.title}
              content={lessonData.description}
              image={lessonData.asset}
            />
            <RhythmPractice
              pattern={lessonData.pattern || []}
              tempo={lessonData.tempo || 120}
              onComplete={(accuracy) => handleComplete(accuracy >= 80)}
              title="Padrão de Strumming"
              instruction="Pratique o padrão de batidas"
            />
          </View>
        );

      case 'leitura-diagrama':
        return (
          <View style={styles.practiceContainer}>
            <TheoryCard
              title={lessonData.title}
              content={lessonData.description}
              image={lessonData.asset}
            />
            {lessonData.diagram && (
              <DiagramReader
                diagram={lessonData.diagram}
                onComplete={() => handleComplete(true)}
                title="Diagrama de Acordes"
                showLabels={true}
              />
            )}
          </View>
        );

      case 'aquecimento':
        return (
          <View style={styles.practiceContainer}>
            <TheoryCard
              title={lessonData.title}
              content={lessonData.description}
              image={lessonData.asset}
            />
            <TouchPractice
              onTap={(timing) => console.log('Tap timing:', timing)}
              targetBPM={lessonData.targetBPM || 120}
              title="Metrônomo Humano"
              instruction="Toque na área em um ritmo constante"
            />
          </View>
        );

      default:
        return (
          <TheoryCard
            title={lessonData.title}
            content={lessonData.description}
            image={lessonData.asset}
          />
        );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Carregando lição...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!lessonData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lição não encontrada</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7E22CE" />
      
      {/* Header */}
      <View style={styles.header}>
        {lessonData.headerImage && headerImages[lessonData.headerImage] && (
          <Image
            style={styles.headerBackgroundImage}
            source={headerImages[lessonData.headerImage]}
            resizeMode="cover"
          />
        )}
        {lessonData.headerImage && (
          <View style={styles.gradientOverlay} />
        )}
        
        <View style={styles.headerTopRow}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{lessonData.title}</Text>
            <Text style={styles.headerSubtitle} numberOfLines={3}>
            {lessonData.description}
          </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}

        {lessonData.successCriteria && (
          <View style={styles.criteriaContainer}>
            <Text style={styles.criteriaLabel}>Critério de Sucesso:</Text>
            <Text style={styles.criteriaText}>{lessonData.successCriteria}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Lexend',
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Lexend',
    fontWeight: '600',
    color: '#EF4444',
  },
  header: {
    backgroundColor: '#7E22CE',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    zIndex: 10,
  },
  headerBackgroundImage: {
    position: 'absolute',
    width: '110%',
    height: '120%',
    left: -5,
    top: -14,
    opacity: 0.50,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerContent: {
    gap: 4,
    flex: 1,
    flexShrink: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Lexend',
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Lexend',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    flexShrink: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Lexend',
    fontWeight: '600',
    color: '#FFFFFF',
    minWidth: 40,
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 20,
  },
  practiceContainer: {
    gap: 24,
  },
  criteriaContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#7C3AED',
    marginTop: 16,
  },
  criteriaLabel: {
    fontSize: 14,
    fontFamily: 'Lexend',
    fontWeight: '600',
    color: '#7C3AED',
    marginBottom: 8,
  },
  criteriaText: {
    fontSize: 14,
    fontFamily: 'Lexend',
    color: '#374151',
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#7C3AED',
    borderRadius: 24,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '600',
  },
});
