#!/bin/bash

# Script para iniciar ngrok tunnel para o backend Flask
# Uso: ./start-ngrok-tunnel.sh

echo "🚀 Iniciando ngrok tunnel para o backend Flask..."
echo "📡 Porta: 5000"
echo ""

# Verificar se o backend está rodando
if ! curl -s http://localhost:5000 > /dev/null 2>&1; then
    echo "⚠️  Aviso: Backend Flask não está respondendo em http://localhost:5000"
    echo "💡 Certifique-se de que o backend está rodando antes de continuar"
    echo ""
fi

# Iniciar ngrok em background
ngrok http 5000 --log=stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

echo "⏳ Aguardando ngrok inicializar..."
sleep 5

# Tentar obter a URL pública do ngrok (múltiplas tentativas)
NGROK_URL=""
for i in {1..10}; do
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o 'https://[^"]*\.ngrok[^"]*' | head -1)
    if [ -n "$NGROK_URL" ]; then
        break
    fi
    echo "⏳ Tentativa $i/10..."
    sleep 1
done

if [ -z "$NGROK_URL" ]; then
    echo "❌ Erro: Não foi possível obter a URL do ngrok"
    echo "💡 Verifique se o ngrok está rodando corretamente"
    echo "💡 Tente acessar http://localhost:4040 para ver a interface do ngrok"
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

echo ""
echo "✅ Tunnel criado com sucesso!"
echo "🌐 URL pública: $NGROK_URL"
echo ""
echo "📋 Para usar no app Expo:"
echo "   1. Defina a variável de ambiente antes de iniciar o Expo:"
echo "      export EXPO_PUBLIC_API_URL=$NGROK_URL/api"
echo "      npx expo start --tunnel"
echo ""
echo "   2. Ou atualize manualmente em frontend/umi/services/api.ts:"
echo "      const TUNNEL_URL = '$NGROK_URL/api';"
echo ""
echo "🔍 Interface do ngrok: http://localhost:4040"
echo "⚠️  Pressione Ctrl+C para parar o tunnel"
echo ""

# Salvar PID e URL para referência
echo $NGROK_PID > /tmp/ngrok.pid
echo $NGROK_URL > /tmp/ngrok.url

# Função para limpar ao sair
cleanup() {
    echo ""
    echo "🛑 Parando ngrok tunnel..."
    kill $NGROK_PID 2>/dev/null
    rm -f /tmp/ngrok.pid /tmp/ngrok.url
    exit 0
}

trap cleanup SIGINT SIGTERM

# Aguardar até o usuário parar
wait $NGROK_PID

