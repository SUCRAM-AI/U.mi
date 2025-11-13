# Guia de Integração Backend-Frontend - U.Mi (React Web)

Este guia explica como configurar e executar a integração completa entre o backend Flask e o frontend React (Vite).

## 🚀 Início Rápido

### 1. Configurar o Backend

```bash
cd backend

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
# Crie um arquivo .env na pasta backend com:
# api_key=sua_chave_da_api_music_ai

# Executar a API
python api.py
```

A API estará disponível em `http://localhost:5000`

### 2. Configurar o Frontend

```bash
cd frontend

# Instalar dependências
npm install
# ou
yarn install

# Configurar variáveis de ambiente
# Crie um arquivo .env na pasta frontend com:
# VITE_API_URL=http://localhost:5000/api

# Executar o frontend
npm run dev
# ou
yarn dev
```

O frontend estará disponível em `http://localhost:5173` (ou outra porta se 5173 estiver ocupada)

## 📁 Estrutura do Projeto

```
projeto/
├── backend/
│   ├── api.py                 # API Flask principal
│   ├── requirements.txt       # Dependências Python
│   └── modulos/              # Módulos de detecção de acordes
│
└── frontend/
    ├── src/
    │   ├── services/
    │   │   └── api.ts        # Serviço de API
    │   ├── hooks/
    │   │   └── use-audio-recorder.ts  # Hook de gravação de áudio
    │   └── pages/
    │       ├── Apprentice.tsx  # Modo Aprendiz (com gravação)
    │       └── Music.tsx       # Modo Música (com upload)
    └── .env                   # Variáveis de ambiente
```

## 🔌 Funcionalidades Integradas

### Modo Aprendiz (`/apprentice`)

- **Gravação de áudio em tempo real** usando MediaRecorder API
- **Detecção de acordes** via API
- **Feedback visual** sobre acertos/erros
- **Estatísticas** de precisão

**Como usar:**
1. Acesse `/apprentice`
2. Clique em "Começar Reconhecimento"
3. Permita o acesso ao microfone
4. Toque o acorde exibido
5. Clique em "Parar Gravação"
6. Aguarde a detecção do acorde
7. Receba feedback sobre o resultado

### Modo Música (`/music`)

- **Upload de arquivos de áudio** (MP3, WAV, M4A, OGG)
- **Extração automática de acordes** com timestamps
- **Visualização de acordes** extraídos
- **Lista de músicas** pré-definidas

**Como usar:**
1. Acesse `/music`
2. Clique em "Selecionar Arquivo de Áudio"
3. Escolha um arquivo de música
4. Aguarde o processamento
5. Veja os acordes extraídos com seus timestamps

## 🔧 Configuração

### Variáveis de Ambiente

**Backend (`backend/.env`):**
```env
api_key=sua_chave_da_api_music_ai
PORT=5000
DEBUG=True
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### CORS

O backend já está configurado com CORS para permitir requisições do frontend. Se você estiver rodando em portas diferentes, certifique-se de que o CORS está habilitado no `backend/api.py`.

## 🧪 Testando a Integração

### 1. Testar o Backend

```bash
# Health check
curl http://localhost:5000/api/health

# Deve retornar:
# {"status":"ok","message":"API está funcionando"}
```

### 2. Testar o Frontend

1. Execute o backend: `cd backend && python api.py`
2. Execute o frontend: `cd frontend && npm run dev`
3. Acesse `http://localhost:5173`
4. Navegue até `/apprentice` ou `/music`
5. Teste as funcionalidades

## 🐛 Troubleshooting

### Erro de conexão com a API

1. **Verifique se o backend está rodando:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Verifique a URL da API no frontend:**
   - Confirme que `VITE_API_URL` no `.env` está correto
   - Reinicie o servidor de desenvolvimento após alterar `.env`

3. **Verifique o console do navegador:**
   - Abra as ferramentas de desenvolvedor (F12)
   - Veja se há erros de CORS ou conexão

### Erro ao gravar áudio

1. **Permissões do navegador:**
   - Certifique-se de permitir o acesso ao microfone
   - Alguns navegadores requerem HTTPS para acesso ao microfone

2. **Formato de áudio:**
   - O MediaRecorder grava em WebM por padrão
   - O backend pode precisar de conversão (WAV/MP3)
   - Para produção, considere converter WebM para WAV no frontend

### Erro ao fazer upload

1. **Tamanho do arquivo:**
   - Arquivos muito grandes podem causar timeout
   - Considere limitar o tamanho no frontend

2. **Formato do arquivo:**
   - Verifique se o formato é suportado (MP3, WAV, M4A, OGG)
   - Alguns formatos podem não ser suportados pelo backend

### Problemas de CORS

Se você estiver vendo erros de CORS:

1. Verifique se `CORS(app)` está no `backend/api.py`
2. Certifique-se de que o backend está rodando na porta correta
3. Verifique se a URL no frontend corresponde à porta do backend

## 📝 Notas Importantes

### Formato de Áudio

- **Gravação:** O navegador grava em WebM (codec Opus)
- **Backend:** Aceita MP3, WAV, M4A, OGG
- **Solução temporária:** O backend pode não aceitar WebM diretamente
- **Solução futura:** Converter WebM para WAV no frontend antes de enviar

### Limitações

1. **Gravação de áudio:**
   - Requer HTTPS em produção (exceto localhost)
   - Depende das permissões do navegador
   - Pode variar entre navegadores

2. **Processamento:**
   - A detecção de acordes pode levar alguns segundos
   - Arquivos grandes podem demorar mais para processar

## 🚢 Deploy

### Backend (Produção)

1. Configure variáveis de ambiente
2. Use um servidor WSGI (ex: Gunicorn)
3. Configure um reverse proxy (ex: Nginx)
4. Configure HTTPS

### Frontend (Produção)

1. Atualize `VITE_API_URL` para a URL de produção
2. Build do projeto: `npm run build`
3. Sirva os arquivos estáticos com um servidor web
4. Configure HTTPS (necessário para gravação de áudio)

## 📚 Documentação Adicional

- **Backend:** Veja `backend/README_API.md` para detalhes da API
- **Comandos:** Veja `COMANDOS.md` para comandos rápidos

