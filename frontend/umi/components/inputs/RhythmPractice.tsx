/**
 * Componente para prática de ritmo e strumming
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

interface RhythmPracticeProps {
  pattern: string[]; // ['↓', '↑', '↓', '↑']
  tempo?: number; // BPM
  onComplete?: (accuracy: number) => void;
  title?: string;
  instruction?: string;
}

export function RhythmPractice({
  pattern,
  tempo = 120,
  onComplete,
  title,
  instruction,
}: RhythmPracticeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [userTaps, setUserTaps] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [metronomeSound, setMetronomeSound] = useState<Audio.Sound | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const beatInterval = (60 / tempo) * 1000; // ms per beat

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (metronomeSound) {
        metronomeSound.unloadAsync();
      }
    };
  }, [metronomeSound]);

  const startMetronome = async () => {
    try {
      // Criar um som de metrônomo simples (tic)
      // Em produção, usar um arquivo de áudio real
      setIsPlaying(true);
      setCurrentBeat(0);
      setStartTime(Date.now());
      setUserTaps([]);

      // Iniciar loop de metrônomo
      intervalRef.current = setInterval(() => {
        setCurrentBeat((prev) => {
          const next = (prev + 1) % pattern.length;
          if (next === 0 && prev === pattern.length - 1) {
            // Uma rodada completa
            checkAccuracy();
          }
          return next;
        });
      }, beatInterval);
    } catch (error) {
      console.error('Erro ao iniciar metrônomo:', error);
    }
  };

  const stopMetronome = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(0);
    checkAccuracy();
  };

  const handleTap = () => {
    if (!isPlaying) {
      Alert.alert('Atenção', 'Inicie o metrônomo primeiro!');
      return;
    }

    const now = Date.now();
    if (!startTime) return;

    const elapsed = now - startTime;
    const beatNumber = userTaps.length;
    const expectedTime = beatNumber * beatInterval;

    setUserTaps([...userTaps, elapsed]);
  };

  const checkAccuracy = () => {
    if (userTaps.length === 0) return;

    let correct = 0;
    const tolerance = beatInterval * 0.2; // 20% de tolerância

    userTaps.forEach((tap, index) => {
      const expectedTime = index * beatInterval;
      const diff = Math.abs(tap - expectedTime);
      if (diff <= tolerance) {
        correct++;
      }
    });

    const accuracy = (correct / pattern.length) * 100;
    onComplete?.(accuracy);

    if (accuracy >= 80) {
      Alert.alert('Parabéns!', `Precisão: ${accuracy.toFixed(0)}%`);
    } else {
      Alert.alert('Continue praticando', `Precisão: ${accuracy.toFixed(0)}%`);
    }
  };

  const reset = () => {
    stopMetronome();
    setUserTaps([]);
    setStartTime(null);
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      {instruction && <Text style={styles.instruction}>{instruction}</Text>}

      {/* Pattern Display */}
      <View style={styles.patternContainer}>
        {pattern.map((beat, index) => (
          <View
            key={index}
            style={[
              styles.beatItem,
              currentBeat === index && isPlaying && styles.beatItemActive,
            ]}
          >
            <Text
              style={[
                styles.beatText,
                currentBeat === index && isPlaying && styles.beatTextActive,
              ]}
            >
              {beat}
            </Text>
          </View>
        ))}
      </View>

      {/* Tempo Display */}
      <View style={styles.tempoContainer}>
        <Text style={styles.tempoLabel}>Tempo</Text>
        <Text style={styles.tempoValue}>{tempo} BPM</Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, isPlaying && styles.controlButtonStop]}
          onPress={isPlaying ? stopMetronome : startMetronome}
        >
          <Ionicons
            name={isPlaying ? 'stop-circle' : 'play-circle'}
            size={48}
            color="#FFFFFF"
          />
          <Text style={styles.controlButtonText}>
            {isPlaying ? 'Parar' : 'Iniciar Metrônomo'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tapButton, !isPlaying && styles.tapButtonDisabled]}
          onPress={handleTap}
          disabled={!isPlaying}
        >
          <Text style={styles.tapButtonText}>
            Tocar {pattern[currentBeat]}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      {userTaps.length > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Batidas detectadas: {userTaps.length} / {pattern.length}
          </Text>
        </View>
      )}

      {userTaps.length > 0 && (
        <TouchableOpacity style={styles.resetButton} onPress={reset}>
          <Text style={styles.resetButtonText}>Resetar</Text>
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
  patternContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 20,
  },
  beatItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  beatItemActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
    transform: [{ scale: 1.2 }],
  },
  beatText: {
    fontSize: 24,
    fontFamily: 'Lexend',
    fontWeight: '700',
    color: '#1F113C',
  },
  beatTextActive: {
    color: '#FFFFFF',
  },
  tempoContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
  },
  tempoLabel: {
    fontSize: 14,
    fontFamily: 'Lexend',
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  tempoValue: {
    fontSize: 32,
    fontFamily: 'Lexend',
    fontWeight: '700',
    color: '#1F113C',
  },
  controlsContainer: {
    gap: 16,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#7C3AED',
    borderRadius: 24,
  },
  controlButtonStop: {
    backgroundColor: '#EF4444',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Lexend',
    fontWeight: '600',
  },
  tapButton: {
    padding: 20,
    backgroundColor: '#F97316',
    borderRadius: 24,
    alignItems: 'center',
  },
  tapButtonDisabled: {
    opacity: 0.5,
  },
  tapButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Lexend',
    fontWeight: '700',
  },
  statsContainer: {
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '500',
    color: '#22C55E',
  },
  resetButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#6B7280',
    borderRadius: 24,
    alignSelf: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '600',
  },
});
