/**
 * Serviço de API para comunicação com o backend
 */

import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Detectar plataforma e usar URL apropriada
// Web: usa localhost (navegador não consegue acessar IP da rede facilmente)
// Native (Expo Go): usa IP da rede para dispositivos físicos/emuladores
const getApiBaseUrl = () => {
  if (!__DEV__) {
    return 'https://your-api-url.com/api'; // Produção
  }
  
  // Web: usar localhost
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }
  
  // Native (iOS/Android): usar IP da rede
  // Para emulador Android, pode precisar usar 10.0.2.2
  // Para iOS Simulator, pode usar localhost
  // Para dispositivo físico, usar IP da máquina
  return 'http://192.168.0.7:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

export interface DetectChordResponse {
  success: boolean;
  chord: string | null;
  all_chords: string[];
  message: string;
  error?: string;
}

export interface CompareChordsResponse {
  success: boolean;
  is_correct: boolean;
  message: string;
  chord_gabarito: string | null;
  chord_tocado: string | null;
  error?: string;
}

export interface ExtractChordsResponse {
  success: boolean;
  chords: Array<{
    start: number;
    end: number;
    chord_majmin: string;
  }>;
  count: number;
  message: string;
  error?: string;
}

/**
 * Detecta acorde de um áudio
 */
export async function detectChord(audioUri: string): Promise<DetectChordResponse> {
  console.log('🔍 detectChord chamado com URI:', audioUri);
  
  try {
    let base64: string;
    
    // Verificar se é uma URI blob (web) ou file:// (nativo)
    if (audioUri.startsWith('blob:') || audioUri.startsWith('http://') || audioUri.startsWith('https://')) {
      // Web: converter blob para base64
      console.log('🌐 Modo Web: convertendo blob para base64...');
      const response = await fetch(audioUri);
      const blob = await response.blob();
      
      // Converter blob para base64
      base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // Remover o prefixo data:audio/...;base64,
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      console.log('✅ Blob convertido para base64, tamanho:', base64.length);
    } else {
      // Nativo: usar expo-file-system
      console.log('📱 Modo Nativo: usando expo-file-system...');
      
      // Verificar se o arquivo existe (apenas em nativo)
      try {
        const fileInfo = await FileSystem.getInfoAsync(audioUri);
        console.log('📁 Informações do arquivo:', fileInfo);
        
        if (!fileInfo.exists) {
          console.error('❌ Arquivo não existe:', audioUri);
          throw new Error('Arquivo de áudio não encontrado');
        }
      } catch (error) {
        // Se getInfoAsync não estiver disponível (web), continuar
        console.log('⚠️ getInfoAsync não disponível, continuando...');
      }
      
      // Ler o arquivo como base64
      console.log('📖 Lendo arquivo como base64...');
      base64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('✅ Arquivo lido, tamanho base64:', base64.length);
    }
    
    const filename = audioUri.split('/').pop() || 'audio.wav';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `audio/${match[1]}` : 'audio/wav';
    
    // Criar FormData e adicionar o arquivo
    const formData = new FormData();
    
    if (audioUri.startsWith('blob:') || audioUri.startsWith('http://') || audioUri.startsWith('https://')) {
      // Web: converter base64 para Blob e enviar como arquivo
      console.log('📦 Criando Blob a partir do base64...');
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: type });
      
      // Adicionar o Blob ao FormData (web)
      formData.append('audio', blob, filename);
      console.log('✅ Blob adicionado ao FormData');
    } else {
      // Nativo: usar formato React Native
      // @ts-ignore
      formData.append('audio', {
        uri: audioUri,
        type: type,
        name: filename,
        // Adicionar os dados do arquivo
        data: base64,
      } as any);
      console.log('✅ FormData preparado para React Native');
    }

    console.log('📤 Enviando requisição para:', `${API_BASE_URL}/detect-chord`);
    console.log('📦 FormData preparado, filename:', filename, 'type:', type);

    const response = await fetch(`${API_BASE_URL}/detect-chord`, {
      method: 'POST',
      body: formData,
      // Não definir Content-Type manualmente - o fetch fará isso automaticamente com o boundary
    });
    
    console.log('📥 Resposta recebida, status:', response.status, 'ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao detectar acorde');
    }

    const data: DetectChordResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao detectar acorde:', error);
    return {
      success: false,
      chord: null,
      all_chords: [],
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Compara dois áudios (gabarito e tocado)
 */
export async function compareChords(
  gabaritoUri: string,
  tocadoUri: string
): Promise<CompareChordsResponse> {
  try {
    const formData = new FormData();
    
    // @ts-ignore
    formData.append('gabarito', {
      uri: gabaritoUri,
      type: 'audio/wav',
      name: 'gabarito.wav',
    } as any);
    
    // @ts-ignore
    formData.append('tocado', {
      uri: tocadoUri,
      type: 'audio/wav',
      name: 'tocado.wav',
    } as any);

    const response = await fetch(`${API_BASE_URL}/compare-chords`, {
      method: 'POST',
      body: formData,
      // Não definir Content-Type manualmente
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao comparar acordes');
    }

    const data: CompareChordsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao comparar acordes:', error);
    return {
      success: false,
      is_correct: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      chord_gabarito: null,
      chord_tocado: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Extrai todos os acordes de uma música com timestamps
 */
export async function extractChords(audioUri: string): Promise<ExtractChordsResponse> {
  try {
    const formData = new FormData();
    
    // @ts-ignore
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/mp3',
      name: 'audio.mp3',
    } as any);

    const response = await fetch(`${API_BASE_URL}/extract-chords`, {
      method: 'POST',
      body: formData,
      // Não definir Content-Type manualmente
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao extrair acordes');
    }

    const data: ExtractChordsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao extrair acordes:', error);
    return {
      success: false,
      chords: [],
      count: 0,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Health check da API
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Erro ao verificar saúde da API:', error);
    return false;
  }
}

// ===== CIFRA CLUB API =====

export interface CifraClubResponse {
  artist: string;
  cifra: string[];
  cifraclub_url: string;
  name: string;
  youtube_url: string;
  error?: string;
}

/**
 * Busca uma cifra específica por artista e música
 */
export async function getCifra(
  artist: string,
  song: string
): Promise<CifraClubResponse | null> {
  console.log('🚀 getCifra chamado com:', { artist, song });
  console.log('🌐 API_BASE_URL:', API_BASE_URL);
  
  try {
    // Normalizar: remover espaços e caracteres especiais
    const normalizedArtist = encodeURIComponent(artist.trim().toLowerCase().replace(/\s+/g, '-'));
    const normalizedSong = encodeURIComponent(song.trim().toLowerCase().replace(/\s+/g, '-'));
    
    console.log('📝 Normalizado:', { normalizedArtist, normalizedSong });
    
    const url = `${API_BASE_URL}/cifra/${normalizedArtist}/${normalizedSong}`;
    console.log('🔍 URL completa:', url);
    console.log('📤 Fazendo requisição fetch...');
    
    // Criar AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 150000); // 150 segundos (2.5 minutos)
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      console.log('📥 Resposta recebida:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      });
      
      if (!response.ok) {
        console.log('❌ Resposta não OK, tentando ler erro...');
        const errorData = await response.json();
        console.log('❌ Dados do erro:', errorData);
        throw new Error(errorData.message || `Erro ${response.status}`);
      }
      
      console.log('✅ Resposta OK, parseando JSON...');
      const data: CifraClubResponse = await response.json();
      console.log('✅ JSON parseado:', {
        artist: data.artist,
        name: data.name,
        hasCifra: !!data.cifra,
        cifraLength: data.cifra?.length || 0,
        hasError: !!data.error,
      });
      
      // Verificar se há erro na resposta
      if (data.error) {
        console.log('⚠️ Resposta contém erro:', data.error);
        throw new Error(data.error);
      }
      
      console.log('✅ Retornando dados da cifra');
      return data;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('⏱️ Timeout: A requisição demorou mais de 2.5 minutos');
        throw new Error('A requisição demorou muito. Tente novamente.');
      }
      
      console.error('❌ Erro ao buscar cifra:', fetchError);
      if (fetchError instanceof Error) {
        console.error('❌ Mensagem de erro:', fetchError.message);
        console.error('❌ Stack:', fetchError.stack);
      }
      
      // Se for erro de rede, relançar para o componente tratar
      if (fetchError.message?.includes('Failed to fetch') || 
          fetchError.message?.includes('NetworkError') ||
          fetchError.message?.includes('Network request failed')) {
        throw new Error('Erro de conexão. Verifique se o backend está rodando.');
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('❌ Erro geral ao buscar cifra:', error);
    if (error instanceof Error) {
      console.error('❌ Mensagem de erro:', error.message);
    }
    return null;
  }
}

/**
 * Verifica se a cifraclub-api está disponível
 */
export async function checkCifraHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/cifra/health`);
    const data = await response.json();
    return data.cifraclub_api_available === true;
  } catch (error) {
    console.error('Erro ao verificar saúde da cifraclub-api:', error);
    return false;
  }
}

