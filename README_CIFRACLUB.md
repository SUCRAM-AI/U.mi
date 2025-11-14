# 🎸 Guia Completo - Integração Cifra Club API

Este guia explica como configurar e usar a funcionalidade de busca e visualização de cifras do Cifra Club no app U.Mi.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Configuração](#configuração)
4. [Como Usar](#como-usar)
5. [Estrutura do Projeto](#estrutura-do-projeto)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

A integração com o Cifra Club permite que os usuários:
- Busquem cifras de músicas por artista e nome da música
- Visualizem cifras formatadas com acordes destacados
- Acessem links para YouTube e Cifra Club
- Vejam todos os acordes únicos da música
- Ajustem o tamanho da fonte para melhor leitura

### Arquitetura

```
Frontend (React Native)
    ↓
Backend Flask (porta 5000)
    └─→ /api/cifra/<artist>/<song> (proxy)
            ↓
    CifraClub API (porta 3000, Docker)
        └─→ Selenium scraping do Cifra Club
```

---

## 📦 Pré-requisitos

### 1. Docker e Docker Compose
A CifraClub API usa Selenium, que requer Docker.

**Instalação:**
- **Linux:** `sudo apt-get install docker.io docker-compose`
- **Mac:** [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Windows:** [Docker Desktop](https://www.docker.com/products/docker-desktop)

**Verificar instalação:**
```bash
docker --version
docker-compose --version
```

### 2. Python 3.8+
Para o backend Flask.

**Verificar:**
```bash
python3 --version
```

### 3. Node.js e npm/yarn
Para o frontend React Native.

**Verificar:**
```bash
node --version
npm --version
```

---

## ⚙️ Configuração

### Passo 1: Configurar CifraClub API

1. **Navegar para a pasta:**
```bash
cd cifraclub-api
```

2. **Construir e iniciar os containers Docker:**
```bash
docker-compose build
docker-compose up -d
```

Ou usando Makefile:
```bash
make up
```

3. **Verificar se está rodando:**
```bash
curl http://localhost:3000/
```

Deve retornar:
```json
{"api": "Cifra Club API"}
```

4. **Testar busca de cifra:**
```bash
curl http://localhost:3000/artists/coldplay/songs/the-scientist
```

### Passo 2: Configurar Backend Flask

1. **Navegar para a pasta:**
```bash
cd backend
```

2. **Instalar dependências (se necessário):**
```bash
pip install -r requirements.txt
```

**Nota:** O `requests` já está no `requirements.txt`, então não precisa instalar separadamente.

3. **Configurar variável de ambiente (opcional):**
Se a CifraClub API estiver em outro endereço, defina:
```bash
export CIFRACLUB_API_URL=http://localhost:3000
```

Ou crie um arquivo `.env`:
```env
CIFRACLUB_API_URL=http://localhost:3000
```

4. **Iniciar o backend:**
```bash
python api.py
```

O backend estará disponível em `http://localhost:5000`

5. **Verificar endpoints:**
```bash
# Health check
curl http://localhost:5000/api/health

# Health check da CifraClub API
curl http://localhost:5000/api/cifra/health

# Buscar cifra (via proxy)
curl http://localhost:5000/api/cifra/coldplay/the-scientist
```

### Passo 3: Configurar Frontend

1. **Navegar para a pasta:**
```bash
cd frontend/umi
```

2. **Instalar dependências (se necessário):**
```bash
npm install
# ou
yarn install
```

3. **Configurar URL da API:**
Edite `services/api.ts` e ajuste o `API_BASE_URL`:
```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://SEU_IP_LOCAL:5000/api'  // Substitua SEU_IP_LOCAL
  : 'https://your-api-url.com/api';
```

**Importante para dispositivos móveis:**
- **Android Emulator:** Use `10.0.2.2:5000`
- **iOS Simulator:** Use `localhost:5000` ou `127.0.0.1:5000`
- **Dispositivo Físico:** Use o IP da sua máquina na rede local (ex: `192.168.1.100:5000`)

**Descobrir seu IP:**
- **Linux/Mac:** `ifconfig` ou `ip addr show`
- **Windows:** `ipconfig`

4. **Iniciar o app:**
```bash
npm start
# ou
yarn start
```

---

## 🚀 Como Usar

### No App

1. **Acesse a tela "Música"** na navegação inferior
2. **Digite o nome do artista** (ex: "Coldplay")
3. **Digite o nome da música** (ex: "The Scientist")
4. **Toque em "Buscar"**
5. **Aguarde a busca** (pode levar alguns segundos)
6. **Visualize a cifra** com:
   - Acordes destacados em roxo
   - Seções marcadas
   - Tablaturas (se disponíveis)
   - Lista de acordes únicos
   - Links para YouTube e Cifra Club
   - Controles de tamanho de fonte

### Funcionalidades do Visualizador

- **Botão Voltar:** Retorna à tela de busca
- **YouTube:** Abre a música no YouTube
- **Cifra Club:** Abre a cifra no site do Cifra Club
- **Aumentar/Diminuir Fonte:** Ajusta o tamanho do texto (12-20px)
- **Scroll:** Navegue pela cifra completa

---

## 📁 Estrutura do Projeto

```
projeto/
├── backend/
│   ├── api.py                    # Backend Flask com proxy para CifraClub API
│   └── requirements.txt           # Dependências Python
│
├── cifraclub-api/
│   ├── app/
│   │   ├── api.py                # API Flask da CifraClub
│   │   ├── cifraclub.py          # Lógica de scraping
│   │   └── requirements.txt      # Dependências
│   ├── docker-compose.yml        # Configuração Docker
│   └── Dockerfile                # Imagem Docker
│
└── frontend/umi/
    ├── app/(tabs)/
    │   └── musica.tsx            # Tela principal de música
    ├── components/
    │   ├── cifra-search.tsx      # Componente de busca
    │   └── cifra-viewer.tsx      # Visualizador de cifras
    └── services/
        └── api.ts                # Serviços de API (inclui getCifra)
```

---

## 🔧 Troubleshooting

### Problema: CifraClub API não responde

**Sintomas:**
- Erro "CifraClub API não está disponível"
- Timeout nas requisições

**Soluções:**
1. Verificar se Docker está rodando:
```bash
docker ps
```

2. Verificar se os containers estão ativos:
```bash
cd cifraclub-api
docker-compose ps
```

3. Reiniciar os containers:
```bash
cd cifraclub-api
docker-compose down
docker-compose up -d
```

4. Verificar logs:
```bash
cd cifraclub-api
docker-compose logs
```

### Problema: Backend não encontra CifraClub API

**Sintomas:**
- Erro 503 "CifraClub API não está disponível"
- Backend retorna erro de conexão

**Soluções:**
1. Verificar se CifraClub API está rodando:
```bash
curl http://localhost:3000/
```

2. Verificar variável de ambiente:
```bash
echo $CIFRACLUB_API_URL
```

3. Se estiver usando Docker em outra máquina, ajuste a URL:
```python
# Em backend/api.py
CIFRACLUB_API_URL = 'http://IP_DA_OUTRA_MAQUINA:3000'
```

### Problema: Frontend não conecta ao backend

**Sintomas:**
- Erro de rede no app
- "Failed to fetch"

**Soluções:**
1. Verificar se backend está rodando:
```bash
curl http://localhost:5000/api/health
```

2. Verificar IP no `services/api.ts`:
   - Deve ser o IP da sua máquina, não `localhost`
   - Para emulador Android: `10.0.2.2`
   - Para iOS Simulator: `localhost` ou `127.0.0.1`

3. Verificar firewall:
   - Linux: `sudo ufw allow 5000`
   - Mac/Windows: Configurações do Sistema → Firewall

### Problema: Cifra não encontrada

**Sintomas:**
- Mensagem "Não encontrado"
- Erro 404

**Soluções:**
1. Verificar se o artista e música estão corretos
2. Tentar variações do nome (com/sem acentos)
3. Verificar se a cifra existe no Cifra Club:
   - Acesse https://www.cifraclub.com.br
   - Busque manualmente
   - Use exatamente o mesmo formato de URL

### Problema: Busca muito lenta

**Causa:** O Selenium precisa carregar a página completa do Cifra Club, o que pode levar 10-30 segundos.

**Soluções:**
1. Aguardar - é normal demorar
2. Verificar conexão com internet
3. Verificar se o Selenium está funcionando:
```bash
cd cifraclub-api
docker-compose logs selenium
```

---

## 📝 Endpoints da API

### Backend Flask

#### `GET /api/cifra/<artist>/<song>`
Busca uma cifra específica.

**Parâmetros:**
- `artist`: Nome do artista (normalizado, ex: "coldplay")
- `song`: Nome da música (normalizado, ex: "the-scientist")

**Resposta:**
```json
{
  "artist": "Coldplay",
  "name": "The Scientist",
  "cifra": ["...", "..."],
  "cifraclub_url": "https://www.cifraclub.com.br/coldplay/the-scientist",
  "youtube_url": "https://www.youtube.com/watch?v=..."
}
```

#### `GET /api/cifra/health`
Verifica se a CifraClub API está disponível.

**Resposta:**
```json
{
  "cifraclub_api_available": true,
  "cifraclub_api_url": "http://localhost:3000"
}
```

### CifraClub API (Direto)

#### `GET /artists/<artist>/songs/<song>`
Busca cifra diretamente (sem proxy).

**Exemplo:**
```bash
curl http://localhost:3000/artists/coldplay/songs/the-scientist
```

---

## 🎨 Personalização

### Cores do App

As cores principais usadas:
- **Roxo:** `#7C3AED` (acordes, botões principais)
- **Laranja:** `#F97316` (destaques, afinação)
- **Background:** `#fbfaff`, `#FFFFFF`
- **Texto:** `#1F113C`, `#6B7280`

Para alterar, edite os arquivos:
- `components/cifra-viewer.tsx` (estilos)
- `components/cifra-search.tsx` (estilos)

### Tamanho de Fonte

O tamanho padrão é 16px, variando de 12px a 20px.

Para alterar, edite `components/cifra-viewer.tsx`:
```typescript
const [fontSize, setFontSize] = useState(16); // Altere o valor inicial
```

---

## 📚 Recursos Adicionais

- [Documentação do Cifra Club](https://www.cifraclub.com.br)
- [Documentação do Selenium](https://www.selenium.dev/documentation/)
- [Documentação do Flask](https://flask.palletsprojects.com/)
- [Documentação do React Native](https://reactnative.dev/)

---

## ✅ Checklist de Configuração

- [ ] Docker e Docker Compose instalados
- [ ] CifraClub API rodando (porta 3000)
- [ ] Backend Flask rodando (porta 5000)
- [ ] Frontend configurado com IP correto
- [ ] Teste de busca funcionando
- [ ] Visualizador de cifra funcionando

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs:
   - Backend: Console onde `python api.py` está rodando
   - CifraClub API: `docker-compose logs` na pasta `cifraclub-api`
   - Frontend: Console do Expo/React Native

2. Verifique a conectividade:
   - Backend → CifraClub API: `curl http://localhost:3000/`
   - Frontend → Backend: `curl http://localhost:5000/api/health`

3. Reinicie os serviços:
   - CifraClub API: `docker-compose restart`
   - Backend: Reinicie o processo Python
   - Frontend: `npm start` novamente

---

**Desenvolvido com ❤️ para o projeto U.Mi**

