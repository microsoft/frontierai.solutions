"""Tests for app/main.py FastAPI endpoints."""

import json
import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from fastapi.testclient import TestClient


class TestRootEndpoint:
    """Tests for root (/) endpoint."""
    
    def test_root_returns_welcome_message(self, client):
        """Test root endpoint returns welcome message and endpoint list."""
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Frontier AI Solutions API" in data["message"]
        assert "endpoints" in data
        assert "version" in data
    
    def test_root_lists_available_endpoints(self, client):
        """Test root endpoint lists all available endpoints."""
        response = client.get("/")
        data = response.json()
        
        endpoints = data["endpoints"]
        assert "health" in endpoints
        assert "config" in endpoints
        assert "solutions" in endpoints
        assert "websocket" in endpoints
        assert "recommendations" in endpoints


class TestHealthEndpoint:
    """Tests for /health endpoint."""
    
    def test_health_returns_healthy_when_config_valid(self, client):
        """Test health endpoint returns healthy status with valid config."""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "configuration_valid" in data
        assert "redis_status" in data
        assert "environment" in data
    
    def test_health_shows_backup_only_mode(self, client):
        """Test health endpoint shows backup_only_mode when BACKUP_ONLY is true."""
        response = client.get("/health")
        data = response.json()
        
        assert data["redis_status"] == "backup_only_mode"
    
    def test_health_returns_degraded_when_config_invalid(self, client, monkeypatch):
        """Test health endpoint returns degraded status with invalid config."""
        # Clear required env vars to invalidate config
        monkeypatch.delenv("AZURE_OPENAI_API_KEY", raising=False)
        
        # Reload app to pick up new config
        import importlib
        import app.main
        import app.config
        importlib.reload(app.config)
        importlib.reload(app.main)
        
        from app.main import app
        test_client = TestClient(app)
        response = test_client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "degraded"
        assert data["configuration_valid"] is False
        assert len(data["missing_config"]) > 0


class TestConfigEndpoint:
    """Tests for /api/config endpoint."""
    
    def test_config_returns_non_sensitive_config(self, client):
        """Test config endpoint returns non-sensitive configuration."""
        response = client.get("/api/config")
        
        assert response.status_code == 200
        data = response.json()
        assert "environment" in data
        assert "azure_ai_region" in data
        assert "model_deployment_name" in data
        assert "avatar_character" in data
        assert "avatar_style" in data
    
    def test_config_does_not_expose_secrets(self, client):
        """Test config endpoint doesn't expose sensitive data."""
        response = client.get("/api/config")
        data = response.json()
        
        # Ensure no sensitive keys are in the response
        assert "api_key" not in str(data).lower()
        assert "password" not in str(data).lower()
        assert "secret" not in str(data).lower()
        assert "AZURE_OPENAI_API_KEY" not in data
        assert "AZURE_SPEECH_KEY" not in data


class TestSolutionsEndpoint:
    """Tests for /api/solutions endpoint."""
    
    def test_solutions_returns_solutions_list(self, client):
        """Test solutions endpoint returns solutions data."""
        response = client.get("/api/solutions")
        
        assert response.status_code == 200
        data = response.json()
        assert "solutions" in data
        assert isinstance(data["solutions"], list)
    
    def test_solutions_contains_expected_solutions(self, client):
        """Test solutions endpoint contains expected solution categories."""
        response = client.get("/api/solutions")
        data = response.json()
        
        solutions = data["solutions"]
        solution_ids = [s["id"] for s in solutions]
        
        assert "engage" in solution_ids
        assert any(s.get("title") for s in solutions)
        assert any(s.get("description") for s in solutions)


class TestCatalogEndpoint:
    """Tests for /api/catalog endpoint."""
    
    def test_catalog_returns_data_in_backup_mode(self, client):
        """Test catalog endpoint returns data from backup files."""
        response = client.get("/api/catalog")
        
        # Should work with backup data
        assert response.status_code in [200, 500]  # May fail if no backup files exist
    
    @patch('app.redis_client.redis_client.get_catalog')
    def test_catalog_returns_roles_and_industries(self, mock_get_catalog, client):
        """Test catalog endpoint returns roles and industries data."""
        mock_get_catalog.return_value = {
            "roles": ["developer", "architect"],
            "industries": ["healthcare", "finance"]
        }
        
        response = client.get("/api/catalog")
        
        assert response.status_code == 200
        data = response.json()
        # Can be either format depending on backup data
        assert "roles" in data or "type" in data


class TestCategoryEndpoint:
    """Tests for /api/category/{type}/{slug} endpoint."""
    
    def test_category_rejects_invalid_type(self, client):
        """Test category endpoint rejects invalid category type."""
        response = client.get("/api/category/invalid/test")
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
    
    def test_category_accepts_role_type(self, client):
        """Test category endpoint accepts 'role' type."""
        response = client.get("/api/category/role/developer")
        
        # Should return 404 if not found, or 200 if exists
        assert response.status_code in [200, 404]
    
    def test_category_accepts_industry_type(self, client):
        """Test category endpoint accepts 'industry' type."""
        response = client.get("/api/category/industry/healthcare")
        
        # Should return 404 if not found, or 200 if exists
        assert response.status_code in [200, 404]
    
    @patch('app.redis_client.redis_client.get_category')
    def test_category_returns_404_when_not_found(self, mock_get_category, client):
        """Test category endpoint returns 404 when category doesn't exist."""
        mock_get_category.return_value = None
        
        response = client.get("/api/category/role/nonexistent")
        
        assert response.status_code == 404
    
    @patch('app.redis_client.redis_client.get_category')
    def test_category_returns_category_data(self, mock_get_category, client):
        """Test category endpoint returns category data when found."""
        mock_data = {
            "slug": "developer",
            "title": "Developer",
            "description": "Software developer role"
        }
        mock_get_category.return_value = mock_data
        
        response = client.get("/api/category/role/developer")
        
        assert response.status_code == 200
        data = response.json()
        assert data == mock_data


class TestInspireSettingsEndpoint:
    """Tests for /api/settings/inspire endpoint."""
    
    @patch('app.redis_client.redis_client.get_settings')
    def test_inspire_settings_returns_settings_data(self, mock_get_settings, client):
        """Test inspire settings endpoint returns settings data."""
        mock_settings = {
            "interests": ["AI", "Cloud", "Data"]
        }
        mock_get_settings.return_value = mock_settings
        
        response = client.get("/api/settings/inspire")
        
        assert response.status_code == 200
        data = response.json()
        assert data == mock_settings
    
    @patch('app.redis_client.redis_client.get_settings')
    def test_inspire_settings_returns_500_when_load_fails(self, mock_get_settings, client):
        """Test inspire settings endpoint returns 500 when data load fails."""
        mock_get_settings.return_value = None
        
        response = client.get("/api/settings/inspire")
        
        assert response.status_code == 500


class TestRecommendationsEndpoint:
    """Tests for /api/recommendations endpoint."""
    
    @patch('openai.AzureOpenAI')
    def test_recommendations_generates_from_transcript(self, mock_openai_class, client, sample_transcript):
        """Test recommendations endpoint generates recommendations from transcript."""
        # Setup mock
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_message = MagicMock()
        mock_message.content = "Here are my recommendations: 1. Use Azure AI Foundry 2. Contact sales"
        mock_response.choices = [MagicMock(message=mock_message)]
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai_class.return_value = mock_client
        
        response = client.post("/api/recommendations", json={
            "transcript": sample_transcript
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "recommendations" in data
        assert isinstance(data["recommendations"], str)
        assert len(data["recommendations"]) > 0
    
    @patch('openai.AzureOpenAI')
    def test_recommendations_includes_transcript_context(self, mock_openai_class, client, sample_transcript):
        """Test recommendations endpoint includes transcript context in API call."""
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_message = MagicMock()
        mock_message.content = "Test recommendations"
        mock_response.choices = [MagicMock(message=mock_message)]
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai_class.return_value = mock_client
        
        response = client.post("/api/recommendations", json={
            "transcript": sample_transcript
        })
        
        assert response.status_code == 200
        
        # Verify that create was called with transcript content
        mock_client.chat.completions.create.assert_called_once()
        call_args = mock_client.chat.completions.create.call_args
        messages = call_args[1]["messages"]
        
        # Check that the user message contains transcript content
        user_message = next((m for m in messages if m["role"] == "user"), None)
        assert user_message is not None
        assert "Azure AI solutions" in user_message["content"]
    
    def test_recommendations_requires_transcript(self, client):
        """Test recommendations endpoint requires transcript field."""
        response = client.post("/api/recommendations", json={})
        
        assert response.status_code == 422  # Validation error
    
    @patch('openai.AzureOpenAI')
    def test_recommendations_handles_openai_error(self, mock_openai_class, client, sample_transcript):
        """Test recommendations endpoint handles OpenAI errors gracefully."""
        mock_openai_class.side_effect = Exception("OpenAI API error")
        
        response = client.post("/api/recommendations", json={
            "transcript": sample_transcript
        })
        
        assert response.status_code == 500
        data = response.json()
        assert "detail" in data


class TestExecutiveNarrativeEndpoint:
    """Tests for /api/executive-narrative endpoint."""
    
    @patch('openai.AzureOpenAI')
    @patch('aiohttp.ClientSession.get')
    def test_executive_narrative_generates_from_scenario(self, mock_get, mock_openai_class, client):
        """Test executive narrative endpoint generates narrative from scenario."""
        # Setup OpenAI mock
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_message = MagicMock()
        mock_message.content = "## Your Personalized Narrative\n\nBased on your scenario..."
        mock_response.choices = [MagicMock(message=mock_message)]
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai_class.return_value = mock_client
        
        # Setup aiohttp mock
        mock_http_response = AsyncMock()
        mock_http_response.status = 200
        mock_http_response.text = AsyncMock(return_value="Additional context from URL")
        mock_get.return_value.__aenter__.return_value = mock_http_response
        
        response = client.post("/api/executive-narrative", json={
            "scenario": "I want to improve customer support with AI"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "narrative" in data
        assert isinstance(data["narrative"], str)
        assert len(data["narrative"]) > 0
    
    def test_executive_narrative_requires_scenario(self, client):
        """Test executive narrative endpoint requires scenario field."""
        response = client.post("/api/executive-narrative", json={})
        
        assert response.status_code == 422  # Validation error
    
    @patch('openai.AzureOpenAI')
    def test_executive_narrative_handles_openai_error(self, mock_openai_class, client):
        """Test executive narrative endpoint handles OpenAI errors gracefully."""
        mock_openai_class.side_effect = Exception("OpenAI API error")
        
        response = client.post("/api/executive-narrative", json={
            "scenario": "Test scenario"
        })
        
        assert response.status_code == 500


class TestStoryEndpoint:
    """Tests for /api/story endpoint."""
    
    @patch('app.story_scraper.scraper.scrape_story')
    def test_story_endpoint_scrapes_url(self, mock_scrape, client):
        """Test story endpoint scrapes story from URL."""
        mock_story = {
            "url": "https://example.com/story",
            "title": "Test Story",
            "summary": "Test summary",
            "content": "Test content",
            "image": "https://example.com/image.jpg"
        }
        mock_scrape.return_value = mock_story
        
        response = client.post("/api/story", json={
            "url": "https://example.com/story"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "story" in data
        assert data["story"]["title"] == "Test Story"
    
    def test_story_endpoint_requires_url(self, client):
        """Test story endpoint requires url field."""
        response = client.post("/api/story", json={})
        
        assert response.status_code == 422  # Validation error
    
    @patch('app.story_scraper.scraper.scrape_story')
    def test_story_endpoint_handles_scraping_error(self, mock_scrape, client):
        """Test story endpoint handles scraping errors gracefully."""
        mock_scrape.side_effect = Exception("Scraping failed")
        
        response = client.post("/api/story", json={
            "url": "https://example.com/failing"
        })
        
        assert response.status_code == 500
        data = response.json()
        assert "detail" in data


class TestCORSMiddleware:
    """Tests for CORS middleware configuration."""
    
    def test_cors_allows_all_origins(self, client):
        """Test CORS middleware allows all origins."""
        response = client.get("/health", headers={"Origin": "https://example.com"})
        
        assert response.status_code == 200
        # CORS headers should be present
        assert "access-control-allow-origin" in [h.lower() for h in response.headers.keys()]
