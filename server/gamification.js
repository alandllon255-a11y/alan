// Simple in-memory gamification event bus and worker (no DB)

import { adjustUserStats, addAchievement, getUserStats } from './state.js';

const queue = [];

export function publishEvent(type, payload) {
  queue.push({ type, payload, createdAt: new Date().toISOString() });
}

const rules = {
  ANSWER_UPVOTED: { rep: 10, currency: 1 },
  SOLUTION_MARKED: { rep: 50, currency: 0 },
  DAILY_LOGIN: { rep: 0, currency: 25, dailyLimit: 1 },
  COMMENT_CREATED: { rep: 0, currency: 5, dailyLimit: 20 },
  UPVOTE_GIVEN: { rep: 1, currency: 2, dailyLimit: 50 },
  DOWNVOTE_GIVEN: { rep: -2, currency: -1, dailyLimit: 50 },
  PROFILE_COMPLETED: { rep: 0, currency: 100, dailyLimit: 1 },
};

export function startGamificationWorker() {
  // Simple daily counters: { dateKey: Map<userId, Map<actionType, count>> }
  const counters = new Map();
  const getDateKey = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
  const getAndInc = (userId, actionType) => {
    const dateKey = getDateKey();
    if (!counters.has(dateKey)) counters.set(dateKey, new Map());
    const byUser = counters.get(dateKey);
    if (!byUser.has(userId)) byUser.set(userId, new Map());
    const byAction = byUser.get(userId);
    const old = byAction.get(actionType) || 0;
    byAction.set(actionType, old + 1);
    return old + 1;
  };

  setInterval(() => {
    const batch = queue.splice(0, 50);
    if (batch.length === 0) return;
    for (const evt of batch) {
      const rule = rules[evt.type];
      if (!rule) continue;
      const userId = evt.payload?.userId;
      if (!userId) continue;

      // Basic self-abuse prevention example
      if (evt.type === 'ANSWER_UPVOTED' && evt.payload?.targetOwnerId && evt.payload.targetOwnerId === userId) {
        console.log(`[GAMIFY] skipped self-upvote reward for user=${userId}`);
        continue;
      }

      // Daily limit enforcement (in-memory)
      if (rule.dailyLimit && rule.dailyLimit > 0) {
        const newCount = getAndInc(userId, evt.type);
        if (newCount > rule.dailyLimit) {
          console.log(`[GAMIFY] limit reached for user=${userId} action=${evt.type} count=${newCount}/${rule.dailyLimit}`);
          continue;
        }
      }

      // Negative currency requires sufficient balance
      if (rule.currency < 0) {
        const stats = getUserStats(userId);
        const needed = Math.abs(rule.currency);
        if (stats.currencyBalance < needed) {
          console.log(`[GAMIFY] insufficient balance for debit user=${userId} need=${needed} has=${stats.currencyBalance}`);
          continue;
        }
      }
      // Apply to in-memory state
      const s = adjustUserStats(userId, rule.rep, rule.currency);
      // Simple example achievements
      if (evt.type === 'SOLUTION_MARKED') addAchievement(evt.payload?.targetOwnerId || userId, 'GOOD_SAMARITAN');
      if (evt.type === 'DAILY_LOGIN') addAchievement(userId, 'PERSISTENT_USER');
      console.log(`[GAMIFY] ${evt.type} user=${userId} → rep=${s.reputationPoints}, coins=${s.currencyBalance}, lvl=${s.currentLevel}`);
    }
  }, 1000);
}


