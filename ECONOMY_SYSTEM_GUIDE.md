# Sistema de Economia DevForum - Guia Completo

## 🎯 Visão Geral

O DevForum agora possui um sistema completo de economia virtual com **DevCoins (₫)**, sistema de níveis, badges e recompensas baseadas em interações dos usuários.

## 💰 Moeda Virtual: DevCoins

### Características
- **Nome**: DevCoins
- **Símbolo**: ₫
- **Propósito**: Recompensar engajamento e qualidade do conteúdo
- **Economia Saudável**: Sistema de inflação/deflação automático

### Como Ganhar DevCoins

| Ação | Recompensa | Descrição |
|------|------------|-----------|
| **Criar Pergunta** | ₫10 | Por fazer uma nova pergunta |
| **Criar Resposta** | ₫15 | Por responder uma pergunta |
| **Resposta Aceita** | ₫50 | Quando sua resposta é aceita |
| **Receber Voto** | ₫5 | Por cada voto positivo recebido |
| **Dar Voto** | ₫1 | Por votar em conteúdo |
| **Login Diário** | ₫20 | Por acessar o site diariamente |
| **Perfil Completo** | ₫100 | Ao completar todas as informações |
| **Resposta Útil** | ₫25 | Resposta com 10+ votos |
| **Pergunta Popular** | ₫30 | Pergunta com 50+ visualizações |
| **Streak 7 dias** | ₫100 | Login por 7 dias seguidos |
| **Streak 30 dias** | ₫500 | Login por 30 dias seguidos |
| **Subir de Nível** | ₫200 | Bônus ao atingir novo nível |
| **Badge Desbloqueado** | ₫100 | Por cada conquista |

## 🏆 Sistema de Níveis

### Progressão de Níveis

| Nível | Nome | XP Necessário | Cor |
|-------|------|---------------|-----|
| 1 | Iniciante | 0 | Cinza |
| 2 | Aprendiz | 100 | Verde |
| 3 | Desenvolvedor Jr | 300 | Azul |
| 4 | Desenvolvedor | 600 | Roxo |
| 5 | Desenvolvedor Sr | 1000 | Laranja |
| 6 | Expert | 1500 | Vermelho |
| 7 | Mestre | 2500 | Amarelo |
| 8 | Guru | 4000 | Rosa |
| 9 | Lenda | 6000 | Índigo |
| 10 | Mítico | 10000 | Gradiente |

### Como Ganhar XP
- **XP = 50% das moedas ganhas**
- Exemplo: Ganhar ₫20 = +10 XP
- **Bônus de nível**: +₫200 ao subir de nível

## 🎖️ Sistema de Badges/Conquistas

### Badges Disponíveis

| Badge | Ícone | Requisito | Recompensa |
|-------|-------|-----------|------------|
| **Primeiros Passos** | 🎯 | Completar perfil | ₫100 + 50 XP |
| **Ajudante** | 🤝 | 5 respostas aceitas | ₫300 + 200 XP |
| **Popular** | ⭐ | 100 votos positivos | ₫500 + 300 XP |
| **Mestre da Consistência** | 🔥 | 30 dias de login | ₫1000 + 500 XP |
| **Guru do Código** | 💻 | 50 respostas | ₫2000 + 1000 XP |

## 🏪 Loja de Recompensas (Futuro)

### Itens Planejados

| Item | Custo | Tipo | Descrição |
|------|-------|------|-----------|
| **Tema Purple Dark** | ₫500 | Tema | Tema exclusivo roxo escuro |
| **Moldura Dourada** | ₫1000 | Cosmético | Moldura dourada para perfil |
| **Boost XP 2x (1h)** | ₫300 | Boost | Dobre XP por 1 hora |
| **Destacar Post** | ₫200 | Utilitário | Destaque post por 24h |

## 📊 Interface do Sistema

### Header - Exibição da Economia
```
┌─────────────────────────────────────────┐
│ [₫1,250] [🏆 Nível 3] [████░░░░] 450/600 XP │
└─────────────────────────────────────────┘
```

### Notificações de Recompensas
```
┌─────────────────────────────────────┐
│ 💰 Pergunta Criada                  │
│ +₫10 DevCoins, +5 XP               │
└─────────────────────────────────────┘
```

## 🔄 Integração com Ações

### Ações que Geram Recompensas

1. **Criar Pergunta**
   - Recompensa: ₫10 + 5 XP
   - Trigger: `rewardUserAction('CREATE_QUESTION')`

2. **Votar em Pergunta**
   - Quem vota: ₫1 + 0.5 XP
   - Quem recebe: ₫5 + 2.5 XP
   - Trigger: `rewardUserAction('VOTE_GIVEN')` / `rewardUserAction('VOTE_RECEIVED')`

3. **Login Diário**
   - Recompensa: ₫20 + 10 XP
   - Bônus streak: ₫100 (7 dias) / ₫500 (30 dias)
   - Trigger: Automático no `useEconomy`

## 🏥 Saúde da Economia

### Métricas Monitoradas
- **Total de moedas em circulação**
- **Moedas por usuário médio**
- **Velocidade de circulação**
- **Distribuição de riqueza**

### Recomendações Automáticas
- **Inflação alta**: Aumentar custos na loja
- **Deflação**: Aumentar recompensas temporariamente
- **Baixa circulação**: Criar mais utilidades
- **Alta circulação**: Adicionar cooldowns

## 🎮 Gamificação

### Elementos de Jogo
- **Progressão visual**: Barras de XP animadas
- **Feedback imediato**: Notificações de recompensas
- **Status social**: Níveis visíveis no perfil
- **Conquistas**: Badges colecionáveis
- **Competição**: Ranking global (futuro)

### Psicologia Aplicada
- **Recompensa variável**: Diferentes valores por ação
- **Progressão clara**: Níveis bem definidos
- **Feedback positivo**: Sempre recompensar engajamento
- **Status social**: Níveis visíveis para outros usuários

## 🔧 Implementação Técnica

### Arquivos Principais
- `src/services/economyService.js` - Lógica da economia
- `src/hooks/useEconomy.js` - Hook React para economia
- `src/components/economy/EconomyDisplay.jsx` - Exibição no header
- `src/components/economy/RewardNotifications.jsx` - Notificações

### Persistência
- **LocalStorage**: Dados do usuário atual
- **Futuro**: API backend para dados globais

### Performance
- **Cálculos otimizados**: useMemo para níveis
- **Notificações limitadas**: Máximo 10 simultâneas
- **Transações em lote**: Agrupar ações similares

## 🚀 Próximas Funcionalidades

### Fase 2 - Ranking e Competição
- [ ] Leaderboard global
- [ ] Ranking por categoria
- [ ] Torneios semanais
- [ ] Desafios especiais

### Fase 3 - Loja Avançada
- [ ] Temas personalizados
- [ ] Avatares exclusivos
- [ ] Boosts temporários
- [ ] Itens de utilidade

### Fase 4 - Economia Social
- [ ] Transferência entre usuários
- [ ] Doações para projetos
- [ ] Sistema de propinas
- [ ] Mercado de itens

## 📈 Métricas de Sucesso

### KPIs Principais
- **Engajamento**: +40% em interações
- **Retenção**: +25% em logins diários
- **Qualidade**: +30% em respostas aceitas
- **Satisfação**: +50% em tempo na plataforma

### Monitoramento
- **Dashboard em tempo real**
- **Relatórios semanais**
- **Alertas de anomalias**
- **A/B testing de recompensas**

## 🎉 Resultado Esperado

O sistema de economia transforma o DevForum em uma plataforma mais engajante e recompensadora, onde:

- ✅ **Usuários são recompensados** por contribuir com qualidade
- ✅ **Engajamento aumenta** através de gamificação
- ✅ **Comunidade cresce** com incentivos claros
- ✅ **Conteúdo melhora** com sistema de reputação
- ✅ **Retenção aumenta** com progressão visível

A economia virtual cria um ciclo virtuoso onde **qualidade gera recompensas**, **recompensas geram engajamento**, e **engajamento gera mais qualidade**! 🚀
