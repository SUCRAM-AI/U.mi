# 🔄 Como Recarregar o App Após Alterações

## Backend (Flask)

### Reiniciar o servidor:
```bash
# No terminal do backend, pressione Ctrl+C para parar
# Depois inicie novamente:
cd backend
python api.py
```

### Verificar se está rodando:
- Você deve ver: `🚀 Iniciando servidor Flask na porta 5000`
- Teste: `curl http://localhost:5000/api/health`

---

## Frontend (React Native/Expo)

### 1. Hot Reload Automático (Normal)
- O Expo normalmente recarrega automaticamente quando você salva arquivos
- Se não recarregar, pressione `r` no terminal do Metro/Expo

### 2. Recarregar Manualmente no App
- **Android/iOS**: Agite o dispositivo e toque em "Reload"
- **Web**: Pressione `Ctrl+R` ou `F5`
- **No terminal**: Pressione `r` para reload

### 3. Limpar Cache e Reiniciar (Se mudanças não aparecerem)

#### Opção A: Limpar cache do Metro
```bash
cd frontend/umi
npm start -- --reset-cache
# ou
npx expo start --clear
```

#### Opção B: Limpar tudo e reinstalar
```bash
cd frontend/umi
# Limpar cache do npm
rm -rf node_modules
rm -rf .expo
rm package-lock.json  # ou yarn.lock se usar yarn

# Reinstalar
npm install
# ou
yarn install

# Iniciar novamente
npm start
```

### 4. Verificar se as mudanças foram aplicadas

#### No código:
- Adicione um `console.log` único para verificar
- Exemplo: `console.log('🔄 VERSÃO 2.0 - Código atualizado!')`

#### No app:
- Veja o console do Metro/Expo para os logs
- Verifique se os novos logs aparecem

---

## Checklist de Recarregamento

### ✅ Backend:
- [ ] Servidor parado (Ctrl+C)
- [ ] Servidor reiniciado (`python api.py`)
- [ ] Logs mostram "Iniciando servidor Flask"
- [ ] Teste `/api/health` funciona

### ✅ Frontend:
- [ ] Metro/Expo está rodando
- [ ] Pressionou `r` no terminal (se não recarregou automaticamente)
- [ ] Limpou cache se necessário (`--reset-cache`)
- [ ] Console mostra logs novos (se adicionou)

### ✅ Teste Completo:
- [ ] Backend recebe requisições (veja logs do backend)
- [ ] Frontend envia requisições (veja console do Metro)
- [ ] App mostra feedback visual correto

---

## Comandos Rápidos

### Reiniciar Backend:
```bash
cd backend && python api.py
```

### Reiniciar Frontend com cache limpo:
```bash
cd frontend/umi && npm start -- --reset-cache
```

### Ver logs do backend em tempo real:
```bash
# No terminal do backend, você verá os logs automaticamente
```

### Ver logs do frontend:
```bash
# No terminal do Metro/Expo, você verá os logs automaticamente
# Ou abra o DevTools no navegador se estiver usando web
```

---

## Dicas

1. **Sempre verifique os logs**: Backend e Frontend mostram o que está acontecendo
2. **Se algo não funciona**: Limpe o cache primeiro
3. **Mudanças em arquivos de configuração**: Sempre requerem reiniciar
4. **Mudanças em código**: Geralmente hot reload funciona
5. **Se hot reload não funciona**: Use `r` no terminal ou recarregue manualmente

---

## Problemas Comuns

### "Mudanças não aparecem"
1. Limpe o cache: `npm start -- --reset-cache`
2. Reinicie o app completamente
3. Verifique se salvou o arquivo

### "Backend não recebe requisições"
1. Verifique se o backend está rodando
2. Verifique a URL no frontend (`API_BASE_URL`)
3. Verifique os logs do backend

### "Erros de importação"
1. Limpe `node_modules` e reinstale
2. Verifique se os imports estão corretos
3. Reinicie o Metro bundler

