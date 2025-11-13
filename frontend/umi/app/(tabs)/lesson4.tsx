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
import { useAuth } from '@contexts/AuthContext';
import { useAudioRecorder } from '@hooks/use-audio-recorder';
import { detectChord, compareChords } from '@services/api';

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

// Componente Visual de Tríade
function TriadVisual() {
  return (
    <View style={styles.triadContainer}>
      <View style={styles.triadStack}>
        <View style={[styles.triadNote, styles.triadFifth]}>
          <Text style={styles.triadNoteLabel}>Quinta</Text>
          <Text style={styles.triadNoteName}>5ª</Text>
        </View>
        <View style={[styles.triadNote, styles.triadThird]}>
          <Text style={styles.triadNoteLabel}>Terça</Text>
          <Text style={styles.triadNoteName}>3ª</Text>
        </View>
        <View style={[styles.triadNote, styles.triadRoot]}>
          <Text style={styles.triadNoteLabel}>Tônica</Text>
          <Text style={styles.triadNoteName}>1ª</Text>
        </View>
      </View>
      <View style={styles.triadExplanation}>
        <Text style={styles.triadExplanationText}>
          Uma tríade é formada por três notas: a <Text style={styles.triadBold}>tônica</Text> (nota base),
          a <Text style={styles.triadBold}>terça</Text> (que define se é maior ou menor) e a{' '}
          <Text style={styles.triadBold}>quinta</Text> (que completa o acorde).
        </Text>
      </View>
    </View>
  );
}

// Componente Badge de Acorde
interface ChordBadgeProps {
  chord: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

function ChordBadge({ chord, isCompleted, isCurrent }: ChordBadgeProps) {
  return (
    <View
      style={[
        styles.chordBadge,
        isCompleted && styles.chordBadgeCompleted,
        isCurrent && styles.chordBadgeCurrent,
      ]}
    >
      <Text style={styles.chordBadgeText}>{chord}</Text>
      {isCompleted && (
        <Ionicons name="checkmark-circle" size={20} color="#22C55E" style={styles.chordBadgeIcon} />
      )}
    </View>
  );
}

// Tela Principal
export default function Lesson4() {
  const router = useRouter();
  const { addXP, completeLesson } = useAuth();
  const [progress, setProgress] = useState(10);
  
  // Estados para Card 1 - Tríades
  const [triadStudied, setTriadStudied] = useState(false);
  
  // Estados para Card 2 - Ouvir diferença
  const [majorPlayed, setMajorPlayed] = useState(false);
  const [minorPlayed, setMinorPlayed] = useState(false);
  const [isPlayingMajor, setIsPlayingMajor] = useState(false);
  const [isPlayingMinor, setIsPlayingMinor] = useState(false);
  
  // Estados para Card 3 - Praticar acordes
  const practiceChords = ['C', 'D', 'E', 'G', 'Am'];
  const [completedChords, setCompletedChords] = useState<Set<string>>(new Set());
  const [currentPracticeChord, setCurrentPracticeChord] = useState<string | null>(null);
  const {
    isRecording,
    soundUri,
    startRecording,
    stopRecording,
    reset,
  } = useAudioRecorder();
  const [isDetecting, setIsDetecting] = useState(false);
  
  // Estados para Card 4 - Desafio "Monte o Acorde"
  const challengeChords = ['C', 'D', 'E', 'G', 'Am', 'F', 'A'];
  const [challengeChord, setChallengeChord] = useState<string | null>(null);
  const [challengeAttempts, setChallengeAttempts] = useState(0);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const {
    isRecording: isRecordingChallenge,
    soundUri: challengeSoundUri,
    startRecording: startChallengeRecording,
    stopRecording: stopChallengeRecording,
    reset: resetChallenge,
  } = useAudioRecorder();
  const [isDetectingChallenge, setIsDetectingChallenge] = useState(false);
  const [challengeResult, setChallengeResult] = useState<'correct' | 'incorrect' | null>(null);

  // Atualizar progresso
  useEffect(() => {
    let newProgress = 10;
    if (triadStudied) newProgress += 20;
    if (majorPlayed && minorPlayed) newProgress += 20;
    if (completedChords.size >= 5) newProgress += 30;
    if (challengeComplete) newProgress += 20;
    setProgress(newProgress);
  }, [triadStudied, majorPlayed, minorPlayed, completedChords.size, challengeComplete]);

  // Inicializar desafio
  useEffect(() => {
    if (!challengeChord && !challengeComplete) {
      const randomChord = challengeChords[Math.floor(Math.random() * challengeChords.length)];
      setChallengeChord(randomChord);
    }
  }, [challengeChord, challengeComplete]);

  // Limpar sons ao desmontar
  useEffect(() => {
    return () => {
      reset();
      resetChallenge();
    };
  }, []);

  // Estudar tríades
  const handleStudyTriad = () => {
    setTriadStudied(true);
    addXP(20);
  };

  // Tocar acorde maior
  const playMajorChord = async () => {
    setIsPlayingMajor(true);
    // Em produção, carregar arquivo de áudio real
    Alert.alert(
      '🎧 Acorde Maior',
      'Tocando um acorde maior (ex: C maior).\n\nO som é mais brilhante e alegre.\n\n(Em produção, aqui tocaria o áudio real)',
      [{ text: 'OK', onPress: () => {
        setIsPlayingMajor(false);
        setMajorPlayed(true);
      }}]
    );
  };

  // Tocar acorde menor
  const playMinorChord = async () => {
    setIsPlayingMinor(true);
    // Em produção, carregar arquivo de áudio real
    Alert.alert(
      '🎧 Acorde Menor',
      'Tocando um acorde menor (ex: Am).\n\nO som é mais melancólico e suave.\n\n(Em produção, aqui tocaria o áudio real)',
      [{ text: 'OK', onPress: () => {
        setIsPlayingMinor(false);
        setMinorPlayed(true);
      }}]
    );
  };

  // Praticar acorde
  const handlePracticeChord = (chord: string) => {
    if (completedChords.has(chord)) {
      Alert.alert('Já completo!', `Você já praticou o acorde ${chord} com sucesso!`);
      return;
    }
    setCurrentPracticeChord(chord);
  };

  // Gravar acorde para prática
  const handleRecordPractice = async () => {
    if (!currentPracticeChord) {
      Alert.alert('Atenção', 'Selecione um acorde para praticar primeiro');
      return;
    }

    if (isRecording) {
      // Parar gravação
      const uri = await stopRecording();
      if (uri) {
        setIsDetecting(true);

        try {
          const result = await detectChord(uri);
          setIsDetecting(false);

          if (result.success && result.chord) {
            const detected = result.chord.toUpperCase();
            const expected = currentPracticeChord.toUpperCase();
            
            // Verificar se o acorde detectado corresponde ao esperado
            const isCorrect = 
              detected === expected ||
              result.all_chords?.some(chord => chord.toUpperCase() === expected);

            if (isCorrect) {
              setCompletedChords(prev => new Set([...prev, currentPracticeChord]));
              addXP(30);
              Alert.alert(
                '✅ Correto!',
                `Você tocou o acorde ${currentPracticeChord} perfeitamente!`
              );
              setCurrentPracticeChord(null);
            } else {
              Alert.alert(
                '❌ Tente novamente',
                `Você tocou ${detected}, mas o esperado era ${currentPracticeChord}.`
              );
            }
          } else {
            Alert.alert('Erro', result.error || 'Não foi possível detectar o acorde');
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

  // Desafio: gravar acorde
  const handleChallengeRecord = async () => {
    if (!challengeChord) return;

    if (isRecordingChallenge) {
      // Parar gravação
      const uri = await stopChallengeRecording();
      if (uri) {
        setIsDetectingChallenge(true);
        setChallengeResult(null);

        try {
          const result = await detectChord(uri);
          setIsDetectingChallenge(false);

          if (result.success && result.chord) {
            const detected = result.chord.toUpperCase();
            const expected = challengeChord.toUpperCase();
            
            const isCorrect = 
              detected === expected ||
              result.all_chords?.some(chord => chord.toUpperCase() === expected);

            if (isCorrect) {
              setChallengeResult('correct');
              setChallengeComplete(true);
              addXP(40);
              Alert.alert(
                '✅ Parabéns!',
                `Você montou o acorde ${challengeChord} corretamente!`
              );
            } else {
              setChallengeResult('incorrect');
              setChallengeAttempts(prev => prev + 1);
              Alert.alert(
                '❌ Tente novamente',
                `Você tocou ${detected}, mas o esperado era ${challengeChord}.`
              );
            }
          } else {
            Alert.alert('Erro', result.error || 'Não foi possível detectar o acorde');
          }
        } catch (error) {
          setIsDetectingChallenge(false);
          console.error('Erro ao detectar acorde:', error);
          Alert.alert('Erro', 'Não foi possível processar o áudio');
        }
      }
      resetChallenge();
    } else {
      // Iniciar gravação
      await startChallengeRecording();
    }
  };

  const handleNextLesson = async () => {
    if (progress < 100) {
      Alert.alert('Atenção', 'Complete todas as tarefas antes de avançar!');
      return;
    }
    
    await completeLesson('mundo1-lesson4');
    Alert.alert('Parabéns! 🎉', 'Você completou o Módulo 4!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const handleReview = () => {
    setTriadStudied(false);
    setMajorPlayed(false);
    setMinorPlayed(false);
    setCompletedChords(new Set());
    setCurrentPracticeChord(null);
    setChallengeComplete(false);
    setChallengeChord(null);
    setChallengeAttempts(0);
    setChallengeResult(null);
    setProgress(10);
    reset();
    resetChallenge();
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
          title="🧩 Módulo 4 — Formação de Acordes"
          subtitle="Aprenda como acordes são construídos e pratique suas formas básicas."
          progress={progress}
          onBack={() => router.back()}
        />

        <View style={styles.content}>
          {/* Card 1 — O que é uma tríade? */}
          <Card
            title="O que é uma tríade?"
            icon="layers"
            color="#FFFFFF"
          >
            <Text style={styles.cardDescription}>
              Uma tríade é o acorde mais básico, formado por três notas tocadas simultaneamente.
              Vamos entender cada parte:
            </Text>

            <TriadVisual />

            {!triadStudied && (
              <Button
                title="Entendi! Continuar"
                onPress={handleStudyTriad}
                icon="checkmark-circle"
                variant="primary"
              />
            )}

            {triadStudied && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.completedText}>Conceito compreendido! 🎉</Text>
              </View>
            )}
          </Card>

          {/* Card 2 — Ouça a diferença */}
          <Card
            title="Ouça a diferença"
            icon="headset"
            color="#FFFFFF"
          >
            <Text style={styles.cardDescription}>
              A diferença entre um acorde maior e menor está na terça. Ouça e sinta a diferença:
            </Text>

            <View style={styles.chordComparisonContainer}>
              <TouchableOpacity
                onPress={playMajorChord}
                style={[
                  styles.chordComparisonButton,
                  styles.chordMajorButton,
                  majorPlayed && styles.chordButtonPlayed,
                ]}
                disabled={isPlayingMajor}
              >
                <Ionicons name="musical-note" size={32} color="#FFFFFF" />
                <Text style={styles.chordComparisonText}>Acorde Maior 🎧</Text>
                {majorPlayed && (
                  <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" style={styles.chordButtonCheck} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={playMinorChord}
                style={[
                  styles.chordComparisonButton,
                  styles.chordMinorButton,
                  minorPlayed && styles.chordButtonPlayed,
                ]}
                disabled={isPlayingMinor}
              >
                <Ionicons name="musical-note" size={32} color="#FFFFFF" />
                <Text style={styles.chordComparisonText}>Acorde Menor 🎧</Text>
                {minorPlayed && (
                  <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" style={styles.chordButtonCheck} />
                )}
              </TouchableOpacity>
            </View>

            {majorPlayed && minorPlayed && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.completedText}>Diferença compreendida! 🎉</Text>
              </View>
            )}
          </Card>

          {/* Card 3 — Pratique os acordes */}
          <Card
            title="Pratique os acordes"
            icon="guitar"
            color="#FFFFFF"
          >
            <Text style={styles.cardDescription}>
              Selecione um acorde e toque no seu violão. O app reconhecerá e validará se você tocou corretamente.
            </Text>

            <View style={styles.practiceChordsContainer}>
              {practiceChords.map((chord, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handlePracticeChord(chord)}
                  style={[
                    styles.practiceChordButton,
                    currentPracticeChord === chord && styles.practiceChordButtonActive,
                  ]}
                >
                  <ChordBadge
                    chord={chord}
                    isCompleted={completedChords.has(chord)}
                    isCurrent={currentPracticeChord === chord}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {currentPracticeChord && (
              <View style={styles.recordingSection}>
                <Text style={styles.recordingLabel}>
                  Praticando: <Text style={styles.recordingChord}>{currentPracticeChord}</Text>
                </Text>
                <Button
                  title={isRecording ? "⏹️ Parar gravação" : "🎙 Gravar"}
                  onPress={handleRecordPractice}
                  icon={isRecording ? "stop" : "mic"}
                  variant="primary"
                  loading={isDetecting}
                />
                {isDetecting && (
                  <View style={styles.detectingContainer}>
                    <ActivityIndicator size="small" color="#7C3AED" />
                    <Text style={styles.detectingText}>Analisando acorde...</Text>
                  </View>
                )}
              </View>
            )}

            {completedChords.size >= 5 && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.completedText}>Todos os acordes praticados! 🎉</Text>
              </View>
            )}
          </Card>

          {/* Card 4 — Monte o Acorde */}
          <Card
            title="Monte o Acorde"
            icon="trophy"
            color="#FFFFFF"
          >
            <Text style={styles.cardDescription}>
              Desafio final! O app mostrará um acorde. Toque-o no seu violão e veja se acertou!
            </Text>

            {challengeChord && !challengeComplete && (
              <View style={styles.challengeContainer}>
                <View style={styles.challengeDisplay}>
                  <Text style={styles.challengeLabel}>Toque o acorde:</Text>
                  <Text style={styles.challengeChord}>{challengeChord}</Text>
                </View>

                <Button
                  title={isRecordingChallenge ? "⏹️ Parar gravação" : "🎙 Gravar acorde"}
                  onPress={handleChallengeRecord}
                  icon={isRecordingChallenge ? "stop" : "mic"}
                  variant="primary"
                  loading={isDetectingChallenge}
                />

                {isDetectingChallenge && (
                  <View style={styles.detectingContainer}>
                    <ActivityIndicator size="small" color="#7C3AED" />
                    <Text style={styles.detectingText}>Verificando...</Text>
                  </View>
                )}

                {challengeResult === 'correct' && (
                  <View style={styles.challengeResultSuccess}>
                    <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
                    <Text style={styles.challengeResultText}>✅ Correto!</Text>
                  </View>
                )}

                {challengeResult === 'incorrect' && (
                  <View style={styles.challengeResultError}>
                    <Ionicons name="close-circle" size={48} color="#EF4444" />
                    <Text style={styles.challengeResultText}>❌ Tente novamente</Text>
                  </View>
                )}

                {challengeAttempts > 0 && (
                  <Text style={styles.challengeAttempts}>
                    Tentativas: {challengeAttempts}
                  </Text>
                )}
              </View>
            )}

            {challengeComplete && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.completedText}>Desafio completo! 🎉</Text>
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
  triadContainer: {
    marginBottom: 16,
  },
  triadStack: {
    alignItems: 'center',
    marginBottom: 20,
  },
  triadNote: {
    width: 120,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  triadRoot: {
    backgroundColor: '#7C3AED',
  },
  triadThird: {
    backgroundColor: '#F97316',
  },
  triadFifth: {
    backgroundColor: '#22C55E',
  },
  triadNoteLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  triadNoteName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  triadExplanation: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
  },
  triadExplanationText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  triadBold: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  chordComparisonContainer: {
    gap: 16,
    marginBottom: 16,
  },
  chordComparisonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  chordMajorButton: {
    backgroundColor: '#F97316',
  },
  chordMinorButton: {
    backgroundColor: '#7C3AED',
  },
  chordButtonPlayed: {
    opacity: 0.8,
  },
  chordComparisonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  chordButtonCheck: {
    marginLeft: 'auto',
  },
  practiceChordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
    justifyContent: 'center',
  },
  practiceChordButton: {
    minWidth: 80,
  },
  practiceChordButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  chordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  chordBadgeCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  chordBadgeCurrent: {
    backgroundColor: '#E0E7FF',
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  chordBadgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  chordBadgeIcon: {
    marginLeft: 4,
  },
  recordingSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
  },
  recordingLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  recordingChord: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  detectingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  detectingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  challengeContainer: {
    marginTop: 16,
  },
  challengeDisplay: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#E0E7FF',
    borderRadius: 16,
    marginBottom: 16,
  },
  challengeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  challengeChord: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  challengeResultSuccess: {
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 16,
  },
  challengeResultError: {
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
  },
  challengeResultText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  challengeAttempts: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
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

