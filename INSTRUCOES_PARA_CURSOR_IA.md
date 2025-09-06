## Instruções para Cursor IA

Estas instruções documentam como preparar o ambiente, rodar cada serviço (backend, chat e frontend), o que foi alterado nesta sessão e o que ainda falta fazer. Use-as para automação no Cursor.

### Requisitos
- Node.js 18+ (recomendado 18 LTS; evitar ts-node com Node 22)
- npm (v10+)
- PostgreSQL 15+
- Redis 7+

Opcional (containers):
- Docker e Docker Compose (para usar `docker-compose.full.yml`)

### Variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/devforum
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
BACKEND_PORT=4000
ENABLE_GAMIFICATION=true
```

Frontend/Chat (dev):
- `VITE_API_URL`: URL base do chat/API (HTTP) — ex.: `http://localhost:3001`
- `VITE_CHAT_URL`: URL do Socket.IO — ex.: `http://localhost:3001`

### Instalação
```
npm install
npm run prisma:generate
npm run prisma:migrate
```

Se o banco ainda não existir:
```
createdb devforum
```

Para popular dados de exemplo (opcional):
```
npm run build:backend
npm run db:seed
```

### Executar Backend (recomendado: compilado)
Usar o backend compilado evita problemas do ts-node com Node 22.

```
npm run build:backend
node dist/backend/main.js
```

Backend escuta em: `http://localhost:${BACKEND_PORT:-4000}/api`

Testes rápidos:
```
curl -s http://localhost:4000/api/users/profile -H 'x-user-id: 7'
curl -s 'http://localhost:4000/api/v1/leaderboard?type=rep'
```

Caso prefira rodar no modo dev (hot-reload), use Node 18 LTS:
```
npm run nest:dev
```

### Executar Chat Server
O chat pode operar de forma autônoma (in-memory) ou encaminhar eventos de gamificação para o backend Nest.

Encaminhando para o backend Nest (recomendado):
```
PORT=3001 \
USE_NEST_GAMIFY=true \
NEST_BASE_URL=http://localhost:4000/api \
npm run chat-server
```

Chat HTTP/Socket: `http://localhost:3001`

Testes rápidos:
```
curl -s http://localhost:3001/
curl -s http://localhost:3001/api/users
```

### Executar Frontend (Vite)
```
VITE_API_URL=http://localhost:3001 \
VITE_CHAT_URL=http://localhost:3001 \
npm run dev
```

Frontend: `http://localhost:5173`

### Via Docker (stack completa)
Requer Docker/Compose instalados.

```
docker-compose -f docker-compose.full.yml up -d
```

Serviços provisionados: Postgres, Redis, Backend, Chat e Frontend.

Comandos auxiliares (package.json):
- `npm run docker:start` / `npm run docker:stop`
- `npm run docker:db-migrate` / `npm run docker:db-seed`

### O que foi feito nesta sessão
- Instalado e iniciado PostgreSQL e Redis localmente.
- Gerado Prisma Client e aplicadas migrações (`prisma:migrate`).
- Seed executado com sucesso (`db:seed`).
- Backend foi iniciado compilado; estava em conflito na porta 4000 e foi validado na 4001. Motivo: processo ocupando 4000. Conclusão: o erro de dev inicial era do ambiente ts-node com Node 22, não do código.
- Chat e Frontend foram iniciados no ambiente remoto e testados localmente; acesso via navegador externo requer rodar localmente ou usar túnel.

### Alterações realizadas em arquivos
- Criado `.env` com `DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`, `BACKEND_PORT`, `ENABLE_GAMIFICATION`.
- Nenhum ajuste de código-fonte foi necessário para rodar compilado; mantidas as configurações existentes de `package.json`, `Dockerfile.*` e `docker-compose*`.
- Este documento adicionado: `INSTRUCOES_PARA_CURSOR_IA.md`.

### Pendências e próximos passos
- Porta 4000 opcionalmente padronizada: encerrar qualquer processo ocupando 4000 e iniciar o backend com `BACKEND_PORT=4000`.
- Se quiser hot-reload do Nest, usar Node 18 LTS ou ajustar `ts-node/esm` para Node 22 (não recomendado no momento).
- Configurar autenticação real (JWT) e proteger endpoints (há placeholders para `JWT_SECRET` em `docker-compose.full.yml`).
- Observabilidade: adicionar logs estruturados, métricas e healthchecks.
- Busca avançada: considerar Meilisearch/OpenSearch se necessário.

### Diagnóstico rápido (checklist)
1) Banco:
```
psql "${DATABASE_URL}"
```
2) Redis:
```
redis-cli ping
```
3) Prisma:
```
npm run prisma:generate && npm run prisma:migrate
```
4) Backend (compilado):
```
npm run build:backend && node dist/backend/main.js
```
5) Chat e Frontend:
```
PORT=3001 USE_NEST_GAMIFY=true NEST_BASE_URL=http://localhost:4000/api npm run chat-server
VITE_API_URL=http://localhost:3001 VITE_CHAT_URL=http://localhost:3001 npm run dev
```

### Observações importantes
- O schema Prisma está preparado para PostgreSQL (UUID, enums, cascades, índices).
- Redis é usado para BullMQ (fila de gamificação) quando `ENABLE_GAMIFICATION=true`.
- Em dev remoto, `localhost` do servidor não é acessível do seu navegador; rode localmente ou exponha túneis.

