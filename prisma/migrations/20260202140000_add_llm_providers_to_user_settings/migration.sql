-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN IF NOT EXISTS "llmProviders" JSONB;
