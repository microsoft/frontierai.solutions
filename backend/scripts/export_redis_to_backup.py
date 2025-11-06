"""Export Redis data to local backup JSON files.

This script reads all data from Redis and writes it to backup JSON files
in backend/data/. Run this after making changes to Redis data to keep
the backup files in sync.

Usage:
    python backend/scripts/export_redis_to_backup.py

Environment variables required:
    REDIS_HOST: Redis server hostname
    REDIS_PORT: Redis server port (default: 6379)
    REDIS_PASSWORD: Redis password
"""

import redis
import json
import os
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")
KEY_PREFIX = "fas"
BACKUP_DIR = Path(__file__).parent.parent / "data"


def export_redis_to_backup():
    """Export all Redis data to backup JSON files."""
    logger.info("🚀 Starting Redis export to backup files...\n")

    if not REDIS_HOST or not REDIS_PASSWORD:
        logger.error("❌ REDIS_HOST and REDIS_PASSWORD environment variables must be set")
        return False

    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    logger.info(f"✅ Backup directory ready: {BACKUP_DIR}\n")

    try:
        client = redis.Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            password=REDIS_PASSWORD,
            username="default",
            ssl=True,
            decode_responses=False
        )
        client.ping()
        logger.info("✅ Connected to Redis\n")
    except Exception as e:
        logger.error(f"❌ Failed to connect to Redis: {e}")
        return False

    try:
        logger.info("📋 Exporting catalog...")
        catalog_result = client.execute_command('JSON.GET', f'{KEY_PREFIX}:catalog', '$')
        if catalog_result:
            catalog_data = json.loads(catalog_result)[0]
            with open(BACKUP_DIR / "catalog.json", 'w') as f:
                json.dump(catalog_data, f, indent=2)
            logger.info("  ✅ Exported: catalog.json")

        logger.info("📋 Exporting solutions...")
        solutions_result = client.execute_command('JSON.GET', f'{KEY_PREFIX}:solutions', '$')
        if solutions_result:
            solutions_data = json.loads(solutions_result)[0]
            with open(BACKUP_DIR / "solutions.json", 'w') as f:
                json.dump(solutions_data, f, indent=2)
            logger.info("  ✅ Exported: solutions.json")

        logger.info("📋 Exporting settings...")
        settings_backup = {}
        
        inspire_result = client.execute_command('JSON.GET', f'{KEY_PREFIX}:settings:inspire', '$')
        if inspire_result:
            settings_backup['inspire'] = json.loads(inspire_result)[0]
        
        avatar_result = client.execute_command('JSON.GET', f'{KEY_PREFIX}:settings:avatar', '$')
        if avatar_result:
            settings_backup['avatar'] = json.loads(avatar_result)[0]
        
        with open(BACKUP_DIR / "settings.json", 'w') as f:
            json.dump(settings_backup, f, indent=2)
        logger.info("  ✅ Exported: settings.json")

        logger.info("📋 Exporting content...")
        content_backup = {}
        
        exec_narr_result = client.execute_command('JSON.GET', f'{KEY_PREFIX}:content:exec_narr', '$')
        if exec_narr_result:
            content_backup['exec_narr'] = json.loads(exec_narr_result)[0]
        
        with open(BACKUP_DIR / "content.json", 'w') as f:
            json.dump(content_backup, f, indent=2)
        logger.info("  ✅ Exported: content.json")

        logger.info("📋 Exporting categories...")
        categories_backup = {'role': {}, 'industry': {}}
        
        role_keys = [key.decode() for key in client.keys(f'{KEY_PREFIX}:role:*')]
        for key in role_keys:
            result = client.execute_command('JSON.GET', key, '$')
            if result:
                data = json.loads(result)[0]
                slug = data.get('slug')
                if slug:
                    categories_backup['role'][slug] = data
        
        industry_keys = [key.decode() for key in client.keys(f'{KEY_PREFIX}:industry:*')]
        for key in industry_keys:
            result = client.execute_command('JSON.GET', key, '$')
            if result:
                data = json.loads(result)[0]
                slug = data.get('slug')
                if slug:
                    categories_backup['industry'][slug] = data
        
        with open(BACKUP_DIR / "categories.json", 'w') as f:
            json.dump(categories_backup, f, indent=2)
        logger.info("  ✅ Exported: categories.json")
        logger.info(f"     - {len(categories_backup['role'])} roles")
        logger.info(f"     - {len(categories_backup['industry'])} industries")

        logger.info("\n✨ Export complete! All backup files written to " + str(BACKUP_DIR))
        return True

    except Exception as e:
        logger.error(f"\n❌ Export failed: {e}")
        return False
    finally:
        client.close()
        logger.info("👋 Disconnected from Redis")


if __name__ == "__main__":
    success = export_redis_to_backup()
    exit(0 if success else 1)
