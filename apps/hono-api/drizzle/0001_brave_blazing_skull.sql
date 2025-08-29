CREATE TYPE "public"."user_auth_method" AS ENUM('email', 'google', 'github');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'superadmin');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended', 'read-only');--> statement-breakpoint
CREATE TYPE "public"."user_subscription" AS ENUM('free', 'paid', 'enterprise');--> statement-breakpoint
ALTER TABLE "revoked_tokens" DROP CONSTRAINT "revoked_tokens_uuid_unique";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "auth_method" SET DEFAULT 'email'::"public"."user_auth_method";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "auth_method" SET DATA TYPE "public"."user_auth_method" USING "auth_method"::"public"."user_auth_method";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."user_status";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "status" SET DATA TYPE "public"."user_status" USING "status"::"public"."user_status";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "subscription_type" SET DEFAULT 'free'::"public"."user_subscription";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "subscription_type" SET DATA TYPE "public"."user_subscription" USING "subscription_type"::"public"."user_subscription";