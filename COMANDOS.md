# 🚀 Comandos para Executar o Projeto

## 📦 Backend (Flask API)

### 1. Navegar para a pasta do backend
```bash
cd backend
```

### 2. Instalar dependências (primeira vez)
```bash
pip install -r requirements.txt
```

### 3. Configurar variáveis de ambiente
Crie um arquivo `.env` na pasta `backend` com:
```env
api_key=sua_chave_da_api_music_ai
```

### 4. Executar o backend
```bash
python api.py
```

O backend estará disponível em:
- **Local:** http://localhost:5000
- **Rede local:** http://192.168.0.7:5000 (ou seu IP)

---

## 📱 Frontend (React - Vite)

### 1. Navegar para a pasta do frontend
```bash
cd frontend
```

### 2. Instalar dependências (primeira vez)
```bash
npm install
# ou
yarn install
```

### 3. Configurar variáveis de ambiente
Crie um arquivo `.env` na pasta `frontend` com:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Executar o frontend
```bash
npm run dev
# ou
yarn dev
```

O frontend estará disponível em `http://localhost:5173` (ou outra porta se 5173 estiver ocupada)

---

## 🔄 Executando Ambos Simultaneamente

### Terminal 1 - Backend
```bash
cd backend
python api.py
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

---

## ✅ Verificar se está funcionando

### Testar Backend
```bash
curl http://localhost:5000/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "message": "API está funcionando"
}
```

### Testar Frontend
1. Abra o navegador em `http://localhost:5173`
2. Navegue até `/apprentice` para testar gravação de áudio
3. Navegue até `/music` para testar upload de arquivos

---

## 🐛 Problemas Comuns

### Backend não inicia
- Verifique se o Python está instalado: `python --version`
- Verifique se as dependências estão instaladas: `pip list`
- Verifique se o arquivo `.env` existe e tem a chave da API

### Frontend não conecta ao backend
- Verifique se o backend está rodando
- Verifique se o IP no `services/api.ts` está correto
- Verifique se o firewall permite conexões na porta 5000
- Para Android Emulator, use `10.0.2.2` em vez do IP local
- Para iOS Simulator, use `localhost`

### Erro de permissões
- Backend: Verifique permissões de escrita na pasta `temp_uploads/`
- Frontend: Verifique permissões de microfone no dispositivo

---

## 📝 Notas Importantes

1. **Backend deve estar rodando antes do frontend** para que a API esteja disponível
2. **Variáveis de ambiente:** Configure `VITE_API_URL` no arquivo `.env` do frontend
3. **Porta 5000:** Certifique-se de que a porta 5000 não está sendo usada por outro processo
4. **Formato de áudio:** Gravações do navegador são em WebM - o backend pode precisar de conversão para WAV/MP3
5. **HTTPS:** Em produção, HTTPS é necessário para acesso ao microfone (exceto localhost)

