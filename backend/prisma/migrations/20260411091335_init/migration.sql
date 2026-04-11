-- CreateEnum
CREATE TYPE "UserTier" AS ENUM ('logged_in', 'admin');

-- CreateEnum
CREATE TYPE "LinkCreatorType" AS ENUM ('anonymous', 'user', 'organization');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('mobile', 'desktop', 'tablet', 'bot', 'other');

-- CreateTable
CREATE TABLE "organizations" (
    "id" BIGINT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" BIGINT NOT NULL,
    "organization_id" BIGINT,
    "email" VARCHAR(320) NOT NULL,
    "full_name" VARCHAR(200) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "refresh_token_hash" VARCHAR(255),
    "tier" "UserTier" NOT NULL DEFAULT 'logged_in',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shortened_links" (
    "id" BIGINT NOT NULL,
    "organization_id" BIGINT,
    "user_id" BIGINT,
    "short_code" VARCHAR(50) NOT NULL,
    "destination_url" TEXT NOT NULL,
    "title" VARCHAR(255),
    "created_by_type" "LinkCreatorType" NOT NULL DEFAULT 'anonymous',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "shortened_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "click_events" (
    "id" BIGINT NOT NULL,
    "link_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "organization_id" BIGINT,
    "clicked_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referrer_url" TEXT,
    "referrer_domain" VARCHAR(255),
    "utm_source" VARCHAR(100),
    "utm_medium" VARCHAR(100),
    "utm_campaign" VARCHAR(150),
    "utm_term" VARCHAR(150),
    "utm_content" VARCHAR(150),
    "country" VARCHAR(100),
    "city" VARCHAR(100),
    "device_type" "DeviceType",
    "browser" VARCHAR(100),
    "os" VARCHAR(100),
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "click_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_stats_hourly" (
    "id" BIGINT NOT NULL,
    "link_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "organization_id" BIGINT,
    "bucket_start" TIMESTAMP(6) NOT NULL,
    "total_clicks" BIGINT NOT NULL DEFAULT 0,
    "mobile_clicks" BIGINT NOT NULL DEFAULT 0,
    "desktop_clicks" BIGINT NOT NULL DEFAULT 0,
    "tablet_clicks" BIGINT NOT NULL DEFAULT 0,
    "bot_clicks" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "link_stats_hourly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_stats_daily" (
    "id" BIGINT NOT NULL,
    "link_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "organization_id" BIGINT,
    "stats_date" DATE NOT NULL,
    "total_clicks" BIGINT NOT NULL DEFAULT 0,
    "unique_referrer_domains" BIGINT NOT NULL DEFAULT 0,
    "unique_countries" BIGINT NOT NULL DEFAULT 0,
    "unique_cities" BIGINT NOT NULL DEFAULT 0,
    "mobile_clicks" BIGINT NOT NULL DEFAULT 0,
    "desktop_clicks" BIGINT NOT NULL DEFAULT 0,
    "tablet_clicks" BIGINT NOT NULL DEFAULT 0,
    "bot_clicks" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "link_stats_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_stats_weekly" (
    "id" BIGINT NOT NULL,
    "link_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "organization_id" BIGINT,
    "week_start_date" DATE NOT NULL,
    "total_clicks" BIGINT NOT NULL DEFAULT 0,
    "unique_referrer_domains" BIGINT NOT NULL DEFAULT 0,
    "unique_countries" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "link_stats_weekly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_stats_daily" (
    "id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "organization_id" BIGINT,
    "stats_date" DATE NOT NULL,
    "links_created_count" BIGINT NOT NULL DEFAULT 0,
    "active_links_count" BIGINT NOT NULL DEFAULT 0,
    "total_clicks_received" BIGINT NOT NULL DEFAULT 0,
    "top_link_id" BIGINT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "creator_stats_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_stats_weekly" (
    "id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "organization_id" BIGINT,
    "week_start_date" DATE NOT NULL,
    "links_created_count" BIGINT NOT NULL DEFAULT 0,
    "active_links_count" BIGINT NOT NULL DEFAULT 0,
    "total_clicks_received" BIGINT NOT NULL DEFAULT 0,
    "top_link_id" BIGINT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "creator_stats_weekly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_stats_monthly" (
    "id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "organization_id" BIGINT,
    "month_start_date" DATE NOT NULL,
    "links_created_count" BIGINT NOT NULL DEFAULT 0,
    "active_links_count" BIGINT NOT NULL DEFAULT 0,
    "total_clicks_received" BIGINT NOT NULL DEFAULT 0,
    "top_link_id" BIGINT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "creator_stats_monthly_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_organization_id" ON "users"("organization_id");

-- CreateIndex
CREATE INDEX "idx_users_created_at" ON "users"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "uq_shortened_links_short_code" ON "shortened_links"("short_code");

-- CreateIndex
CREATE INDEX "idx_shortened_links_user_id" ON "shortened_links"("user_id");

-- CreateIndex
CREATE INDEX "idx_shortened_links_organization_id" ON "shortened_links"("organization_id");

-- CreateIndex
CREATE INDEX "idx_shortened_links_created_at" ON "shortened_links"("created_at");

-- CreateIndex
CREATE INDEX "idx_shortened_links_user_created_at" ON "shortened_links"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_shortened_links_org_created_at" ON "shortened_links"("organization_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "uq_shortened_links_id_user_id" ON "shortened_links"("id", "user_id");

-- CreateIndex
CREATE INDEX "idx_click_events_link_id" ON "click_events"("link_id");

-- CreateIndex
CREATE INDEX "idx_click_events_user_id" ON "click_events"("user_id");

-- CreateIndex
CREATE INDEX "idx_click_events_organization_id" ON "click_events"("organization_id");

-- CreateIndex
CREATE INDEX "idx_click_events_clicked_at" ON "click_events"("clicked_at");

-- CreateIndex
CREATE INDEX "idx_click_events_link_clicked_at" ON "click_events"("link_id", "clicked_at");

-- CreateIndex
CREATE INDEX "idx_click_events_user_clicked_at" ON "click_events"("user_id", "clicked_at");

-- CreateIndex
CREATE INDEX "idx_click_events_org_clicked_at" ON "click_events"("organization_id", "clicked_at");

-- CreateIndex
CREATE INDEX "idx_click_events_referrer_domain" ON "click_events"("referrer_domain");

-- CreateIndex
CREATE INDEX "idx_click_events_country_city" ON "click_events"("country", "city");

-- CreateIndex
CREATE INDEX "idx_click_events_device_type" ON "click_events"("device_type");

-- CreateIndex
CREATE INDEX "idx_link_stats_hourly_user_bucket" ON "link_stats_hourly"("user_id", "bucket_start");

-- CreateIndex
CREATE INDEX "idx_link_stats_hourly_org_bucket" ON "link_stats_hourly"("organization_id", "bucket_start");

-- CreateIndex
CREATE INDEX "idx_link_stats_hourly_bucket" ON "link_stats_hourly"("bucket_start");

-- CreateIndex
CREATE UNIQUE INDEX "uq_link_stats_hourly_link_bucket" ON "link_stats_hourly"("link_id", "bucket_start");

-- CreateIndex
CREATE INDEX "idx_link_stats_daily_user_date" ON "link_stats_daily"("user_id", "stats_date");

-- CreateIndex
CREATE INDEX "idx_link_stats_daily_org_date" ON "link_stats_daily"("organization_id", "stats_date");

-- CreateIndex
CREATE INDEX "idx_link_stats_daily_stats_date" ON "link_stats_daily"("stats_date");

-- CreateIndex
CREATE UNIQUE INDEX "uq_link_stats_daily_link_date" ON "link_stats_daily"("link_id", "stats_date");

-- CreateIndex
CREATE INDEX "idx_link_stats_weekly_user_week" ON "link_stats_weekly"("user_id", "week_start_date");

-- CreateIndex
CREATE INDEX "idx_link_stats_weekly_org_week" ON "link_stats_weekly"("organization_id", "week_start_date");

-- CreateIndex
CREATE INDEX "idx_link_stats_weekly_week" ON "link_stats_weekly"("week_start_date");

-- CreateIndex
CREATE UNIQUE INDEX "uq_link_stats_weekly_link_week" ON "link_stats_weekly"("link_id", "week_start_date");

-- CreateIndex
CREATE INDEX "idx_creator_stats_daily_org_date" ON "creator_stats_daily"("organization_id", "stats_date");

-- CreateIndex
CREATE INDEX "idx_creator_stats_daily_leaderboard" ON "creator_stats_daily"("stats_date", "total_clicks_received");

-- CreateIndex
CREATE UNIQUE INDEX "uq_creator_stats_daily_user_date" ON "creator_stats_daily"("user_id", "stats_date");

-- CreateIndex
CREATE INDEX "idx_creator_stats_weekly_org_week" ON "creator_stats_weekly"("organization_id", "week_start_date");

-- CreateIndex
CREATE INDEX "idx_creator_stats_weekly_leaderboard" ON "creator_stats_weekly"("week_start_date", "total_clicks_received");

-- CreateIndex
CREATE UNIQUE INDEX "uq_creator_stats_weekly_user_week" ON "creator_stats_weekly"("user_id", "week_start_date");

-- CreateIndex
CREATE INDEX "idx_creator_stats_monthly_org_month" ON "creator_stats_monthly"("organization_id", "month_start_date");

-- CreateIndex
CREATE INDEX "idx_creator_stats_monthly_leaderboard" ON "creator_stats_monthly"("month_start_date", "total_clicks_received");

-- CreateIndex
CREATE UNIQUE INDEX "uq_creator_stats_monthly_user_month" ON "creator_stats_monthly"("user_id", "month_start_date");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shortened_links" ADD CONSTRAINT "shortened_links_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shortened_links" ADD CONSTRAINT "shortened_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "click_events" ADD CONSTRAINT "click_events_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "click_events" ADD CONSTRAINT "click_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "click_events" ADD CONSTRAINT "click_events_link_id_user_id_fkey" FOREIGN KEY ("link_id", "user_id") REFERENCES "shortened_links"("id", "user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_stats_hourly" ADD CONSTRAINT "link_stats_hourly_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_stats_hourly" ADD CONSTRAINT "link_stats_hourly_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_stats_hourly" ADD CONSTRAINT "link_stats_hourly_link_id_user_id_fkey" FOREIGN KEY ("link_id", "user_id") REFERENCES "shortened_links"("id", "user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_stats_daily" ADD CONSTRAINT "link_stats_daily_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_stats_daily" ADD CONSTRAINT "link_stats_daily_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_stats_daily" ADD CONSTRAINT "link_stats_daily_link_id_user_id_fkey" FOREIGN KEY ("link_id", "user_id") REFERENCES "shortened_links"("id", "user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_stats_weekly" ADD CONSTRAINT "link_stats_weekly_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_stats_weekly" ADD CONSTRAINT "link_stats_weekly_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_stats_weekly" ADD CONSTRAINT "link_stats_weekly_link_id_user_id_fkey" FOREIGN KEY ("link_id", "user_id") REFERENCES "shortened_links"("id", "user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_stats_daily" ADD CONSTRAINT "creator_stats_daily_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_stats_daily" ADD CONSTRAINT "creator_stats_daily_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_stats_daily" ADD CONSTRAINT "creator_stats_daily_top_link_id_fkey" FOREIGN KEY ("top_link_id") REFERENCES "shortened_links"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_stats_weekly" ADD CONSTRAINT "creator_stats_weekly_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_stats_weekly" ADD CONSTRAINT "creator_stats_weekly_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_stats_weekly" ADD CONSTRAINT "creator_stats_weekly_top_link_id_fkey" FOREIGN KEY ("top_link_id") REFERENCES "shortened_links"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_stats_monthly" ADD CONSTRAINT "creator_stats_monthly_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_stats_monthly" ADD CONSTRAINT "creator_stats_monthly_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_stats_monthly" ADD CONSTRAINT "creator_stats_monthly_top_link_id_fkey" FOREIGN KEY ("top_link_id") REFERENCES "shortened_links"("id") ON DELETE SET NULL ON UPDATE CASCADE;
