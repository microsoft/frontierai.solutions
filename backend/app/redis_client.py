"""Redis client for accessing cached data with local backup fallback."""

import redis
import json
import os
from typing import Optional, Any
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")
BACKUP_ONLY = os.getenv("BACKUP_ONLY", "false").lower() == "true"
KEY_PREFIX = "fas"
BACKUP_DIR = Path(__file__).parent.parent / "data"

class BackupLoader:
    """Loads and caches backup JSON files."""
    
    def __init__(self):
        """Initialize backup loader with in-memory cache."""
        self._cache = {}
        self._loaded = False
        self._redis_unavailable_logged = False
    
    def _load_backups(self):
        """Lazy-load all backup files into memory cache."""
        if self._loaded:
            return
        
        try:
            catalog_path = BACKUP_DIR / "catalog.json"
            if catalog_path.exists():
                with open(catalog_path, 'r') as f:
                    self._cache['catalog'] = json.load(f)
            
            solutions_path = BACKUP_DIR / "solutions.json"
            if solutions_path.exists():
                with open(solutions_path, 'r') as f:
                    self._cache['solutions'] = json.load(f)
            
            settings_path = BACKUP_DIR / "settings.json"
            if settings_path.exists():
                with open(settings_path, 'r') as f:
                    settings_data = json.load(f)
                    self._cache['settings'] = settings_data
            
            content_path = BACKUP_DIR / "content.json"
            if content_path.exists():
                with open(content_path, 'r') as f:
                    content_data = json.load(f)
                    self._cache['content'] = content_data
            
            categories_path = BACKUP_DIR / "categories.json"
            if categories_path.exists():
                with open(categories_path, 'r') as f:
                    categories_data = json.load(f)
                    self._cache['categories'] = categories_data
            
            self._loaded = True
            logger.info(f"Loaded backup data from {BACKUP_DIR}")
        except Exception as e:
            logger.error(f"Failed to load backup files: {e}")
    
    def get_catalog(self) -> Optional[dict]:
        """Get catalog from backup."""
        self._load_backups()
        return self._cache.get('catalog')
    
    def get_solutions(self) -> Optional[dict]:
        """Get solutions from backup."""
        self._load_backups()
        return self._cache.get('solutions')
    
    def get_category(self, category_type: str, slug: str) -> Optional[dict]:
        """Get category from backup."""
        self._load_backups()
        categories = self._cache.get('categories', {})
        return categories.get(category_type, {}).get(slug)
    
    def get_settings(self, setting_type: str) -> Optional[dict]:
        """Get settings from backup."""
        self._load_backups()
        settings = self._cache.get('settings', {})
        return settings.get(setting_type)
    
    def get_content(self, content_type: str) -> Optional[dict]:
        """Get content from backup."""
        self._load_backups()
        content = self._cache.get('content', {})
        return content.get(content_type)
    
    def log_redis_unavailable(self):
        """Log Redis unavailability once per process."""
        if not self._redis_unavailable_logged:
            logger.warning("Redis unavailable, using local backup files")
            self._redis_unavailable_logged = True


class RedisClient:
    """Redis client wrapper for JSON operations with backup fallback."""
    
    def __init__(self):
        """Initialize Redis client."""
        self.redis_available = False
        self.backup_loader = BackupLoader()
        
        if BACKUP_ONLY:
            logger.info("BACKUP_ONLY mode enabled, skipping Redis connection")
            return
        
        if not REDIS_HOST or not REDIS_PASSWORD:
            logger.warning("REDIS_HOST or REDIS_PASSWORD not set, will use backup files only")
            return
        
        try:
            self.client = redis.Redis(
                host=REDIS_HOST,
                port=REDIS_PORT,
                password=REDIS_PASSWORD,
                username="default",
                ssl=True,
                decode_responses=False,
                socket_connect_timeout=2,
                socket_timeout=2
            )
            self._test_connection()
        except Exception as e:
            logger.warning(f"Failed to initialize Redis client: {e}. Will use backup files.")
            self.client = None
    
    def _test_connection(self):
        """Test Redis connection."""
        try:
            self.client.ping()
            self.redis_available = True
            logger.info("Successfully connected to Redis")
        except Exception as e:
            logger.warning(f"Redis connection test failed: {e}. Will use backup files.")
            self.redis_available = False
    
    def get_json(self, key: str) -> Optional[Any]:
        """Get JSON document from Redis with backup fallback."""
        if self.redis_available and self.client:
            try:
                result = self.client.execute_command('JSON.GET', key, '$')
                if result:
                    data = json.loads(result)
                    return data[0] if isinstance(data, list) and len(data) > 0 else data
                logger.debug(f"Key not found in Redis: {key}")
            except Exception as e:
                logger.warning(f"Error getting key {key} from Redis: {e}. Falling back to backup.")
                self.redis_available = False
        
        return None
    
    def get_catalog(self) -> Optional[dict]:
        """Get catalog index from Redis or backup."""
        result = self.get_json(f"{KEY_PREFIX}:catalog")
        if result is None:
            self.backup_loader.log_redis_unavailable()
            result = self.backup_loader.get_catalog()
        return result
    
    def get_solutions(self) -> Optional[dict]:
        """Get solutions document from Redis or backup."""
        result = self.get_json(f"{KEY_PREFIX}:solutions")
        if result is None:
            self.backup_loader.log_redis_unavailable()
            result = self.backup_loader.get_solutions()
        return result
    
    def get_category(self, category_type: str, slug: str) -> Optional[dict]:
        """Get category document from Redis or backup."""
        key = f"{KEY_PREFIX}:{category_type}:{slug}"
        result = self.get_json(key)
        if result is None:
            self.backup_loader.log_redis_unavailable()
            result = self.backup_loader.get_category(category_type, slug)
        return result
    
    def get_settings(self, setting_type: str) -> Optional[dict]:
        """Get settings document from Redis or backup."""
        key = f"{KEY_PREFIX}:settings:{setting_type}"
        result = self.get_json(key)
        if result is None:
            self.backup_loader.log_redis_unavailable()
            result = self.backup_loader.get_settings(setting_type)
        return result
    
    def get_content(self, content_type: str) -> Optional[dict]:
        """Get content document from Redis or backup."""
        key = f"{KEY_PREFIX}:content:{content_type}"
        result = self.get_json(key)
        if result is None:
            self.backup_loader.log_redis_unavailable()
            result = self.backup_loader.get_content(content_type)
        return result

class LazyRedisClient:
    """Lazy-loading wrapper for RedisClient."""
    
    def __init__(self):
        self._client = None
    
    def _get_client(self) -> RedisClient:
        if self._client is None:
            self._client = RedisClient()
        return self._client
    
    def get_catalog(self):
        return self._get_client().get_catalog()
    
    def get_solutions(self):
        return self._get_client().get_solutions()
    
    def get_category(self, category_type: str, slug: str):
        return self._get_client().get_category(category_type, slug)
    
    def get_settings(self, setting_type: str):
        return self._get_client().get_settings(setting_type)
    
    def get_content(self, content_type: str):
        return self._get_client().get_content(content_type)

redis_client = LazyRedisClient()
