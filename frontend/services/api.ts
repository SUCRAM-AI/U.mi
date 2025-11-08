// Configuração da API
// Para desenvolvimento, use o IP da sua máquina na mesma rede
// Exemplo: 'http://192.168.1.100:5000/api'
// Para descobrir seu IP: ifconfig (Linux/Mac) ou ipconfig (Windows)
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.0.14:5000/api'  // Desenvolvimento - ajuste para seu IP local se necessário
  : 'https://seu-servidor.com/api';  // Produção

// Tipos TypeScript
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  email: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  error?: string;
}

export interface ChordDetectionResponse {
  success: boolean;
  chord?: string;
  all_chords?: string[];
  message?: string;
  error?: string;
}

// Função auxiliar para fazer requisições
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`🌐 [API] Fazendo requisição para: ${url}`);
  console.log(`🌐 [API] Método: ${options.method || 'GET'}`);
  console.log(`🌐 [API] Body:`, options.body);
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Adicionar token se existir
  const token = await getStoredToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    console.log(`🌐 [API] Resposta recebida - Status: ${response.status}`);
    
    const data = await response.json().catch(() => {
      console.error(`🌐 [API] Erro ao parsear JSON`);
      return { error: 'Erro ao processar resposta do servidor' };
    });

    console.log(`🌐 [API] Dados da resposta:`, data);

    // Para 401 (não autorizado), retornar os dados normalmente (não lançar erro)
    // O código que chama a função deve verificar response.success
    if (!response.ok && response.status !== 401) {
      throw new Error(data.error || data.message || `Erro ${response.status}`);
    }

    return data as T;
  } catch (error: any) {
    console.error(`🌐 [API] Erro na requisição:`, error);
    throw error;
  }
}

// Funções de armazenamento (usando AsyncStorage do React Native)
let storedToken: string | null = null;

export async function getStoredToken(): Promise<string | null> {
  // Em produção, use AsyncStorage do @react-native-async-storage/async-storage
  return storedToken;
}

export async function setStoredToken(token: string): Promise<void> {
  storedToken = token;
  // Em produção, salve no AsyncStorage
}

export async function clearStoredToken(): Promise<void> {
  storedToken = null;
  // Em produção, limpe o AsyncStorage
}

// API Functions

/**
 * Verifica se a API está funcionando
 */
export async function healthCheck(): Promise<{ status: string; message: string }> {
  console.log('🏥 [HEALTH] Verificando saúde da API...');
  try {
    const result = await apiRequest<{ status: string; message: string }>('/health');
    console.log('🏥 [HEALTH] API está funcionando!', result);
    return result;
  } catch (error: any) {
    console.error('🏥 [HEALTH] Erro ao verificar API:', error);
    throw error;
  }
}

/**
 * Faz login do usuário
 */
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  console.log('🔐 [LOGIN] Iniciando login com:', credentials.email);
  
  try {
    const response = await apiRequest<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    console.log('🔐 [LOGIN] Resposta:', response);
    
    if (response.success && response.token) {
      await setStoredToken(response.token);
      console.log('🔐 [LOGIN] Token salvo');
    }
    
    return response;
  } catch (error: any) {
    console.error('🔐 [LOGIN] Erro:', error);
    throw error;
  }
}

/**
 * Registra um novo usuário
 */
export async function register(userData: RegisterRequest): Promise<AuthResponse> {
  console.log('📝 [REGISTER] Iniciando cadastro com:', userData.email);
  
  try {
    const response = await apiRequest<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    console.log('📝 [REGISTER] Resposta:', response);
    
    if (response.success && response.token) {
      await setStoredToken(response.token);
      console.log('📝 [REGISTER] Token salvo');
    }
    
    return response;
  } catch (error: any) {
    console.error('📝 [REGISTER] Erro:', error);
    throw error;
  }
}

/**
 * Detecta acorde de um arquivo de áudio
 * @param audioUri - URI do arquivo de áudio (ex: file:///path/to/audio.wav)
 * @param audioType - Tipo MIME do áudio (ex: 'audio/wav', 'audio/mpeg')
 */
export async function detectChord(
  audioUri: string, 
  audioType: string = 'audio/wav'
): Promise<ChordDetectionResponse> {
  // Criar FormData para enviar o arquivo
  // No React Native, FormData funciona diferente do navegador
  const formData = new FormData();
  
  // Para React Native, o arquivo deve ser um objeto com uri, type e name
  const audioFile = {
    uri: audioUri,
    type: audioType,
    name: audioUri.split('/').pop() || 'audio.wav',
  } as any;
  
  formData.append('audio', audioFile);

  const token = await getStoredToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Não definir Content-Type manualmente - o React Native fará isso automaticamente
  // com o boundary correto para multipart/form-data

  const response = await fetch(`${API_BASE_URL}/detect-chord`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || error.message || `Erro ${response.status}`);
  }

  return response.json();
}

/**
 * Faz logout do usuário
 */
export async function logout(): Promise<void> {
  await clearStoredToken();
}

