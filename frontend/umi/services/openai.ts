/**
 * Serviço para integração com a API da OpenAI via backend proxy
 */

import { API_BASE_URL } from './api';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Gera uma resposta do chatbot usando o endpoint do backend
 */
export async function getChatbotResponse(
  messages: ChatMessage[],
  lessonContext?: string
): Promise<string> {
  try {
    // Usar apenas mensagens do usuário e assistente (sem system message, o backend adiciona)
    const userMessages = messages.filter(msg => msg.role !== 'system');

    const requestBody = {
      messages: userMessages,
      lessonContext: lessonContext || '',
    };

    console.log('🌐 Chamando backend:', `${API_BASE_URL}/chatbot`);
    console.log('📦 Corpo da requisição:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${API_BASE_URL}/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Status da resposta:', response.status, response.statusText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `Erro HTTP ${response.status}: ${response.statusText}` };
      }
      console.error('❌ Erro na resposta:', errorData);
      throw new Error(errorData.message || `Erro na API: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Dados recebidos:', data);
    
    if (!data.success) {
      throw new Error(data.message || 'Erro ao processar mensagem');
    }

    return data.message || 'Desculpe, não consegui gerar uma resposta.';
  } catch (error) {
    console.error('❌ Erro ao chamar API do chatbot:', error);
    
    // Mensagens de erro mais específicas
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Não foi possível conectar ao servidor. Verifique se o backend está rodando em ${API_BASE_URL.replace('/api', '')}`);
    }
    
    throw error;
  }
}

/**
 * Gera contexto sobre as lições disponíveis
 */
export function getLessonsContext(): string {
  return `O aplicativo possui as seguintes seções de aprendizado:
- Seção 1: Fundamentos (Notas musicais, Intervalos, Escalas, Acordes básicos, Harmonia)
- Seção 2: Conceitos básicos (Casas do violão, Tom e Semitom)
- Seção 3: Acordes básicos (Em, Am, Pivô Em ↔ Am)
- Seção 4: Acordes maiores e menores (Menor vs Maior, Acorde E)
- Seção 5: Ritmo e símbolos (Símbolos rítmicos, Progressão Pop, Ritmo + Acordes)
- Seção 6-10: Conteúdos avançados de prática e teoria musical`;
}

