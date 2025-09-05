export type RuleDefinition = {
  rep: number;
  currency: number;
  dailyLimit?: number;
};

export type RuleKey =
  | 'ANSWER_UPVOTED'
  | 'SOLUTION_MARKED'
  | 'DAILY_LOGIN'
  | 'COMMENT_CREATED'
  | 'UPVOTE_GIVEN'
  | 'DOWNVOTE_GIVEN'
  | 'PROFILE_COMPLETED';

export class GamificationRulesService {
  // Central rules map
  private readonly rules: Record<RuleKey, RuleDefinition> = {
    ANSWER_UPVOTED: { rep: 10, currency: 1 },
    SOLUTION_MARKED: { rep: 50, currency: 0 },
    DAILY_LOGIN: { rep: 0, currency: 25, dailyLimit: 1 },
    COMMENT_CREATED: { rep: 0, currency: 5, dailyLimit: 20 },
    UPVOTE_GIVEN: { rep: 1, currency: 2, dailyLimit: 50 },
    DOWNVOTE_GIVEN: { rep: -2, currency: -1, dailyLimit: 50 },
    PROFILE_COMPLETED: { rep: 0, currency: 100, dailyLimit: 1 },
  };

  getRule(action: RuleKey): RuleDefinition | null {
    return this.rules[action] ?? null;
  }
}


