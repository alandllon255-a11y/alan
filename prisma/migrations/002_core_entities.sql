-- 002_core_entities.sql

-- 1) Enums auxiliares
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vote_type') THEN
    CREATE TYPE vote_type AS ENUM ('UP', 'DOWN');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM ('ANSWER','VOTE','ACCEPTED','MENTION','BADGE','SUCCESS','REPLY','COMMENT');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_priority') THEN
    CREATE TYPE notification_priority AS ENUM ('HIGH','NORMAL','LOW');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
    CREATE TYPE media_type AS ENUM ('IMAGE','VIDEO');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
    CREATE TYPE transaction_type AS ENUM ('REWARD','PURCHASE','TRANSFER','ADJUST');
  END IF;
END $$;

-- 2) Core Q&A
-- Create questions without FK to accepted_answer_id first (cyclic dep), then add FK later
CREATE TABLE IF NOT EXISTS "questions" (
  "id"                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title"              TEXT NOT NULL,
  "content"            TEXT NOT NULL,
  "author_id"          UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "accepted_answer_id" UUID NULL,
  "views"              INTEGER NOT NULL DEFAULT 0,
  "created_at"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_author_id ON "questions" ("author_id");
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON "questions" ("created_at");

CREATE TABLE IF NOT EXISTS "answers" (
  "id"                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "question_id"        UUID NOT NULL REFERENCES "questions"("id") ON DELETE CASCADE,
  "author_id"          UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "content"            TEXT NOT NULL,
  "is_accepted"        BOOLEAN NOT NULL DEFAULT FALSE,
  "parent_answer_id"   UUID NULL REFERENCES "answers"("id") ON DELETE CASCADE,
  "created_at"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_answers_question_id ON "answers" ("question_id");
CREATE INDEX IF NOT EXISTS idx_answers_author_id ON "answers" ("author_id");
CREATE INDEX IF NOT EXISTS idx_answers_created_at ON "answers" ("created_at");

-- Now add accepted_answer_id FK
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_questions_accepted_answer'
  ) THEN
    ALTER TABLE "questions"
    ADD CONSTRAINT fk_questions_accepted_answer
    FOREIGN KEY ("accepted_answer_id") REFERENCES "answers"("id") ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "comments" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "author_id"   UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "question_id" UUID NULL REFERENCES "questions"("id") ON DELETE CASCADE,
  "answer_id"   UUID NULL REFERENCES "answers"("id") ON DELETE CASCADE,
  "content"     TEXT NOT NULL,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_question_id ON "comments" ("question_id");
CREATE INDEX IF NOT EXISTS idx_comments_answer_id ON "comments" ("answer_id");
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON "comments" ("author_id");

CREATE TABLE IF NOT EXISTS "tags" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug"        TEXT NOT NULL UNIQUE,
  "name"        TEXT NOT NULL,
  "description" TEXT NULL,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "question_tags" (
  "question_id" UUID NOT NULL REFERENCES "questions"("id") ON DELETE CASCADE,
  "tag_id"      UUID NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY ("question_id","tag_id")
);

CREATE INDEX IF NOT EXISTS idx_question_tag_tag_id ON "question_tags" ("tag_id");

CREATE TABLE IF NOT EXISTS "question_votes" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "question_id" UUID NOT NULL REFERENCES "questions"("id") ON DELETE CASCADE,
  "user_id"     UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type"        vote_type NOT NULL,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_question_vote_once UNIQUE ("question_id","user_id")
);

CREATE INDEX IF NOT EXISTS idx_question_vote_user_id ON "question_votes" ("user_id");

CREATE TABLE IF NOT EXISTS "answer_votes" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "answer_id"  UUID NOT NULL REFERENCES "answers"("id") ON DELETE CASCADE,
  "user_id"    UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type"       vote_type NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_answer_vote_once UNIQUE ("answer_id","user_id")
);

CREATE INDEX IF NOT EXISTS idx_answer_vote_user_id ON "answer_votes" ("user_id");

CREATE TABLE IF NOT EXISTS "media_items" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "question_id" UUID NULL REFERENCES "questions"("id") ON DELETE CASCADE,
  "type"        media_type NOT NULL,
  "url"         TEXT NOT NULL,
  "name"        TEXT NULL,
  "size"        INTEGER NULL,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_question_id ON "media_items" ("question_id");

-- 3) Chat
CREATE TABLE IF NOT EXISTS "conversations" (
  "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_a_id"        UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "user_b_id"        UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "last_message_at"  TIMESTAMPTZ NULL,
  CONSTRAINT uq_conversation_pair_ordered UNIQUE ("user_a_id","user_b_id")
);

-- Optional ordering constraint to avoid duplicates A-B vs B-A (requires app to order before insert)
-- ALTER TABLE "conversations" ADD CONSTRAINT chk_conversation_order CHECK ("user_a_id" < "user_b_id");

CREATE INDEX IF NOT EXISTS idx_conversation_last_message_at ON "conversations" ("last_message_at");

CREATE TABLE IF NOT EXISTS "messages" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "conversation_id" UUID NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
  "sender_id"       UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "receiver_id"     UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "content"         TEXT NOT NULL,
  "timestamp"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "read"            BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_message_conversation_timestamp ON "messages" ("conversation_id","timestamp");
CREATE INDEX IF NOT EXISTS idx_message_receiver_read ON "messages" ("receiver_id","read");

-- 4) Notificações
CREATE TABLE IF NOT EXISTS "notifications" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"    UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type"       notification_type NOT NULL,
  "priority"   notification_priority NOT NULL DEFAULT 'NORMAL',
  "title"      TEXT NOT NULL,
  "message"    TEXT NOT NULL,
  "link"       TEXT NULL,
  "read"       BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON "notifications" ("user_id","read","created_at");

-- 5) Economia / Transações
CREATE TABLE IF NOT EXISTS "currency_transactions" (
  "id"                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"            UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type"               transaction_type NOT NULL,
  "amount"             INTEGER NOT NULL,
  "source_action"      gamification_action_type NULL,
  "related_entity_id"  TEXT NULL,
  "metadata"           JSONB NULL,
  "created_at"         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_currency_tx_user_created ON "currency_transactions" ("user_id","created_at");


