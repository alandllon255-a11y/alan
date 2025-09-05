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


