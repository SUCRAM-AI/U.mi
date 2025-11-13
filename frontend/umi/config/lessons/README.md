# Sistema de Lições - U.Mi

## Estrutura

Todas as lições são definidas em arquivos JSON localizados em `config/lessons/`. Cada lição possui um ID único no formato `{section}.{unit}` (ex: `1.1`, `3.2`, `10.4`).

## Tipos de Lição

### 1. `quiz-arrastar`
Quiz interativo de drag and drop onde o usuário arrasta itens para zonas de destino.

**Campos necessários:**
- `items`: Array de itens para arrastar
- `dropZones`: Array de zonas de destino
- Cada item deve ter `correctTarget` apontando para o ID da zona correta

### 2. `quiz-audio`
Quiz onde o usuário ouve um áudio e seleciona a resposta correta.

**Campos necessários:**
- `quiz.question`: Pergunta
- `quiz.options`: Array de opções
- `quiz.correctAnswer`: Resposta correta
- `quiz.audioUri`: URI do áudio (opcional)

### 3. `teoria`
Conteúdo teórico com explicações, imagens e texto.

**Campos necessários:**
- `content`: String ou array de strings com o conteúdo
- `asset`: URI da imagem (opcional)

### 4. `pratica-microfone`
Prática com gravação de áudio e detecção de acordes/notas.

**Campos necessários:**
- `expectedChord`: Acorde esperado (opcional)
- `expectedFrequencies`: Array de frequências esperadas (opcional)
- `tolerance`: Tolerância em Hz (padrão: 20)

### 5. `pratica-sequencia`
Prática de sequência de acordes/notas.

**Campos necessários:**
- `sequence`: Array de acordes/notas na ordem
- `expectedChords`: Array de acordes esperados (opcional)

### 6. `pratica-ritmo`
Prática de ritmo e strumming.

**Campos necessários:**
- `pattern`: Array de batidas (ex: `["↓", "↑", "↓", "↑"]`)
- `tempo`: BPM (opcional, padrão: 120)
- `sequence`: Array de acordes (opcional)

### 7. `strumming`
Prática específica de strumming.

**Campos necessários:**
- `pattern`: Array de batidas
- `tempo`: BPM (opcional)

### 8. `leitura-diagrama`
Leitura de diagramas de acordes.

**Campos necessários:**
- `diagram`: Objeto com informações do diagrama
  - `chordName`: Nome do acorde
  - `frets`: Array de trastes (6 elementos, um por corda)
  - `strings`: Array de índices de cordas
  - `fingerPositions`: Array de posições dos dedos (opcional)

### 9. `aquecimento`
Prática de metrônomo humano/toque na tela.

**Campos necessários:**
- `targetBPM`: BPM alvo (opcional)

## Campos Comuns

Todos os tipos de lição devem ter:

- `id`: ID único (ex: `"1.1"`)
- `section`: Número da seção (ex: `"1"`)
- `unit`: Número da unidade (ex: `"1"`)
- `lesson`: ID da lição (geralmente igual a `id`)
- `title`: Título da lição
- `description`: Descrição curta
- `type`: Tipo da lição (ver acima)
- `asset`: URI da imagem (opcional)
- `successCriteria`: Critério de sucesso
- `xpReward`: XP ganho ao completar (opcional)
- `tolerance`: Tolerância para detecção (padrão: 20)

## Como Adicionar uma Nova Lição

1. Crie um arquivo JSON em `config/lessons/lesson-{section}-{unit}.json`
2. Adicione o import e export em `config/lessons/index.ts`
3. A tela genérica `LessonScreen` renderizará automaticamente baseado no tipo

## Exemplo

```json
{
  "id": "1.1",
  "section": "1",
  "unit": "1",
  "lesson": "1.1",
  "title": "Título da Lição",
  "description": "Descrição da lição",
  "type": "pratica-microfone",
  "asset": "assets/images/exemplo.png",
  "successCriteria": "Tocar o acorde corretamente",
  "expectedChord": "C",
  "xpReward": 50,
  "tolerance": 20
}
```
