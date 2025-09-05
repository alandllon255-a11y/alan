import { describe, it, expect } from 'vitest';
import { GamificationRulesService } from '../rules.service';

describe('GamificationRulesService', () => {
  it('retorna regra para ANSWER_UPVOTED', () => {
    const svc = new GamificationRulesService();
    const rule = svc.getRule('ANSWER_UPVOTED');
    expect(rule).toBeTruthy();
    expect(rule?.rep).toBeGreaterThanOrEqual(0);
  });

  it('retorna null para ação inexistente', () => {
    const svc = new GamificationRulesService();
    // @ts-expect-error testando valor inválido
    const rule = svc.getRule('UNKNOWN');
    expect(rule).toBeNull();
  });
});

