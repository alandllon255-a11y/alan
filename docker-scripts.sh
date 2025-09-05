#!/bin/bash

# Scripts para gerenciar o ambiente Docker

case "$1" in
  "start")
    echo "🚀 Iniciando todos os serviços..."
    docker-compose up -d
    echo "✅ Serviços iniciados!"
    echo "📊 Acesse:"
    echo "   Frontend: http://localhost:5173"
    echo "   Backend: http://localhost:4000"
    echo "   Chat: http://localhost:3001"
    ;;
  
  "stop")
    echo "🛑 Parando todos os serviços..."
    docker-compose down
    echo "✅ Serviços parados!"
    ;;
  
  "restart")
    echo "🔄 Reiniciando todos os serviços..."
    docker-compose down
    docker-compose up -d
    echo "✅ Serviços reiniciados!"
    ;;
  
  "logs")
    echo "📋 Mostrando logs dos serviços..."
    docker-compose logs -f
    ;;
  
  "logs-backend")
    echo "📋 Mostrando logs do backend..."
    docker-compose logs -f backend
    ;;
  
  "logs-chat")
    echo "📋 Mostrando logs do chat..."
    docker-compose logs -f chat-server
    ;;
  
  "logs-frontend")
    echo "📋 Mostrando logs do frontend..."
    docker-compose logs -f frontend
    ;;
  
  "build")
    echo "🔨 Construindo todas as imagens..."
    docker-compose build
    echo "✅ Imagens construídas!"
    ;;
  
  "clean")
    echo "🧹 Limpando containers e volumes..."
    docker-compose down -v
    docker system prune -f
    echo "✅ Limpeza concluída!"
    ;;
  
  "db-migrate")
    echo "🗄️ Executando migrações do banco..."
    docker-compose exec backend npx prisma migrate deploy
    echo "✅ Migrações executadas!"
    ;;
  
  "db-seed")
    echo "🌱 Populando banco com dados de exemplo..."
    docker-compose exec backend npm run db:seed
    echo "✅ Banco populado!"
    ;;
  
  "db-reset")
    echo "🔄 Resetando banco de dados..."
    docker-compose exec backend npx prisma migrate reset --force
    docker-compose exec backend npm run db:seed
    echo "✅ Banco resetado e populado!"
    ;;
  
  "shell-backend")
    echo "🐚 Abrindo shell do backend..."
    docker-compose exec backend sh
    ;;
  
  "shell-chat")
    echo "🐚 Abrindo shell do chat..."
    docker-compose exec chat-server sh
    ;;
  
  "shell-frontend")
    echo "🐚 Abrindo shell do frontend..."
    docker-compose exec frontend sh
    ;;
  
  "status")
    echo "📊 Status dos serviços:"
    docker-compose ps
    ;;
  
  *)
    echo "🐳 Scripts Docker para DevForum"
    echo ""
    echo "Uso: ./docker-scripts.sh [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  start        - Inicia todos os serviços"
    echo "  stop         - Para todos os serviços"
    echo "  restart      - Reinicia todos os serviços"
    echo "  logs         - Mostra logs de todos os serviços"
    echo "  logs-backend - Mostra logs do backend"
    echo "  logs-chat    - Mostra logs do chat"
    echo "  logs-frontend- Mostra logs do frontend"
    echo "  build        - Constrói todas as imagens"
    echo "  clean        - Limpa containers e volumes"
    echo "  db-migrate   - Executa migrações do banco"
    echo "  db-seed      - Popula banco com dados de exemplo"
    echo "  db-reset     - Reseta e popula o banco"
    echo "  shell-backend- Abre shell do backend"
    echo "  shell-chat   - Abre shell do chat"
    echo "  shell-frontend- Abre shell do frontend"
    echo "  status       - Mostra status dos serviços"
    ;;
esac
