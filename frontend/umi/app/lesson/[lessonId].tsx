/**
 * Rota dinâmica para acessar lições
 * Exemplo: /lesson/1.1, /lesson/2.3, etc.
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
  [key: string]: any;
}

export default function LessonScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user, updateUserProgress } = useAuth();
  const lessonId = params.lessonId as string;
  
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const lessonData = getLesson(lessonId);
    if (lessonData) {
      setLesson(lessonData as LessonData);
    } else {
      Alert.alert('Erro', 'Lição não encontrada');
      router.back();
    }
    setLoading(false);
  }, [lessonId]);

  const handleComplete = async () => {
    if (!lesson || completed) return;
    
    setCompleted(true);
    
    // Atualizar progresso do usuário
    if (user && lesson.xpReward) {
      await updateUserProgress?.(lessonId, lesson.xpReward);
    }
    
    Alert.alert(
      'Parabéns!',
      `Você completou a lição e ganhou ${lesson.xpReward || 0} XP!`,
      [
        {
          text: 'Voltar',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const renderLessonContent = () => {
    if (!lesson) return null;

    switch (lesson.type) {
      case 'quiz-arrastar':
        return (
          <DragAndDrop
            items={lesson.items || []}
            dropZones={lesson.dropZones || []}
            onComplete={handleComplete}
          />
        );
      case 'quiz-audio':
        return (
          <AudioQuiz
            quiz={lesson.quiz || {}}
            onComplete={handleComplete}
          />
        );
      case 'teoria':
        return (
          <TheoryCard
            content={lesson.content}
            asset={lesson.asset}
            onComplete={handleComplete}
          />
        );
      case 'pratica-microfone':
        return (
          <MicrophoneInput
            expectedChord={lesson.expectedChord}
            expectedFrequencies={lesson.expectedFrequencies}
            tolerance={lesson.tolerance || 20}
            onComplete={handleComplete}
          />
        );
      case 'pratica-sequencia':
        return (
          <SequencePractice
            sequence={lesson.sequence || []}
            expectedChords={lesson.expectedChords}
            onComplete={handleComplete}
          />
        );
      case 'pratica-ritmo':
        return (
          <RhythmPractice
            pattern={lesson.pattern}
            tempo={lesson.tempo}
            sequence={lesson.sequence}
            onComplete={handleComplete}
          />
        );
      case 'leitura-diagrama':
        return (
          <DiagramReader
            diagram={lesson.diagram}
            onComplete={handleComplete}
          />
        );
      case 'pratica-toque':
        return (
          <TouchPractice
            expectedChord={lesson.expectedChord}
            onComplete={handleComplete}
          />
        );
      case 'flashcard':
        return (
          <Flashcard
            cards={lesson.cards || []}
            onComplete={handleComplete}
          />
        );
      default:
        return (
          <View style={styles.unsupported}>
            <Text style={styles.unsupportedText}>
              Tipo de lição não suportado: {lesson.type}
            </Text>
          </View>
        );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Carregando lição...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F113C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{lesson.title}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.lessonContainer}>
          <Text style={styles.lessonId}>Lição {lesson.id}</Text>
          <Text style={styles.lessonDescription}>{lesson.description}</Text>
          {lesson.successCriteria && (
            <View style={styles.criteriaContainer}>
              <Text style={styles.criteriaLabel}>Critério de sucesso:</Text>
              <Text style={styles.criteriaText}>{lesson.successCriteria}</Text>
            </View>
          )}
          {renderLessonContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfaff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Lexend-Bold',
    fontWeight: '700',
    color: '#1F113C',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Lexend-Medium',
    color: '#6B7280',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  lessonContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lessonId: {
    fontSize: 14,
    fontFamily: 'Lexend-SemiBold',
    fontWeight: '600',
    color: '#7C3AED',
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    fontWeight: '400',
    color: '#1F113C',
    marginBottom: 16,
    lineHeight: 24,
  },
  criteriaContainer: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  criteriaLabel: {
    fontSize: 12,
    fontFamily: 'Lexend-SemiBold',
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 4,
  },
  criteriaText: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    fontWeight: '400',
    color: '#1F113C',
    lineHeight: 20,
  },
  unsupported: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unsupportedText: {
    fontSize: 16,
    fontFamily: 'Lexend-Medium',
    color: '#EF4444',
    textAlign: 'center',
  },
});
