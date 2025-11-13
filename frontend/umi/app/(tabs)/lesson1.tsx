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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useAuth } from '../../contexts/AuthContext';

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
}

function Button({ title, onPress, variant = 'primary', icon, disabled }: ButtonProps) {
  const buttonStyle = variant === 'secondary' ? styles.buttonSecondary : styles.buttonPrimary;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[buttonStyle, disabled && styles.buttonDisabled]}
      disabled={disabled}
    >
      {icon && <Ionicons name={icon as any} size={20} color="#FFFFFF" style={styles.buttonIcon} />}
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

// Componente Label Interativo para Partes do Violão
interface PartLabelProps {
  part: string;
  position: { top: number; left: number };
  visible: boolean;
  onPress: () => void;
}

function PartLabel({ part, position, visible, onPress }: PartLabelProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.partLabel,
        {
          top: position.top,
          left: position.left,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} style={styles.labelButton}>
        <View style={styles.labelDot} />
        <Text style={styles.labelText}>{part}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Componente Quiz Interativo
interface QuizButtonProps {
  question: string;
  options: string[];
  correctAnswer: string;
  onComplete: () => void;
}

function QuizButton({ question, options, correctAnswer, onComplete }: QuizButtonProps) {
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
export default function Lesson1() {
  const router = useRouter();
  const { addXP, completeLesson } = useAuth();
  const [progress, setProgress] = useState(10);
  const [showPartLabels, setShowPartLabels] = useState(false);
  const [postureChecked, setPostureChecked] = useState(false);
  const [quiz1Complete, setQuiz1Complete] = useState(false);
  const [quiz2Complete, setQuiz2Complete] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Partes do violão com posições (ajustar conforme necessário)
  const guitarParts = [
    { name: 'Cabeça', position: { top: 10, left: 50 } },
    { name: 'Pestana', position: { top: 60, left: 50 } },
    { name: 'Trastes', position: { top: 100, left: 50 } },
    { name: 'Braço', position: { top: 120, left: 50 } },
    { name: 'Corpo', position: { top: 200, left: 50 } },
    { name: 'Cordas', position: { top: 150, left: 50 } },
  ];

  // Atualizar progresso baseado nas tarefas completadas
  useEffect(() => {
    let newProgress = 10;
    if (showPartLabels) newProgress += 30;
    if (postureChecked) newProgress += 30;
    if (quiz1Complete && quiz2Complete) newProgress += 30;
    setProgress(newProgress);
  }, [showPartLabels, postureChecked, quiz1Complete, quiz2Complete]);

  const handleShowParts = () => {
    setShowPartLabels(true);
    addXP(20);
  };

  const handleCheckPosture = () => {
    // Simulação de verificação de postura
    Alert.alert(
      'Postura Verificada! 🧍',
      'Sua postura está correta! Lembre-se:\n\n• Mantenha as costas retas\n• Apoie o violão na perna direita\n• O braço deve estar em um ângulo confortável',
      [{ text: 'OK', onPress: () => setPostureChecked(true) }]
    );
    addXP(30);
  };

  const handleQuiz1Complete = () => {
    setQuiz1Complete(true);
    addXP(25);
  };

  const handleQuiz2Complete = () => {
    setQuiz2Complete(true);
    addXP(25);
  };

  const handleNextLesson = async () => {
    if (progress < 100) {
      Alert.alert('Atenção', 'Complete todas as tarefas antes de avançar!');
      return;
    }
    
    await completeLesson('mundo1-lesson1');
    Alert.alert('Parabéns! 🎉', 'Você completou o Módulo 1!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const handleReview = () => {
    setShowPartLabels(false);
    setPostureChecked(false);
    setQuiz1Complete(false);
    setQuiz2Complete(false);
    setProgress(10);
  };

  // Limpar som ao desmontar
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="🎸 Módulo 1: Introdução ao Instrumento"
          subtitle="Conheça seu instrumento antes de começar a tocar."
          progress={progress}
          onBack={() => router.back()}
        />

        <View style={styles.content}>
          {/* Card 1 — Partes do Violão */}
          <Card
            title="Partes do Violão"
            icon="musical-notes"
            color="#FFFFFF"
          >
            <View style={styles.imageContainer}>
              {/* Placeholder para imagem do violão - substituir por imagem real */}
              <View style={styles.guitarPlaceholder}>
                <Ionicons name="musical-notes" size={80} color="#7C3AED" />
                <Text style={styles.placeholderText}>Imagem do Violão</Text>
              </View>
              
              {showPartLabels && (
                <View style={styles.labelsContainer}>
                  {guitarParts.map((part, index) => (
                    <PartLabel
                      key={index}
                      part={part.name}
                      position={part.position}
                      visible={showPartLabels}
                      onPress={() => {}}
                    />
                  ))}
                </View>
              )}
            </View>
            
            <Text style={styles.cardDescription}>
              O violão é composto por várias partes importantes. Cada uma tem uma função específica
              no som e na forma como você toca o instrumento.
            </Text>
            
            {!showPartLabels && (
              <Button
                title="Mostrar nomes das partes 🎯"
                onPress={handleShowParts}
                icon="eye"
                variant="primary"
              />
            )}
            
            {showPartLabels && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.completedText}>Partes identificadas!</Text>
              </View>
            )}
          </Card>

          {/* Card 2 — Como Segurar Corretamente */}
          <Card
            title="Como Segurar Corretamente"
            icon="body"
            color="#FFFFFF"
          >
            <View style={styles.imageContainer}>
              <View style={styles.guitarPlaceholder}>
                <Ionicons name="body" size={80} color="#F97316" />
                <Text style={styles.placeholderText}>Postura Correta</Text>
              </View>
            </View>
            
            <Text style={styles.cardDescription}>
              Ajuste a posição do corpo e do braço. O violão deve estar apoiado na perna direita,
              com o braço em um ângulo confortável. Mantenha as costas retas e relaxe os ombros.
            </Text>
            
            {!postureChecked && (
              <Button
                title="Verificar postura 🧍"
                onPress={handleCheckPosture}
                icon="checkmark-circle"
                variant="primary"
              />
            )}
            
            {postureChecked && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.completedText}>Postura verificada!</Text>
              </View>
            )}
          </Card>

          {/* Card 3 — Numeração das Cordas e Dedos */}
          <Card
            title="Numeração das Cordas e Dedos"
            icon="finger-print"
            color="#FFFFFF"
          >
            <Text style={styles.cardDescription}>
              As cordas são contadas da mais fina (1ª) até a mais grossa (6ª). Os dedos são numerados
              da seguinte forma:
            </Text>
            
            <View style={styles.infoBox}>
              <View style={styles.infoRow}>
                <Ionicons name="musical-note" size={20} color="#7C3AED" />
                <Text style={styles.infoText}>
                  <Text style={styles.infoBold}>Cordas:</Text> 1ª (Mi) → 2ª (Si) → 3ª (Sol) → 4ª (Ré) → 5ª (Lá) → 6ª (Mi)
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="hand-left" size={20} color="#F97316" />
                <Text style={styles.infoText}>
                  <Text style={styles.infoBold}>Dedos:</Text> 1 = Indicador, 2 = Médio, 3 = Anelar, 4 = Mínimo
                </Text>
              </View>
            </View>

            {!quiz1Complete && (
              <QuizButton
                question="Qual é a 3ª corda do violão?"
                options={['Mi', 'Si', 'Sol', 'Ré']}
                correctAnswer="Sol"
                onComplete={handleQuiz1Complete}
              />
            )}

            {quiz1Complete && !quiz2Complete && (
              <QuizButton
                question="Qual dedo é o nº 2?"
                options={['Polegar', 'Indicador', 'Médio', 'Anelar']}
                correctAnswer="Médio"
                onComplete={handleQuiz2Complete}
              />
            )}

            {quiz1Complete && quiz2Complete && (
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
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  guitarPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  labelsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  partLabel: {
    position: 'absolute',
  },
  labelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  labelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  infoBold: {
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

