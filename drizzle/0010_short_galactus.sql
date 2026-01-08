-- Create asset_type enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "public"."asset_type" AS ENUM('STOCK', 'CRYPTO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
-- Create investment_transaction_type enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "public"."investment_transaction_type" AS ENUM('BUY', 'SELL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
-- Add INVESTMENT value to account_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'INVESTMENT' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'account_type')
    ) THEN
        ALTER TYPE "public"."account_type" ADD VALUE 'INVESTMENT';
    END IF;
END $$;--> statement-breakpoint
-- Add TRANSFER value to transaction_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'TRANSFER' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transaction_type')
    ) THEN
        ALTER TYPE "public"."transaction_type" ADD VALUE 'TRANSFER';
    END IF;
END $$;--> statement-breakpoint
CREATE TABLE "holdings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"symbol" text NOT NULL,
	"asset_type" "asset_type" NOT NULL,
	"quantity" numeric(19, 8) DEFAULT '0' NOT NULL,
	"average_purchase_price" numeric(19, 4) DEFAULT '0' NOT NULL,
	"current_price" numeric(19, 4) DEFAULT '0' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"clerk_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investment_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"holding_id" uuid,
	"type" "investment_transaction_type" NOT NULL,
	"symbol" text NOT NULL,
	"quantity" numeric(19, 8) NOT NULL,
	"price" numeric(19, 4) NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"clerk_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"icon" text NOT NULL,
	"clerk_user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account_currencies" RENAME COLUMN "user_id" TO "clerk_user_id";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "user_id" TO "clerk_user_id";--> statement-breakpoint
ALTER TABLE "categories" RENAME COLUMN "user_id" TO "clerk_user_id";--> statement-breakpoint
ALTER TABLE "goals" RENAME COLUMN "user_id" TO "clerk_user_id";--> statement-breakpoint
-- Drop the old source column (text) and create new source_id column (uuid)
-- First, drop the column if it exists (safe even if empty)
ALTER TABLE "transactions" DROP COLUMN IF EXISTS "source";--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "source_id" uuid;--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "user_id" TO "clerk_user_id";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "user_id" TO "clerk_user_id";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_user_id_unique";--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "to_account_id" uuid;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "parent_recurring_transaction_id" uuid;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "receipt_image" text;--> statement-breakpoint
-- Add email column, allow NULL initially, then set a default and make it NOT NULL
ALTER TABLE "users" ADD COLUMN "email" text;--> statement-breakpoint
-- Update existing rows with a placeholder email if needed (using clerk_user_id)
UPDATE "users" SET "email" = "clerk_user_id" || '@placeholder.local' WHERE "email" IS NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar" text;--> statement-breakpoint
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_transactions" ADD CONSTRAINT "investment_transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_transactions" ADD CONSTRAINT "investment_transactions_holding_id_holdings_id_fk" FOREIGN KEY ("holding_id") REFERENCES "public"."holdings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_to_account_id_accounts_id_fk" FOREIGN KEY ("to_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_parent_recurring_transaction_id_transactions_id_fk" FOREIGN KEY ("parent_recurring_transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");