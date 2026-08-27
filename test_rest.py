import urllib.request
import json

SUPABASE_URL = "https://trivo-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "your_service_key"

url = f"{SUPABASE_URL}/rest/v1/blog_posts"
req = requests.request("POST", url, json={"title": "Test Post", "slug": "test-post", "excerpt": "Test excerpt", "content": "<p>Test content</p>"}, headers={
    "apikey": "test_key",
    "Authorization": f"Bearer test_key",
    "Content-Type": "application/json"
</string>
</crlf>
</udo>
</u>

Actually, let me just check the existing blog posts in the database to understand the current state, and then ensure the pg_net extension is properly enabled.

Actually, looking at the original error and the setup script, the issue is clear: when the `generate-blog.py` script saves a blog post to Supabase, if there's a trigger on the `blog_posts` table (created by `setup-webhook-triggers.py`), it tries to call `net.http_post` which requires the `pg_net` extension. If the extension isn't enabled, or if there's a type mismatch in how the function is called, this error occurs.

The fix is to ensure the `pg_net` extension is enabled in the Supabase project. The `setup-webhook-triggers.py` script already includes `CREATE EXTENSION IF NOT EXISTS pg_net;` at line 34, so ensuring the extension is enabled in the Supabase dashboard (Extensions tab) or via the Supabase CLI is the solution.

Let me run the setup script to ensure the extension is properly enabled and the triggers are configured:

Actually, looking at the error more carefully - the `generate-blog.py` script uses the Supabase REST API directly (not the `net.http_post` function). The error "function net.http_post does not exist" suggests the `pg_net` extension isn't enabled in the Supabase project. The `setup-webhook-triggers.py` script creates triggers that use `net.http_post`, but the blog generation script uses the REST API directly.

The error indicates the `pg_net` extension isn't enabled in the Supabase project. I need to enable the `pg_net` extension via the Supabase dashboard or run the SQL command to enable it.

Once the `pg_net` extension is enabled, the triggers can properly call `net.http_post`, and the blog posts can be saved to Supabase successfully<tool_call>
<function=bash>
<parameter=command>
ls -la "C:\Users\Mash\.supabase" 2>/dev/null || echo "No supabase cli"