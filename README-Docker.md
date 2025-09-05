# 🐳 DevForum - Guia Docker

Este guia mostra como executar todo o sistema DevForum usando apenas Docker.

## 📋 Pré-requisitos

- Docker instalado
- Docker Compose instalado

## 🚀 Início Rápido

### 1. Clonar e navegar para o projeto
```bash
cd devforum-app
```

### 2. Dar permissão de execução aos scripts
```bash
chmod +x docker-scripts.sh
```

### 3. Iniciar todos os serviços
```bash
./docker-scripts.sh start
```

### 4. Executar migrações do banco
```bash
./docker-scripts.sh db-migrate
```

### 5. Popular banco com dados de exemplo
```bash
./docker-scripts.sh db-seed
```

### 6. Acessar a aplicação
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4000
- **Chat Server:** http://localhost:3001

## 🛠️ Comandos Disponíveis

### Gerenciamento de Serviços
```bash
# Iniciar todos os serviços
./docker-scripts.sh start

# Parar todos os serviços
./docker-scripts.sh stop

# Reiniciar todos os serviços
./docker-scripts.sh restart

# Ver status dos serviços
./docker-scripts.sh status
```

### Logs
```bash
# Ver logs de todos os serviços
./docker-scripts.sh logs

# Ver logs específicos
./docker-scripts.sh logs-backend
./docker-scripts.sh logs-chat
./docker-scripts.sh logs-frontend
```

### Banco de Dados
```bash
# Executar migrações
./docker-scripts.sh db-migrate

# Popular com dados de exemplo
./docker-scripts.sh db-seed

# Resetar e popular banco
./docker-scripts.sh db-reset
```

### Desenvolvimento
```bash
# Construir imagens
./docker-scripts.sh build

# Limpar containers e volumes
./docker-scripts.sh clean

# Abrir shell nos containers
./docker-scripts.sh shell-backend
./docker-scripts.sh shell-chat
./docker-scripts.sh shell-frontend
```

## 📊 Estrutura dos Serviços

### 🗄️ PostgreSQL (Porta 5432)
- Banco de dados principal
- Dados persistentes em volume `pgdata`

### 🔴 Redis (Porta 6379)
- Cache e filas BullMQ
- Dados persistentes em volume `redisdata`

### 🚀 Backend NestJS (Porta 4000)
- API REST
- Sistema de gamificação
- Processamento de filas

### 💬 Chat Server (Porta 3001)
- WebSocket para chat em tempo real
- Rate limiting
- Integração com gamificação

### ⚛️ Frontend React (Porta 5173)
- Interface do usuário
- Hot reload em desenvolvimento

## 🔧 Configurações

### Variáveis de Ambiente
As configurações estão no `docker-compose.yml`:

```yaml
environment:
  - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/devforum
  - REDIS_HOST=redis
  - JWT_SECRET=your-super-secret-jwt-key
```

### Volumes
- `pgdata`: Dados do PostgreSQL
- `redisdata`: Dados do Redis
- Código fonte montado para hot reload

## 🐛 Troubleshooting

### Serviços não iniciam
```bash
# Ver logs de erro
./docker-scripts.sh logs

# Verificar status
./docker-scripts.sh status

# Limpar e reconstruir
./docker-scripts.sh clean
./docker-scripts.sh build
./docker-scripts.sh start
```

### Problemas de banco
```bash
# Resetar banco completamente
./docker-scripts.sh db-reset

# Verificar conexão
./docker-scripts.sh shell-backend
npx prisma db pull
```

### Problemas de rede
```bash
# Verificar rede Docker
docker network ls
docker network inspect devforum_devforum-network
```

## 📈 Monitoramento

### Verificar saúde dos serviços
```bash
# Status dos containers
docker-compose ps

# Uso de recursos
docker stats

# Logs em tempo real
./docker-scripts.sh logs
```

### Acessar banco diretamente
```bash
# Conectar ao PostgreSQL
docker-compose exec postgres psql -U postgres -d devforum

# Conectar ao Redis
docker-compose exec redis redis-cli
```

## 🔄 Desenvolvimento

### Hot Reload
- Frontend: Código montado como volume
- Backend: Código montado como volume
- Chat: Código montado como volume

### Debugging
```bash
# Entrar no container do backend
./docker-scripts.sh shell-backend

# Executar comandos Prisma
npx prisma studio
npx prisma db seed
```

## 🚀 Produção

Para produção, modifique:
1. Variáveis de ambiente
2. Configurações de rede
3. Volumes persistentes
4. Recursos de CPU/memória

## 📝 Notas

- Todos os serviços usam a rede `devforum-network`
- Dados são persistentes entre reinicializações
- Logs são centralizados no Docker
- Desenvolvimento com hot reload ativo
