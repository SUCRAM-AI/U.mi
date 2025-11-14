import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@contexts/AuthContext';
import SettingsModal from '@components/settings-modal';

// Importar ícones
import MenuIcon from '@assets/images/people.svg';
import IconeConfig from '@assets/images/config.svg';
import IconeNotas from '@assets/images/icongray.svg';
import Iconeloja from '@assets/images/loja.svg';
import Perfilp from '@assets/images/perfilp.svg';
import TrilhaIcon from '@assets/images/trilhateorica.svg';
import MascoteLyrics from '@assets/images/chatlyrics.svg';
import BottomNav from '@components/ui/bottom-nav';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Chat = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Eu sou o Lyrics, seu assistente musical! Como posso te ajudar hoje?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSettingsPress = () => {
    setSettingsVisible(true);
  };

  const handleCloseSettings = () => {
    setSettingsVisible(false);
  };

  const handleAbout = () => {
    setSettingsVisible(false);
    Alert.alert('Sobre', 'U.Mi - Aplicativo de aprendizado musical');
  };

  const handleLogout = async () => {
    setSettingsVisible(false);
    await logout();
    router.replace('/login');
  };

  // Respostas do chatbot
  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase().trim();

    // Saudações
    if (message.includes('oi') || message.includes('olá') || message.includes('ola') || message.includes('hey')) {
      return 'Olá! Fico feliz em te ajudar! O que você gostaria de saber sobre música?';
    }

    // Perguntas sobre acordes
    if (message.includes('acorde') || message.includes('acordes')) {
      if (message.includes('maior') || message.includes('menor')) {
        return 'Acordes maiores têm um som mais alegre e brilhante, enquanto acordes menores têm um som mais melancólico. A diferença está na terça: maior usa terça maior, menor usa terça menor. Quer saber mais sobre algum acorde específico?';
      }
      return 'Acordes são combinações de três ou mais notas tocadas simultaneamente. Eles formam a base harmônica da música! Posso te ajudar com acordes específicos ou progressões.';
    }

    // Perguntas sobre escalas
    if (message.includes('escala') || message.includes('escalas')) {
      return 'Escalas são sequências ordenadas de notas. A escala maior é a mais comum e tem um padrão de tons e semitons: T-T-ST-T-T-T-ST. Quer praticar alguma escala específica?';
    }

    // Perguntas sobre ritmo
    if (message.includes('ritmo') || message.includes('tempo') || message.includes('batida')) {
      return 'Ritmo é a organização temporal da música. Ele define quando as notas são tocadas e por quanto tempo. O tempo (bpm) controla a velocidade da música. Quer saber mais sobre algum padrão rítmico?';
    }

    // Perguntas sobre intervalos
    if (message.includes('intervalo') || message.includes('intervalos')) {
      return 'Intervalos são a distância entre duas notas. Eles podem ser maiores, menores, justos, aumentados ou diminutos. Os intervalos são fundamentais para entender harmonia!';
    }

    // Perguntas sobre progressão
    if (message.includes('progressão') || message.includes('progressao') || message.includes('sequência') || message.includes('sequencia')) {
      return 'Progressões de acordes são sequências de acordes que criam movimento harmônico. Uma progressão muito comum é I-V-vi-IV (por exemplo, C-G-Am-F em Dó maior). Quer aprender alguma progressão específica?';
    }

    // Perguntas sobre teoria musical
    if (message.includes('teoria') || message.includes('aprender') || message.includes('como')) {
      return 'A teoria musical ajuda a entender como a música funciona! Comece pelos fundamentos: notas, escalas, acordes e ritmo. Nossa trilha teórica é perfeita para isso! Quer uma dica sobre por onde começar?';
    }

    // Perguntas sobre lições
    if (message.includes('lição') || message.includes('licao') || message.includes('aula') || message.includes('curso')) {
      return 'Nossas lições estão organizadas em seções: Fundamentos Físicos, Base Harmônica, O Motor Rítmico, Gigantes do PoP e Consolidar. Cada seção tem lições práticas e teóricas! Qual seção te interessa?';
    }

    // Perguntas sobre prática
    if (message.includes('praticar') || message.includes('prática') || message.includes('pratica') || message.includes('treinar')) {
      return 'A prática constante é essencial! Recomendo praticar pelo menos 15-30 minutos por dia. Foque em uma coisa de cada vez e seja paciente. Quer dicas de como praticar algo específico?';
    }

    // Perguntas sobre violão/guitarra
    if (message.includes('violão') || message.includes('violao') || message.includes('guitarra')) {
      return 'O violão é um instrumento incrível! Comece aprendendo os acordes básicos (C, G, D, Em, Am) e pratique trocas entre eles. A postura e o posicionamento das mãos são muito importantes!';
    }

    // Despedidas
    if (message.includes('tchau') || message.includes('obrigado') || message.includes('obrigada') || message.includes('valeu')) {
      return 'De nada! Fico feliz em ajudar. Continue praticando e qualquer dúvida, estou aqui! 🎵';
    }

    // Resposta padrão
    return 'Interessante! Posso te ajudar com teoria musical, acordes, escalas, ritmo, intervalos e muito mais. Faça uma pergunta específica e eu te ajudo!';
  };

  const handleSend = () => {
    if (inputText.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // Simular resposta do bot após um pequeno delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(userMessage.text),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 500);
  };

  // Scroll para o final quando novas mensagens são adicionadas
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.chat}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.button2} onPress={handleSettingsPress}>
            <IconeConfig width={45} height={45} style={styles.iconStyle} />
          </TouchableOpacity>
          <Text style={styles.heading2Chat}>Chat com Lyrics</Text>
          <TouchableOpacity style={styles.button3}>
            <MenuIcon width={32} height={32} style={styles.iconStyle} />
          </TouchableOpacity>
        </View>

        {/* Área de Mensagens */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Mascote Lyrics no topo */}
          <View style={styles.mascoteContainer}>
            <MascoteLyrics width={200} height={217} />
            <Text style={styles.mascoteText}>Olá! Sou o Lyrics, seu assistente musical! 🎵</Text>
            <View style={styles.mascoteTextRectangle} />
          </View>

          {/* Mensagens */}
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.isUser ? styles.userMessage : styles.botMessage,
              ]}
            >
              {!message.isUser && (
                <View style={styles.botAvatar}>
                  <MascoteLyrics width={32} height={35} />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userBubble : styles.botBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isUser ? styles.userText : styles.botText,
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua pergunta..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity 
            style={[styles.sendButton, inputText.trim() === '' && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={inputText.trim() === ''}
          >
            <Text style={styles.sendButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom navigation */}
        <BottomNav
          TrilhaIcon={TrilhaIcon}
          IconeNotas={IconeNotas}
          Iconeloja={Iconeloja}
          Perfilp={Perfilp}
        />

        {/* Settings Modal */}
        <SettingsModal
          visible={settingsVisible}
          onClose={handleCloseSettings}
          onPressAbout={handleAbout}
          onPressLogout={handleLogout}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfaff',
  },
  chat: {
    flex: 1,
    backgroundColor: '#fbfaff',
  },
  header: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(245, 245, 247, 0.8)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  button2: {
    backgroundColor: '#ffffff',
    borderRadius: 9999,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button3: {
    backgroundColor: '#ffffff',
    borderRadius: 9999,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconStyle: {
    // Estilo para SVGs do Header
  },
  heading2Chat: {
    color: '#333333',
    fontFamily: 'SplineSans-Bold',
    fontSize: 18,
    fontWeight: '700',
  },
  messagesContainer: {
    flex: 1,
    marginTop: 72,
    marginBottom: 150, // Espaço para input + bottom nav
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  mascoteContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 10,
  },
  mascoteText: {
    color: '#7C3AED',
    fontFamily: 'Lexend-SemiBold',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  mascoteTextRectangle: {
    width: 200,
    height: 4,
    backgroundColor: '#7C3AED',
    borderRadius: 2,
    marginTop: 12,
    opacity: 0.3,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 35,
    marginRight: 8,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#7C3AED',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'Lexend-Regular',
  },
  userText: {
    color: '#ffffff',
  },
  botText: {
    color: '#333333',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 85, // Acima do bottom nav
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eae0f5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Lexend-Regular',
    color: '#333333',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#ffffff',
    fontFamily: 'Lexend-SemiBold',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default Chat;

