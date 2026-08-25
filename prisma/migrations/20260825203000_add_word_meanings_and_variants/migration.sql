CREATE TABLE "WordMeaning" (
    "id" SERIAL NOT NULL,
    "wordId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "translation" TEXT NOT NULL,
    "definition" TEXT,
    "partOfSpeech" TEXT,
    "register" TEXT,
    "example" TEXT,
    "exampleTranslation" TEXT,
    "reviewStatus" TEXT NOT NULL DEFAULT 'pending',
    "source" TEXT,
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WordMeaning_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WordVariant" (
    "id" SERIAL NOT NULL,
    "wordId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "spelling" TEXT NOT NULL,
    "label" TEXT,
    "region" TEXT,
    "reviewStatus" TEXT NOT NULL DEFAULT 'pending',
    "source" TEXT,
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WordVariant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WordMeaning_wordId_position_key" ON "WordMeaning"("wordId", "position");
CREATE INDEX "WordMeaning_translation_idx" ON "WordMeaning"("translation");
CREATE UNIQUE INDEX "WordVariant_wordId_spelling_key" ON "WordVariant"("wordId", "spelling");
CREATE INDEX "WordVariant_spelling_idx" ON "WordVariant"("spelling");

ALTER TABLE "WordMeaning" ADD CONSTRAINT "WordMeaning_wordId_fkey"
    FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WordVariant" ADD CONSTRAINT "WordVariant_wordId_fkey"
    FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve every existing entry as one unsplit meaning. Leon can split and enrich it
-- explicitly in the new editor without a punctuation heuristic changing its meaning.
INSERT INTO "WordMeaning" (
    "wordId", "position", "translation", "partOfSpeech", "example",
    "exampleTranslation", "reviewStatus", "source", "sourceUrl"
)
SELECT
    "id", 0, "translation", "partOfSpeech", "example",
    "exampleTranslation", "reviewStatus", "source", "sourceUrl"
FROM "Word";

-- Existing aliases become structured variants while the legacy array remains available
-- to search and translator code during the transition.
INSERT INTO "WordVariant" (
    "wordId", "position", "spelling", "reviewStatus", "source", "sourceUrl"
)
SELECT
    word."id", alias.ordinality - 1, alias.spelling,
    word."reviewStatus", word."source", word."sourceUrl"
FROM "Word" AS word
CROSS JOIN LATERAL unnest(word."aliases") WITH ORDINALITY AS alias(spelling, ordinality)
WHERE btrim(alias.spelling) <> '' AND lower(alias.spelling) <> lower(word."koelsch")
ON CONFLICT ("wordId", "spelling") DO NOTHING;
