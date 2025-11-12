# Guia de Integração Backend-Frontend - U.Mi

Este guia explica como configurar e executar a integração completa entre o backend Flask e o frontend React Native.

## 🚀 Início Rápido

### 1. Configurar o Backend

```bash
cd backend

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env e adicione sua chave da API Music.ai

# Executar a API
python api.py
```

A API estará disponível em `http://localhost:5000`

### 2. Configurar o Frontend

```bash
cd frontend/umi

# Instalar dependências
npm install
# ou
yarn install

# Configurar URL da API
# Edite services/api.ts e atualize API_BASE_URL com o IP da sua máquina
# Para desenvolvimento local com dispositivo: use o IP da sua máquina (ex: 192.168.1.100)
# Para emulador Android: use 10.0.2.2
# Para emulador iOS: use localhost

# Executar o app
npm start
# ou
yarn start
```

## 📱 Configuração para Dispositivos Móveis

### Descobrir o IP da sua máquina

- **Linux/Mac:** `ifconfig` ou `ip addr show`
- **Windows:** `ipconfig`

Procure pelo endereço IP da sua rede local (geralmente começa com `192.168.` ou `10.0.`)

### Atualizar URL da API no Frontend

Edite `frontend/umi/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://SEU_IP_AQUI:5000/api'  // Substitua SEU_IP_AQUI
  : 'https://your-api-url.com/api';
```

### Configurações Especiais

- **Android Emulator:** Use `10.0.2.2` em vez do IP local
- **iOS Simulator:** Use `localhost` ou `127.0.0.1`
- **Dispositivo Físico:** Use o IP da sua máquina na rede local

### Firewall

Certifique-se de que o firewall permite conexões na porta 5000:

- **Linux:** `sudo ufw allow 5000`
- **Mac:** Configurações do Sistema → Firewall
- **Windows:** Defender do Windows → Firewall

## 🧪 Testando a Integração

### 1. Testar a API

```bash
# Health check
curl http://localhost:5000/api/health

# Detectar acorde (exemplo)
curl -X POST -F "audio=@backend/audios/Sparks.mp3" http://localhost:5000/api/detect-chord
```

### 2. Testar no Frontend

1. Execute o backend
2. Execute o frontend
3. Navegue até a tela de lição
4. Use o componente de gravação de áudio
5. Grave um acorde e verifique se é detectado corretamente

## 📁 Estrutura do Projeto

```
projeto/
├── backend/
│   ├── api.py                 # API Flask principal
│   ├── requirements.txt       # Dependências Python
│   ├── README_API.md         # Documentação da API
│   ├── modulos/
│   │   ├── chord_detector.py      # Detecção de acordes
│   │   ├── comparador.py          # Comparação de acordes
│   │   └── extract_music_chords.py # Extração com timestamps
│   └── temp_uploads/         # Arquivos temporários (criado automaticamente)
│
└── frontend/
    └── umi/
        ├── services/
        │   └── api.ts            # Serviço de API
        ├── hooks/
        │   └── use-audio-recorder.ts  # Hook de gravação
        ├── components/
        │   ├── audio-recorder-button.tsx      # Botão de gravação
        │   └── chord-detection-exercise.tsx   # Exercício completo
        └── README_INTEGRATION.md  # Documentação do frontend
```

## 🔌 Endpoints da API

### GET `/api/health`
Verifica se a API está funcionando.

### POST `/api/detect-chord`
Detecta o acorde de um áudio.

**Parâmetros:**
- `audio` (file): Arquivo de áudio

**Resposta:**
```json
{
  "success": true,
  "chord": "C",
  "all_chords": ["C"],
  "message": "Acorde detectado: C"
}
```

### POST `/api/compare-chords`
Compara dois áudios (gabarito vs tocado).

**Parâmetros:**
- `gabarito` (file): Arquivo de referência
- `tocado` (file): Arquivo do usuário

### POST `/api/extract-chords`
Extrai todos os acordes de uma música com timestamps.

**Parâmetros:**
- `audio` (file): Arquivo de áudio

## 🎨 Componentes do Frontend

### `AudioRecorderButton`
Componente de botão para gravação de áudio.

### `ChordDetectionExercise`
Componente completo de exercício que:
- Permite gravar áudio
- Detecta o acorde
- Compara com o acorde esperado
- Mostra feedback visual

## 🐛 Troubleshooting

### Erro de conexão com a API

1. Verifique se o backend está rodando: `curl http://localhost:5000/api/health`
2. Verifique se o IP está correto no `services/api.ts`
3. Verifique se o firewall permite conexões na porta 5000
4. Para Android, verifique permissões de internet no `AndroidManifest.xml`

### Erro ao gravar áudio

1. Verifique permissões de microfone no dispositivo
2. Verifique se o dispositivo suporta gravação
3. Verifique os logs do console

### Erro ao enviar arquivo

1. Verifique se o arquivo foi gravado (verifique o `soundUri`)
2. Verifique os logs do backend
3. Verifique o formato do arquivo (wav, mp3, m4a, ogg)

### API não encontra arquivo

1. Verifique se a pasta `temp_uploads/` existe
2. Verifique permissões de escrita na pasta
3. Verifique os logs do backend para erros

## 📚 Documentação Adicional

- **Backend:** Veja `backend/README_API.md` para detalhes da API
- **Frontend:** Veja `frontend/umi/README_INTEGRATION.md` para detalhes dos componentes

## 🔐 Segurança

- Nunca commite o arquivo `.env` com suas chaves de API
- Use variáveis de ambiente em produção
- Configure CORS adequadamente para produção
- Use HTTPS em produção

## 🚢 Deploy

### Backend (Produção)

1. Configure variáveis de ambiente
2. Use um servidor WSGI (ex: Gunicorn)
3. Configure um reverse proxy (ex: Nginx)
4. Configure HTTPS

### Frontend (Produção)

1. Atualize `API_BASE_URL` para a URL de produção
2. Configure variáveis de ambiente
3. Build do app: `expo build` ou `eas build`
4. Publique na App Store / Google Play Store

## 📞 Suporte

Para problemas ou dúvidas, consulte a documentação específica:
- Backend: `backend/README_API.md`
- Frontend: `frontend/umi/README_INTEGRATION.md`

