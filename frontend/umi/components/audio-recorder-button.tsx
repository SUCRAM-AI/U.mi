/**
 * Componente de botão para gravação de áudio
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useAudioRecorder } from '../hooks/use-audio-recorder';
import Play from '../assets/images/play.svg';

interface AudioRecorderButtonProps {
  onRecordingComplete?: (uri: string) => void;
  onError?: (error: string) => void;
  buttonStyle?: object;
  textStyle?: object;
}

export function AudioRecorderButton({
  onRecordingComplete,
  onError,
  buttonStyle,
  textStyle,
}: AudioRecorderButtonProps) {
  const {
    isRecording,
    isPaused,
    duration,
    soundUri,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
  } = useAudioRecorder();

  React.useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  React.useEffect(() => {
    if (soundUri && onRecordingComplete) {
      onRecordingComplete(soundUri);
      reset();
    }
  }, [soundUri, onRecordingComplete, reset]);

  const handlePress = async () => {
    if (isRecording) {
      if (isPaused) {
        await resumeRecording();
      } else {
        await pauseRecording();
      }
    } else {
      await startRecording();
    }
  };

  const handleStop = async () => {
    await stopRecording();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, buttonStyle, isRecording && styles.buttonRecording]}
        onPress={handlePress}
        activeOpacity={0.7}
        disabled={!!soundUri}
      >
        {isRecording ? (
          <View style={styles.recordingContainer}>
            <View style={styles.recordingIndicator} />
            <Text style={[styles.buttonText, textStyle]}>
              {isPaused ? 'Retomar' : 'Gravando...'}
            </Text>
            <Text style={[styles.durationText, textStyle]}>
              {formatTime(duration)}
            </Text>
          </View>
        ) : (
          <View style={styles.playContainer}>
            <Play width={24} height={24} />
            <Text style={[styles.buttonText, textStyle]}>
              {soundUri ? 'Gravação concluída' : 'Gravar Áudio'}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {isRecording && !isPaused && (
        <TouchableOpacity
          style={[styles.stopButton, buttonStyle]}
          onPress={handleStop}
          activeOpacity={0.7}
        >
          <Text style={[styles.stopButtonText, textStyle]}>Parar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#F97316',
    borderRadius: 9999,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonRecording: {
    backgroundColor: '#EF4444',
  },
  playContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '600',
  },
  durationText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Lexend',
    fontWeight: '400',
  },
  stopButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#6B7280',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '600',
  },
});

