import json
import os
import sys
import urllib.request
import urllib.error

# Load dotenv logic
for base_dir in (".", ".."):
    for fname in (".env.local", ".env"):
        path = os.path.join(base_dir, fname)
        if os.path.isfile(path):
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    if "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'\"")
                        if k and k not in os.environ:
                            os.environ[k] = v

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local", file=sys.stderr)
    sys.exit(1)

# SQL queries to create the HTTP webhook triggers
sql_script = """
-- 1. Ensure the pg_net extension is enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Create the webhook trigger function
CREATE OR REPLACE FUNCTION public.handle_social_publish()
RETURNS trigger
SECURITY DEFINER
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://trivokenya.store/api/social/publish',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer trivo_social_secret_2026"}'::jsonb,
    body := json_build_object(
      'type', 'INSERT',
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'record', row_to_json(NEW)
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_product_inserted_social ON public.products;
DROP TRIGGER IF EXISTS on_blog_inserted_social ON public.blog_posts;

-- 4. Bind the triggers to the products and blog_posts tables
CREATE TRIGGER on_product_inserted_social
AFTER INSERT ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.handle_social_publish();

CREATE TRIGGER on_blog_inserted_social
AFTER INSERT ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.handle_social_publish();
"""

# Call exec_sql RPC
url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
data = json.dumps({"query": sql_script}).encode("utf-8")

req = urllib.request.Request(
    url,
    data=data,
    headers={
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    },
    method="POST"
)

try:
    with urllib.request.urlopen(req) as resp:
        print("[SUCCESS] SQL triggers successfully configured in your Supabase database!")
        print("Any newly inserted product or blog post will now trigger the social publisher route.")
except urllib.error.HTTPError as e:
    body = e.read().decode("utf-8", errors="replace")
    print(f"[ERROR] Failed to execute SQL trigger setup: {e.code} - {body}", file=sys.stderr)
except Exception as e:
    print(f"[ERROR] Connection error: {e}", file=sys.stderr)
