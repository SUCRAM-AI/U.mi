import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useAuth } from '@contexts/AuthContext';
import { useAudioRecorder } from '@hooks/use-audio-recorder';
import { detectChord } from '@services/api';

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

// Componente Badge de Nota
interface NoteBadgeProps {
  note: string;
  isSharp?: boolean;
  color?: string;
}

function NoteBadge({ note, isSharp = false, color }: NoteBadgeProps) {
  const noteColor = color || (isSharp ? '#7C3AED' : '#F97316');
  
  return (
    <View style={[styles.noteBadge, { backgroundColor: noteColor }]}>
      <Text style={styles.noteBadgeText}>{note}</Text>
    </View>
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
export default function Lesson3() {
  const router = useRouter();
  const { addXP, completeLesson } = useAuth();
  const [progress, setProgress] = useState(10);
  
  // Estados para Card 1 - As 12 notas
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [notesStudied, setNotesStudied] = useState<Set<string>>(new Set());
  
  // Estados para Card 2 - Notas no braço
  const [bracoInteracted, setBracoInteracted] = useState(false);
  
  // Estados para Card 3 - Exercício de correspondência
  const {
    isRecording,
    soundUri,
    startRecording,
    stopRecording,
    reset,
  } = useAudioRecorder();
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [correspondenceComplete, setCorrespondenceComplete] = useState(false);
  
  // Estados para Card 4 - Quiz auditivo
  const [currentQuizNote, setCurrentQuizNote] = useState<string | null>(null);
  const [noteSound, setNoteSound] = useState<Audio.Sound | null>(null);
  const [isPlayingNote, setIsPlayingNote] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  // As 12 notas musicais
  const allNotes = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
  ];

  // Notas para quiz auditivo
  const quizNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const quizOptions = ['A', 'B', 'C', 'D'];

  // Atualizar progresso
  useEffect(() => {
    let newProgress = 10;
    if (notesStudied.size >= 12) newProgress += 25;
    if (bracoInteracted) newProgress += 20;
    if (correspondenceComplete) newProgress += 25;
    if (quizComplete) newProgress += 20;
    setProgress(newProgress);
  }, [notesStudied.size, bracoInteracted, correspondenceComplete, quizComplete]);

  // Limpar som ao desmontar
  useEffect(() => {
    return () => {
      if (noteSound) {
        noteSound.unloadAsync();
      }
    };
  }, [noteSound]);

  // Tocar sequência cromática
  const playChromaticSequence = async () => {
    setIsPlayingSequence(true);
    
    // Em produção, tocar arquivos de áudio reais
    // Por enquanto, simular a sequência
    Alert.alert(
      '🎧 Sequência Cromática',
      'Tocando as 12 notas em sequência: C, C#, D, D#, E, F, F#, G, G#, A, A#, B\n\n(Em produção, aqui tocaria o áudio real de cada nota)',
      [{ text: 'OK', onPress: () => {
        setIsPlayingSequence(false);
        // Marcar todas as notas como estudadas
        setNotesStudied(new Set(allNotes));
      }}]
    );
  };

  // Interagir com o braço
  const handleBracoInteraction = () => {
    setBracoInteracted(true);
    addXP(20);
    Alert.alert(
      '🎸 Braço do Violão',
      'Cada casa no braço representa um semitom. A primeira corda (Mi) na casa 0 é E, na casa 1 é F, na casa 2 é F#, e assim por diante!',
      [{ text: 'Entendi!' }]
    );
  };

  // Exercício de correspondência - gravar e detectar nota
  const handleRecordNote = async () => {
    if (isRecording) {
      // Parar gravação
      const uri = await stopRecording();
      if (uri) {
        setIsDetecting(true);
        setDetectedNote(null);

        try {
          const result = await detectChord(uri);
          setIsDetecting(false);

          if (result.success && result.chord) {
            const detected = result.chord.toUpperCase();
            setDetectedNote(detected);
            setCorrespondenceComplete(true);
            addXP(30);
            
            Alert.alert(
              '✅ Nota Identificada!',
              `Você tocou a nota: ${detected}\n\nO app conseguiu identificar corretamente!`
            );
          } else {
            Alert.alert('Erro', result.error || 'Não foi possível detectar a nota');
          }
        } catch (error) {
          setIsDetecting(false);
          console.error('Erro ao detectar nota:', error);
          Alert.alert('Erro', 'Não foi possível processar o áudio');
        }
      }
      reset();
    } else {
      // Iniciar gravação
      await startRecording();
    }
  };

  // Tocar nota para quiz auditivo
  const playQuizNote = async () => {
    try {
      if (noteSound) {
        await noteSound.unloadAsync();
      }

      // Selecionar nota aleatória
      const randomNote = quizNotes[Math.floor(Math.random() * quizNotes.length)];
      setCurrentQuizNote(randomNote);
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

  // Verificar resposta do quiz auditivo
  const handleQuizAnswer = (answer: string) => {
    if (currentQuizNote && answer === currentQuizNote) {
      setQuizComplete(true);
      addXP(25);
      Alert.alert('✅ Correto!', `Você identificou corretamente a nota ${currentQuizNote}!`);
      setCurrentQuizNote(null);
    } else {
      Alert.alert('❌ Errado', `A nota correta era ${currentQuizNote}. Tente novamente!`);
      setCurrentQuizNote(null);
      setIsPlayingNote(false);
    }
  };

  const handleNextLesson = async () => {
    if (progress < 100) {
      Alert.alert('Atenção', 'Complete todas as tarefas antes de avançar!');
      return;
    }
    
    await completeLesson('mundo1-lesson3');
    Alert.alert(
      'Parabéns! 🎉',
      'Agora você sabe onde cada nota vive no violão 🎸.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const handleReview = () => {
    setNotesStudied(new Set());
    setBracoInteracted(false);
    setCorrespondenceComplete(false);
    setQuizComplete(false);
    setDetectedNote(null);
    setCurrentQuizNote(null);
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
          title="🎶 Módulo 3 — Notas e Escala Natural"
          subtitle="Entenda o conceito de notas musicais e onde elas aparecem no braço."
          progress={progress}
          onBack={() => router.back()}
        />

        <View style={styles.content}>
          {/* Card 1 — As 12 notas */}
          <Card
            title="As 12 notas"
            icon="musical-notes"
            color="#FFFFFF"
          >
            <Text style={styles.cardDescription}>
              A música ocidental usa 12 notas diferentes. Elas se repetem em oitavas, criando
              a escala cromática completa.
            </Text>
            
            <View style={styles.notesGrid}>
              {allNotes.map((note, index) => {
                const isSharp = note.includes('#');
                const isStudied = notesStudied.has(note);
                return (
                  <NoteBadge
                    key={index}
                    note={note}
                    isSharp={isSharp}
                    color={isStudied ? '#22C55E' : undefined}
                  />
                );
              })}
            </View>

            <Button
              title={isPlayingSequence ? "🎧 Tocando..." : "Ouvir sequência cromática 🎧"}
              onPress={playChromaticSequence}
              icon="play"
              variant="primary"
              disabled={isPlayingSequence}
            />

            {notesStudied.size >= 12 && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.completedText}>Todas as notas estudadas! 🎉</Text>
              </View>
            )}
          </Card>

          {/* Card 2 — Notas no braço */}
          <Card
            title="Notas no braço"
            icon="guitar"
            color="#FFFFFF"
          >
            <Text style={styles.cardDescription}>
              Cada casa no braço do violão representa um semitom. Toque na imagem para
              entender como as notas estão organizadas.
            </Text>

            <TouchableOpacity
              onPress={handleBracoInteraction}
              activeOpacity={0.8}
              style={styles.bracoContainer}
            >
              <View style={styles.bracoPlaceholder}>
                <Ionicons name="guitar" size={80} color="#7C3AED" />
                <Text style={styles.placeholderText}>
                  {bracoInteracted
                    ? 'Imagem do braço com notas marcadas'
                    : 'Toque para ver as notas no braço'}
                </Text>
                {!bracoInteracted && (
                  <Text style={styles.tapHint}>👆 Toque aqui</Text>
                )}
              </View>
              {/* Em produção, substituir por: */}
              {/* <Image
                source={require('@assets/images/braco_violao_notas.png')}
                style={styles.bracoImage}
                resizeMode="contain"
              /> */}
            </TouchableOpacity>

            {bracoInteracted && (
              <View style={styles.bracoInfo}>
                <Text style={styles.bracoInfoText}>
                  💡 <Text style={styles.bracoInfoBold}>Dica:</Text> Cada corda tem suas próprias
                  notas. A primeira corda (Mi) começa em E, a segunda (Si) em B, e assim por diante.
                </Text>
              </View>
            )}
          </Card>

          {/* Card 3 — Exercício de correspondência */}
          <Card
            title="Exercício de correspondência"
            icon="mic"
            color="#FFFFFF"
          >
            <Text style={styles.cardDescription}>
              Toque uma nota no seu violão e grave o som. O app identificará qual nota você tocou.
            </Text>

            <Button
              title={isRecording ? "⏹️ Parar gravação" : "🎙 Gravar nota"}
              onPress={handleRecordNote}
              icon={isRecording ? "stop" : "mic"}
              variant="primary"
              loading={isDetecting}
            />

            {isDetecting && (
              <View style={styles.detectingContainer}>
                <ActivityIndicator size="small" color="#7C3AED" />
                <Text style={styles.detectingText}>Identificando nota...</Text>
              </View>
            )}

            {detectedNote && !isDetecting && (
              <View style={styles.detectedNoteContainer}>
                <Ionicons name="musical-note" size={32} color="#7C3AED" />
                <Text style={styles.detectedNoteLabel}>Nota detectada:</Text>
                <Text style={styles.detectedNoteText}>{detectedNote}</Text>
              </View>
            )}

            {correspondenceComplete && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.completedText}>Exercício completo! 🎉</Text>
              </View>
            )}
          </Card>

          {/* Card 4 — Quiz auditivo */}
          <Card
            title="Quiz auditivo"
            icon="ear"
            color="#FFFFFF"
          >
            <Text style={styles.cardDescription}>
              Ouça a nota tocada e tente identificar qual é. Este exercício desenvolve sua
              percepção auditiva.
            </Text>

            {!quizComplete ? (
              <>
                <Button
                  title={isPlayingNote ? "🎵 Tocando..." : "▶️ Ouvir nota"}
                  onPress={playQuizNote}
                  icon="play"
                  variant="primary"
                  disabled={isPlayingNote}
                />

                {currentQuizNote && !isPlayingNote && (
                  <View style={styles.quizAuditivoContainer}>
                    <Text style={styles.quizAuditivoQuestion}>
                      Qual nota você ouviu?
                    </Text>
                    <View style={styles.quizAuditivoOptions}>
                      {quizOptions.map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.quizAuditivoButton}
                          onPress={() => handleQuizAnswer(option)}
                        >
                          <Text style={styles.quizAuditivoButtonText}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.completedText}>Quiz completo! 🎉</Text>
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
  notesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
    justifyContent: 'center',
  },
  noteBadge: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  noteBadgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bracoContainer: {
    width: '100%',
    marginBottom: 16,
  },
  bracoPlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  bracoImage: {
    width: '100%',
    height: 250,
    borderRadius: 16,
  },
  placeholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
    textAlign: 'center',
  },
  tapHint: {
    fontSize: 12,
    color: '#7C3AED',
    marginTop: 8,
    fontWeight: '600',
  },
  bracoInfo: {
    backgroundColor: '#E0E7FF',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  bracoInfoText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  bracoInfoBold: {
    fontWeight: 'bold',
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
  detectedNoteContainer: {
    alignItems: 'center',
    marginTop: 16,
    padding: 20,
    backgroundColor: '#E0E7FF',
    borderRadius: 16,
  },
  detectedNoteLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  detectedNoteText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginTop: 4,
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
  quizAuditivoContainer: {
    marginTop: 16,
  },
  quizAuditivoQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  quizAuditivoOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  quizAuditivoButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 70,
    alignItems: 'center',
  },
  quizAuditivoButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
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

