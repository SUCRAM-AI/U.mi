# Guia de Integração Frontend-Backend

Este documento explica como a integração entre o frontend (React Native/Expo) e o backend (Flask) foi implementada.

## Estrutura da Integração

### Backend (API Flask)

A API REST foi criada em `backend/api.py` com os seguintes endpoints:

1. **GET /api/health** - Verifica se a API está funcionando
2. **POST /api/login** - Autenticação de usuário
3. **POST /api/register** - Cadastro de novo usuário
4. **POST /api/detect-chord** - Detecção de acorde em arquivo de áudio

### Frontend (Serviço de API)

O serviço de API foi criado em `frontend/services/api.ts` e fornece funções TypeScript para:

- `login()` - Faz login do usuário
- `register()` - Registra novo usuário
- `detectChord()` - Detecta acorde de um arquivo de áudio
- `healthCheck()` - Verifica conexão com a API

## Como Usar

### 1. Configurar o Backend

```bash
cd backend
pip install -r requirements.txt
```

Crie um arquivo `.env` com sua chave da API music.ai:
```
api_key=SUA_CHAVE_AQUI
```

Execute a API:
```bash
python api.py
```

A API estará rodando em `http://localhost:5000`

### 2. Configurar o Frontend

#### Para Desenvolvimento Local

Se você estiver testando no emulador Android/iOS ou dispositivo físico:

1. Descubra o IP da sua máquina:
   - Linux/Mac: `ifconfig` ou `ip addr`
   - Windows: `ipconfig`

2. Atualize a URL da API em `frontend/services/api.ts`:
   ```typescript
   const API_BASE_URL = __DEV__ 
     ? 'http://SEU_IP_AQUI:5000/api'  // Ex: 'http://192.168.1.100:5000/api'
     : 'https://seu-servidor.com/api';
   ```

3. Para Android, adicione permissão de internet no `app.json` (já está incluído por padrão no Expo)

4. Para iOS, certifique-se de que o Info.plist permite requisições HTTP (Expo gerencia isso automaticamente)

#### Para Web

Se estiver testando no navegador, `localhost` funcionará normalmente.

### 3. Testar a Integração

1. Inicie o backend:
   ```bash
   cd backend
   python api.py
   ```

2. Inicie o frontend:
   ```bash
   cd frontend
   npm start  # ou yarn start
   ```

3. Teste as funcionalidades:
   - Tela de Login: Preencha email e senha e clique em "Login"
   - Tela de Cadastro: Preencha os dados e clique em "Cadastrar"
   - Detecção de Acorde: Use a função `detectChord()` quando implementar a gravação de áudio

## Exemplo de Uso no Código

### Login
```typescript
import { login } from '../services/api';

const handleLogin = async () => {
  try {
    const response = await login({
      email: 'usuario@exemplo.com',
      password: 'senha123'
    });
    
    if (response.success) {
      console.log('Login realizado!', response.user);
      // Navegar para próxima tela
    }
  } catch (error) {
    console.error('Erro no login:', error);
  }
};
```

### Cadastro
```typescript
import { register } from '../services/api';

const handleRegister = async () => {
  try {
    const response = await register({
      name: 'Nome do Usuário',
      email: 'usuario@exemplo.com',
      password: 'senha123',
      confirmPassword: 'senha123'
    });
    
    if (response.success) {
      console.log('Cadastro realizado!', response.user);
    }
  } catch (error) {
    console.error('Erro no cadastro:', error);
  }
};
```

### Detecção de Acorde
```typescript
import { detectChord } from '../services/api';

const handleDetectChord = async (audioUri: string) => {
  try {
    const response = await detectChord(audioUri, 'audio/wav');
    
    if (response.success) {
      console.log('Acorde detectado:', response.chord);
      console.log('Todos os acordes:', response.all_chords);
    }
  } catch (error) {
    console.error('Erro na detecção:', error);
  }
};
```

## Próximos Passos

1. **Banco de Dados**: Implementar banco de dados real para login/cadastro (SQLite, PostgreSQL, etc.)
2. **Autenticação JWT**: Substituir tokens fake por JWT real
3. **Armazenamento**: Salvar tokens de autenticação usando AsyncStorage
4. **Tratamento de Erros**: Melhorar tratamento de erros e feedback ao usuário
5. **Validação**: Adicionar validação mais robusta no backend
6. **Testes**: Adicionar testes unitários e de integração

## Troubleshooting

### Erro: "Network request failed"
- Verifique se o backend está rodando
- Verifique se o IP/URL está correto no `api.ts`
- Para Android, certifique-se de usar o IP da máquina, não `localhost`
- Verifique se há firewall bloqueando a porta 5000

### Erro: "CORS policy"
- O backend já está configurado com CORS, mas se ainda houver problemas, verifique se `flask-cors` está instalado

### Erro: "Cannot read property 'success'"
- Verifique se a resposta da API está no formato esperado
- Adicione logs para debugar: `console.log(response)`

## Arquivos Modificados/Criados

- `backend/api.py` - Nova API REST Flask
- `backend/requirements.txt` - Dependências atualizadas
- `frontend/services/api.ts` - Serviço de API do frontend
- `frontend/app/(tabs)/login.tsx` - Integrado com API
- `frontend/app/(tabs)/cadastro.tsx` - Integrado com API

