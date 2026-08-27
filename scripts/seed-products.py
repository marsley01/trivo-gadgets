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

products = [
    {
        "name": "70mai Dash Cam Pro Plus+ A500S Dual Channel",
        "description": "Premium dual-channel dash cam with built-in GPS, ADAS (Advanced Driver Assistance Systems), and 1944P Ultra HD resolution. Features 24-hour parking monitoring, night vision, and app control.",
        "price": 14500,
        "stock": 15,
        "category": "car-accessories",
        "image_url": "https://images.unsplash.com/photo-1508962914676-134849a727f0?w=600&auto=format&fit=crop",
        "is_featured": True,
        "slug": "70mai-dash-cam-pro-plus-a500s-kenya",
        "brand": "70mai",
        "specifications": {
            "Resolution": "2592 x 1944 (1944P)",
            "Field of View": "140 degrees",
            "Sensor": "Sony IMX335",
            "Screen": "2.0-inch IPS",
            "Storage": "MicroSD up to 128GB",
            "GPS": "Built-in",
            "ADAS": "Supported"
        },
        "features": [
            "Front & Rear Dual Recording",
            "Super High Resolution 1944P",
            "Sony Sensor for Night Vision",
            "ADAS Driving Assistance",
            "24H Parking Surveillance"
        ]
    },
    {
        "name": "Oraimo FreePods 4 Active Noise Cancelling Earbuds",
        "description": "Oraimo's flagship wireless earbuds with up to 30dB Active Noise Cancellation, 35.5-hour playtime, transparency mode, low latency game mode, and heavy bass tuned by HavyBass.",
        "price": 4500,
        "stock": 40,
        "category": "audio",
        "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop",
        "is_featured": True,
        "slug": "oraimo-freepods-4-anc-kenya",
        "brand": "Oraimo",
        "specifications": {
            "Bluetooth Version": "V5.2",
            "ANC Depth": "Up to 30dB",
            "Battery Life": "Up to 35.5 hours (with case)",
            "Water Resistance": "IPX5 Waterproof",
            "Drivers": "10mm Dynamic Drivers",
            "Charge Time": "2 Hours"
        },
        "features": [
            "Pro Active Noise Cancellation",
            "Transparency Mode",
            "HavyBass Signature Sound",
            "4-Mic Beamforming Call Technology",
            "Google Fast Pairing"
        ]
    },
    {
        "name": "Anker PowerCore 24K 140W Power Bank",
        "description": "Ultra-high capacity power bank with 140W two-way fast charging, smart digital display showing input/output parameters, and 24,000mAh capacity. Charges laptops, tablets, and phones simultaneously.",
        "price": 18500,
        "stock": 12,
        "category": "cables",
        "image_url": "https://images.unsplash.com/photo-1609592424109-dd9892f1b17c?w=600&auto=format&fit=crop",
        "is_featured": True,
        "slug": "anker-powercore-24k-140w-kenya",
        "brand": "Anker",
        "specifications": {
            "Capacity": "24,000 mAh",
            "Output Power": "140W Max",
            "Ports": "2 USB-C, 1 USB-A",
            "Display": "Color Smart Digital Screen",
            "Recharge Speed": "140W Input",
            "Compatibility": "Universal (Laptops, Phones, Switch)"
        },
        "features": [
            "140W Ultra-Fast Charging",
            "Smart Digital Information Display",
            "Huge 24,000mAh Battery Capacity",
            "ActiveShield 2.0 Temperature Monitor",
            "Simultaneous 3-Device Charging"
        ]
    },
    {
        "name": "Xiaomi Redmi Watch 4 Smartwatch",
        "description": "Large-screen smartwatch with 1.97-inch AMOLED display, built-in multi-system GNSS (GPS), Bluetooth calling support, 150+ sports modes, and up to 20 days battery life.",
        "price": 12500,
        "stock": 25,
        "category": "smart-home",
        "image_url": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop",
        "is_featured": False,
        "slug": "xiaomi-redmi-watch-4-kenya",
        "brand": "Xiaomi",
        "specifications": {
            "Display": "1.97\" AMOLED, 60Hz",
            "Battery Life": "Up to 20 Days",
            "Water Resistance": "5ATM (50 meters)",
            "Sensors": "Heart Rate, SpO2, Accelerometer",
            "GNSS": "GPS, GLONASS, Galileo, BDS",
            "Connectivity": "Bluetooth 5.3"
        },
        "features": [
            "Vibrant Always-On AMOLED Screen",
            "Bluetooth Calling & Notifications",
            "Built-in Independent GPS",
            "20-Day Extended Battery Life",
            "Heart Rate & Sleep Monitoring"
        ]
    },
    {
        "name": "Google Nest Hub (2nd Generation)",
        "description": "Smart display for your connected home. Watch Netflix, stream music, control compatible smart lights/security cameras, and get hands-free help from Google Assistant.",
        "price": 11500,
        "stock": 8,
        "category": "smart-home",
        "image_url": "https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&auto=format&fit=crop",
        "is_featured": False,
        "slug": "google-nest-hub-2nd-gen-kenya",
        "brand": "Google",
        "specifications": {
            "Screen": "7.0-inch Touchscreen",
            "Speaker": "Full-range with 3 mics",
            "Connectivity": "Wi-Fi 5, Bluetooth 5.0",
            "Assistant": "Google Assistant Built-in",
            "Smart Home Control": "Thread & Matter supported",
            "Sensors": "Soli Sensor for Sleep Sensing"
        },
        "features": [
            "Voice Control Smart Home Devices",
            "7-Inch Clear Smart Display",
            "Gesture Control (Quick Gestures)",
            "Enhanced Sleep Sensing Technology",
            "Privacy Switch for Muting Mic"
        ]
    }
]

for p in products:
    url = f"{SUPABASE_URL}/rest/v1/products"
    data = json.dumps(p).encode("utf-8")
    
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates",
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"Successfully seeded/updated: {p['name']}")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"Failed to seed {p['name']}: {e.code} - {body}", file=sys.stderr)
    except Exception as e:
        print(f"Error seeding {p['name']}: {e}", file=sys.stderr)
