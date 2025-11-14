/**
 * Componente para prática de sequência de acordes/notas
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MicrophoneInput } from './MicrophoneInput';
import { detectChord } from '@services/api';

interface SequencePracticeProps {
  sequence: string[];
  onComplete?: (results: { expected: string; detected: string; correct: boolean }[]) => void;
  title?: string;
  instruction?: string;
  currentIndex?: number;
  lessonId?: string;
}

// Mapeamento de acordes para imagens
const chordImages: Record<string, any> = {
  'C': require('@assets/acordes/Dó(C).png'),
  'D': require('@assets/acordes/Ré(D).png'),
  'E': require('@assets/acordes/Mi(E).png'),
  'G': require('@assets/acordes/Sol(G).png'),
  'A': require('@assets/acordes/Lá(A).png'),
  'Am': require('@assets/acordes/LáMenor(Am).png'),
};

export function SequencePractice({
  sequence,
  onComplete,
  title,
  instruction,
  lessonId,
}: SequencePracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<{ expected: string; detected: string; correct: boolean }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleDetect = async (result: { chord: string; success: boolean }) => {
    if (isProcessing || completed) return;

    setIsProcessing(true);
    const expected = sequence[currentIndex];
    const isCorrect = result.success && 
      (result.chord.toLowerCase().includes(expected.toLowerCase()) ||
       expected.toLowerCase().includes(result.chord.toLowerCase()));

    const newResult = {
      expected,
      detected: result.chord,
      correct: isCorrect,
    };

    const newResults = [...results, newResult];
    setResults(newResults);

    if (isCorrect) {
      if (currentIndex < sequence.length - 1) {
        Alert.alert('Correto!', `Detectado: ${result.chord}\nPróximo: ${sequence[currentIndex + 1]}`, [
          { text: 'OK', onPress: () => {
            setCurrentIndex(currentIndex + 1);
            setIsProcessing(false);
          }},
        ]);
      } else {
        // Sequência completa
        setCompleted(true);
        setIsProcessing(false);
        onComplete?.(newResults);
        Alert.alert(
          'Parabéns!',
          'Você completou toda a sequência!',
          [{ text: 'OK' }]
        );
      }
    } else {
      Alert.alert(
        'Tente novamente',
        `Esperado: ${expected}\nDetectado: ${result.chord}`,
        [{ text: 'OK', onPress: () => setIsProcessing(false) }]
      );
    }
  };

  const reset = () => {
    setCurrentIndex(0);
    setResults([]);
    setCompleted(false);
    setIsProcessing(false);
  };

  const getProgress = () => {
    return ((currentIndex + 1) / sequence.length) * 100;
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      {instruction && <Text style={styles.instruction}>{instruction}</Text>}

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${getProgress()}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {sequence.length}
        </Text>
      </View>

      {/* Current Chord */}
      <View style={styles.currentChordContainer}>
        <Text style={styles.currentChordLabel}>Tocar agora:</Text>
        <Text style={styles.currentChord}>{sequence[currentIndex]}</Text>
        {/* Imagem do acorde para lesson 9.2, 10.2 e 10.3 */}
        {(lessonId === '9.2' || lessonId === '10.2' || lessonId === '10.3') && chordImages[sequence[currentIndex]] && (
          <View style={styles.chordImageContainer}>
            <Image 
              source={chordImages[sequence[currentIndex]]} 
              style={styles.chordImage}
              resizeMode="contain"
            />
          </View>
        )}
      </View>

      {/* Sequence Preview */}
      <View style={styles.sequenceContainer}>
        {sequence.map((chord, index) => {
          const isPast = index < currentIndex;
          const isCurrent = index === currentIndex;
          const result = results[index];

          return (
            <View
              key={index}
              style={[
                styles.sequenceItem,
                isPast && (result?.correct ? styles.sequenceItemCorrect : styles.sequenceItemIncorrect),
                isCurrent && !completed && styles.sequenceItemCurrent,
              ]}
            >
              <Text
                style={[
                  styles.sequenceItemText,
                  isPast && result?.correct && styles.sequenceItemTextCorrect,
                  isPast && !result?.correct && styles.sequenceItemTextIncorrect,
                  isCurrent && styles.sequenceItemTextCurrent,
                ]}
              >
                {chord}
              </Text>
              {isPast && (
                <Ionicons
                  name={result?.correct ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={result?.correct ? '#22C55E' : '#EF4444'}
                />
              )}
            </View>
          );
        })}
      </View>

      {/* Microphone Input */}
      <MicrophoneInput
        expectedChord={sequence[currentIndex]}
        onDetect={handleDetect}
        label="Grave o acorde"
        disabled={completed || isProcessing}
        buttonText={isProcessing ? 'Processando...' : 'Gravar'}
      />

      {completed && (
        <TouchableOpacity style={styles.resetButton} onPress={reset}>
          <Text style={styles.resetButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Lexend',
    fontWeight: '700',
    color: '#1F113C',
  },
  instruction: {
    fontSize: 14,
    fontFamily: 'Lexend',
    color: '#6B7280',
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Lexend',
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  currentChordContainer: {
    backgroundColor: '#F5F3FF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  currentChordLabel: {
    fontSize: 14,
    fontFamily: 'Lexend',
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  currentChord: {
    fontSize: 36,
    fontFamily: 'Lexend',
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 16,
  },
  chordImageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  chordImage: {
    width: '100%',
    maxWidth: 300,
    height: 250,
  },
  sequenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  sequenceItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 60,
  },
  sequenceItemCurrent: {
    borderColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
    transform: [{ scale: 1.1 }],
  },
  sequenceItemCorrect: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  sequenceItemIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  sequenceItemText: {
    fontSize: 18,
    fontFamily: 'Lexend',
    fontWeight: '600',
    color: '#1F113C',
  },
  sequenceItemTextCurrent: {
    color: '#7C3AED',
  },
  sequenceItemTextCorrect: {
    color: '#22C55E',
  },
  sequenceItemTextIncorrect: {
    color: '#EF4444',
  },
  resetButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#F97316',
    borderRadius: 24,
    alignSelf: 'center',
    marginTop: 16,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '600',
  },
});
