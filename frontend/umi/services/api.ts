/**
 * Serviço de API para comunicação com o backend
 */

const API_BASE_URL = __DEV__ 
  ? 'http://192.168.0.7:5000/api'  // Desenvolvimento
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
 * Detecta acorde de um áudio
 */
export async function detectChord(audioUri: string): Promise<DetectChordResponse> {
  try {
    const formData = new FormData();
    
    // Criar arquivo a partir do URI (React Native FormData)
    const filename = audioUri.split('/').pop() || 'audio.wav';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `audio/${match[1]}` : 'audio/wav';
    
    // @ts-ignore - FormData no React Native aceita objetos com uri
    formData.append('audio', {
      uri: audioUri,
      type: type,
      name: filename,
    } as any);

    const response = await fetch(`${API_BASE_URL}/detect-chord`, {
      method: 'POST',
      body: formData,
      // Não definir Content-Type manualmente - o fetch fará isso automaticamente com o boundary
    });

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

