CREATE TYPE "public"."recurrence_frequency" AS ENUM('MONTHLY', 'YEARLY', 'WEEKLY', 'DAILY');--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "icon" text DEFAULT 'Target' NOT NULL;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "color" text DEFAULT '#8B5CF6' NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "recurrence_frequency" "recurrence_frequency";