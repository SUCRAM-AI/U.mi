/**
 * Componente de exercício de detecção de acordes
 * Permite gravar áudio e detectar o acorde tocado
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { AudioRecorderButton } from './audio-recorder-button';
import { detectChord } from '../services/api';
import Play from '../assets/images/play.svg';

interface ChordDetectionExerciseProps {
  expectedChord?: string;
  onCorrect?: () => void;
  onIncorrect?: () => void;
}

export function ChordDetectionExercise({
  expectedChord,
  onCorrect,
  onIncorrect,
}: ChordDetectionExerciseProps) {
  const [detectedChord, setDetectedChord] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);

  const handleRecordingComplete = async (uri: string) => {
    setRecordedUri(uri);
    setIsDetecting(true);
    setDetectedChord(null);

    try {
      const result = await detectChord(uri);

      if (result.success && result.chord) {
        setDetectedChord(result.chord);

        // Verificar se está correto (se esperado foi fornecido)
        if (expectedChord) {
          const isCorrect = result.chord.toLowerCase() === expectedChord.toLowerCase();
          
          if (isCorrect) {
            Alert.alert('✅ Correto!', `Você tocou ${result.chord} corretamente!`, [
              { text: 'OK', onPress: onCorrect },
            ]);
          } else {
            Alert.alert(
              '❌ Incorreto',
              `Você tocou ${result.chord}, mas o esperado era ${expectedChord}`,
              [{ text: 'Tentar novamente', onPress: onIncorrect }]
            );
          }
        } else {
          // Apenas mostrar o acorde detectado
          Alert.alert('Acorde Detectado', `O acorde detectado é: ${result.chord}`);
        }
      } else {
        Alert.alert('Erro', result.message || 'Não foi possível detectar o acorde');
      }
    } catch (error) {
      console.error('Erro ao detectar acorde:', error);
      Alert.alert('Erro', 'Não foi possível processar o áudio. Tente novamente.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleError = (error: string) => {
    Alert.alert('Erro na gravação', error);
  };

  const handlePlayAudio = async () => {
    if (!recordedUri) return;

    try {
      const { sound } = await Audio.Sound.createAsync({ uri: recordedUri });
      await sound.playAsync();
      
      // Limpar o som quando terminar
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
      Alert.alert('Erro', 'Não foi possível reproduzir o áudio');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grave o acorde que você tocou</Text>
      <Text style={styles.subtitle}>
        {expectedChord
          ? `Tente tocar: ${expectedChord}`
          : 'Grave seu áudio e descubra qual acorde você tocou'}
      </Text>

      <View style={styles.recorderContainer}>
        <AudioRecorderButton
          onRecordingComplete={handleRecordingComplete}
          onError={handleError}
          buttonStyle={styles.recorderButton}
        />
      </View>

      {isDetecting && (
        <View style={styles.detectingContainer}>
          <ActivityIndicator size="large" color="#7E22CE" />
          <Text style={styles.detectingText}>Analisando áudio...</Text>
        </View>
      )}

      {detectedChord && !isDetecting && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>Acorde detectado:</Text>
          <Text style={styles.resultChord}>{detectedChord}</Text>
          
          {recordedUri && (
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayAudio}
              activeOpacity={0.7}
            >
              <Play width={24} height={24} />
              <Text style={styles.playButtonText}>Reproduzir gravação</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {expectedChord && detectedChord && (
        <View
          style={[
            styles.feedbackContainer,
            detectedChord.toLowerCase() === expectedChord.toLowerCase()
              ? styles.feedbackCorrect
              : styles.feedbackIncorrect,
          ]}
        >
          <Text style={styles.feedbackText}>
            {detectedChord.toLowerCase() === expectedChord.toLowerCase()
              ? '✅ Correto!'
              : '❌ Tente novamente'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 32,
    gap: 16,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Lexend',
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Lexend',
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
  },
  recorderContainer: {
    width: '100%',
    marginVertical: 8,
  },
  recorderButton: {
    width: '100%',
  },
  detectingContainer: {
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  detectingText: {
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '500',
    color: '#7E22CE',
  },
  resultContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    gap: 8,
  },
  resultLabel: {
    fontSize: 14,
    fontFamily: 'Lexend',
    fontWeight: '500',
    color: '#6B7280',
  },
  resultChord: {
    fontSize: 24,
    fontFamily: 'Lexend',
    fontWeight: '700',
    color: '#7E22CE',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    padding: 8,
  },
  playButtonText: {
    fontSize: 14,
    fontFamily: 'Lexend',
    fontWeight: '500',
    color: '#7E22CE',
  },
  feedbackContainer: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  feedbackCorrect: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  feedbackIncorrect: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  feedbackText: {
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '600',
    color: '#111827',
  },
});

