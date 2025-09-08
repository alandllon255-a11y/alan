export type GamificationEventPayload = {
  userId: string;
  targetId?: string;
  targetOwnerId?: string;
};

export type GamificationEventType =
  | 'ANSWER_UPVOTED'
  | 'SOLUTION_MARKED'
  | 'DAILY_LOGIN'
  | 'COMMENT_CREATED'
  | 'UPVOTE_GIVEN'
  | 'DOWNVOTE_GIVEN'
  | 'PROFILE_COMPLETED';

export type GamificationEvent = {
  type: GamificationEventType;
  payload: GamificationEventPayload;
  createdAt: string;
};

export function isGamificationEventType(val: string): val is GamificationEventType {
  return (
    val === 'ANSWER_UPVOTED' ||
    val === 'SOLUTION_MARKED' ||
    val === 'DAILY_LOGIN' ||
    val === 'COMMENT_CREATED' ||
    val === 'UPVOTE_GIVEN' ||
    val === 'DOWNVOTE_GIVEN' ||
    val === 'PROFILE_COMPLETED'
  );
}


