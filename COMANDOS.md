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

## 📱 Frontend (React Native - Expo)

### 1. Navegar para a pasta do frontend
```bash
cd frontend/umi
```

### 2. Instalar dependências (primeira vez)
```bash
npm install
# ou
yarn install
```

### 3. Executar o frontend

**Opção 1: Iniciar servidor de desenvolvimento**
```bash
npm start
# ou
yarn start
```

**Opção 2: Executar no Android**
```bash
npm run android
# ou
yarn android
```

**Opção 3: Executar no iOS**
```bash
npm run ios
# ou
yarn ios
```

**Opção 4: Executar na Web**
```bash
npm run web
# ou
yarn web
```

---

## 🔄 Executando Ambos Simultaneamente

### Terminal 1 - Backend
```bash
cd backend
python api.py
```

### Terminal 2 - Frontend
```bash
cd frontend/umi
npm start
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
1. Abra o app no dispositivo/emulador
2. Navegue até a tela de lição
3. Tente gravar um áudio e detectar o acorde

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
2. **IP da API:** O IP `192.168.0.7` no `services/api.ts` deve corresponder ao IP da sua máquina
3. **Porta 5000:** Certifique-se de que a porta 5000 não está sendo usada por outro processo
4. **Firewall:** Permita conexões na porta 5000 se estiver usando dispositivo físico

