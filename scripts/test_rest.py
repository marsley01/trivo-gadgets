import os
import json
import urllib.request
import urllib.error

for base_dir in ('.', '..'):
    for fname in ('.env.local', '.env'):
        path = os.path.join(base_dir, fname)
        if os.path.isfile(path):
            with open(path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith('#'):
                        continue
                    if '=' in line:
                        k, v = line.split('=', 1)
                        k = k.strip()
                        v = v.strip().strip("'\"")
                        if k and k not in os.environ:
                            os.environ[k] = v

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')

print('URL:', SUPABASE_URL)
print('KEY starts with:', SUPABASE_SERVICE_ROLE_KEY[:10] if SUPABASE_SERVICE_ROLE_KEY else 'None', '...')

url = f'{SUPABASE_URL}/rest/v1/blog_posts'
payload = json.dumps({'title': 'test', 'slug': 'test-post', 'excerpt': 'test', 'content': '<p>test</p>'})
req = urllib.request.Request(url, data=payload.encode('utf-8'), headers={
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}, method='POST')

try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        print(f'Status: {resp.status}')
        print(resp.read().decode()[:300])
except urllib.error.HTTPError as e:
    body = e.read().decode('utf-8', errors='replace')
    print(f'HTTP Error {e.code}: {body[:300]}')
except Exception as e:
    print(f'Error: {e}')