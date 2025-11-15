# 🚇 Guia de Uso do Tunnel para Backend Flask

Este guia explica como usar o tunnel do ngrok para conectar o app Expo ao backend Flask quando o dispositivo móvel não está na mesma rede.

## 📋 Pré-requisitos

1. **ngrok instalado**: Verifique com `which ngrok`
2. **Backend Flask rodando**: Certifique-se de que o backend está rodando em `http://localhost:5000`
3. **Conta ngrok** (opcional, mas recomendado para URLs estáveis)

## 🚀 Método 1: Usando o Script Automático

1. **Inicie o backend Flask** (se ainda não estiver rodando):
   ```bash
   cd U.mi/backend
   python api.py
   ```

2. **Inicie o tunnel ngrok**:
   ```bash
   cd U.mi
   ./start-ngrok-tunnel.sh
   ```

3. **Copie a URL pública** exibida pelo script (ex: `https://xxxx.ngrok.io`)

4. **Defina a variável de ambiente** antes de iniciar o Expo:
   ```bash
   export EXPO_PUBLIC_API_URL=https://xxxx.ngrok.io/api
   npx expo start --tunnel
   ```

5. **Ou atualize manualmente** em `frontend/umi/services/api.ts`:
   ```typescript
   const TUNNEL_URL = 'https://xxxx.ngrok.io/api';
   ```

## 🔧 Método 2: Usando ngrok Manualmente

1. **Inicie o ngrok**:
   ```bash
   ngrok http 5000
   ```

2. **Copie a URL HTTPS** exibida (ex: `https://xxxx.ngrok.io`)

3. **Defina a variável de ambiente**:
   ```bash
   export EXPO_PUBLIC_API_URL=https://xxxx.ngrok.io/api
   ```

4. **Reinicie o Expo**:
   ```bash
   npx expo start --tunnel
   ```

## 📱 Usando Tunnel do Expo

O Expo também oferece um tunnel nativo. Para usar:

```bash
npx expo start --tunnel
```

**Nota**: O tunnel do Expo é para o **Metro bundler** (servidor de desenvolvimento do React Native), não para o backend Flask. Você ainda precisa de um tunnel separado (ngrok) para o backend.

## ⚙️ Configuração do App

O app já está configurado para:
- ✅ Permitir requisições HTTP no iOS (App Transport Security)
- ✅ Permitir requisições HTTP no Android (cleartext traffic)
- ✅ Usar variável de ambiente `EXPO_PUBLIC_API_URL` quando disponível
- ✅ Fallback para IP local (`192.168.0.7:5000`) se o tunnel não estiver configurado

## 🔍 Verificação

1. **Verifique a URL do backend** no app:
   - Os logs do console mostrarão a URL sendo usada
   - Verifique em `services/api.ts` qual URL está sendo usada

2. **Teste a conexão**:
   - Tente buscar uma cifra no app
   - Verifique os logs do backend Flask
   - Verifique os logs do ngrok em `http://localhost:4040`

## 🐛 Troubleshooting

### Erro: "Network request failed"
- Verifique se o backend Flask está rodando
- Verifique se o ngrok está rodando e acessível
- Verifique se a URL do tunnel está correta
- Verifique se a variável de ambiente `EXPO_PUBLIC_API_URL` está definida

### Erro: "ngrok: command not found"
- Instale o ngrok: `snap install ngrok` ou baixe de https://ngrok.com/

### URL do ngrok muda a cada reinicialização
- Use uma conta ngrok gratuita para URLs estáveis
- Configure um domínio reservado no ngrok

### Backend não está acessível via tunnel
- Verifique se o backend está rodando em `localhost:5000`
- Verifique se o backend está configurado para aceitar conexões externas (`host='0.0.0.0'`)
- Verifique o firewall do sistema

## 📝 Notas

- URLs do ngrok gratuitas mudam a cada reinicialização
- URLs do ngrok têm limites de requisições (free tier)
- Para produção, use um serviço de hospedagem com HTTPS
- O tunnel do ngrok é apenas para desenvolvimento/testes

