import os
import json

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

from generate_blog import supabase_request
status, body = supabase_request('POST', '/blog_posts', {'title': 'test', 'slug': 'test-post', 'content': '<p>test</p>', 'excerpt': 'test excerpt'})
print(f'Status: {status}, Body: {body}')