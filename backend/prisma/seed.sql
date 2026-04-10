-- Seed data for schema validation and analytics smoke tests.

INSERT INTO organizations (id, name, slug, created_at, updated_at)
VALUES
  (1000000000001, 'Acme Inc', 'acme', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (1000000000002, 'Beta Labs', 'beta-labs', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (
  id,
  organization_id,
  email,
  full_name,
  password_hash,
  tier,
  is_active,
  created_at,
  updated_at
)
VALUES
  (2000000000001, 1000000000001, 'alice@acme.test', 'Alice Nguyen', 'hashed_pw_1', 'logged_in', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2000000000002, 1000000000001, 'bob@acme.test', 'Bob Tran', 'hashed_pw_2', 'admin', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2000000000003, 1000000000002, 'carol@beta.test', 'Carol Pham', 'hashed_pw_3', 'logged_in', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO shortened_links (
  id,
  organization_id,
  user_id,
  short_code,
  destination_url,
  title,
  created_by_type,
  is_active,
  expires_at,
  created_at,
  updated_at
)
VALUES
  (3000000000001, NULL, NULL, 'anon123', 'https://example.com/public-page', 'Anonymous public page', 'anonymous', TRUE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3000000000002, 1000000000001, 2000000000001, 'alice01', 'https://example.com/pricing', 'Pricing page', 'user', TRUE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3000000000003, 1000000000001, 2000000000002, 'acme01', 'https://example.com/campaign', 'Campaign landing page', 'organization', TRUE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3000000000004, 1000000000002, 2000000000003, 'carol1', 'https://example.com/docs', 'Docs page', 'user', TRUE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO click_events (
  id,
  link_id,
  user_id,
  organization_id,
  clicked_at,
  referrer_url,
  referrer_domain,
  utm_source,
  utm_medium,
  utm_campaign,
  utm_term,
  utm_content,
  country,
  city,
  device_type,
  browser,
  os,
  ip_address,
  created_at,
  updated_at
)
VALUES
  (
    4000000000001,
    3000000000002,
    2000000000001,
    1000000000001,
    TIMESTAMP '2026-04-10 09:15:00',
    'https://google.com/search?q=pricing',
    'google.com',
    'google',
    'organic',
    'spring_launch',
    NULL,
    NULL,
    'Vietnam',
    'Ho Chi Minh City',
    'mobile',
    'Chrome',
    'Android',
    '203.0.113.10',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    4000000000002,
    3000000000002,
    2000000000001,
    1000000000001,
    TIMESTAMP '2026-04-10 10:20:00',
    'https://twitter.com/',
    'twitter.com',
    'twitter',
    'social',
    'spring_launch',
    NULL,
    'ad_a',
    'Vietnam',
    'Da Nang',
    'desktop',
    'Firefox',
    'Windows',
    '203.0.113.11',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    4000000000003,
    3000000000003,
    2000000000002,
    1000000000001,
    TIMESTAMP '2026-04-10 10:35:00',
    'https://news.ycombinator.com/',
    'news.ycombinator.com',
    'hn',
    'referral',
    'founders_campaign',
    NULL,
    NULL,
    'Singapore',
    'Singapore',
    'desktop',
    'Safari',
    'macOS',
    '203.0.113.12',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    4000000000004,
    3000000000003,
    2000000000002,
    1000000000001,
    TIMESTAMP '2026-04-11 11:05:00',
    'https://linkedin.com/',
    'linkedin.com',
    'linkedin',
    'social',
    'founders_campaign',
    NULL,
    NULL,
    'Singapore',
    'Singapore',
    'mobile',
    'Chrome',
    'iOS',
    '203.0.113.13',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    4000000000005,
    3000000000004,
    2000000000003,
    1000000000002,
    TIMESTAMP '2026-04-11 15:45:00',
    'https://github.com/',
    'github.com',
    'github',
    'referral',
    'docs_push',
    NULL,
    NULL,
    'Japan',
    'Tokyo',
    'desktop',
    'Chrome',
    'Windows',
    '203.0.113.14',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO link_stats_hourly (
  id,
  link_id,
  user_id,
  organization_id,
  bucket_start,
  total_clicks,
  mobile_clicks,
  desktop_clicks,
  tablet_clicks,
  bot_clicks,
  created_at,
  updated_at
)
VALUES
  (5000000000001, 3000000000002, 2000000000001, 1000000000001, TIMESTAMP '2026-04-10 09:00:00', 1, 1, 0, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5000000000002, 3000000000002, 2000000000001, 1000000000001, TIMESTAMP '2026-04-10 10:00:00', 1, 0, 1, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5000000000003, 3000000000003, 2000000000002, 1000000000001, TIMESTAMP '2026-04-10 10:00:00', 1, 0, 1, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5000000000004, 3000000000003, 2000000000002, 1000000000001, TIMESTAMP '2026-04-11 11:00:00', 1, 1, 0, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5000000000005, 3000000000004, 2000000000003, 1000000000002, TIMESTAMP '2026-04-11 15:00:00', 1, 0, 1, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (link_id, bucket_start) DO UPDATE
SET
  user_id = EXCLUDED.user_id,
  organization_id = EXCLUDED.organization_id,
  total_clicks = EXCLUDED.total_clicks,
  mobile_clicks = EXCLUDED.mobile_clicks,
  desktop_clicks = EXCLUDED.desktop_clicks,
  tablet_clicks = EXCLUDED.tablet_clicks,
  bot_clicks = EXCLUDED.bot_clicks,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO link_stats_daily (
  id,
  link_id,
  user_id,
  organization_id,
  stats_date,
  total_clicks,
  unique_referrer_domains,
  unique_countries,
  unique_cities,
  mobile_clicks,
  desktop_clicks,
  tablet_clicks,
  bot_clicks,
  created_at,
  updated_at
)
VALUES
  (6000000000001, 3000000000002, 2000000000001, 1000000000001, DATE '2026-04-10', 2, 2, 1, 2, 1, 1, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6000000000002, 3000000000003, 2000000000002, 1000000000001, DATE '2026-04-10', 1, 1, 1, 1, 0, 1, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6000000000003, 3000000000003, 2000000000002, 1000000000001, DATE '2026-04-11', 1, 1, 1, 1, 1, 0, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6000000000004, 3000000000004, 2000000000003, 1000000000002, DATE '2026-04-11', 1, 1, 1, 1, 0, 1, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (link_id, stats_date) DO UPDATE
SET
  user_id = EXCLUDED.user_id,
  organization_id = EXCLUDED.organization_id,
  total_clicks = EXCLUDED.total_clicks,
  unique_referrer_domains = EXCLUDED.unique_referrer_domains,
  unique_countries = EXCLUDED.unique_countries,
  unique_cities = EXCLUDED.unique_cities,
  mobile_clicks = EXCLUDED.mobile_clicks,
  desktop_clicks = EXCLUDED.desktop_clicks,
  tablet_clicks = EXCLUDED.tablet_clicks,
  bot_clicks = EXCLUDED.bot_clicks,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO link_stats_weekly (
  id,
  link_id,
  user_id,
  organization_id,
  week_start_date,
  total_clicks,
  unique_referrer_domains,
  unique_countries,
  created_at,
  updated_at
)
VALUES
  (7000000000001, 3000000000002, 2000000000001, 1000000000001, DATE '2026-04-06', 2, 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7000000000002, 3000000000003, 2000000000002, 1000000000001, DATE '2026-04-06', 2, 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7000000000003, 3000000000004, 2000000000003, 1000000000002, DATE '2026-04-06', 1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (link_id, week_start_date) DO UPDATE
SET
  user_id = EXCLUDED.user_id,
  organization_id = EXCLUDED.organization_id,
  total_clicks = EXCLUDED.total_clicks,
  unique_referrer_domains = EXCLUDED.unique_referrer_domains,
  unique_countries = EXCLUDED.unique_countries,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO creator_stats_daily (
  id,
  user_id,
  organization_id,
  stats_date,
  links_created_count,
  active_links_count,
  total_clicks_received,
  top_link_id,
  created_at,
  updated_at
)
VALUES
  (8000000000001, 2000000000001, 1000000000001, DATE '2026-04-10', 1, 1, 2, 3000000000002, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8000000000002, 2000000000002, 1000000000001, DATE '2026-04-10', 1, 1, 1, 3000000000003, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8000000000003, 2000000000002, 1000000000001, DATE '2026-04-11', 1, 1, 1, 3000000000003, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8000000000004, 2000000000003, 1000000000002, DATE '2026-04-11', 1, 1, 1, 3000000000004, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (user_id, stats_date) DO UPDATE
SET
  organization_id = EXCLUDED.organization_id,
  links_created_count = EXCLUDED.links_created_count,
  active_links_count = EXCLUDED.active_links_count,
  total_clicks_received = EXCLUDED.total_clicks_received,
  top_link_id = EXCLUDED.top_link_id,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO creator_stats_weekly (
  id,
  user_id,
  organization_id,
  week_start_date,
  links_created_count,
  active_links_count,
  total_clicks_received,
  top_link_id,
  created_at,
  updated_at
)
VALUES
  (9000000000001, 2000000000001, 1000000000001, DATE '2026-04-06', 1, 1, 2, 3000000000002, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9000000000002, 2000000000002, 1000000000001, DATE '2026-04-06', 1, 1, 2, 3000000000003, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9000000000003, 2000000000003, 1000000000002, DATE '2026-04-06', 1, 1, 1, 3000000000004, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (user_id, week_start_date) DO UPDATE
SET
  organization_id = EXCLUDED.organization_id,
  links_created_count = EXCLUDED.links_created_count,
  active_links_count = EXCLUDED.active_links_count,
  total_clicks_received = EXCLUDED.total_clicks_received,
  top_link_id = EXCLUDED.top_link_id,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO creator_stats_monthly (
  id,
  user_id,
  organization_id,
  month_start_date,
  links_created_count,
  active_links_count,
  total_clicks_received,
  top_link_id,
  created_at,
  updated_at
)
VALUES
  (9100000000001, 2000000000001, 1000000000001, DATE '2026-04-01', 1, 1, 2, 3000000000002, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9100000000002, 2000000000002, 1000000000001, DATE '2026-04-01', 1, 1, 2, 3000000000003, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9100000000003, 2000000000003, 1000000000002, DATE '2026-04-01', 1, 1, 1, 3000000000004, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (user_id, month_start_date) DO UPDATE
SET
  organization_id = EXCLUDED.organization_id,
  links_created_count = EXCLUDED.links_created_count,
  active_links_count = EXCLUDED.active_links_count,
  total_clicks_received = EXCLUDED.total_clicks_received,
  top_link_id = EXCLUDED.top_link_id,
  updated_at = CURRENT_TIMESTAMP;
