"""
Supabase Client — Singleton connection to Supabase PostgreSQL.
Validates env vars at import time and exposes a single `supabase` instance.
"""

import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL: str | None = os.getenv("SUPABASE_URL")
SUPABASE_KEY: str | None = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print(
        "[FATAL] Missing SUPABASE_URL or SUPABASE_KEY in environment. "
        "Ensure your .env file is configured.",
        file=sys.stderr,
    )
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print("✓ Supabase client initialized successfully")
