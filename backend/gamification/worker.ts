import { EventTriggerService } from './event-trigger.service';
import { GamificationRulesService } from './rules.service';
import { ReputationService } from './reputation.service';
import { CurrencyService } from './currency.service';

/**
 * Background worker stub that drains the in-memory queue and applies rules.
 * Replace drain with real queue (Redis/RabbitMQ) in production.
 */
export class GamificationWorker {
  private readonly rules = new GamificationRulesService();
  private readonly reputation = new ReputationService();
  private readonly currency = new CurrencyService();

  async tick() {
    const batch = EventTriggerService.drain(100);
    for (const evt of batch) {
      const rule = this.rules.getRule(evt.type as any);
      if (!rule) continue;

      // NOTE: daily limits and validations should be done here.
      // We will wire the daily limit check in Passo 4 (consultando logs).

      if (rule.rep !== 0) {
        await this.reputation.grantReputation(evt.payload.userId, rule.rep, evt.type, evt.payload.targetId);
      }
      if (rule.currency !== 0) {
        if (rule.currency > 0) {
          await this.currency.credit(evt.payload.userId, rule.currency, evt.type, evt.payload.targetId);
        } else {
          await this.currency.debit(evt.payload.userId, Math.abs(rule.currency), `${evt.type}`);
        }
      }
    }
  }
}


