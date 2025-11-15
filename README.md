# U.Mi - Plataforma de Aprendizado Musical

U.Mi é uma aplicação mobile desenvolvida em React Native/Expo que oferece uma experiência completa de aprendizado musical, com foco em violão. A plataforma inclui trilhas teóricas, exercícios práticos, detecção de acordes, integração com chatbot via OpenAI, e muito mais.

## Índice

- [Características](#características)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Executar](#como-executar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades Principais](#funcionalidades-principais)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)

## Características

- **Trilha Teórica**: Módulos de aprendizado progressivos com lições interativas
- **Detecção de Acordes**: Sistema de reconhecimento de acordes em tempo real
- **Chatbot Inteligente**: Assistente virtual integrado com OpenAI GPT
- **Sistema de Progresso**: XP, níveis e conquistas para gamificação
- **Autenticação Completa**: Login, cadastro e recuperação de senha
- **Biblioteca de Cifras**: Integração com CifraClub para busca de músicas
- **Multiplataforma**: Funciona em iOS, Android e Web

## Tecnologias Utilizadas

### Frontend
- **React Native** (0.81.5)
- **Expo** (~54.0.22)
- **Expo Router** (~6.0.14) - Navegação baseada em arquivos
- **TypeScript** (~5.9.2)
- **AsyncStorage** - Armazenamento local
- **React Context API** - Gerenciamento de estado

### Backend
- **Flask** (>=3.1.0) - Framework web Python
- **Flask-CORS** - Controle de CORS
- **OpenAI API** - Integração com ChatGPT
- **Python-dotenv** - Gerenciamento de variáveis de ambiente

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **Python** (versão 3.8 ou superior)
- **pip** (gerenciador de pacotes Python)
- **Expo CLI** (instalado globalmente via `npm install -g expo-cli`)
- **Git**

### Para desenvolvimento mobile:
- **Expo Go** (app instalado no seu dispositivo móvel)
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

## Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd U.mi
```

### 2. Instale as dependências do Frontend

```bash
cd frontend/umi
npm install
```

### 3. Instale as dependências do Backend

```bash
cd ../../backend

# Criar ambiente virtual (recomendado)
python3 -m venv venv

# Ativar ambiente virtual
# No Linux/Mac:
source venv/bin/activate
# No Windows:
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt
```

## Configuração

### Backend - Variáveis de Ambiente

1. Crie um arquivo `.env` na pasta `backend/`:

```bash
cd backend
touch .env
```

2. Adicione suas variáveis de ambiente no arquivo `.env`:

```env
OPENAI_API_KEY=sua-chave-api-openai-aqui
```

> **Nota**: Para obter uma chave da API OpenAI, acesse [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### Frontend - Configuração da API

O frontend está configurado para se conectar ao backend na URL `http://localhost:5000` por padrão. Se você precisar alterar isso, edite o arquivo `frontend/umi/services/api.ts`.

## Como Executar

### Backend (Flask API)

1. Ative o ambiente virtual (se ainda não estiver ativo):

```bash
cd backend
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

2. Inicie o servidor Flask:

```bash
python api.py
```

O servidor estará rodando em `http://localhost:5000`

### Frontend (React Native/Expo)

1. Navegue até a pasta do frontend:

```bash
cd frontend/umi
```

2. Inicie o servidor Expo:

```bash
npm start
# ou
expo start
```

3. Escaneie o QR Code:
   - **iOS**: Use a câmera do iPhone ou o app Expo Go
   - **Android**: Use o app Expo Go para escanear o QR Code
   - **Web**: Pressione `w` no terminal ou acesse a URL exibida

### Executar em plataformas específicas

```bash
# Android
npm run android
# ou
expo start --android

# iOS (apenas no Mac)
npm run ios
# ou
expo start --ios

# Web
npm run web
# ou
expo start --web
```

## Estrutura do Projeto

```
U.mi/
├── backend/                 # API Flask
│   ├── api.py              # Arquivo principal da API
│   ├── modulos/            # Módulos de processamento
│   │   ├── chord_detector.py
│   │   ├── comparador.py
│   │   ├── detect_user_chord.py
│   │   └── extract_music_chords.py
│   ├── requirements.txt    # Dependências Python
│   ├── .env               # Variáveis de ambiente (criar)
│   ├── audios/            # Arquivos de áudio de exemplo
│   └── temp_uploads/      # Uploads temporários
│
├── frontend/
│   └── umi/               # Aplicação React Native
│       ├── app/           # Rotas e telas (Expo Router)
│       │   ├── (tabs)/    # Telas com navegação por abas
│       │   ├── login.tsx
│       │   ├── cadastro.tsx
│       │   └── ...
│       ├── components/    # Componentes reutilizáveis
│       ├── contexts/      # Context API (AuthContext)
│       ├── services/      # Serviços (API, OpenAI)
│       ├── config/        # Configurações e dados
│       │   └── lessons/   # Arquivos JSON das lições
│       ├── assets/         # Imagens, ícones, áudios
│       ├── package.json
│       └── app.json        # Configuração do Expo
│
└── README.md              # Este arquivo
```

## Funcionalidades Principais

### 1. Autenticação
- Login com email e senha
- Cadastro de novos usuários
- Recuperação de senha com token
- Modo convidado
- Persistência de sessão

### 2. Trilha Teórica
- Módulos progressivos de aprendizado
- Lições interativas com conteúdo teórico
- Sistema de desbloqueio baseado em progresso
- Barra de progresso por módulo

### 3. Sistema de Progresso
- XP (pontos de experiência)
- Níveis do usuário
- Lições completadas
- Conquistas
- Streak de prática

### 4. Detecção de Acordes
- Gravação de áudio
- Análise e detecção de acordes
- Comparação com acordes esperados
- Feedback visual

### 5. Chatbot
- Integração com OpenAI GPT
- Assistente virtual para dúvidas
- Contexto sobre violão e música

### 6. Biblioteca de Cifras
- Busca de músicas no CifraClub
- Visualização de cifras
- Links externos para músicas

## API Endpoints

### Backend (`http://localhost:5000`)

#### Detecção de Acordes
- `POST /api/detect_chord` - Detecta acorde em áudio enviado

#### Chatbot
- `POST /api/chatbot` - Envia mensagem para o chatbot OpenAI

#### Health Check
- `GET /api/health` - Verifica status da API

## Troubleshooting

### Problemas Comuns

#### 1. Erro ao instalar dependências do frontend
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### 2. Backend não inicia
- Verifique se o ambiente virtual está ativado
- Certifique-se de que a porta 5000 não está em uso
- Verifique se todas as dependências foram instaladas: `pip install -r requirements.txt`

#### 3. Erro de conexão com a API
- Verifique se o backend está rodando em `http://localhost:5000`
- No dispositivo físico, use o IP da sua máquina ao invés de `localhost`
- Verifique as configurações de CORS no backend

#### 4. Token de recuperação de senha não funciona
- Em desenvolvimento, o token é exibido no console do backend
- Verifique o console para obter o token gerado

#### 5. Expo Go não conecta
- Certifique-se de que o dispositivo e o computador estão na mesma rede Wi-Fi
- Tente usar o modo tunnel: `expo start --tunnel`

### Logs e Debug

#### Frontend
```bash
# Ver logs do Expo
expo start --clear

# Ver logs no dispositivo
# No Expo Go, agite o dispositivo e selecione "Debug Remote JS"
```

#### Backend
```bash
# Executar com debug
FLASK_DEBUG=1 python api.py
```

## Notas Importantes

- **Ambiente de Desenvolvimento**: Este projeto está configurado para desenvolvimento. Para produção, configure variáveis de ambiente adequadas e use HTTPS.

- **Armazenamento de Dados**: Atualmente, os dados dos usuários são armazenados localmente usando AsyncStorage. Para produção, considere implementar um banco de dados real.

- **API OpenAI**: O uso da API OpenAI requer uma chave válida e pode gerar custos. Monitore seu uso em [https://platform.openai.com/usage](https://platform.openai.com/usage)

- **Segurança**: As senhas são hashadas antes de serem armazenadas. Em produção, considere usar bibliotecas mais robustas como `bcrypt`.

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto é privado e de uso interno.

## Autores

- Equipe U.Mi

## Agradecimentos

- Expo por fornecer uma excelente plataforma de desenvolvimento
- OpenAI por disponibilizar a API GPT
- CifraClub pela API de cifras

---

**Desenvolvido para o aprendizado musical**

