import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEED_FILE_PATH = os.path.join(BASE_DIR, "seed.json")

try:
    with open(SEED_FILE_PATH, "r", encoding="utf-8") as f:
        FAILURE_DB = json.load(f)
    print(f"✅ Successfully loaded {len(FAILURE_DB)} failure entries from seed.json")
except FileNotFoundError:
    print(f"⚠️ Warning: seed.json not found at {SEED_FILE_PATH}. Initializing empty database array.")
    FAILURE_DB = []

for index, item in enumerate(FAILURE_DB, start=1):
    if "id" not in item:
        item["id"] = index