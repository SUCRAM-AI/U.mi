#!/bin/bash

# Script para iniciar Expo com URL do ngrok configurada
# URL do ngrok (atualize se mudar)
export EXPO_PUBLIC_API_URL=https://penetrative-cayson-geitonogamous.ngrok-free.dev/api

echo "🚀 Iniciando Expo com ngrok..."
echo "📡 URL da API: $EXPO_PUBLIC_API_URL"
echo ""
echo "⚠️  Certifique-se de que:"
echo "   1. Backend Flask está rodando na porta 5000"
echo "   2. Ngrok está rodando e apontando para porta 5000"
echo ""

# Iniciar Expo com cache limpo
npx expo start --clear

