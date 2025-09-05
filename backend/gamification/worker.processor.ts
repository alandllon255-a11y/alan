import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { GAMIFICATION_QUEUE } from './gamification.constants.js';
import { GamificationRulesService } from './rules.service.js';
import { ReputationService } from './reputation.service.js';
import { CurrencyService } from './currency.service.js';

@Processor(GAMIFICATION_QUEUE)
export class GamificationProcessor extends WorkerHost {
  private readonly rules = new GamificationRulesService();
  private readonly reputation = new ReputationService();
  private readonly currency = new CurrencyService();

  async process(job: Job): Promise<void> {
    const { type, payload } = job.data as { type: any; payload: any };
    const rule = this.rules.getRule(type);
    if (!rule) return;

    // NOTE: Daily limits e validações completas serão feitas via DB no Passo 4
    if (rule.rep !== 0) {
      await this.reputation.grantReputation(payload.userId, rule.rep, type, payload.targetId);
    }
    if (rule.currency !== 0) {
      if (rule.currency > 0) {
        await this.currency.credit(payload.userId, rule.currency, type, payload.targetId);
      } else {
        await this.currency.debit(payload.userId, Math.abs(rule.currency), `${type}`);
      }
    }
  }
}


