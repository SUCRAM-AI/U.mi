/**
 * Componente para prática de toque na tela (metrônomo humano)
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

interface TouchPracticeProps {
  onTap?: (timing: number) => void;
  targetBPM?: number;
  title?: string;
  instruction?: string;
}

export function TouchPractice({
  onTap,
  targetBPM,
  title,
  instruction,
}: TouchPracticeProps) {
  const [taps, setTaps] = useState<number[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [currentBPM, setCurrentBPM] = useState<number | null>(null);
  const lastTapRef = useRef<number>(0);
  const intervalsRef = useRef<number[]>([]);

  const handleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (lastTapRef.current > 0 && timeSinceLastTap < 2000) {
      // Limitar intervalos entre 100ms e 2s
      intervalsRef.current.push(timeSinceLastTap);
      
      // Manter apenas últimos 4 intervalos
      if (intervalsRef.current.length > 4) {
        intervalsRef.current.shift();
      }

      // Calcular BPM médio
      const avgInterval = intervalsRef.current.reduce((a, b) => a + b, 0) / intervalsRef.current.length;
      const bpm = Math.round(60000 / avgInterval);
      setCurrentBPM(bpm);
      onTap?.(timeSinceLastTap);
    }

    lastTapRef.current = now;
    setTaps([...taps, now]);
    setIsActive(true);

    // Reset após 2 segundos sem tap
    setTimeout(() => {
      if (Date.now() - lastTapRef.current >= 2000) {
        setIsActive(false);
        setCurrentBPM(null);
        intervalsRef.current = [];
      }
    }, 2000);
  };

  const reset = () => {
    setTaps([]);
    setIsActive(false);
    setCurrentBPM(null);
    intervalsRef.current = [];
    lastTapRef.current = 0;
  };

  const getAccuracy = () => {
    if (!targetBPM || !currentBPM) return null;

    const targetInterval = 60000 / targetBPM;
    const avgInterval = intervalsRef.current.reduce((a, b) => a + b, 0) / intervalsRef.current.length;
    const diff = Math.abs(targetInterval - avgInterval);
    const accuracy = Math.max(0, 100 - (diff / targetInterval) * 100);

    return Math.round(accuracy);
  };

  const accuracy = getAccuracy();

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      {instruction && <Text style={styles.instruction}>{instruction}</Text>}

      {/* BPM Display */}
      <View style={styles.bpmContainer}>
        {targetBPM && (
          <View style={styles.targetBPMContainer}>
            <Text style={styles.targetBPMLabel}>Alvo</Text>
            <Text style={styles.targetBPMValue}>{targetBPM} BPM</Text>
          </View>
        )}

        {currentBPM && (
          <View style={styles.currentBPMContainer}>
            <Text style={styles.currentBPMLabel}>Seu Tempo</Text>
            <Text
              style={[
                styles.currentBPMValue,
                targetBPM &&
                  accuracy !== null &&
                  (accuracy >= 80
                    ? styles.currentBPMValueGood
                    : accuracy >= 60
                    ? styles.currentBPMValueMedium
                    : styles.currentBPMValuePoor),
              ]}
            >
              {currentBPM} BPM
            </Text>
          </View>
        )}

        {targetBPM && accuracy !== null && (
          <View style={styles.accuracyContainer}>
            <Text style={styles.accuracyLabel}>Precisão</Text>
            <Text
              style={[
                styles.accuracyValue,
                accuracy >= 80
                  ? styles.accuracyValueGood
                  : accuracy >= 60
                  ? styles.accuracyValueMedium
                  : styles.accuracyValuePoor,
              ]}
            >
              {accuracy}%
            </Text>
          </View>
        )}
      </View>

      {/* Tap Area */}
      <TouchableOpacity
        style={[
          styles.tapArea,
          isActive && styles.tapAreaActive,
        ]}
        onPress={handleTap}
        activeOpacity={0.8}
      >
        <View style={styles.tapCircle}>
          <Ionicons name="hand-left" size={64} color="#FFFFFF" />
        </View>
        <Text style={styles.tapText}>Toque aqui</Text>
        {taps.length > 0 && (
          <Text style={styles.tapCount}>{taps.length} toques</Text>
        )}
      </TouchableOpacity>

      {/* Instructions */}
      {taps.length === 0 && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            Toque na área acima em um ritmo constante para calcular seu BPM
          </Text>
        </View>
      )}

      {/* Feedback */}
      {targetBPM && accuracy !== null && (
        <View style={styles.feedbackContainer}>
          {accuracy >= 80 ? (
            <>
              <Ionicons name="checkmark-circle" size={32} color="#22C55E" />
              <Text style={styles.feedbackTextGood}>Ótimo! Mantenha o ritmo!</Text>
            </>
          ) : accuracy >= 60 ? (
            <>
              <Ionicons name="warning" size={32} color="#F97316" />
              <Text style={styles.feedbackTextMedium}>
                Continue praticando. Você está próximo!
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="close-circle" size={32} color="#EF4444" />
              <Text style={styles.feedbackTextPoor}>
                Tente manter um ritmo mais constante
              </Text>
            </>
          )}
        </View>
      )}

      {/* Reset Button */}
      {taps.length > 0 && (
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
    gap: 24,
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
  bpmContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  targetBPMContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F3FF',
    borderRadius: 16,
    alignItems: 'center',
  },
  targetBPMLabel: {
    fontSize: 12,
    fontFamily: 'Lexend',
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  targetBPMValue: {
    fontSize: 24,
    fontFamily: 'Lexend',
    fontWeight: '700',
    color: '#7C3AED',
  },
  currentBPMContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    alignItems: 'center',
  },
  currentBPMLabel: {
    fontSize: 12,
    fontFamily: 'Lexend',
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  currentBPMValue: {
    fontSize: 24,
    fontFamily: 'Lexend',
    fontWeight: '700',
    color: '#F97316',
  },
  currentBPMValueGood: {
    color: '#22C55E',
  },
  currentBPMValueMedium: {
    color: '#F97316',
  },
  currentBPMValuePoor: {
    color: '#EF4444',
  },
  accuracyContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    alignItems: 'center',
  },
  accuracyLabel: {
    fontSize: 12,
    fontFamily: 'Lexend',
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  accuracyValue: {
    fontSize: 24,
    fontFamily: 'Lexend',
    fontWeight: '700',
    color: '#1F113C',
  },
  accuracyValueGood: {
    color: '#22C55E',
  },
  accuracyValueMedium: {
    color: '#F97316',
  },
  accuracyValuePoor: {
    color: '#EF4444',
  },
  tapArea: {
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  tapAreaActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
    borderStyle: 'solid',
  },
  tapCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapText: {
    fontSize: 18,
    fontFamily: 'Lexend',
    fontWeight: '600',
    color: '#1F113C',
  },
  tapCount: {
    fontSize: 14,
    fontFamily: 'Lexend',
    fontWeight: '500',
    color: '#6B7280',
  },
  instructionsContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
  },
  instructionsText: {
    fontSize: 14,
    fontFamily: 'Lexend',
    color: '#6B7280',
    textAlign: 'center',
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
  },
  feedbackTextGood: {
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '600',
    color: '#22C55E',
  },
  feedbackTextMedium: {
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '600',
    color: '#F97316',
  },
  feedbackTextPoor: {
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '600',
    color: '#EF4444',
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
