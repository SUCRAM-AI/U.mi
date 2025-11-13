import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useAuth } from '../../contexts/AuthContext';
import { useAudioRecorder } from '../../hooks/use-audio-recorder';
import { detectChord } from '../../services/api';

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
  title?: string;
}

function Card({ children, color = '#FFFFFF', icon, title }: CardProps) {
  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      {icon && (
        <View style={styles.cardIconContainer}>
          <Ionicons name={icon as any} size={32} color="#7C3AED" />
        </View>
      )}
      {title && <Text style={styles.cardTitle}>{title}</Text>}
      {children}
    </View>
  );
}

// Componente Botão Reutilizável
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
}

function Button({ title, onPress, variant = 'primary', icon, disabled, loading }: ButtonProps) {
  const buttonStyle = variant === 'secondary' ? styles.buttonSecondary : styles.buttonPrimary;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[buttonStyle, disabled && styles.buttonDisabled]}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          {icon && <Ionicons name={icon as any} size={20} color="#FFFFFF" style={styles.buttonIcon} />}
          <Text style={styles.buttonText}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

// Componente Botão Circular para Cordas
interface StringButtonProps {
  note: string;
  label: string;
  onPress: () => void;
  isPlaying: boolean;
}

function StringButton({ note, label, onPress, isPlaying }: StringButtonProps) {
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isPlaying) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isPlaying]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View
        style={[
          styles.stringButton,
          isPlaying && styles.stringButtonPlaying,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.stringNote}>{note}</Text>
        <Text style={styles.stringLabel}>{label}</Text>
        {isPlaying && (
          <View style={styles.playingIndicator}>
            <Ionicons name="musical-note" size={16} color="#FFFFFF" />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// Componente Quiz de Múltipla Escolha
interface QuizProps {
  question: string;
  options: string[];
  correctAnswer: string;
  onComplete: () => void;
}

function Quiz({ question, options, correctAnswer, onComplete }: QuizProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (showFeedback) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showFeedback]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    if (answer === correctAnswer) {
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  const getButtonStyle = (option: string) => {
    if (selectedAnswer === null) return styles.quizOption;
    if (option === correctAnswer) return styles.quizOptionCorrect;
    if (option === selectedAnswer && option !== correctAnswer) return styles.quizOptionWrong;
    return styles.quizOption;
  };

  return (
    <View style={styles.quizContainer}>
      <Text style={styles.quizQuestion}>{question}</Text>
      <View style={styles.quizOptionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={getButtonStyle(option)}
            onPress={() => handleAnswer(option)}
            disabled={selectedAnswer !== null}
          >
            <Text style={styles.quizOptionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {showFeedback && (
        <Animated.View style={[styles.feedbackContainer, { opacity: fadeAnim }]}>
          {selectedAnswer === correctAnswer ? (
            <View style={styles.feedbackSuccess}>
              <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
              <Text style={styles.feedbackText}>Correto! 🎉</Text>
            </View>
          ) : (
            <View style={styles.feedbackError}>
              <Ionicons name="close-circle" size={24} color="#EF4444" />
              <Text style={styles.feedbackText}>Tente novamente!</Text>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

// Tela Principal
export default function Lesson2() {
  const router = useRouter();
  const { addXP, completeLesson } = useAuth();
  const [progress, setProgress] = useState(10);
  
  // Estados para Card 1 - Cordas
  const [playingString, setPlayingString] = useState<string | null>(null);
  const [stringSounds, setStringSounds] = useState<{ [key: string]: Audio.Sound | null }>({});
  const [stringsListened, setStringsListened] = useState<Set<string>>(new Set());
  
  // Estados para Card 2 - Reconhecimento Auditivo
  const [currentNote, setCurrentNote] = useState<string | null>(null);
  const [noteSound, setNoteSound] = useState<Audio.Sound | null>(null);
  const [isPlayingNote, setIsPlayingNote] = useState(false);
  const [recognitionComplete, setRecognitionComplete] = useState(false);
  
  // Estados para Card 3 - Quiz
  const [quizComplete, setQuizComplete] = useState(false);
  
  // Estados para Card 4 - Teste de Afinação
  const {
    isRecording,
    soundUri,
    startRecording,
    stopRecording,
    reset,
  } = useAudioRecorder();
  const [isDetecting, setIsDetecting] = useState(false);
  const [tuningResult, setTuningResult] = useState<{
    detected: string | null;
    isInTune: boolean;
  } | null>(null);
  const [tuningComplete, setTuningComplete] = useState(false);

  // Cordas do violão (da mais fina para a mais grossa)
  const guitarStrings = [
    { note: 'E', label: '1ª corda', frequency: 329.63 }, // Mi
    { note: 'B', label: '2ª corda', frequency: 246.94 }, // Si
    { note: 'G', label: '3ª corda', frequency: 196.00 }, // Sol
    { note: 'D', label: '4ª corda', frequency: 146.83 }, // Ré
    { note: 'A', label: '5ª corda', frequency: 110.00 }, // Lá
    { note: 'E', label: '6ª corda', frequency: 82.41 },  // Mi
  ];

  // Notas para reconhecimento auditivo
  const recognitionNotes = ['E', 'A', 'D', 'G', 'B'];
  const recognitionOptions = ['E', 'A', 'D', 'G', 'B', 'C', 'F'];

  // Atualizar progresso
  useEffect(() => {
    let newProgress = 10;
    if (stringsListened.size >= 6) newProgress += 25;
    if (recognitionComplete) newProgress += 25;
    if (quizComplete) newProgress += 25;
    if (tuningComplete) newProgress += 15;
    setProgress(newProgress);
  }, [stringsListened.size, recognitionComplete, quizComplete, tuningComplete]);

  // Limpar sons ao desmontar
  useEffect(() => {
    return () => {
      Object.values(stringSounds).forEach(sound => {
        if (sound) {
          sound.unloadAsync();
        }
      });
      if (noteSound) {
        noteSound.unloadAsync();
      }
    };
  }, [stringSounds, noteSound]);

  // Função para tocar uma corda (simulação - em produção, usar arquivos de áudio reais)
  const playString = async (stringNote: string, label: string) => {
    try {
      // Parar som anterior se estiver tocando
      if (playingString && stringSounds[playingString]) {
        await stringSounds[playingString]?.stopAsync();
      }

      setPlayingString(stringNote + label);

      // Em produção, carregar arquivo de áudio real
      // Por enquanto, vamos simular com um som genérico
      // const { sound } = await Audio.Sound.createAsync(
      //   require(`../../assets/audio/string_${stringNote.toLowerCase()}.mp3`)
      // );

      // Simulação: criar um som simples
      // Nota: Em produção, substituir por arquivos de áudio reais
      Alert.alert(
        '🎵 Tocando corda',
        `A corda ${label} (${stringNote}) está sendo tocada.\n\nEm produção, aqui tocaria o áudio real da corda.`,
        [{ text: 'OK' }]
      );

      // Marcar como ouvida
      setStringsListened(prev => new Set([...prev, stringNote + label]));

      // Simular duração do som
      setTimeout(() => {
        setPlayingString(null);
      }, 2000);
    } catch (error) {
      console.error('Erro ao tocar corda:', error);
      Alert.alert('Erro', 'Não foi possível tocar a corda');
    }
  };

  // Função para tocar nota de reconhecimento
  const playRecognitionNote = async () => {
    try {
      if (noteSound) {
        await noteSound.unloadAsync();
      }

      // Selecionar nota aleatória
      const randomNote = recognitionNotes[Math.floor(Math.random() * recognitionNotes.length)];
      setCurrentNote(randomNote);
      setIsPlayingNote(true);

      // Em produção, carregar arquivo de áudio real
      Alert.alert(
        '🎵 Tocando nota',
        `Uma nota está sendo tocada. Tente identificar qual é!\n\n(Em produção, aqui tocaria o áudio real da nota ${randomNote})`,
        [{ text: 'OK', onPress: () => setIsPlayingNote(false) }]
      );
    } catch (error) {
      console.error('Erro ao tocar nota:', error);
      Alert.alert('Erro', 'Não foi possível tocar a nota');
      setIsPlayingNote(false);
    }
  };

  // Verificar resposta do reconhecimento
  const handleRecognitionAnswer = (answer: string) => {
    if (currentNote && answer === currentNote) {
      Alert.alert('✅ Correto!', `Você identificou corretamente a nota ${currentNote}!`);
      setRecognitionComplete(true);
      addXP(30);
      setCurrentNote(null);
    } else {
      Alert.alert('❌ Errado', `A nota correta era ${currentNote}. Tente novamente!`);
      setCurrentNote(null);
      setIsPlayingNote(false);
    }
  };

  // Teste de afinação
  const handleTuningTest = async () => {
    if (isRecording) {
      // Parar gravação
      const uri = await stopRecording();
      if (uri) {
        setIsDetecting(true);
        setTuningResult(null);

        try {
          const result = await detectChord(uri);
          setIsDetecting(false);

          if (result.success && result.chord) {
            // Verificar se o acorde detectado é uma nota simples (E, A, D, G, B)
            const detectedNote = result.chord.toUpperCase();
            const isInTune = recognitionNotes.includes(detectedNote);

            setTuningResult({
              detected: detectedNote,
              isInTune,
            });

            if (isInTune) {
              setTuningComplete(true);
              addXP(40);
              Alert.alert(
                '✅ Afinação precisa!',
                `Você tocou a nota ${detectedNote} corretamente!`
              );
            } else {
              Alert.alert(
                '⚠️ Cordas fora de tom!',
                `Detectamos: ${detectedNote}. Tente afinar melhor e tocar uma das cordas soltas (E, A, D, G, B).`
              );
            }
          } else {
            Alert.alert('Erro', result.error || 'Não foi possível detectar a nota');
          }
        } catch (error) {
          setIsDetecting(false);
          console.error('Erro ao detectar acorde:', error);
          Alert.alert('Erro', 'Não foi possível processar o áudio');
        }
      }
      reset();
    } else {
      // Iniciar gravação
      await startRecording();
    }
  };

  const handleNextLesson = async () => {
    if (progress < 100) {
      Alert.alert('Atenção', 'Complete todas as tarefas antes de avançar!');
      return;
    }
    
    await completeLesson('mundo1-lesson2');
    Alert.alert('Parabéns! 🎉', 'Você completou o Módulo 2!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const handleReview = () => {
    setStringsListened(new Set());
    setRecognitionComplete(false);
    setQuizComplete(false);
    setTuningComplete(false);
    setTuningResult(null);
    setCurrentNote(null);
    setProgress(10);
    reset();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="🎵 Módulo 2 — Afinação e Som"
          subtitle="Desenvolva sua percepção auditiva e controle do som."
          progress={progress}
          onBack={() => router.back()}
        />

        <View style={styles.content}>
          {/* Card 1 — Ouça cada corda solta */}
          <Card
            title="Ouça cada corda solta"
            icon="musical-notes"
            color="#FFFFFF"
          >
            <Text style={styles.cardDescription}>
              Toque em cada botão para ouvir o som da corda solta. Compare com o som do seu violão
              para afinar corretamente.
            </Text>
            
            <View style={styles.stringsContainer}>
              {guitarStrings.map((string, index) => (
                <StringButton
                  key={index}
                  note={string.note}
                  label={string.label}
                  onPress={() => playString(string.note, string.label)}
                  isPlaying={playingString === string.note + string.label}
                />
              ))}
            </View>

            {stringsListened.size >= 6 && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.completedText}>Todas as cordas ouvidas! 🎉</Text>
              </View>
            )}
          </Card>

          {/* Card 2 — Reconhecimento Auditivo */}
          <Card
            title="Reconhecimento Auditivo"
            icon="ear"
            color="#FFFFFF"
          >
            <Text style={styles.cardDescription}>
              Ouça a nota tocada e tente identificar qual é. Este exercício desenvolve sua
              percepção auditiva.
            </Text>

            {!recognitionComplete ? (
              <>
                <Button
                  title={isPlayingNote ? "🎵 Tocando..." : "▶️ Ouvir nota"}
                  onPress={playRecognitionNote}
                  icon="play"
                  variant="primary"
                  disabled={isPlayingNote}
                />

                {currentNote && !isPlayingNote && (
                  <View style={styles.recognitionOptions}>
                    <Text style={styles.recognitionQuestion}>
                      Qual nota você ouviu?
                    </Text>
                    <View style={styles.recognitionButtonsContainer}>
                      {recognitionOptions.map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.recognitionButton}
                          onPress={() => handleRecognitionAnswer(option)}
                        >
                          <Text style={styles.recognitionButtonText}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.completedText}>Reconhecimento completo! 🎉</Text>
              </View>
            )}
          </Card>

          {/* Card 3 — Quiz Rápido */}
          <Card
            title="Quiz rápido"
            icon="help-circle"
            color="#FFFFFF"
          >
            <Text style={styles.cardDescription}>
              Teste seus conhecimentos sobre as notas abertas do violão.
            </Text>

            {!quizComplete ? (
              <Quiz
                question="Qual é a 5ª corda do violão?"
                options={['E (Mi)', 'A (Lá)', 'D (Ré)', 'G (Sol)']}
                correctAnswer="A (Lá)"
                onComplete={() => {
                  setQuizComplete(true);
                  addXP(25);
                }}
              />
            ) : (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.completedText}>Quiz completo! 🎉</Text>
              </View>
            )}
          </Card>

          {/* Card 4 — Teste sua Afinação */}
          <Card
            title="Teste sua afinação"
            icon="mic"
            color="#FFFFFF"
          >
            <Text style={styles.cardDescription}>
              Grave uma corda solta do seu violão. O app verificará se está afinada corretamente.
            </Text>

            <Button
              title={isRecording ? "⏹️ Parar gravação" : "🎙 Gravar corda"}
              onPress={handleTuningTest}
              icon={isRecording ? "stop" : "mic"}
              variant="primary"
              loading={isDetecting}
            />

            {isDetecting && (
              <View style={styles.detectingContainer}>
                <ActivityIndicator size="small" color="#7C3AED" />
                <Text style={styles.detectingText}>Analisando afinação...</Text>
              </View>
            )}

            {tuningResult && !isDetecting && (
              <View style={[
                styles.tuningResult,
                tuningResult.isInTune ? styles.tuningResultSuccess : styles.tuningResultWarning
              ]}>
                <Ionicons
                  name={tuningResult.isInTune ? "checkmark-circle" : "warning"}
                  size={24}
                  color={tuningResult.isInTune ? "#22C55E" : "#F97316"}
                />
                <Text style={styles.tuningResultText}>
                  {tuningResult.isInTune
                    ? `✅ Afinação precisa! Nota detectada: ${tuningResult.detected}`
                    : `⚠️ Cordas fora de tom! Detectado: ${tuningResult.detected}`}
                </Text>
              </View>
            )}

            {tuningComplete && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.completedText}>Teste de afinação completo! 🎉</Text>
              </View>
            )}
          </Card>

          {/* Footer com Botões */}
          <View style={styles.footer}>
            <Button
              title="Próxima lição 🎶"
              onPress={handleNextLesson}
              icon="arrow-forward"
              variant="primary"
              disabled={progress < 100}
            />
            <Button
              title="Rever tarefa 🔁"
              onPress={handleReview}
              icon="refresh"
              variant="secondary"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    backgroundColor: '#7C3AED',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E9D5FF',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    minWidth: 45,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardIconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 16,
  },
  stringsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
    marginBottom: 16,
  },
  stringButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  stringButtonPlaying: {
    backgroundColor: '#F97316',
  },
  stringNote: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stringLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    marginTop: 4,
  },
  playingIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  recognitionOptions: {
    marginTop: 16,
  },
  recognitionQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  recognitionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  recognitionButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  recognitionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  quizContainer: {
    marginTop: 8,
  },
  quizQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  quizOptionsContainer: {
    gap: 12,
  },
  quizOption: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  quizOptionCorrect: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  quizOptionWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  quizOptionText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  feedbackContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  feedbackSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  feedbackError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  detectingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
  },
  detectingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  tuningResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
  },
  tuningResultSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  tuningResultWarning: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
  },
  tuningResultText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
  },
  buttonPrimary: {
    backgroundColor: '#F97316',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonSecondary: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    marginRight: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    gap: 12,
    marginTop: 8,
  },
});

