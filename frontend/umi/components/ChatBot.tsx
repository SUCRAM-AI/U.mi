/**
 * Componente ChatBot - Botão flutuante e modal de chat
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getChatbotResponse, getLessonsContext, ChatMessage } from '@services/openai';
import { useLocalSearchParams, usePathname } from 'expo-router';
import { getLesson } from '@config/lessons';

interface ChatBotProps {
  currentLessonId?: string;
}

export default function ChatBot({ currentLessonId }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou seu assistente virtual. Como posso ajudá-lo hoje com suas dúvidas sobre violão e música?',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const params = useLocalSearchParams();
  const pathname = usePathname();
  
  // Extrair lessonId da URL se estiver na rota /lesson/[lessonId]
  let lessonId: string | undefined = currentLessonId;
  if (!lessonId && pathname?.includes('/lesson/')) {
    const lessonIdFromParams = Array.isArray(params.lessonId) 
      ? params.lessonId[0] 
      : (params.lessonId as string);
    lessonId = lessonIdFromParams;
  }

  // Obter contexto da lição atual
  const getLessonContext = (): string => {
    if (!lessonId) return getLessonsContext();
    
    const lesson = getLesson(lessonId);
    if (!lesson) return getLessonsContext();
    
    return `${getLessonsContext()}\n\nLição atual: ${lesson.title} - ${lesson.description}`;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputText.trim(),
    };

    // Adicionar mensagem do usuário
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const messageToSend = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      const lessonContext = getLessonContext();
      console.log('📤 Enviando mensagem para o chatbot:', messageToSend);
      console.log('📋 Contexto da lição:', lessonContext);
      
      const response = await getChatbotResponse(newMessages, lessonContext);
      console.log('✅ Resposta recebida:', response);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('❌ Erro ao obter resposta do chatbot:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: error instanceof Error 
          ? `Desculpe, ocorreu um erro: ${error.message}. Por favor, verifique se o backend está rodando e tente novamente.`
          : 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para quando o usuário pressiona Enter (mas não Shift+Enter)
  const handleKeyPress = (e: any) => {
    // Em web, verificar se é Enter sem Shift
    if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Scroll automático quando novas mensagens são adicionadas
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isOpen]);

  return (
    <>
      {/* Botão flutuante */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal de chat */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardView}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.headerIconContainer}>
                  <Ionicons name="chatbubble-ellipses" size={24} color="#7e22ce" />
                </View>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>Assistente Virtual</Text>
                  <Text style={styles.headerSubtitle}>Como posso ajudar?</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsOpen(false)}
              >
                <Ionicons name="close" size={28} color="#333333" />
              </TouchableOpacity>
            </View>

            {/* Mensagens */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map((message, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageWrapper,
                    message.role === 'user' ? styles.userMessageWrapper : styles.assistantMessageWrapper,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      message.role === 'user' ? styles.userMessage : styles.assistantMessage,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        message.role === 'user' ? styles.userMessageText : styles.assistantMessageText,
                      ]}
                    >
                      {message.content}
                    </Text>
                  </View>
                </View>
              ))}
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#7e22ce" />
                  <Text style={styles.loadingText}>Pensando...</Text>
                </View>
              )}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Digite sua dúvida..."
                placeholderTextColor="#999999"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                editable={!isLoading}
                onSubmitEditing={Platform.OS === 'web' ? undefined : handleSendMessage}
                onKeyPress={handleKeyPress}
                blurOnSubmit={false}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
                onPress={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
              >
                <Ionicons name="send" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7e22ce',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Lexend-Bold',
    fontWeight: '700',
    color: '#333333',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    fontWeight: '400',
    color: '#666666',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#FBFBFF',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageWrapper: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  assistantMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userMessage: {
    backgroundColor: '#7e22ce',
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontFamily: 'Lexend-Regular',
    fontWeight: '400',
  },
  assistantMessageText: {
    color: '#333333',
    fontFamily: 'Lexend-Regular',
    fontWeight: '400',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#7e22ce',
    fontFamily: 'Lexend-Regular',
    fontWeight: '400',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 22,
    fontSize: 15,
    fontFamily: 'Lexend-Regular',
    color: '#333333',
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7e22ce',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.5,
  },
});

