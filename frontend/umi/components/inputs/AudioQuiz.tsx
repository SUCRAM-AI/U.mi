/**
 * Componente de Quiz com áudio
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

// Importar SVGs
import MaiorMenorSVG from '@assets/images/maior_menor.svg';

// Mapeamento de imagens PNG (apenas imagens que existem)
const assetImages: Record<string, any> = {
  // Adicione PNGs aqui quando forem criados
};

// Mapeamento de SVGs
const assetSVGs: Record<string, React.ComponentType<any>> = {
  'assets/images/maior_menor.svg': MaiorMenorSVG,
};

interface AudioQuizProps {
  question: string;
  options: string[];
  correctAnswer: string;
  audioUri?: string;
  image?: string;
  onComplete?: (correct: boolean) => void;
  autoPlay?: boolean;
}

export function AudioQuiz({
  question,
  options,
  correctAnswer,
  audioUri,
  image,
  onComplete,
  autoPlay = false,
}: AudioQuizProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [completed, setCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (autoPlay && audioUri) {
      playAudio();
    }

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audioUri]);

  const playAudio = async () => {
    if (!audioUri) return;

    try {
      setIsLoading(true);
      const { sound: audioSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );

      setSound(audioSound);
      setIsPlaying(true);

      audioSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
      Alert.alert('Erro', 'Não foi possível reproduzir o áudio');
    } finally {
      setIsLoading(false);
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  const handleSelect = (option: string) => {
    if (completed) return;

    setSelectedAnswer(option);
    const isCorrect = option.toLowerCase() === correctAnswer.toLowerCase();
    setCompleted(true);

    onComplete?.(isCorrect);

    if (isCorrect) {
      Alert.alert('Parabéns!', 'Resposta correta!');
    } else {
      Alert.alert(
        'Tente novamente',
        `Resposta incorreta. A resposta correta é: ${correctAnswer}`
      );
    }
  };

  const reset = () => {
    setSelectedAnswer(null);
    setCompleted(false);
    if (sound) {
      stopAudio();
    }
  };

  const getOptionStyle = (option: string) => {
    if (!selectedAnswer || !completed) return styles.option;

    const isSelected = selectedAnswer === option;
    const isCorrect = option === correctAnswer;

    if (isSelected && isCorrect) {
      return [styles.option, styles.optionCorrect];
    } else if (isSelected && !isCorrect) {
      return [styles.option, styles.optionIncorrect];
    } else if (isCorrect && !isSelected) {
      return [styles.option, styles.optionCorrectHidden];
    }

    return styles.option;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>

      {image && (
        <View style={styles.imageContainer}>
          {assetSVGs[image] ? (
            <View style={styles.svgContainer}>
              {(() => {
                const SVGComponent = assetSVGs[image];
                return <SVGComponent width="100%" height="250" />;
              })()}
            </View>
          ) : assetImages[image] ? (
            <Image 
              source={assetImages[image]} 
              style={styles.image}
              resizeMode="contain"
            />
          ) : null}
        </View>
      )}

      {audioUri && (
        <TouchableOpacity
          style={styles.audioButton}
          onPress={isPlaying ? stopAudio : playAudio}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#F97316" />
          ) : (
            <Ionicons
              name={isPlaying ? 'pause-circle' : 'play-circle'}
              size={48}
              color="#F97316"
            />
          )}
          <Text style={styles.audioButtonText}>
            {isPlaying ? 'Pausar Áudio' : 'Ouvir Áudio'}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.optionsContainer}>
        {options && options.length > 0 ? options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={getOptionStyle(option)}
            onPress={() => handleSelect(option)}
            disabled={completed}
          >
            <Text style={styles.optionText}>{option}</Text>
            {completed &&
              selectedAnswer === option &&
              (option === correctAnswer ? (
                <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
              ) : (
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              ))}
          </TouchableOpacity>
        )) : (
          <Text style={styles.errorText}>Nenhuma opção disponível</Text>
        )}
      </View>

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
  question: {
    fontSize: 18,
    fontFamily: 'Lexend',
    fontWeight: '600',
    color: '#1F113C',
    marginBottom: 16,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
  },
  svgContainer: {
    width: '100%',
    minHeight: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFF7ED',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#F97316',
  },
  audioButtonText: {
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '600',
    color: '#F97316',
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionCorrect: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  optionIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  optionCorrectHidden: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
    opacity: 0.7,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '500',
    color: '#1F113C',
    flex: 1,
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
  errorText: {
    fontSize: 14,
    fontFamily: 'Lexend',
    color: '#EF4444',
    textAlign: 'center',
    padding: 16,
  },
});
