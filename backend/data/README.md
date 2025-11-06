# Redis Backup Files

This directory contains local backup JSON files for all application data stored in Redis. These files serve as a fallback data source if Redis becomes unavailable.

## Files

- **catalog.json** - Index of all roles and industries
- **solutions.json** - Solutions metadata (Engage, Explore, Envision)
- **settings.json** - Application settings (inspire interests, avatar defaults)
- **content.json** - Executive narrative content and URLs
- **categories.json** - All role and industry data with use cases and solutions

## Fallback Behavior

The backend automatically falls back to these files if:
- Redis connection fails
- Redis credentials are not configured
- A specific key is not found in Redis
- `BACKUP_ONLY=true` environment variable is set

The fallback is transparent to the application - data is loaded from backup files with in-memory caching for performance.

## Keeping Backups in Sync

After making changes to Redis data, run the export script to update these backup files:

```bash
# From the backend directory
python scripts/export_redis_to_backup.py
```

Or run the migration script which writes to both Redis and backup files:

```bash
# From the frontend directory
npx tsx scripts/migrate-to-redis-and-backup.ts
```

**Important:** After updating these files, commit them to version control to ensure the backup is up to date.

## Environment Variables

The export and migration scripts require:
- `REDIS_HOST` - Redis server hostname
- `REDIS_PORT` - Redis server port (default: 6379)
- `REDIS_PASSWORD` - Redis password

Set these in `backend/.env` (not committed to version control).
