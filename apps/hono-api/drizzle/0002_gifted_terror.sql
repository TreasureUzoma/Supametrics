ALTER TABLE "projects" ADD COLUMN "type" varchar(64) DEFAULT 'web' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "url" text;