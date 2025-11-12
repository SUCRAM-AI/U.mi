/**
 * Hook para gravação de áudio
 */

import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  recording: Audio.Recording | null;
  soundUri: string | null;
  duration: number;
  error: string | null;
}

export function useAudioRecorder() {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    recording: null,
    soundUri: null,
    duration: 0,
    error: null,
  });

  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Solicitar permissões ao montar
    (async () => {
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      } catch (error) {
        console.error('Erro ao solicitar permissões de áudio:', error);
        setState(prev => ({
          ...prev,
          error: 'Erro ao solicitar permissões de áudio',
        }));
      }
    })();

    return () => {
      // Limpar interval ao desmontar
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setState(prev => ({ ...prev, error: null }));

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setState(prev => ({
        ...prev,
        isRecording: true,
        recording,
        soundUri: null,
        duration: 0,
      }));

      startTimeRef.current = Date.now();
      
      // Atualizar duração a cada segundo
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setState(prev => ({ ...prev, duration: elapsed }));
      }, 1000);

    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      setState(prev => ({
        ...prev,
        error: 'Erro ao iniciar gravação',
        isRecording: false,
      }));
    }
  };

  const stopRecording = async () => {
    try {
      if (!state.recording) {
        return;
      }

      // Limpar intervalo
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      await state.recording.stopAndUnloadAsync();
      const uri = state.recording.getURI();

      setState(prev => ({
        ...prev,
        isRecording: false,
        isPaused: false,
        recording: null,
        soundUri: uri || null,
        duration: 0,
      }));

      return uri;
    } catch (error) {
      console.error('Erro ao parar gravação:', error);
      setState(prev => ({
        ...prev,
        error: 'Erro ao parar gravação',
        isRecording: false,
      }));
      return null;
    }
  };

  const pauseRecording = async () => {
    try {
      if (!state.recording) {
        return;
      }

      await state.recording.pauseAsync();
      setState(prev => ({
        ...prev,
        isPaused: true,
      }));

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    } catch (error) {
      console.error('Erro ao pausar gravação:', error);
    }
  };

  const resumeRecording = async () => {
    try {
      if (!state.recording) {
        return;
      }

      await state.recording.startAsync();
      setState(prev => ({
        ...prev,
        isPaused: false,
      }));

      startTimeRef.current = Date.now() - state.duration * 1000;
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setState(prev => ({ ...prev, duration: elapsed }));
      }, 1000);
    } catch (error) {
      console.error('Erro ao retomar gravação:', error);
    }
  };

  const reset = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    setState({
      isRecording: false,
      isPaused: false,
      recording: null,
      soundUri: null,
      duration: 0,
      error: null,
    });
  };

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
  };
}

