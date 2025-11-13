import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { useAudioRecorder } from '../../hooks/use-audio-recorder';
import { detectChord, compareChords, extractChords } from '../../services/api';

// Componente Header Reutilizável
interface HeaderProps {
  title: string;
  subtitle: string;
  progress: number;
  onBack?: () => void;
}

function Header({ title, subtitle, progress, onBack }: HeaderProps) {
  return (
    <View style={styles.header}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>
    </View>
  );
}

// Componente Card Reutilizável
interface CardProps {
  children: React.ReactNode;
  color?: string;
  icon?: string;
  onPress?: () => void;
}

function Card({ children, color = '#FFFFFF', icon, onPress }: CardProps) {
  const content = (
    <View style={[styles.card, { backgroundColor: color }]}>
      {icon && (
        <View style={styles.cardIconContainer}>
          <Ionicons name={icon as any} size={32} color="#7C3AED" />
        </View>
      )}
      {children}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
}

// Componente Botão Reutilizável
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
}

function Button({ title, onPress, variant = 'primary', icon, disabled, loading }: ButtonProps) {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.buttonSecondary;
      case 'success':
        return styles.buttonSuccess;
      case 'danger':
        return styles.buttonDanger;
      default:
        return styles.buttonPrimary;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[getButtonStyle(), disabled && styles.buttonDisabled]}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          {icon && <Ionicons name={icon as any} size={20} color="#FFFFFF" />}
          <Text style={styles.buttonText}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

// Componente Player de Áudio
interface AudioPlayerProps {
  onPlay: () => void;
  isPlaying: boolean;
  label?: string;
}

function AudioPlayer({ onPlay, isPlaying, label = 'Ouvir' }: AudioPlayerProps) {
  const [waveAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      waveAnimation.setValue(0);
    }
  }, [isPlaying]);

  return (
    <TouchableOpacity onPress={onPlay} style={styles.playerButton}>
      <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#FFFFFF" />
      <Text style={styles.playerButtonText}>{isPlaying ? 'Pausar' : label}</Text>
      {isPlaying && (
        <View style={styles.waveform}>
          {[...Array(5)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.waveBar,
                {
                  height: waveAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [8, 24, 8],
                  }),
                },
              ]}
            />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

// Componente Feedback
interface FeedbackProps {
  type: 'success' | 'error' | 'warning';
  message: string;
}

function Feedback({ type, message }: FeedbackProps) {
  const getStyle = () => {
    switch (type) {
      case 'success':
        return styles.feedbackSuccess;
      case 'error':
        return styles.feedbackError;
      case 'warning':
        return styles.feedbackWarning;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
    }
  };

  return (
    <View style={[styles.feedback, getStyle()]}>
      <Ionicons name={getIcon()} size={24} color="#FFFFFF" />
      <Text style={styles.feedbackText}>{message}</Text>
    </View>
  );
}

// Tela Principal
export default function LessonProgression() {
  const router = useRouter();
  const [progress, setProgress] = useState(40);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'success' | 'error' | null>(null);
  const [practiceChords, setPracticeChords] = useState<string[]>([]);
  const [practiceResults, setPracticeResults] = useState<boolean[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);

  // Estados para modo música sincronizado
  const [musicUri, setMusicUri] = useState<string | null>(null);
  const [musicSound, setMusicSound] = useState<Audio.Sound | null>(null);
  const [musicChords, setMusicChords] = useState<Array<{start: number; end: number; chord_majmin: string}>>([]);
  const [currentMusicChordIndex, setCurrentMusicChordIndex] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessingMusic, setIsProcessingMusic] = useState(false);
  const [userRecordingUri, setUserRecordingUri] = useState<string | null>(null);
  const [isWaitingForUser, setIsWaitingForUser] = useState(false);
  const [isProcessingChord, setIsProcessingChord] = useState(false);
  const [lastDetectedChord, setLastDetectedChord] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    isRecording: isRecordingAudio,
    soundUri,
    startRecording,
    stopRecording,
    reset,
  } = useAudioRecorder();

  const targetChords = ['C', 'G', 'Am', 'F'];

  const handlePlayExample = async () => {
    setIsPlaying(!isPlaying);
    // Aqui você pode tocar um áudio de exemplo
    // Por enquanto, apenas simula a animação
  };

  const handlePlayHarmonicFunction = async (chord: string) => {
    // Tocar exemplo de áudio para a função harmônica
    Alert.alert('Áudio', `Tocando exemplo de ${chord}`);
  };

  const handleQuizSelect = (index: number) => {
    setSelectedQuiz(index);
    // A resposta correta é a opção 2 (vi–IV–V–I)
    if (index === 2) {
      setQuizFeedback('success');
      setProgress(Math.min(progress + 10, 100));
    } else {
      setQuizFeedback('error');
    }
  };

  const handleStartPractice = async () => {
    setCurrentChordIndex(0);
    setPracticeChords([]);
    setPracticeResults([]);
    setIsRecording(true);
    await startRecording();
  };

  const handleStopPractice = async () => {
    const uri = await stopRecording();
    setIsRecording(false);

    if (!uri) {
      Alert.alert('Erro', 'Não foi possível gravar o áudio');
      return;
    }

    // Detectar acorde
    try {
      const result = await detectChord(uri);
      if (result.success && result.chord) {
        const expectedChord = targetChords[currentChordIndex];
        const isCorrect = result.chord.toLowerCase() === expectedChord.toLowerCase();

        setPracticeChords([...practiceChords, result.chord]);
        setPracticeResults([...practiceResults, isCorrect]);

        if (isCorrect) {
          setCurrentChordIndex(currentChordIndex + 1);
          setProgress(Math.min(progress + 5, 100));

          if (currentChordIndex + 1 < targetChords.length) {
            Alert.alert('✅ Correto!', `Você tocou ${result.chord}. Próximo: ${targetChords[currentChordIndex + 1]}`);
          } else {
            Alert.alert('🎉 Parabéns!', 'Você completou a sequência!');
            setProgress(100);
          }
        } else {
          Alert.alert('❌ Tente novamente', `Você tocou ${result.chord}, mas o esperado era ${expectedChord}`);
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível processar o áudio');
    }

    reset();
  };

  // Funções para modo música sincronizado
  const handleSelectMusic = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setMusicUri(uri);
        setIsProcessingMusic(true);
        
        // Extrair acordes da música
        try {
          const chordsResult = await extractChords(uri);
          if (chordsResult.success && chordsResult.chords.length > 0) {
            setMusicChords(chordsResult.chords);
            setCurrentMusicChordIndex(0);
            setIsProcessingMusic(false);
            Alert.alert('Sucesso!', `${chordsResult.count} acordes detectados na música!`);
          } else {
            setIsProcessingMusic(false);
            Alert.alert('Erro', 'Não foi possível extrair acordes da música');
          }
        } catch (error) {
          setIsProcessingMusic(false);
          Alert.alert('Erro', 'Erro ao processar a música');
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao selecionar música');
    }
  };

  const handlePlayMusic = async () => {
    if (!musicUri || !musicChords.length) {
      Alert.alert('Atenção', 'Selecione uma música primeiro');
      return;
    }

    try {
      if (musicSound) {
        await musicSound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: musicUri },
        { shouldPlay: true }
      );

      setMusicSound(sound);
      setIsMusicPlaying(true);
      setIsPaused(false);
      setElapsedTime(0);
      setCurrentMusicChordIndex(0);
      setIsWaitingForUser(false);

      // Monitorar tempo e sincronizar acordes
      intervalRef.current = setInterval(async () => {
        if (isPaused || isWaitingForUser) {
          return;
        }

        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded && status.isPlaying) {
            const position = status.positionMillis / 1000; // em segundos
            setElapsedTime(position);

            // Atualizar índice do acorde atual baseado no tempo
            setCurrentMusicChordIndex((prevIndex) => {
              let newIndex = prevIndex;
              while (
                newIndex + 1 < musicChords.length &&
                position >= musicChords[newIndex + 1].start
              ) {
                newIndex++;
              }

              // Pausar em acordes específicos (exemplo: a cada 2 acordes)
              if (newIndex !== prevIndex && newIndex > 0 && newIndex % 2 === 0) {
                sound.pauseAsync().then(() => {
                  setIsPaused(true);
                  setIsMusicPlaying(false);
                  setIsWaitingForUser(true);
                  Alert.alert(
                    'Pausa!',
                    `Toque o acorde ${musicChords[newIndex].chord_majmin} e grave seu áudio.`
                  );
                });
              }

              return newIndex;
            });
          }
        } catch (error) {
          console.error('Erro ao atualizar status:', error);
        }
      }, 100); // Atualizar a cada 100ms

      // Limpar intervalo quando a música terminar
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsMusicPlaying(false);
        }
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível reproduzir a música');
    }
  };

  const handleResumeMusic = async () => {
    if (musicSound && isPaused) {
      await musicSound.playAsync();
      setIsMusicPlaying(true);
      setIsPaused(false);
    }
  };

  const handleUserChordSubmission = async () => {
    console.log('🎯 handleUserChordSubmission chamado');
    console.log('isWaitingForUser:', isWaitingForUser);
    console.log('userRecordingUri:', userRecordingUri);
    
    if (!isWaitingForUser || !userRecordingUri) {
      Alert.alert('Atenção', 'Grave o áudio do acorde primeiro');
      return;
    }

    setIsProcessingChord(true);
    setLastError(null);
    setLastDetectedChord(null);
    
    console.log('📤 Enviando áudio para detecção:', userRecordingUri);

    try {
      const result = await detectChord(userRecordingUri);
      console.log('📥 Resposta recebida:', result);
      
      setIsProcessingChord(false);
      
      if (result.success && result.chord) {
        const expectedChord = musicChords[currentMusicChordIndex]?.chord_majmin;
        console.log('🎵 Acorde esperado:', expectedChord);
        console.log('🎵 Acorde detectado:', result.chord);
        
        // Verificar se o acorde detectado corresponde ao esperado
        const detectedChord = result.chord;
        const allDetectedChords = result.all_chords || [];
        setLastDetectedChord(detectedChord);
        
        // Comparar: verificar se o acorde esperado está nos acordes detectados
        const isCorrect = 
          detectedChord.toLowerCase() === expectedChord.toLowerCase() ||
          allDetectedChords.some(chord => chord.toLowerCase() === expectedChord.toLowerCase());

        console.log('✅ Acertou?', isCorrect);

        if (isCorrect) {
          Alert.alert('✅ Acertou!', 'Avançando para o próximo acorde.');
          setIsWaitingForUser(false);
          setUserRecordingUri(null);
          setLastDetectedChord(null);
          await handleResumeMusic();
        } else {
          Alert.alert(
            '❌ Acorde errado', 
            `Você tocou ${detectedChord}${allDetectedChords.length > 1 ? ` (ou ${allDetectedChords.slice(1).join(', ')})` : ''}, mas o esperado era ${expectedChord}. Tente novamente.`
          );
        }
      } else {
        const errorMsg = result.error || 'Não foi possível detectar o acorde';
        console.error('❌ Erro na detecção:', errorMsg);
        setLastError(errorMsg);
        Alert.alert('Erro', errorMsg + '. Tente gravar novamente.');
      }
    } catch (error) {
      console.error('💥 Exceção ao processar áudio:', error);
      setIsProcessingChord(false);
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setLastError(errorMsg);
      Alert.alert('Erro', `Não foi possível processar o áudio: ${errorMsg}`);
    }
  };

  const handleRecordUserChord = async () => {
    console.log('🎙️ handleRecordUserChord chamado');
    console.log('isWaitingForUser:', isWaitingForUser);
    
    if (!isWaitingForUser) {
      Alert.alert('Atenção', 'A música precisa estar pausada para gravar');
      return;
    }

    console.log('🎙️ Iniciando gravação...');
    try {
      await startRecording();
      console.log('✅ Gravação iniciada');
    } catch (error) {
      console.error('❌ Erro ao iniciar gravação:', error);
      Alert.alert('Erro', 'Não foi possível iniciar a gravação');
    }
  };

  const handleStopUserChord = async () => {
    console.log('⏹️ handleStopUserChord chamado');
    try {
      const uri = await stopRecording();
      console.log('📼 Gravação parada, URI:', uri);
      if (uri) {
        setUserRecordingUri(uri);
        console.log('✅ URI salva:', uri);
      } else {
        console.error('❌ URI vazia');
        Alert.alert('Erro', 'Não foi possível obter o áudio gravado');
      }
    } catch (error) {
      console.error('❌ Erro ao parar gravação:', error);
      Alert.alert('Erro', 'Não foi possível parar a gravação');
    }
  };

  // Limpar ao desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (musicSound) {
        musicSound.unloadAsync();
      }
    };
  }, [musicSound]);

  const correctCount = practiceResults.filter((r) => r).length;
  const totalCount = practiceResults.length;

  return (
    <ScrollView style={styles.container}>
      <Header
        title="🎶 Lição: Progressões Musicais"
        subtitle="Aprenda a ouvir e entender o movimento dos acordes."
        progress={progress}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        {/* SEÇÃO 1 — Introdução Visual */}
        <Card>
          <Text style={styles.sectionTitle}>Círculo dos Graus</Text>
          <Text style={styles.sectionDescription}>
            Cada acorde tem um papel no tom. Alguns dão repouso, outros criam movimento.
          </Text>
          <View style={styles.degreesCircle}>
            {[
              { degree: 'I', label: 'Tônica', color: '#22C55E' },
              { degree: 'ii', label: 'Super', color: '#9CA3AF' },
              { degree: 'iii', label: 'Mediante', color: '#9CA3AF' },
              { degree: 'IV', label: 'Subdominante', color: '#3B82F6' },
              { degree: 'V', label: 'Dominante', color: '#F97316' },
              { degree: 'vi', label: 'Relativa', color: '#9CA3AF' },
              { degree: 'vii°', label: 'Sensível', color: '#9CA3AF' },
            ].map((item, index) => (
              <View key={index} style={styles.degreeItem}>
                <View style={[styles.degreeCircle, { backgroundColor: item.color }]}>
                  <Text style={styles.degreeText}>{item.degree}</Text>
                </View>
                <Text style={styles.degreeLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* SEÇÃO 2 — Exemplo Auditivo */}
        <Card>
          <Text style={styles.sectionTitle}>Exemplo Auditivo</Text>
          <Text style={styles.sectionDescription}>Ouça a progressão I–V–vi–IV</Text>
          <AudioPlayer onPlay={handlePlayExample} isPlaying={isPlaying} label="▶️ Ouvir" />
        </Card>

        {/* SEÇÃO 3 — Funções Harmônicas */}
        <Card>
          <Text style={styles.sectionTitle}>Funções Harmônicas</Text>
          <View style={styles.harmonicFunctions}>
            <TouchableOpacity
              style={[styles.functionCard, styles.functionTonic]}
              onPress={() => handlePlayHarmonicFunction('Tônica')}
            >
              <Ionicons name="home" size={32} color="#22C55E" />
              <Text style={styles.functionTitle}>🎯 Tônica (I)</Text>
              <Text style={styles.functionDescription}>Transmite repouso</Text>
              <Ionicons name="play-circle" size={24} color="#22C55E" style={styles.playIcon} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.functionCard, styles.functionSubdominant]}
              onPress={() => handlePlayHarmonicFunction('Subdominante')}
            >
              <Ionicons name="water" size={32} color="#3B82F6" />
              <Text style={styles.functionTitle}>🌊 Subdominante (IV)</Text>
              <Text style={styles.functionDescription}>Cria transição</Text>
              <Ionicons name="play-circle" size={24} color="#3B82F6" style={styles.playIcon} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.functionCard, styles.functionDominant]}
              onPress={() => handlePlayHarmonicFunction('Dominante')}
            >
              <Ionicons name="flash" size={32} color="#F97316" />
              <Text style={styles.functionTitle}>⚡ Dominante (V)</Text>
              <Text style={styles.functionDescription}>Gera tensão e resolve</Text>
              <Ionicons name="play-circle" size={24} color="#F97316" style={styles.playIcon} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* SEÇÃO 4 — Quiz Auditivo */}
        <Card>
          <Text style={styles.sectionTitle}>Quiz Auditivo</Text>
          <Text style={styles.sectionDescription}>
            Qual dessas progressões parece 'terminar' a música?
          </Text>
          <View style={styles.quizContainer}>
            {[
              { progression: 'I–V–vi–IV', index: 0 },
              { progression: 'vi–IV–V–I', index: 1 },
              { progression: 'IV–I–V–vi', index: 2 },
            ].map((item) => (
              <TouchableOpacity
                key={item.index}
                style={[
                  styles.quizOption,
                  selectedQuiz === item.index && styles.quizOptionSelected,
                  selectedQuiz === item.index &&
                    quizFeedback === 'success' &&
                    styles.quizOptionCorrect,
                  selectedQuiz === item.index &&
                    quizFeedback === 'error' &&
                    styles.quizOptionWrong,
                ]}
                onPress={() => handleQuizSelect(item.index)}
              >
                <Ionicons name="musical-notes" size={20} color="#7C3AED" />
                <Text style={styles.quizText}>{item.progression}</Text>
                {selectedQuiz === item.index && quizFeedback && (
                  <Ionicons
                    name={quizFeedback === 'success' ? 'checkmark-circle' : 'close-circle'}
                    size={24}
                    color={quizFeedback === 'success' ? '#22C55E' : '#EF4444'}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
          {quizFeedback && (
            <Feedback
              type={quizFeedback}
              message={
                quizFeedback === 'success'
                  ? '✅ Correto! A progressão vi–IV–V–I cria uma resolução final.'
                  : '❌ Tente novamente! Pense sobre qual progressão soa mais "final".'
              }
            />
          )}
        </Card>

        {/* SEÇÃO 5 — Prática com Instrumento */}
        <Card color="#F5F3FF">
          <Text style={styles.sectionTitle}>Agora é sua vez de tocar!</Text>
          <Text style={styles.sectionDescription}>
            Toque a sequência: <Text style={styles.chordSequence}>C → G → Am → F</Text>
          </Text>

          <View style={styles.targetChordsContainer}>
            {targetChords.map((chord, index) => (
              <View
                key={index}
                style={[
                  styles.targetChord,
                  index === currentChordIndex && styles.targetChordActive,
                  index < currentChordIndex && styles.targetChordCompleted,
                ]}
              >
                <Text
                  style={[
                    styles.targetChordText,
                    index === currentChordIndex && styles.targetChordTextActive,
                  ]}
                >
                  {chord}
                </Text>
                {index < currentChordIndex && (
                  <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                )}
              </View>
            ))}
          </View>

          {!isRecording && currentChordIndex < targetChords.length && (
            <Button
              title="🎙 Gravar sequência"
              onPress={handleStartPractice}
              icon="mic"
              variant="primary"
            />
          )}

          {isRecording && (
            <Button
              title="Parar gravação"
              onPress={handleStopPractice}
              icon="stop"
              variant="danger"
            />
          )}

          {totalCount > 0 && (
            <View style={styles.practiceResults}>
              <Text style={styles.resultsText}>
                Você acertou {correctCount} de {totalCount} acordes!
              </Text>
              <View style={styles.resultsBar}>
                <View
                  style={[
                    styles.resultsBarFill,
                    { width: `${(correctCount / totalCount) * 100}%` },
                  ]}
                />
              </View>
              <View style={styles.resultsChords}>
                {practiceChords.map((chord, index) => (
                  <View
                    key={index}
                    style={[
                      styles.resultChord,
                      practiceResults[index] ? styles.resultChordCorrect : styles.resultChordWrong,
                    ]}
                  >
                    <Text style={styles.resultChordText}>{chord}</Text>
                    <Ionicons
                      name={practiceResults[index] ? 'checkmark' : 'close'}
                      size={16}
                      color="#FFFFFF"
                    />
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card>

        {/* SEÇÃO 6 — Modo Música Sincronizado */}
        <Card color="#FFF4E6">
          <Text style={styles.sectionTitle}>🎵 Modo Música Sincronizado</Text>
          <Text style={styles.sectionDescription}>
            Envie uma música e toque junto com ela! O app pausará automaticamente para você tocar os acordes.
          </Text>

          {!musicUri && (
            <Button
              title="Selecionar Música"
              onPress={handleSelectMusic}
              icon="musical-notes"
              variant="primary"
            />
          )}

          {isProcessingMusic && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7C3AED" />
              <Text style={styles.loadingText}>Processando música e extraindo acordes...</Text>
            </View>
          )}

          {musicUri && musicChords.length > 0 && (
            <>
              <View style={styles.musicInfo}>
                <Text style={styles.musicInfoText}>
                  <Text style={styles.musicInfoLabel}>Acordes detectados:</Text> {musicChords.length}
                </Text>
                <Text style={styles.musicInfoText}>
                  <Text style={styles.musicInfoLabel}>Tempo:</Text> {elapsedTime.toFixed(1)}s
                </Text>
                {currentMusicChordIndex < musicChords.length && (
                  <Text style={styles.currentChordText}>
                    Acorde atual: <Text style={styles.chordHighlight}>
                      {musicChords[currentMusicChordIndex].chord_majmin}
                    </Text>
                  </Text>
                )}
              </View>

              {!isMusicPlaying && !isPaused && (
                <Button
                  title="▶️ Tocar Música"
                  onPress={handlePlayMusic}
                  icon="play"
                  variant="primary"
                />
              )}

              {isMusicPlaying && !isPaused && (
                <View style={styles.musicControls}>
                  <Text style={styles.musicStatusText}>🎵 Tocando...</Text>
                </View>
              )}

              {isPaused && isWaitingForUser && (
                <View style={styles.pauseContainer}>
                  <Text style={styles.pauseTitle}>⏸️ Pausa!</Text>
                  <Text style={styles.pauseText}>
                    Toque o acorde: <Text style={styles.chordHighlight}>
                      {musicChords[currentMusicChordIndex]?.chord_majmin}
                    </Text>
                  </Text>

                  {!isRecordingAudio && !userRecordingUri && (
                    <Button
                      title="🎙 Gravar Acorde"
                      onPress={handleRecordUserChord}
                      icon="mic"
                      variant="secondary"
                    />
                  )}

                  {isRecordingAudio && (
                    <Button
                      title="⏹️ Parar Gravação"
                      onPress={handleStopUserChord}
                      icon="stop"
                      variant="danger"
                    />
                  )}

                  {userRecordingUri && (
                    <>
                      <Text style={styles.recordingReadyText}>✅ Áudio gravado!</Text>
                      {isProcessingChord && (
                        <View style={styles.processingContainer}>
                          <ActivityIndicator size="small" color="#7C3AED" />
                          <Text style={styles.processingText}>Processando acorde...</Text>
                        </View>
                      )}
                      {lastDetectedChord && (
                        <Text style={styles.detectedChordText}>
                          🎵 Detectado: {lastDetectedChord}
                        </Text>
                      )}
                      {lastError && (
                        <Text style={styles.errorText}>
                          ❌ Erro: {lastError}
                        </Text>
                      )}
                      <Button
                        title={isProcessingChord ? "Processando..." : "Enviar e Verificar"}
                        onPress={handleUserChordSubmission}
                        icon="checkmark-circle"
                        variant="primary"
                        disabled={isProcessingChord}
                      />
                    </>
                  )}
                </View>
              )}
            </>
          )}
        </Card>

        {/* SEÇÃO 7 — Conclusão */}
        {progress >= 100 && (
          <Card color="#E0E7FF">
            <Text style={styles.conclusionTitle}>🎉 Parabéns!</Text>
            <Text style={styles.conclusionText}>
              Você entendeu como os acordes se conectam. Agora pratique no modo Música!
            </Text>
            <View style={styles.conclusionButtons}>
              <Button
                title="Ir para o Modo Música 🎵"
                onPress={() => router.push('/trilha' as any)}
                variant="secondary"
                icon="musical-notes"
              />
              <Button
                title="Refazer lição 🔁"
                onPress={() => {
                  setProgress(40);
                  setSelectedQuiz(null);
                  setQuizFeedback(null);
                  setPracticeChords([]);
                  setPracticeResults([]);
                  setCurrentChordIndex(0);
                }}
                variant="primary"
                icon="refresh"
              />
            </View>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF',
  },
  header: {
    backgroundColor: '#7C3AED',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  headerContent: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  progressBarContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F97316',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 4,
    textAlign: 'right',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardIconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E1B4B',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  degreesCircle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  degreeItem: {
    alignItems: 'center',
    width: '30%',
    marginBottom: 12,
  },
  degreeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  degreeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  degreeLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  playerButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  playerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 12,
  },
  waveBar: {
    width: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  harmonicFunctions: {
    gap: 12,
    marginTop: 8,
  },
  functionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  functionTonic: {
    backgroundColor: '#D1FAE5',
    borderColor: '#22C55E',
  },
  functionSubdominant: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  functionDominant: {
    backgroundColor: '#FED7AA',
    borderColor: '#F97316',
  },
  functionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E1B4B',
    marginTop: 8,
    marginBottom: 4,
  },
  functionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  playIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  quizContainer: {
    gap: 12,
    marginTop: 16,
  },
  quizOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  quizOptionSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#EDE9FE',
  },
  quizOptionCorrect: {
    borderColor: '#22C55E',
    backgroundColor: '#D1FAE5',
  },
  quizOptionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  quizText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1B4B',
  },
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  feedbackSuccess: {
    backgroundColor: '#22C55E',
  },
  feedbackError: {
    backgroundColor: '#EF4444',
  },
  feedbackWarning: {
    backgroundColor: '#FACC15',
  },
  feedbackText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  chordSequence: {
    fontWeight: 'bold',
    color: '#7C3AED',
    fontSize: 16,
  },
  targetChordsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 24,
  },
  targetChord: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  targetChordActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#F97316',
    transform: [{ scale: 1.1 }],
  },
  targetChordCompleted: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  targetChordText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  targetChordTextActive: {
    color: '#FFFFFF',
  },
  practiceResults: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1B4B',
    marginBottom: 12,
    textAlign: 'center',
  },
  resultsBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  resultsBarFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 6,
  },
  resultsChords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  resultChord: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resultChordCorrect: {
    backgroundColor: '#22C55E',
  },
  resultChordWrong: {
    backgroundColor: '#EF4444',
  },
  resultChordText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  conclusionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E1B4B',
    textAlign: 'center',
    marginBottom: 12,
  },
  conclusionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  conclusionButtons: {
    gap: 12,
  },
  buttonPrimary: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonSecondary: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonSuccess: {
    backgroundColor: '#22C55E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDanger: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  musicInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 8,
  },
  musicInfoText: {
    fontSize: 14,
    color: '#374151',
  },
  musicInfoLabel: {
    fontWeight: '600',
    color: '#7C3AED',
  },
  currentChordText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E1B4B',
    marginTop: 8,
    textAlign: 'center',
  },
  chordHighlight: {
    color: '#7C3AED',
    fontSize: 20,
    fontWeight: 'bold',
  },
  musicControls: {
    alignItems: 'center',
    padding: 16,
  },
  musicStatusText: {
    fontSize: 16,
    color: '#7C3AED',
    fontWeight: '600',
  },
  pauseContainer: {
    backgroundColor: '#FFF4E6',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderColor: '#F97316',
  },
  pauseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F97316',
  },
  pauseText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  recordingReadyText: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '600',
    marginTop: 8,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  processingText: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '500',
  },
  detectedChordText: {
    fontSize: 16,
    color: '#1E1B4B',
    fontWeight: '600',
    marginVertical: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
    marginVertical: 8,
    textAlign: 'center',
  },
});

