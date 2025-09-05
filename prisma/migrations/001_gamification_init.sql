-- 001_gamification_init.sql

-- 1) Enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gamification_action_type') THEN
    CREATE TYPE gamification_action_type AS ENUM (
      'ANSWER_UPVOTED',
      'SOLUTION_MARKED',
      'DAILY_LOGIN',
      'COMMENT_CREATED',
      'PROFILE_COMPLETED',
      'UPVOTE_GIVEN',
      'DOWNVOTE_GIVEN'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'achievement_code') THEN
    CREATE TYPE achievement_code AS ENUM (
      'GOOD_SAMARITAN',
      'PERSISTENT_USER',
      'MENTOR',
      'CURATOR',
      'PIONEER',
      'NIGHT_OWL'
    );
  END IF;
END $$;

-- 2) Alterar tabela users: novos campos + CHECKs
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "reputation_points" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "currency_balance"  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "current_level"     INTEGER NOT NULL DEFAULT 1;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_users_reputation_points_non_negative'
  ) THEN
    ALTER TABLE "users"
    ADD CONSTRAINT chk_users_reputation_points_non_negative
    CHECK ("reputation_points" >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_users_currency_balance_non_negative'
  ) THEN
    ALTER TABLE "users"
    ADD CONSTRAINT chk_users_currency_balance_non_negative
    CHECK ("currency_balance" >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_users_current_level_positive'
  ) THEN
    ALTER TABLE "users"
    ADD CONSTRAINT chk_users_current_level_positive
    CHECK ("current_level" >= 1);
  END IF;
END $$;

-- 3) Tabela de logs de gamificação
CREATE TABLE IF NOT EXISTS "gamification_action_log" (
  "id"                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"           UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "action_type"       gamification_action_type NOT NULL,
  "rep_change"        INTEGER NOT NULL,
  "currency_change"   INTEGER NOT NULL,
  "related_entity_id" TEXT NULL,
  "processed_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "metadata"          JSONB NULL,
  "created_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gam_act_user_id
  ON "gamification_action_log" ("user_id");
CREATE INDEX IF NOT EXISTS idx_gam_act_action_type
  ON "gamification_action_log" ("action_type");
CREATE INDEX IF NOT EXISTS idx_gam_act_created_at
  ON "gamification_action_log" ("created_at");
CREATE INDEX IF NOT EXISTS idx_gam_act_user_action_created
  ON "gamification_action_log" ("user_id","action_type","created_at");

-- 4) Tabela de conquistas
CREATE TABLE IF NOT EXISTS "user_achievements" (
  "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"          UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "achievement_code" achievement_code NOT NULL,
  "unlocked_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_achievement_once
  ON "user_achievements" ("user_id","achievement_code");

CREATE INDEX IF NOT EXISTS idx_user_achievement_user_id
  ON "user_achievements" ("user_id");


