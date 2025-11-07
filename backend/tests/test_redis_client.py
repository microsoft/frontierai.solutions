"""Tests for app/redis_client.py Redis client and backup functionality."""

import json
import os
import pytest
from pathlib import Path
from unittest.mock import MagicMock, patch, mock_open
from app.redis_client import BackupLoader, RedisClient, LazyRedisClient


class TestBackupLoader:
    """Tests for BackupLoader class."""
    
    def test_initialization(self):
        """Test BackupLoader initializes correctly."""
        loader = BackupLoader()
        
        assert loader._cache == {}
        assert loader._loaded is False
        assert loader._redis_unavailable_logged is False
    
    def test_load_backups_loads_all_files(self, monkeypatch, tmp_path):
        """Test _load_backups reads all backup JSON files."""
        # Create temporary backup files
        catalog_data = {"roles": ["developer"], "industries": ["tech"]}
        solutions_data = {"solutions": [{"id": "test", "title": "Test Solution"}]}
        settings_data = {"inspire": {"interests": []}}
        content_data = {"exec_narr": {"context": "test context"}}
        categories_data = {"role": {"developer": {"title": "Developer"}}}
        
        # Write test files
        backup_dir = tmp_path / "data"
        backup_dir.mkdir()
        (backup_dir / "catalog.json").write_text(json.dumps(catalog_data))
        (backup_dir / "solutions.json").write_text(json.dumps(solutions_data))
        (backup_dir / "settings.json").write_text(json.dumps(settings_data))
        (backup_dir / "content.json").write_text(json.dumps(content_data))
        (backup_dir / "categories.json").write_text(json.dumps(categories_data))
        
        # Patch BACKUP_DIR
        with patch('app.redis_client.BACKUP_DIR', backup_dir):
            loader = BackupLoader()
            loader._load_backups()
            
            assert loader._loaded is True
            assert loader._cache['catalog'] == catalog_data
            assert loader._cache['solutions'] == solutions_data
            assert loader._cache['settings'] == settings_data
            assert loader._cache['content'] == content_data
            assert loader._cache['categories'] == categories_data
    
    def test_get_catalog_returns_cached_data(self, tmp_path):
        """Test get_catalog returns catalog data."""
        catalog_data = {"roles": ["developer"]}
        backup_dir = tmp_path / "data"
        backup_dir.mkdir()
        (backup_dir / "catalog.json").write_text(json.dumps(catalog_data))
        
        with patch('app.redis_client.BACKUP_DIR', backup_dir):
            loader = BackupLoader()
            result = loader.get_catalog()
            
            assert result == catalog_data
    
    def test_get_solutions_returns_cached_data(self, tmp_path):
        """Test get_solutions returns solutions data."""
        solutions_data = {"solutions": [{"id": "1"}]}
        backup_dir = tmp_path / "data"
        backup_dir.mkdir()
        (backup_dir / "solutions.json").write_text(json.dumps(solutions_data))
        
        with patch('app.redis_client.BACKUP_DIR', backup_dir):
            loader = BackupLoader()
            result = loader.get_solutions()
            
            assert result == solutions_data
    
    def test_get_category_returns_specific_category(self, tmp_path):
        """Test get_category returns specific category data."""
        categories_data = {
            "role": {"developer": {"title": "Developer", "slug": "developer"}},
            "industry": {"healthcare": {"title": "Healthcare", "slug": "healthcare"}}
        }
        backup_dir = tmp_path / "data"
        backup_dir.mkdir()
        (backup_dir / "categories.json").write_text(json.dumps(categories_data))
        
        with patch('app.redis_client.BACKUP_DIR', backup_dir):
            loader = BackupLoader()
            
            result = loader.get_category("role", "developer")
            assert result == {"title": "Developer", "slug": "developer"}
            
            result = loader.get_category("industry", "healthcare")
            assert result == {"title": "Healthcare", "slug": "healthcare"}
    
    def test_get_category_returns_none_when_not_found(self, tmp_path):
        """Test get_category returns None when category doesn't exist."""
        categories_data = {"role": {}}
        backup_dir = tmp_path / "data"
        backup_dir.mkdir()
        (backup_dir / "categories.json").write_text(json.dumps(categories_data))
        
        with patch('app.redis_client.BACKUP_DIR', backup_dir):
            loader = BackupLoader()
            result = loader.get_category("role", "nonexistent")
            
            assert result is None
    
    def test_get_settings_returns_specific_setting(self, tmp_path):
        """Test get_settings returns specific setting type."""
        settings_data = {
            "inspire": {"interests": ["ai", "cloud"]},
            "other": {"value": "test"}
        }
        backup_dir = tmp_path / "data"
        backup_dir.mkdir()
        (backup_dir / "settings.json").write_text(json.dumps(settings_data))
        
        with patch('app.redis_client.BACKUP_DIR', backup_dir):
            loader = BackupLoader()
            result = loader.get_settings("inspire")
            
            assert result == {"interests": ["ai", "cloud"]}
    
    def test_get_content_returns_specific_content(self, tmp_path):
        """Test get_content returns specific content type."""
        content_data = {
            "exec_narr": {"context": "Executive narrative context"},
            "other": {"value": "test"}
        }
        backup_dir = tmp_path / "data"
        backup_dir.mkdir()
        (backup_dir / "content.json").write_text(json.dumps(content_data))
        
        with patch('app.redis_client.BACKUP_DIR', backup_dir):
            loader = BackupLoader()
            result = loader.get_content("exec_narr")
            
            assert result == {"context": "Executive narrative context"}
    
    def test_log_redis_unavailable_logs_once(self):
        """Test log_redis_unavailable only logs once per process."""
        loader = BackupLoader()
        
        assert loader._redis_unavailable_logged is False
        
        loader.log_redis_unavailable()
        assert loader._redis_unavailable_logged is True
        
        # Calling again shouldn't change state
        loader.log_redis_unavailable()
        assert loader._redis_unavailable_logged is True


class TestRedisClient:
    """Tests for RedisClient class."""
    
    def test_initialization_backup_only_mode(self, monkeypatch):
        """Test RedisClient initializes in backup-only mode."""
        monkeypatch.setenv("BACKUP_ONLY", "true")
        
        client = RedisClient()
        
        assert client.redis_available is False
        assert client.backup_loader is not None
    
    def test_initialization_without_redis_config(self, monkeypatch):
        """Test RedisClient initializes without Redis when config missing."""
        monkeypatch.delenv("REDIS_HOST", raising=False)
        monkeypatch.delenv("REDIS_PASSWORD", raising=False)
        monkeypatch.setenv("BACKUP_ONLY", "false")
        
        client = RedisClient()
        
        assert client.redis_available is False
    
    @patch('app.redis_client.redis.Redis')
    def test_initialization_with_redis_config(self, mock_redis, monkeypatch):
        """Test RedisClient initializes Redis when config present."""
        monkeypatch.setenv("REDIS_HOST", "test-redis.com")
        monkeypatch.setenv("REDIS_PASSWORD", "test-password")
        monkeypatch.setenv("REDIS_PORT", "6380")
        monkeypatch.delenv("BACKUP_ONLY", raising=False)
        
        # Reload the module to pick up new env vars
        import importlib
        import app.redis_client
        importlib.reload(app.redis_client)
        
        # Mock successful connection
        mock_instance = MagicMock()
        mock_instance.ping.return_value = True
        mock_redis.return_value = mock_instance
        
        from app.redis_client import RedisClient
        client = RedisClient()
        
        assert client.redis_available is True
        mock_redis.assert_called_once_with(
            host="test-redis.com",
            port=6380,
            password="test-password",
            username="default",
            ssl=True,
            decode_responses=False,
            socket_connect_timeout=2,
            socket_timeout=2
        )
    
    @patch('app.redis_client.redis.Redis')
    def test_test_connection_marks_available_on_success(self, mock_redis, monkeypatch):
        """Test _test_connection sets redis_available to True on success."""
        monkeypatch.setenv("REDIS_HOST", "test-redis.com")
        monkeypatch.setenv("REDIS_PASSWORD", "test-password")
        monkeypatch.delenv("BACKUP_ONLY", raising=False)
        
        # Reload the module to pick up new env vars
        import importlib
        import app.redis_client
        importlib.reload(app.redis_client)
        
        mock_instance = MagicMock()
        mock_instance.ping.return_value = True
        mock_redis.return_value = mock_instance
        
        from app.redis_client import RedisClient
        client = RedisClient()
        
        assert client.redis_available is True
    
    @patch('app.redis_client.redis.Redis')
    def test_test_connection_marks_unavailable_on_failure(self, mock_redis, monkeypatch):
        """Test _test_connection sets redis_available to False on failure."""
        monkeypatch.setenv("REDIS_HOST", "test-redis.com")
        monkeypatch.setenv("REDIS_PASSWORD", "test-password")
        monkeypatch.setenv("BACKUP_ONLY", "false")
        
        mock_instance = MagicMock()
        mock_instance.ping.side_effect = Exception("Connection failed")
        mock_redis.return_value = mock_instance
        
        client = RedisClient()
        
        assert client.redis_available is False
    
    @patch('app.redis_client.redis.Redis')
    def test_get_json_returns_data_from_redis(self, mock_redis, monkeypatch):
        """Test get_json retrieves data from Redis when available."""
        monkeypatch.setenv("REDIS_HOST", "test-redis.com")
        monkeypatch.setenv("REDIS_PASSWORD", "test-password")
        monkeypatch.delenv("BACKUP_ONLY", raising=False)
        
        # Reload the module to pick up new env vars
        import importlib
        import app.redis_client
        importlib.reload(app.redis_client)
        
        test_data = {"key": "value", "number": 42}
        mock_instance = MagicMock()
        mock_instance.ping.return_value = True
        mock_instance.execute_command.return_value = json.dumps([test_data])
        mock_redis.return_value = mock_instance
        
        from app.redis_client import RedisClient
        client = RedisClient()
        result = client.get_json("test:key")
        
        assert result == test_data
        mock_instance.execute_command.assert_called_once_with('JSON.GET', 'test:key', '$')
    
    @patch('app.redis_client.redis.Redis')
    def test_get_json_returns_none_when_key_not_found(self, mock_redis, monkeypatch):
        """Test get_json returns None when key doesn't exist in Redis."""
        monkeypatch.setenv("REDIS_HOST", "test-redis.com")
        monkeypatch.setenv("REDIS_PASSWORD", "test-password")
        monkeypatch.setenv("BACKUP_ONLY", "false")
        
        mock_instance = MagicMock()
        mock_instance.ping.return_value = True
        mock_instance.execute_command.return_value = None
        mock_redis.return_value = mock_instance
        
        client = RedisClient()
        result = client.get_json("nonexistent:key")
        
        assert result is None
    
    @patch('app.redis_client.redis.Redis')
    def test_get_json_handles_redis_error(self, mock_redis, monkeypatch):
        """Test get_json handles Redis errors gracefully."""
        monkeypatch.setenv("REDIS_HOST", "test-redis.com")
        monkeypatch.setenv("REDIS_PASSWORD", "test-password")
        monkeypatch.setenv("BACKUP_ONLY", "false")
        
        mock_instance = MagicMock()
        mock_instance.ping.return_value = True
        mock_instance.execute_command.side_effect = Exception("Redis error")
        mock_redis.return_value = mock_instance
        
        client = RedisClient()
        result = client.get_json("test:key")
        
        assert result is None
        assert client.redis_available is False
    
    def test_get_catalog_falls_back_to_backup(self, monkeypatch, tmp_path):
        """Test get_catalog falls back to backup when Redis unavailable."""
        monkeypatch.setenv("BACKUP_ONLY", "true")
        
        catalog_data = {"roles": ["developer"]}
        backup_dir = tmp_path / "data"
        backup_dir.mkdir()
        (backup_dir / "catalog.json").write_text(json.dumps(catalog_data))
        
        with patch('app.redis_client.BACKUP_DIR', backup_dir):
            client = RedisClient()
            result = client.get_catalog()
            
            assert result == catalog_data


class TestLazyRedisClient:
    """Tests for LazyRedisClient wrapper."""
    
    def test_lazy_initialization(self, monkeypatch):
        """Test LazyRedisClient doesn't create client until first use."""
        monkeypatch.setenv("BACKUP_ONLY", "true")
        
        lazy_client = LazyRedisClient()
        
        assert lazy_client._client is None
    
    def test_get_catalog_creates_client_on_demand(self, monkeypatch, tmp_path):
        """Test LazyRedisClient creates client on first method call."""
        monkeypatch.setenv("BACKUP_ONLY", "true")
        
        catalog_data = {"roles": ["developer"]}
        backup_dir = tmp_path / "data"
        backup_dir.mkdir()
        (backup_dir / "catalog.json").write_text(json.dumps(catalog_data))
        
        with patch('app.redis_client.BACKUP_DIR', backup_dir):
            lazy_client = LazyRedisClient()
            
            assert lazy_client._client is None
            
            result = lazy_client.get_catalog()
            
            assert lazy_client._client is not None
            assert result == catalog_data
    
    def test_reuses_client_instance(self, monkeypatch, tmp_path):
        """Test LazyRedisClient reuses the same client instance."""
        monkeypatch.setenv("BACKUP_ONLY", "true")
        
        backup_dir = tmp_path / "data"
        backup_dir.mkdir()
        (backup_dir / "catalog.json").write_text(json.dumps({"test": "data"}))
        (backup_dir / "solutions.json").write_text(json.dumps({"test": "data"}))
        
        with patch('app.redis_client.BACKUP_DIR', backup_dir):
            lazy_client = LazyRedisClient()
            
            lazy_client.get_catalog()
            first_client = lazy_client._client
            
            lazy_client.get_solutions()
            second_client = lazy_client._client
            
            assert first_client is second_client
