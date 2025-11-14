# 🚀 Guia Rápido - Configuração do Chatbot

## ⚠️ Erro: "Não foi possível conectar ao servidor"

Este erro significa que o **backend Flask não está rodando** ou não está acessível.

## ✅ Solução Passo a Passo

### 1. Inicie o Backend Flask

Abra um terminal e execute:

```bash
cd backend
python api.py
```

Você deve ver algo como:
```
🚀 Iniciando servidor Flask na porta 5000
📡 Endpoints disponíveis:
   - GET  /api/health
   - POST /api/detect-chord
   - POST /api/chatbot
```

### 2. Verifique se o Backend está Funcionando

Abra seu navegador e acesse:
```
http://localhost:5000/api/health
```

Você deve ver:
```json
{
  "status": "ok",
  "message": "API está funcionando"
}
```

### 3. Inicie o Frontend

Em **outro terminal**, execute:

```bash
cd frontend/umi
npm run web
```

### 4. Teste o Chatbot

1. Abra o app no navegador (geralmente `http://localhost:8081` ou similar)
2. Clique no botão flutuante do chatbot (canto inferior direito)
3. Digite uma mensagem e pressione **Enter** ou clique no botão de enviar

## 🔧 Configuração da URL do Backend

Se ainda não funcionar, verifique a URL em `frontend/umi/services/api.ts`:

```typescript
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api'  // Para web
  : 'https://your-api-url.com/api';
```

**Importante:**
- Se estiver testando no **navegador**: use `http://localhost:5000/api`
- Se estiver testando em **dispositivo móvel**: use o IP da sua máquina (ex: `http://192.168.0.7:5000/api`)

## 🐛 Problemas Comuns

### Backend não inicia
- Verifique se o Python está instalado: `python --version`
- Verifique se as dependências estão instaladas: `pip install -r requirements.txt`
- Verifique se a porta 5000 está livre

### Erro de conexão mesmo com backend rodando
- Verifique se o backend está realmente rodando: acesse `http://localhost:5000/api/health`
- Verifique se a URL em `api.ts` está correta
- Verifique o console do navegador (F12) para ver erros detalhados

### CORS Error
- O backend já tem CORS configurado (`CORS(app)`)
- Se ainda der erro, verifique se o backend está rodando na porta 5000

## 📝 Logs Úteis

Abra o console do navegador (F12) para ver logs detalhados:
- `🌐 Chamando backend:` - mostra a URL sendo chamada
- `📦 Corpo da requisição:` - mostra os dados enviados
- `📥 Status da resposta:` - mostra o status HTTP
- `✅ Dados recebidos:` - mostra a resposta do backend
- `❌ Erro:` - mostra erros detalhados

## ✅ Checklist

- [ ] Backend Flask está rodando (`python api.py`)
- [ ] Backend responde em `http://localhost:5000/api/health`
- [ ] Frontend está rodando (`npm run web`)
- [ ] URL do backend está correta em `frontend/umi/services/api.ts`
- [ ] Console do navegador não mostra erros de CORS


