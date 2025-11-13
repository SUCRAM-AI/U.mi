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

// Componente Badge de Grau Harmônico
interface DegreeBadgeProps {
  degree: string;
  label: string;
  color: string;
  description: string;
}

function DegreeBadge({ degree, label, color, description }: DegreeBadgeProps) {
  return (
    <View style={styles.degreeBadgeContainer}>
      <View style={[styles.degreeBadge, { backgroundColor: color }]}>
        <Text style={styles.degreeBadgeText}>{degree}</Text>
      </View>
      <Text style={styles.degreeLabel}>{label}</Text>
      <Text style={styles.degreeDescription}>{description}</Text>
    </View>
  );
}

// Componente Barra de Progresso Animada
interface AnimatedProgressBarProps {
  progress: number;
  label: string;
}

function AnimatedProgressBar({ progress, label }: AnimatedProgressBarProps) {
  const [animatedWidth] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={styles.progressBarWrapper}>
      <Text style={styles.progressBarLabel}>{label}</Text>
      <View style={styles.progressBarBackground}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <Text style={styles.progressBarText}>{progress}%</Text>
    </View>
  );
}

// Tela Principal
export default function Lesson5() {
  const router = useRouter();
  const { addXP, completeLesson } = useAuth();
  const [progress, setProgress] = useState(10);
  
  // Estados para Card 1 - Campo Harmônico
  const [fieldStudied, setFieldStudied] = useState(false);
  
  // Estados para Card 2 - Função Harmônica
  const [currentChordFunction, setCurrentChordFunction] = useState<string | null>(null);
  const [isPlayingFunctionChord, setIsPlayingFunctionChord] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const [functionResults, setFunctionResults] = useState<Array<{ chord: string; correct: boolean }>>([]);
  const [functionComplete, setFunctionComplete] = useState(false);
  
  // Estados para Card 3 - Desafio Final
  const challengeSequence = ['C', 'G', 'Am', 'F'];
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [sequenceResults, setSequenceResults] = useState<Array<{ expected: string; detected: string | null; correct: boolean }>>([]);
  const [isRecordingSequence, setIsRecordingSequence] = useState(false);
  const [isDetectingSequence, setIsDetectingSequence] = useState(false);
  const [sequenceComplete, setSequenceComplete] = useState(false);
  const {
    isRecording,
    soundUri,
    startRecording,
    stopRecording,
    reset,
  } = useAudioRecorder();

  // Graus harmônicos com funções
  const harmonicDegrees = [
    { degree: 'I', label: 'Tônica', color: '#22C55E', description: 'Início, repouso' },
    { degree: 'ii', label: 'Super', color: '#9CA3AF', description: 'Preparação' },
    { degree: 'iii', label: 'Mediante', color: '#9CA3AF', description: 'Movimento' },
    { degree: 'IV', label: 'Subdominante', color: '#3B82F6', description: 'Meio, tensão' },
    { degree: 'V', label: 'Dominante', color: '#F97316', description: 'Fim, resolução' },
    { degree: 'vi', label: 'Relativa', color: '#9CA3AF', description: 'Movimento' },
    { degree: 'vii°', label: 'Sensível', color: '#9CA3AF', description: 'Tensão' },
  ];

  // Acordes para exercício de função (exemplo em C)
  const functionChords = [
    { chord: 'C', function: 'Tônica' },
    { chord: 'F', function: 'Subdominante' },
    { chord: 'G', function: 'Dominante' },
    { chord: 'C', function: 'Tônica' },
  ];

  // Atualizar progresso
  useEffect(() => {
    let newProgress = 10;
    if (fieldStudied) newProgress += 30;
    if (functionComplete) newProgress += 30;
    if (sequenceComplete) newProgress += 30;
    setProgress(newProgress);
  }, [fieldStudied, functionComplete, sequenceComplete]);

  // Limpar ao desmontar
  useEffect(() => {
    return () => {
      reset();
    };
  }, []);

  // Estudar campo harmônico
  const handleStudyField = () => {
    setFieldStudied(true);
    addXP(30);
  };

  // Tocar acorde para função harmônica
  const playFunctionChord = async () => {
    if (functionResults.length >= functionChords.length) {
      setFunctionComplete(true);
      return;
    }

    const currentIndex = functionResults.length;
    const currentChord = functionChords[currentIndex];
    setCurrentChordFunction(currentChord.function);
    setIsPlayingFunctionChord(true);
    setSelectedFunction(null);

    // Em produção, tocar arquivo de áudio real
    Alert.alert(
      '🎵 Tocando acorde',
      `Ouça o acorde ${currentChord.chord} e identifique sua função harmônica.\n\n(Em produção, aqui tocaria o áudio real)`,
      [{ text: 'OK', onPress: () => setIsPlayingFunctionChord(false) }]
    );
  };

  // Verificar função selecionada
  const handleFunctionSelection = (selected: string) => {
    if (!currentChordFunction) return;

    setSelectedFunction(selected);
    const isCorrect = selected === currentChordFunction;
    
    const currentIndex = functionResults.length;
    const currentChord = functionChords[currentIndex];
    
    setFunctionResults(prev => [...prev, { chord: currentChord.chord, correct: isCorrect }]);

    if (isCorrect) {
      addXP(20);
      Alert.alert('✅ Correto!', `O acorde ${currentChord.chord} tem função de ${currentChordFunction}!`);
    } else {
      Alert.alert('❌ Errado', `A função correta era ${currentChordFunction}.`);
    }

    // Avançar para próximo acorde ou completar
    setTimeout(() => {
      if (functionResults.length + 1 >= functionChords.length) {
        setFunctionComplete(true);
      } else {
        setCurrentChordFunction(null);
        setSelectedFunction(null);
      }
    }, 1500);
  };

  // Iniciar desafio de sequência
  const handleStartSequence = () => {
    setCurrentSequenceIndex(0);
    setSequenceResults([]);
    setSequenceComplete(false);
    Alert.alert(
      '🎸 Desafio Final',
      `Toque a sequência: ${challengeSequence.join(' → ')}\n\nVamos começar com ${challengeSequence[0]}.`
    );
  };

  // Gravar acorde da sequência
  const handleRecordSequence = async () => {
    if (currentSequenceIndex >= challengeSequence.length) {
      return;
    }

    if (isRecording) {
      // Parar gravação
      const uri = await stopRecording();
      if (uri) {
        setIsDetectingSequence(true);
        const expectedChord = challengeSequence[currentSequenceIndex];

        try {
          const result = await detectChord(uri);
          setIsDetectingSequence(false);

          if (result.success && result.chord) {
            const detected = result.chord.toUpperCase();
            const isCorrect = 
              detected === expectedChord.toUpperCase() ||
              result.all_chords?.some(chord => chord.toUpperCase() === expectedChord.toUpperCase());

            setSequenceResults(prev => [
              ...prev,
              { expected: expectedChord, detected, correct: isCorrect }
            ]);

            if (isCorrect) {
              addXP(25);
              if (currentSequenceIndex + 1 < challengeSequence.length) {
                Alert.alert(
                  '✅ Correto!',
                  `Agora toque: ${challengeSequence[currentSequenceIndex + 1]}`
                );
                setCurrentSequenceIndex(prev => prev + 1);
              } else {
                setSequenceComplete(true);
                Alert.alert(
                  '🎉 Parabéns!',
                  'Você completou a progressão pop clássica!'
                );
              }
            } else {
              Alert.alert(
                '❌ Tente novamente',
                `Você tocou ${detected}, mas o esperado era ${expectedChord}.`
              );
            }
          } else {
            Alert.alert('Erro', result.error || 'Não foi possível detectar o acorde');
          }
        } catch (error) {
          setIsDetectingSequence(false);
          console.error('Erro ao detectar acorde:', error);
          Alert.alert('Erro', 'Não foi possível processar o áudio');
        }
      }
      reset();
      setIsRecordingSequence(false);
    } else {
      // Iniciar gravação
      setIsRecordingSequence(true);
      await startRecording();
    }
  };

  // Calcular acertos da sequência
  const sequenceCorrectCount = sequenceResults.filter(r => r.correct).length;
  const sequenceProgress = sequenceResults.length > 0 
    ? (sequenceCorrectCount / challengeSequence.length) * 100 
    : 0;

  const handleNextLesson = async () => {
    if (progress < 100) {
      Alert.alert('Atenção', 'Complete todas as tarefas antes de avançar!');
      return;
    }
    
    await completeLesson('mundo1-lesson5');
    Alert.alert('Parabéns! 🎉', 'Você completou o Módulo 5!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const handleReview = () => {
    setFieldStudied(false);
    setFunctionComplete(false);
    setFunctionResults([]);
    setCurrentChordFunction(null);
    setSelectedFunction(null);
    setSequenceComplete(false);
    setSequenceResults([]);
    setCurrentSequenceIndex(0);
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
          title="🎼 Módulo 5 — Harmonia e Progressões"
          subtitle="Compreenda as relações entre acordes e ouça suas funções na harmonia."
          progress={progress}
          onBack={() => router.back()}
        />

        <View style={styles.content}>
          {/* Card 1 — Campo Harmônico */}
          <Card
            title="Campo Harmônico"
            icon="musical-notes"
            color="#FFFFFF"
          >
            <Text style={styles.cardDescription}>
              Cada acorde tem uma função na música. Alguns dão repouso, outros criam movimento e tensão.
            </Text>

            <View style={styles.degreesContainer}>
              {harmonicDegrees.map((degree, index) => (
                <DegreeBadge
                  key={index}
                  degree={degree.degree}
                  label={degree.label}
                  color={degree.color}
                  description={degree.description}
                />
              ))}
            </View>

            {!fieldStudied && (
              <Button
                title="Entendi! Continuar"
                onPress={handleStudyField}
                icon="checkmark-circle"
                variant="primary"
              />
            )}

            {fieldStudied && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.completedText}>Campo harmônico compreendido! 🎉</Text>
              </View>
            )}
          </Card>

          {/* Card 2 — Função Harmônica */}
          <Card
            title="Função Harmônica"
            icon="ear"
            color="#FFFFFF"
          >
            <Text style={styles.cardDescription}>
              Ouça cada acorde e identifique sua função: Tônica (início), Subdominante (meio) ou Dominante (fim).
            </Text>

            {!functionComplete ? (
              <>
                <Button
                  title={isPlayingFunctionChord ? "🎵 Tocando..." : "▶️ Ouvir acorde"}
                  onPress={playFunctionChord}
                  icon="play"
                  variant="primary"
                  disabled={isPlayingFunctionChord || functionResults.length >= functionChords.length}
                />

                {currentChordFunction && !isPlayingFunctionChord && (
                  <View style={styles.functionSelectionContainer}>
                    <Text style={styles.functionQuestion}>
                      Qual é a função deste acorde?
                    </Text>
                    <View style={styles.functionButtonsContainer}>
                      <TouchableOpacity
                        style={[
                          styles.functionButton,
                          selectedFunction === 'Tônica' && styles.functionButtonSelected,
                        ]}
                        onPress={() => handleFunctionSelection('Tônica')}
                        disabled={selectedFunction !== null}
                      >
                        <Text style={styles.functionButtonText}>Tônica</Text>
                        <Text style={styles.functionButtonSubtext}>Início</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.functionButton,
                          selectedFunction === 'Subdominante' && styles.functionButtonSelected,
                        ]}
                        onPress={() => handleFunctionSelection('Subdominante')}
                        disabled={selectedFunction !== null}
                      >
                        <Text style={styles.functionButtonText}>Subdominante</Text>
                        <Text style={styles.functionButtonSubtext}>Meio</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.functionButton,
                          selectedFunction === 'Dominante' && styles.functionButtonSelected,
                        ]}
                        onPress={() => handleFunctionSelection('Dominante')}
                        disabled={selectedFunction !== null}
                      >
                        <Text style={styles.functionButtonText}>Dominante</Text>
                        <Text style={styles.functionButtonSubtext}>Fim</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {functionResults.length > 0 && (
                  <View style={styles.resultsContainer}>
                    <Text style={styles.resultsLabel}>Resultados:</Text>
                    {functionResults.map((result, index) => (
                      <View key={index} style={styles.resultItem}>
                        <Text style={styles.resultChord}>{result.chord}</Text>
                        {result.correct ? (
                          <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                        ) : (
                          <Ionicons name="close-circle" size={20} color="#EF4444" />
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.completedText}>Funções harmônicas identificadas! 🎉</Text>
              </View>
            )}
          </Card>

          {/* Card 3 — Desafio Final */}
          <Card
            title="Desafio Final 🎸"
            icon="trophy"
            color="#FFFFFF"
          >
            <Text style={styles.cardDescription}>
              Toque a sequência clássica: C → G → Am → F. Esta é a progressão pop mais famosa!
            </Text>

            {!sequenceComplete ? (
              <>
                {sequenceResults.length === 0 && (
                  <Button
                    title="Iniciar desafio"
                    onPress={handleStartSequence}
                    icon="play"
                    variant="primary"
                  />
                )}

                {sequenceResults.length > 0 && currentSequenceIndex < challengeSequence.length && (
                  <View style={styles.sequenceContainer}>
                    <Text style={styles.sequenceLabel}>
                      Toque: <Text style={styles.sequenceChord}>{challengeSequence[currentSequenceIndex]}</Text>
                    </Text>
                    <Text style={styles.sequenceProgress}>
                      {currentSequenceIndex + 1} de {challengeSequence.length}
                    </Text>
                  </View>
                )}

                {sequenceResults.length > 0 && (
                  <Button
                    title={isRecording ? "⏹️ Parar gravação" : "🎙 Gravar acorde"}
                    onPress={handleRecordSequence}
                    icon={isRecording ? "stop" : "mic"}
                    variant="primary"
                    loading={isDetectingSequence}
                    disabled={currentSequenceIndex >= challengeSequence.length}
                  />
                )}

                {isDetectingSequence && (
                  <View style={styles.detectingContainer}>
                    <ActivityIndicator size="small" color="#7C3AED" />
                    <Text style={styles.detectingText}>Analisando acorde...</Text>
                  </View>
                )}

                {sequenceResults.length > 0 && (
                  <View style={styles.sequenceResultsContainer}>
                    <Text style={styles.sequenceResultsLabel}>Progressão:</Text>
                    <View style={styles.sequenceResultsList}>
                      {challengeSequence.map((chord, index) => {
                        const result = sequenceResults[index];
                        return (
                          <View key={index} style={styles.sequenceResultItem}>
                            <Text style={styles.sequenceResultChord}>{chord}</Text>
                            {result ? (
                              result.correct ? (
                                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                              ) : (
                                <Ionicons name="close-circle" size={20} color="#EF4444" />
                              )
                            ) : (
                              <View style={styles.sequenceResultPending} />
                            )}
                          </View>
                        );
                      })}
                    </View>
                    <AnimatedProgressBar
                      progress={sequenceProgress}
                      label="Progresso da sequência"
                    />
                  </View>
                )}
              </>
            ) : (
              <View style={styles.sequenceCompleteContainer}>
                <Ionicons name="trophy" size={64} color="#F97316" />
                <Text style={styles.sequenceCompleteTitle}>🎉 Parabéns!</Text>
                <Text style={styles.sequenceCompleteText}>
                  Você completou a progressão pop clássica!
                </Text>
                <Text style={styles.sequenceCompleteSubtext}>
                  Acertos: {sequenceCorrectCount} de {challengeSequence.length}
                </Text>
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
  degreesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
    justifyContent: 'center',
  },
  degreeBadgeContainer: {
    alignItems: 'center',
    minWidth: 80,
  },
  degreeBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  degreeBadgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  degreeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  degreeDescription: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  functionSelectionContainer: {
    marginTop: 16,
  },
  functionQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  functionButtonsContainer: {
    gap: 12,
  },
  functionButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  functionButtonSelected: {
    backgroundColor: '#E0E7FF',
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  functionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  functionButtonSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  resultsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
  },
  resultsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  resultChord: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  sequenceContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E0E7FF',
    borderRadius: 16,
    marginBottom: 16,
  },
  sequenceLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  sequenceChord: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  sequenceProgress: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
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
  sequenceResultsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
  },
  sequenceResultsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  sequenceResultsList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  sequenceResultItem: {
    alignItems: 'center',
    gap: 8,
  },
  sequenceResultChord: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  sequenceResultPending: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  progressBarWrapper: {
    marginTop: 8,
  },
  progressBarLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 6,
  },
  progressBarText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'right',
  },
  sequenceCompleteContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#E0E7FF',
    borderRadius: 16,
  },
  sequenceCompleteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  sequenceCompleteText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  sequenceCompleteSubtext: {
    fontSize: 14,
    color: '#6B7280',
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

