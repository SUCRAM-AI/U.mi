# API REST - Backend U.Mi

API Flask para integração com o frontend React Native. Esta API substitui a funcionalidade Streamlit anterior.

## Configuração

### 1. Instalar dependências

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na pasta `backend` com sua chave da API:

```env
api_key=sua_chave_da_api_music_ai
```

### 3. Executar a API

```bash
python api.py
```

A API estará disponível em `http://localhost:5000`

## Endpoints

### GET `/api/health`
Verifica se a API está funcionando.

**Resposta:**
```json
{
  "status": "ok",
  "message": "API está funcionando"
}
```

### POST `/api/detect-chord`
Detecta o acorde de um áudio enviado.

**Parâmetros:**
- `audio` (file): Arquivo de áudio (mp3, wav, m4a, ogg)

**Resposta:**
```json
{
  "success": true,
  "chord": "C",
  "all_chords": ["C", "F", "G"],
  "message": "Acorde detectado: C"
}
```

### POST `/api/compare-chords`
Compara dois áudios: gabarito (referência) e tocado (usuário).

**Parâmetros:**
- `gabarito` (file): Arquivo de áudio de referência
- `tocado` (file): Arquivo de áudio do usuário

**Resposta:**
```json
{
  "success": true,
  "is_correct": true,
  "message": "✅ Correto! Você tocou C!",
  "chord_gabarito": "C",
  "chord_tocado": "C"
}
```

### POST `/api/extract-chords`
Extrai todos os acordes de uma música com timestamps.

**Parâmetros:**
- `audio` (file): Arquivo de áudio da música

**Resposta:**
```json
{
  "success": true,
  "chords": [
    {
      "start": 0.0,
      "end": 2.5,
      "chord_majmin": "C"
    },
    {
      "start": 2.5,
      "end": 5.0,
      "chord_majmin": "F"
    }
  ],
  "count": 2,
  "message": "2 acordes detectados"
}
```

### POST `/api/detect-chord-first`
Detecta o primeiro acorde de um áudio (wrapper para usar extract_music_chords).

**Parâmetros:**
- `audio` (file): Arquivo de áudio

**Resposta:**
```json
{
  "success": true,
  "chord": "C",
  "start": 0.0,
  "end": 2.5,
  "full_data": {
    "start": 0.0,
    "end": 2.5,
    "chord_majmin": "C"
  }
}
```

## Configuração para Dispositivos Móveis

### Para desenvolvimento local com dispositivo físico ou emulador:

1. **Descubra o IP da sua máquina:**
   - Linux/Mac: `ifconfig` ou `ip addr`
   - Windows: `ipconfig`
   - Procure pelo endereço IP da sua rede local (ex: `192.168.1.100`)

2. **Atualize a URL da API no frontend:**
   - Edite `frontend/umi/services/api.ts`
   - Altere `API_BASE_URL` para usar o IP da sua máquina:
   ```typescript
   const API_BASE_URL = __DEV__ 
     ? 'http://192.168.1.100:5000/api'  // Substitua pelo seu IP
     : 'https://your-api-url.com/api';
   ```

3. **Execute a API com host 0.0.0.0:**
   ```bash
   python api.py
   ```
   (A API já está configurada para aceitar conexões de qualquer interface)

4. **Certifique-se de que o firewall permite conexões na porta 5000**

## Testando a API

### Com curl:

```bash
# Health check
curl http://localhost:5000/api/health

# Detectar acorde
curl -X POST -F "audio=@path/to/audio.wav" http://localhost:5000/api/detect-chord
```

## Estrutura de Arquivos

```
backend/
├── api.py                 # API Flask principal
├── app.py                 # App Streamlit (antigo - pode ser removido)
├── requirements.txt       # Dependências Python
├── modulos/
│   ├── chord_detector.py      # Detecção de acordes
│   ├── comparador.py          # Comparação de acordes
│   └── extract_music_chords.py # Extração de acordes com timestamps
└── temp_uploads/          # Pasta temporária para uploads (criada automaticamente)
```

## Notas

- Os arquivos enviados são salvos temporariamente em `temp_uploads/` e removidos após o processamento
- A API usa CORS para permitir requisições do frontend
- Todos os endpoints retornam JSON
- Erros são retornados com status HTTP apropriado e mensagem de erro em JSON

