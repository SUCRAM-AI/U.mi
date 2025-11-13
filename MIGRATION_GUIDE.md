# Guia de Migração: React Vite → React Expo

Este guia documenta a migração do projeto de React Vite para React Expo.

## 📁 Estrutura

O projeto agora possui duas versões:

- **`frontend/`** - Versão original React Vite (web)
- **`frontend-expo/`** - Nova versão React Expo (mobile)

## 🔄 Principais Mudanças

### 1. Roteamento

**Antes (React Router):**
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
<Route path="/apprentice" element={<Apprentice />} />
```

**Depois (Expo Router):**
```tsx
// Roteamento baseado em arquivos
app/(tabs)/apprentice.tsx → /apprentice
```

### 2. Componentes UI

**Antes (Web Components):**
```tsx
import { Button } from "@/components/ui/button";
<Button onClick={handleClick}>Clique</Button>
```

**Depois (React Native):**
```tsx
import { TouchableOpacity, Text } from 'react-native';
<TouchableOpacity onPress={handlePress}>
  <Text>Clique</Text>
</TouchableOpacity>
```

### 3. Gravação de Áudio

**Antes (MediaRecorder API):**
```tsx
const mediaRecorder = new MediaRecorder(stream);
```

**Depois (expo-av):**
```tsx
import { Audio } from 'expo-av';
const { recording } = await Audio.Recording.createAsync(...);
```

### 4. Upload de Arquivos

**Antes (HTML Input):**
```tsx
<input type="file" onChange={handleFileUpload} />
```

**Depois (expo-document-picker):**
```tsx
import * as DocumentPicker from 'expo-document-picker';
const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
```

### 5. Estilização

**Antes (Tailwind CSS):**
```tsx
<div className="bg-primary rounded-lg p-4">
```

**Depois (StyleSheet):**
```tsx
<View style={styles.container}>
// ...
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#7E22CE',
    borderRadius: 8,
    padding: 16,
  },
});
```

### 6. Navegação

**Antes (useNavigate):**
```tsx
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/dashboard');
```

**Depois (expo-router):**
```tsx
import { useRouter } from 'expo-router';
const router = useRouter();
router.push('/dashboard');
```

### 7. Notificações

**Antes (Sonner/Toast):**
```tsx
import { toast } from 'sonner';
toast.success('Sucesso!');
```

**Depois (Alert):**
```tsx
import { Alert } from 'react-native';
Alert.alert('Sucesso!', 'Operação concluída');
```

## 📦 Dependências

### Removidas (Web)
- `react-router-dom`
- `lucide-react` (substituído por `@expo/vector-icons`)
- `framer-motion` (não disponível no React Native)
- `sonner` (substituído por `Alert`)
- Componentes shadcn/ui (substituídos por componentes nativos)

### Adicionadas (Expo)
- `expo`
- `expo-av`
- `expo-router`
- `expo-document-picker`
- `@expo/vector-icons`
- `react-native-safe-area-context`
- `react-native-screens`

## 🚀 Como Usar

### Desenvolvimento

1. **Backend (obrigatório):**
   ```bash
   cd backend
   python api.py
   ```

2. **Frontend Expo:**
   ```bash
   cd frontend-expo
   npm install
   npm start
   ```

3. **Escolha a plataforma:**
   - Pressione `a` para Android
   - Pressione `i` para iOS
   - Pressione `w` para Web

### Build

```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

## ⚠️ Limitações e Considerações

1. **Componentes UI:** Todos os componentes shadcn/ui precisaram ser reescritos usando componentes React Native nativos.

2. **Animações:** `framer-motion` não está disponível. Use `react-native-reanimated` ou `Animated` do React Native.

3. **Estilização:** Tailwind CSS não funciona diretamente. Use `StyleSheet` do React Native.

4. **Formato de Áudio:** O Expo grava em formato nativo do dispositivo. O backend pode precisar de ajustes para aceitar diferentes formatos.

5. **Permissões:** Configure permissões no `app.json`:
   - Microfone (gravação)
   - Armazenamento (upload de arquivos)

## 🔗 Arquivos Migrados

- ✅ `app/_layout.tsx` - Layout raiz
- ✅ `app/(tabs)/dashboard.tsx` - Dashboard
- ✅ `app/(tabs)/apprentice.tsx` - Modo Aprendiz
- ✅ `app/(tabs)/music.tsx` - Modo Música
- ✅ `hooks/use-audio-recorder.ts` - Hook de gravação
- ✅ `services/api.ts` - Serviço de API

## 📝 Próximos Passos

1. Adicionar mais páginas conforme necessário
2. Implementar animações com `react-native-reanimated`
3. Adicionar tema/claro-escuro
4. Otimizar performance
5. Adicionar testes

## 🆘 Suporte

Para problemas específicos do Expo, consulte:
- [Documentação do Expo](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [expo-av](https://docs.expo.dev/versions/latest/sdk/av/)

