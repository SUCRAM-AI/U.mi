# Setup do Backend - Detecção de Acordes em Tempo Real

Este guia explica como configurar e executar o backend para detecção de acordes em tempo real.

## 📋 Pré-requisitos

- Python 3.6 ou superior
- pip (gerenciador de pacotes Python)

## 🚀 Instalação

1. **Navegue até a pasta do backend:**
   ```bash
   cd backend
   ```

2. **Crie um ambiente virtual (recomendado):**
   ```bash
   python -m venv venv
   ```

3. **Ative o ambiente virtual:**
   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```
   - **Linux/Mac:**
     ```bash
     source venv/bin/activate
     ```

4. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure as variáveis de ambiente:**
   
   Crie um arquivo `.env` na pasta `backend` com o seguinte conteúdo:
   ```env
   api_key=SUA_CHAVE_API_MUSIC_AI_AQUI
   ```
   
   Substitua `SUA_CHAVE_API_MUSIC_AI_AQUI` pela sua chave da API Music.ai.

## 🏃 Executando o Servidor

Execute o servidor Flask:

```bash
python api.py
```

O servidor estará disponível em `http://localhost:5000`

## 🔌 Endpoints Disponíveis

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
Detecta acorde de um áudio enviado via FormData.

**Parâmetros:**
- `audio` (file): Arquivo de áudio (mp3, wav, m4a, ogg, etc.)

**Resposta de Sucesso:**
```json
{
  "success": true,
  "chord": "C",
  "all_chords": ["C"],
  "message": "Acorde detectado: C"
}
```

**Resposta de Erro:**
```json
{
  "success": false,
  "chord": null,
  "all_chords": [],
  "message": "Mensagem de erro",
  "error": "Detalhes do erro"
}
```

## 🧪 Testando a API

### Usando curl:

```bash
# Health check
curl http://localhost:5000/api/health

# Detectar acorde
curl -X POST -F "audio=@caminho/para/seu/audio.mp3" http://localhost:5000/api/detect-chord
```

### Usando Python:

```python
import requests

# Health check
response = requests.get('http://localhost:5000/api/health')
print(response.json())

# Detectar acorde
with open('audio.mp3', 'rb') as f:
    files = {'audio': f}
    response = requests.post('http://localhost:5000/api/detect-chord', files=files)
    print(response.json())
```

## 📝 Mudanças Realizadas

### `chord_detector.py`
- ✅ Modificado para aceitar dados de áudio em bytes, além de caminhos de arquivo
- ✅ Adicionada função `detect_chord_from_bytes()` para facilitar o uso com dados binários
- ✅ Mantida compatibilidade com código existente que usa caminhos de arquivo

### `api.py` (Novo)
- ✅ Criado servidor Flask com endpoint `/api/detect-chord`
- ✅ Suporte para receber áudio via FormData
- ✅ Integração com `chord_detector.py` para detecção de acordes
- ✅ Tratamento de erros e respostas JSON padronizadas
- ✅ CORS habilitado para permitir requisições do frontend

## 🔧 Configuração para Desenvolvimento

Para desenvolvimento com dispositivos móveis, você precisa:

1. **Descobrir o IP da sua máquina:**
   - Windows: `ipconfig`
   - Linux/Mac: `ifconfig` ou `ip addr show`

2. **Atualizar a URL da API no frontend:**
   
   Edite `frontend/umi/services/api.ts`:
   ```typescript
   const API_BASE_URL = __DEV__ 
     ? 'http://SEU_IP_AQUI:5000/api'  // Substitua SEU_IP_AQUI
     : 'https://your-api-url.com/api';
   ```

3. **Configurar firewall:**
   - Certifique-se de que a porta 5000 está aberta no firewall

## 🐛 Troubleshooting

### Erro: "Coloque sua chave no .env como api_key"
- Verifique se o arquivo `.env` existe na pasta `backend`
- Verifique se a chave está correta no formato: `api_key=SUA_CHAVE`

### Erro de conexão do frontend
- Verifique se o servidor está rodando: `curl http://localhost:5000/api/health`
- Verifique se o IP está correto no `services/api.ts`
- Verifique se o firewall permite conexões na porta 5000

### Erro ao processar áudio
- Verifique os logs do servidor para mais detalhes
- Certifique-se de que o arquivo de áudio é válido
- Verifique se a API Music.ai está funcionando corretamente

## 📚 Documentação Adicional

- Veja `INTEGRATION_GUIDE.md` para informações sobre integração com o frontend
- Veja `modulos/chord_detector.py` para detalhes sobre a detecção de acordes

