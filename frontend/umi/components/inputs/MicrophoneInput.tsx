/**
 * Componente de input com microfone para gravação de áudio
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioRecorder } from '@hooks/use-audio-recorder';
import { detectChord } from '@services/api';
import { isChordMatch } from '../../utils/chordUtils';

interface MicrophoneInputProps {
  onDetect?: (result: { chord: string; success: boolean }) => void;
  onComplete?: () => void;
  expectedChord?: string;
  label?: string;
  buttonText?: string;
  disabled?: boolean;
}

export function MicrophoneInput({
  onDetect,
  onComplete,
  expectedChord,
  label = 'Gravar Áudio',
  buttonText,
  disabled = false,
}: MicrophoneInputProps) {
  const {
    isRecording,
    soundUri,
    duration,
    error,
    startRecording,
    stopRecording,
    reset,
  } = useAudioRecorder();

  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleStop = async () => {
    if (!isRecording) return;

    const uri = await stopRecording();
    if (!uri) {
      Alert.alert('Erro', 'Não foi possível gravar o áudio');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await detectChord(uri);
      
      if (result.success && result.chord) {
        // Usar função de comparação inteligente que normaliza acordes
        const isCorrect = expectedChord 
          ? isChordMatch(result.chord, expectedChord)
          : true;

        onDetect?.({ chord: result.chord, success: isCorrect });

        if (expectedChord) {
          if (isCorrect) {
            // Acorde correto - marcar lição como completa
            Alert.alert(
              '✅ Correto!',
              `Você tocou ${result.chord} corretamente!`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    onComplete?.();
                  },
                },
              ]
            );
          } else {
            // Acorde incorreto
            Alert.alert(
              'Tente novamente',
              `Detectado: ${result.chord}\nEsperado: ${expectedChord}`
            );
          }
        }
      } else {
        Alert.alert('Erro', 'Não foi possível detectar o acorde');
        onDetect?.({ chord: '', success: false });
      }
    } catch (err) {
      console.error('Erro ao detectar acorde:', err);
      Alert.alert('Erro', 'Erro ao processar áudio');
      onDetect?.({ chord: '', success: false });
    } finally {
      setIsProcessing(false);
      reset();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[
          styles.button,
          isRecording && styles.buttonRecording,
          disabled && styles.buttonDisabled,
        ]}
        onPress={isRecording ? handleStop : startRecording}
        disabled={disabled || isProcessing}
        activeOpacity={0.7}
      >
        {isProcessing ? (
          <>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text style={styles.buttonText}>Processando...</Text>
          </>
        ) : isRecording ? (
          <>
            <View style={styles.recordingIndicator} />
            <Text style={styles.buttonText}>
              {buttonText || 'Parar Gravação'}
            </Text>
            <Text style={styles.durationText}>{formatTime(duration)}</Text>
          </>
        ) : (
          <>
            <Ionicons name="mic" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>
              {buttonText || 'Gravar Áudio'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {expectedChord && (
        <Text style={styles.hintText}>Tente tocar: {expectedChord}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '600',
    color: '#1F113C',
    marginBottom: 8,
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#F97316',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonRecording: {
    backgroundColor: '#EF4444',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '600',
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Lexend',
    fontWeight: '400',
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontFamily: 'Lexend',
    textAlign: 'center',
  },
  hintText: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'Lexend',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
