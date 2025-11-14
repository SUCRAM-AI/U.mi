/**
 * Serviço de API para comunicação com o backend
 */

import * as FileSystem from 'expo-file-system';

const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.101:5000/api'  // Desenvolvimento - IP correto
  : 'https://your-api-url.com/api';  // Produção (ajustar quando necessário)

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
 * Normaliza o nome do acorde para um formato padrão
 * Converte variações como "E:min", "E minor", "Emin" para "Em"
 */
export function normalizeChord(chord: string): string {
  if (!chord) return '';
  
  let normalized = chord.trim();
  
  // Remover espaços e converter para minúsculas para comparação
  normalized = normalized.toLowerCase();
  
  // Padrões de substituição:
  // "E:min" → "Em"
  // "A:min" → "Am"
  // "E:major" ou "E:maj" → "E"
  // "E minor" → "Em"
  // "E major" → "E"
  // "Emin" → "Em"
  // "Emaj" → "E"
  
  // Substituir ":min" por "m"
  normalized = normalized.replace(/:min/g, 'm');
  
  // Substituir ":major" ou ":maj" por nada (acorde maior é só a nota)
  normalized = normalized.replace(/:major|:maj/g, '');
  
  // Substituir " minor" por "m"
  normalized = normalized.replace(/\s+minor/g, 'm');
  
  // Substituir " major" por nada
  normalized = normalized.replace(/\s+major/g, '');
  
  // Substituir "min" (sem dois pontos) por "m" se não for parte de outra palavra
  normalized = normalized.replace(/\bmin\b/g, 'm');
  
  // Substituir "maj" (sem dois pontos) por nada se não for parte de outra palavra
  normalized = normalized.replace(/\bmaj\b/g, '');
  
  // Remover espaços extras
  normalized = normalized.replace(/\s+/g, '');
  
  // Capitalizar primeira letra para manter consistência
  if (normalized.length > 0) {
    normalized = normalized[0].toUpperCase() + normalized.slice(1);
  }
  
  return normalized;
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
    
    // Normalizar o acorde detectado
    if (data.chord) {
      data.chord = normalizeChord(data.chord);
    }
    
    // Normalizar todos os acordes na lista
    if (data.all_chords && Array.isArray(data.all_chords)) {
      data.all_chords = data.all_chords.map(chord => normalizeChord(chord));
    }
    
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

/**
 * Interface para resposta da API do Cifra Club
 */
export interface CifraClubResponse {
  name: string;
  artist: string;
  cifra: string[];
  youtube_url?: string;
  cifraclub_url?: string;
  error?: string;
  message?: string;
}

/**
 * Busca uma cifra do Cifra Club
 */
export async function getCifra(artist: string, song: string): Promise<CifraClubResponse> {
  const artistNormalized = encodeURIComponent(artist.toLowerCase().trim());
  const songNormalized = encodeURIComponent(song.toLowerCase().trim());
  const url = `${API_BASE_URL}/cifra/${artistNormalized}/${songNormalized}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return {
      name: song,
      artist: artist,
      cifra: [],
      error: errorData.error || `Erro ${response.status}`,
    };
  }

  const data = await response.json();
  return data;
}

