# Integração Backend-Frontend - U.Mi

Este documento explica como usar a integração entre o frontend React Native e o backend Flask.

## Configuração

### 1. Instalar dependências

```bash
cd frontend/umi
npm install
# ou
yarn install
```

### 2. Configurar URL da API

Edite `services/api.ts` e ajuste a `API_BASE_URL`:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://SEU_IP_LOCAL:5000/api'  // Substitua SEU_IP_LOCAL pelo IP da sua máquina
  : 'https://your-api-url.com/api';
```

**Importante:** Para desenvolvimento com dispositivo físico ou emulador, use o IP da sua máquina local, não `localhost`.

### 3. Executar o backend

Certifique-se de que o backend está rodando (veja `backend/README_API.md`).

## Componentes Disponíveis

### `AudioRecorderButton`

Componente de botão para gravação de áudio.

```typescript
import { AudioRecorderButton } from '../components/audio-recorder-button';

<AudioRecorderButton
  onRecordingComplete={(uri) => {
    console.log('Áudio gravado:', uri);
    // uri pode ser usado para enviar para a API
  }}
  onError={(error) => {
    console.error('Erro:', error);
  }}
/>
```

### `ChordDetectionExercise`

Componente completo de exercício de detecção de acordes.

```typescript
import { ChordDetectionExercise } from '../components/chord-detection-exercise';

<ChordDetectionExercise
  expectedChord="C"
  onCorrect={() => {
    console.log('Acorde correto!');
  }}
  onIncorrect={() => {
    console.log('Acorde incorreto!');
  }}
/>
```

## Serviços de API

### `detectChord(audioUri: string)`

Detecta o acorde de um áudio.

```typescript
import { detectChord } from '../services/api';

const result = await detectChord(audioUri);
if (result.success) {
  console.log('Acorde detectado:', result.chord);
}
```

### `compareChords(gabaritoUri: string, tocadoUri: string)`

Compara dois áudios.

```typescript
import { compareChords } from '../services/api';

const result = await compareChords(gabaritoUri, tocadoUri);
if (result.is_correct) {
  console.log('Acorde correto!');
}
```

### `extractChords(audioUri: string)`

Extrai todos os acordes de uma música com timestamps.

```typescript
import { extractChords } from '../services/api';

const result = await extractChords(audioUri);
console.log('Acordes:', result.chords);
```

## Exemplo de Uso na Tela de Lição

```typescript
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { ChordDetectionExercise } from '../components/chord-detection-exercise';

export default function LessonScreen() {
  const [score, setScore] = useState(0);

  return (
    <View>
      <Text>Lição de Acordes</Text>
      
      <ChordDetectionExercise
        expectedChord="C"
        onCorrect={() => {
          setScore(score + 1);
          Alert.alert('Parabéns!', 'Você acertou!');
        }}
        onIncorrect={() => {
          Alert.alert('Tente novamente', 'O acorde não está correto');
        }}
      />
    </View>
  );
}
```

## Hook de Gravação de Áudio

Você também pode usar o hook diretamente:

```typescript
import { useAudioRecorder } from '../hooks/use-audio-recorder';

function MyComponent() {
  const {
    isRecording,
    duration,
    soundUri,
    startRecording,
    stopRecording,
    reset,
  } = useAudioRecorder();

  return (
    <View>
      <Button
        title={isRecording ? 'Parar' : 'Gravar'}
        onPress={isRecording ? stopRecording : startRecording}
      />
      {soundUri && <Text>Áudio gravado: {soundUri}</Text>}
    </View>
  );
}
```

## Permissões

O app precisa solicitar permissões de microfone. O hook `useAudioRecorder` já faz isso automaticamente, mas você pode verificar manualmente:

```typescript
import { Audio } from 'expo-av';

const { status } = await Audio.requestPermissionsAsync();
if (status !== 'granted') {
  Alert.alert('Permissão necessária', 'É preciso permitir o acesso ao microfone');
}
```

## Troubleshooting

### Erro de conexão com a API

1. Verifique se o backend está rodando
2. Verifique se o IP está correto no `services/api.ts`
3. Verifique se o firewall permite conexões na porta 5000
4. Para Android, certifique-se de que o app tem permissão de internet no `AndroidManifest.xml`

### Erro ao gravar áudio

1. Verifique se o app tem permissão de microfone
2. Verifique se o dispositivo suporta gravação de áudio
3. Verifique os logs do console para mais detalhes

### Erro ao enviar arquivo para a API

1. Verifique se o arquivo foi gravado corretamente (verifique o `soundUri`)
2. Verifique se a API está recebendo o arquivo (verifique os logs do backend)
3. Verifique o formato do arquivo (deve ser wav, mp3, m4a ou ogg)

## Estrutura de Arquivos

```
frontend/umi/
├── services/
│   └── api.ts                    # Serviço de API
├── hooks/
│   └── use-audio-recorder.ts     # Hook de gravação de áudio
├── components/
│   ├── audio-recorder-button.tsx      # Botão de gravação
│   └── chord-detection-exercise.tsx   # Componente de exercício
└── app/
    └── (tabs)/
        └── licao.tsx             # Tela de lição (exemplo de uso)
```

