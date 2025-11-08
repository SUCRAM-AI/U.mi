# Guia de Debug - Problemas de Conexão Frontend-Backend

## ✅ Status Atual

- ✅ Backend funcionando perfeitamente (testado com `test_api.py`)
- ✅ Banco de dados funcionando (testado com `test_db.py`)
- ⚠️ Frontend pode não estar conseguindo se conectar

## 🔍 Passos para Diagnosticar

### 1. Verificar se o Backend está acessível

No terminal do backend, você deve ver logs quando fizer requisições:
```bash
cd backend
python api.py
```

### 2. Verificar Logs do Frontend

Abra o console do navegador/app e procure por:
- `🌐 [API] Fazendo requisição para: ...`
- `🔐 [LOGIN] Iniciando login com: ...`
- `📝 [REGISTER] Iniciando cadastro com: ...`

### 3. Testar Conectividade

#### No Navegador (Web)
1. Abra o DevTools (F12)
2. Vá para a aba "Network"
3. Tente fazer login/cadastro
4. Veja se a requisição aparece e qual o status

#### No App (React Native)
1. Abra o console do Expo/Metro
2. Procure por logs de requisição
3. Verifique se há erros de rede

### 4. Verificar IP e Porta

Certifique-se de que:
- O IP no `api.ts` está correto: `http://192.168.0.14:5000/api`
- O backend está rodando na porta 5000
- Ambos (frontend e backend) estão na mesma rede

### 5. Testar Health Check

Adicione este código temporariamente na tela de login para testar:

```typescript
import { healthCheck } from '../services/api';

// No useEffect ou ao carregar a tela
useEffect(() => {
  healthCheck()
    .then(result => console.log('✅ API OK:', result))
    .catch(error => console.error('❌ API Erro:', error));
}, []);
```

## 🐛 Problemas Comuns

### Problema: "Network request failed"
**Causa**: Frontend não consegue alcançar o backend
**Solução**:
1. Verifique se o IP está correto
2. Verifique se o backend está rodando
3. Verifique firewall/antivírus
4. Para Android/iOS, use o IP da máquina, não `localhost`

### Problema: "CORS policy"
**Causa**: CORS bloqueando requisições
**Solução**: Já configurado no backend, mas se persistir:
- Verifique se `flask-cors` está instalado
- Reinicie o backend

### Problema: Requisições não aparecem no terminal do backend
**Causa**: Requisições não estão chegando ao backend
**Solução**:
1. Verifique a URL no `api.ts`
2. Teste com `curl` ou `test_api.py`
3. Verifique se há proxy/VPN interferindo

### Problema: Status 200 mas retorna 401
**Causa**: Resposta está sendo processada incorretamente
**Solução**: Já corrigido no código - verifique os logs

## 🧪 Testes Rápidos

### Teste 1: Health Check via curl
```bash
curl http://192.168.0.14:5000/api/health
```

### Teste 2: Login via curl
```bash
curl -X POST http://192.168.0.14:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","password":"senha123"}'
```

### Teste 3: Verificar se porta está aberta
```bash
# Linux/Mac
nc -zv 192.168.0.14 5000

# Ou
telnet 192.168.0.14 5000
```

## 📝 Checklist

- [ ] Backend está rodando (`python api.py`)
- [ ] Backend responde a `test_api.py`
- [ ] IP no `api.ts` está correto
- [ ] Frontend e backend na mesma rede
- [ ] Firewall não está bloqueando porta 5000
- [ ] Logs aparecem no console do frontend
- [ ] Logs aparecem no terminal do backend

## 🎯 Próximos Passos

1. Execute o backend: `cd backend && python api.py`
2. Abra o console do navegador/app
3. Tente fazer login/cadastro
4. Compartilhe os logs que aparecem (tanto frontend quanto backend)

