CREATE TABLE "account_currencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"currency" text NOT NULL,
	"balance" numeric(19, 4) DEFAULT '0' NOT NULL,
	"user_id" text DEFAULT 'user_1' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account_currencies" ADD CONSTRAINT "account_currencies_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;