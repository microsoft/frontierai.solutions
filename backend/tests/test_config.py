"""Tests for app/config.py configuration management."""

import os
import pytest
from app.config import Config


class TestConfig:
    """Tests for Config class."""
    
    def test_config_initialization_with_defaults(self, monkeypatch):
        """Test Config initializes with default values."""
        # Clear all env vars
        for key in list(os.environ.keys()):
            if key.startswith("AZURE") or key in ["MODEL_DEPLOYMENT_NAME", "ENVIRONMENT"]:
                monkeypatch.delenv(key, raising=False)
        
        config = Config()
        
        assert config.PORT == 8000
        assert config.ENVIRONMENT == "development"
        assert config.MODEL_DEPLOYMENT_NAME == "gpt-4o"
        assert config.AZURE_AI_REGION == "eastus2"
        assert config.AZURE_SPEECH_REGION == "eastus2"
        assert config.AZURE_AVATAR_CHARACTER == "lori"
        assert config.AZURE_AVATAR_STYLE == "graceful"
        assert config.AI_TEMPERATURE == 0.8
        assert config.MAX_RESPONSE_TOKENS == 4096
        assert config.RECOMMENDATIONS_MAX_TOKENS == 800
    
    def test_config_initialization_with_env_vars(self, monkeypatch):
        """Test Config reads from environment variables."""
        monkeypatch.setenv("PORT", "9000")
        monkeypatch.setenv("ENVIRONMENT", "production")
        monkeypatch.setenv("AZURE_OPENAI_ENDPOINT", "https://prod.openai.azure.com/")
        monkeypatch.setenv("AZURE_OPENAI_API_KEY", "prod-key-123")
        monkeypatch.setenv("AZURE_SPEECH_KEY", "speech-key-456")
        monkeypatch.setenv("AZURE_SPEECH_REGION", "westus")
        monkeypatch.setenv("AZURE_AI_RESOURCE_NAME", "prod-resource")
        monkeypatch.setenv("MODEL_DEPLOYMENT_NAME", "gpt-4")
        monkeypatch.setenv("AZURE_AVATAR_CHARACTER", "maya")
        monkeypatch.setenv("AZURE_AVATAR_STYLE", "professional")
        monkeypatch.setenv("AI_TEMPERATURE", "0.5")
        monkeypatch.setenv("MAX_RESPONSE_TOKENS", "2048")
        monkeypatch.setenv("RECOMMENDATIONS_MAX_TOKENS", "500")
        
        config = Config()
        
        assert config.PORT == 9000
        assert config.ENVIRONMENT == "production"
        assert config.AZURE_OPENAI_ENDPOINT == "https://prod.openai.azure.com/"
        assert config.AZURE_OPENAI_API_KEY == "prod-key-123"
        assert config.AZURE_SPEECH_KEY == "speech-key-456"
        assert config.AZURE_SPEECH_REGION == "westus"
        assert config.AZURE_AI_RESOURCE_NAME == "prod-resource"
        assert config.MODEL_DEPLOYMENT_NAME == "gpt-4"
        assert config.AZURE_AVATAR_CHARACTER == "maya"
        assert config.AZURE_AVATAR_STYLE == "professional"
        assert config.AI_TEMPERATURE == 0.5
        assert config.MAX_RESPONSE_TOKENS == 2048
        assert config.RECOMMENDATIONS_MAX_TOKENS == 500
    
    def test_validate_returns_true_when_all_required_present(self, monkeypatch):
        """Test validation passes when all required config is present."""
        monkeypatch.setenv("AZURE_OPENAI_ENDPOINT", "https://test.openai.azure.com/")
        monkeypatch.setenv("AZURE_OPENAI_API_KEY", "test-key")
        monkeypatch.setenv("AZURE_SPEECH_KEY", "speech-key")
        monkeypatch.setenv("AZURE_SPEECH_REGION", "eastus2")
        monkeypatch.setenv("AZURE_AI_RESOURCE_NAME", "test-resource")
        monkeypatch.setenv("MODEL_DEPLOYMENT_NAME", "gpt-4o")
        
        config = Config()
        is_valid, missing = config.validate()
        
        assert is_valid is True
        assert missing == []
    
    def test_validate_returns_false_when_openai_endpoint_missing(self, monkeypatch):
        """Test validation fails when AZURE_OPENAI_ENDPOINT is missing."""
        monkeypatch.delenv("AZURE_OPENAI_ENDPOINT", raising=False)
        monkeypatch.setenv("AZURE_OPENAI_API_KEY", "test-key")
        monkeypatch.setenv("AZURE_SPEECH_KEY", "speech-key")
        monkeypatch.setenv("AZURE_SPEECH_REGION", "eastus2")
        monkeypatch.setenv("AZURE_AI_RESOURCE_NAME", "test-resource")
        monkeypatch.setenv("MODEL_DEPLOYMENT_NAME", "gpt-4o")
        
        config = Config()
        is_valid, missing = config.validate()
        
        assert is_valid is False
        assert "AZURE_OPENAI_ENDPOINT" in missing
    
    def test_validate_returns_false_when_openai_api_key_missing(self, monkeypatch):
        """Test validation fails when AZURE_OPENAI_API_KEY is missing."""
        monkeypatch.setenv("AZURE_OPENAI_ENDPOINT", "https://test.openai.azure.com/")
        monkeypatch.delenv("AZURE_OPENAI_API_KEY", raising=False)
        monkeypatch.setenv("AZURE_SPEECH_KEY", "speech-key")
        monkeypatch.setenv("AZURE_SPEECH_REGION", "eastus2")
        monkeypatch.setenv("AZURE_AI_RESOURCE_NAME", "test-resource")
        monkeypatch.setenv("MODEL_DEPLOYMENT_NAME", "gpt-4o")
        
        config = Config()
        is_valid, missing = config.validate()
        
        assert is_valid is False
        assert "AZURE_OPENAI_API_KEY" in missing
    
    def test_validate_returns_all_missing_fields(self, monkeypatch):
        """Test validation returns all missing required fields."""
        # Clear all required env vars
        for key in ["AZURE_OPENAI_ENDPOINT", "AZURE_OPENAI_API_KEY", "AZURE_SPEECH_KEY", 
                    "AZURE_SPEECH_REGION", "AZURE_AI_RESOURCE_NAME", "MODEL_DEPLOYMENT_NAME"]:
            monkeypatch.delenv(key, raising=False)
        
        config = Config()
        is_valid, missing = config.validate()
        
        assert is_valid is False
        assert len(missing) > 0
        assert "AZURE_OPENAI_ENDPOINT" in missing
        assert "AZURE_OPENAI_API_KEY" in missing
        assert "AZURE_SPEECH_KEY" in missing
        assert "AZURE_AI_RESOURCE_NAME" in missing
    
    def test_to_dict_returns_non_sensitive_config(self, monkeypatch):
        """Test to_dict returns only non-sensitive configuration."""
        monkeypatch.setenv("ENVIRONMENT", "production")
        monkeypatch.setenv("AZURE_AI_REGION", "westus2")
        monkeypatch.setenv("MODEL_DEPLOYMENT_NAME", "gpt-4")
        monkeypatch.setenv("AZURE_AVATAR_CHARACTER", "maya")
        monkeypatch.setenv("AZURE_AVATAR_STYLE", "casual")
        monkeypatch.setenv("AZURE_OPENAI_API_KEY", "secret-key-should-not-appear")
        
        config = Config()
        config_dict = config.to_dict()
        
        assert config_dict["environment"] == "production"
        assert config_dict["azure_ai_region"] == "westus2"
        assert config_dict["model_deployment_name"] == "gpt-4"
        assert config_dict["avatar_character"] == "maya"
        assert config_dict["avatar_style"] == "casual"
        
        # Ensure sensitive data is NOT in the output
        assert "AZURE_OPENAI_API_KEY" not in str(config_dict)
        assert "secret-key" not in str(config_dict).lower()
        assert "api_key" not in config_dict
    
    def test_to_dict_structure(self, monkeypatch):
        """Test to_dict returns expected structure."""
        monkeypatch.setenv("ENVIRONMENT", "test")
        
        config = Config()
        config_dict = config.to_dict()
        
        assert isinstance(config_dict, dict)
        assert "environment" in config_dict
        assert "azure_ai_region" in config_dict
        assert "model_deployment_name" in config_dict
        assert "avatar_character" in config_dict
        assert "avatar_style" in config_dict
    
    def test_voicelive_endpoint_construction(self, monkeypatch):
        """Test AZURE_VOICELIVE_ENDPOINT is constructed correctly."""
        monkeypatch.setenv("AZURE_AI_REGION", "westeurope")
        
        config = Config()
        
        assert config.AZURE_VOICELIVE_ENDPOINT == "wss://westeurope.api.cognitive.microsoft.com/openai/realtime"
    
    def test_voicelive_endpoint_custom(self, monkeypatch):
        """Test AZURE_VOICELIVE_ENDPOINT can be overridden."""
        custom_endpoint = "wss://custom.endpoint.com/realtime"
        monkeypatch.setenv("AZURE_VOICELIVE_ENDPOINT", custom_endpoint)
        
        config = Config()
        
        assert config.AZURE_VOICELIVE_ENDPOINT == custom_endpoint
