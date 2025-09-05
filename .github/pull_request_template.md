## Objetivo

Melhorias de qualidade (lint, tipagem, build, DX) no frontend, backend e CI.

## Mudanças Principais

- ESLint/Prettier configurados; scripts `lint`, `format`, `typecheck` adicionados
- CI (GitHub Actions): lint + typecheck + build
- Correção de ESM no backend Nest (imports com `.js` e NodeNext)
- Ajustes no `Dockerfile.backend` e `build` via `node` (Vite/TS)
- `.env.example` com variáveis relevantes
- Compose completo: `docker-compose.full.yml` (postgres, redis, backend, chat, frontend)
- Correções de código: toasts, blocos `catch` vazios, imports não usados
- Redução de warnings de hooks com `useCallback` e deps corretas

## Como Testar

### Local (sem Docker)
1. `npm install`
2. `npm run lint` (sem erros)
3. `npm run build` (gera `dist/` do frontend e compila backend)
4. Rodar dev: `npm run dev:all`

### Docker
1. `docker compose -f docker-compose.full.yml up -d`
2. `docker compose -f docker-compose.full.yml exec backend npx prisma migrate deploy`
3. `docker compose -f docker-compose.full.yml exec backend npm run db:seed`

## Notas

- Gamificação pode ser desativada via `ENABLE_GAMIFICATION=false`
- Warnings de hooks foram endereçados
- Próximo passo: cobertura de testes (Vitest/Jest) e hardening de tipagem

