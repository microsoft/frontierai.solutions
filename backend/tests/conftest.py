"""Shared test fixtures for Frontier AI Solutions backend tests."""

import os
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, AsyncMock


@pytest.fixture
def mock_env_vars(monkeypatch):
    """Set up mock environment variables for testing."""
    monkeypatch.setenv("AZURE_OPENAI_ENDPOINT", "https://test.openai.azure.com/")
    monkeypatch.setenv("AZURE_OPENAI_API_KEY", "test-key-12345")
    monkeypatch.setenv("AZURE_SPEECH_KEY", "test-speech-key-12345")
    monkeypatch.setenv("AZURE_SPEECH_REGION", "eastus2")
    monkeypatch.setenv("AZURE_AI_RESOURCE_NAME", "test-resource")
    monkeypatch.setenv("AZURE_AI_REGION", "eastus2")
    monkeypatch.setenv("MODEL_DEPLOYMENT_NAME", "gpt-4o")
    monkeypatch.setenv("BACKUP_ONLY", "true")
    monkeypatch.setenv("ENVIRONMENT", "test")


@pytest.fixture
def client(mock_env_vars):
    """FastAPI test client fixture with mocked environment."""
    from app.main import app
    return TestClient(app)


@pytest.fixture
def mock_openai_client():
    """Mock Azure OpenAI client for testing."""
    mock_response = MagicMock()
    mock_message = MagicMock()
    mock_message.content = "Test AI response with recommendations"
    mock_response.choices = [MagicMock(message=mock_message)]
    
    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = mock_response
    
    return mock_client


@pytest.fixture
def sample_transcript():
    """Sample conversation transcript for testing."""
    return [
        {
            "role": "user",
            "content": "Hello, I need help with Azure AI solutions",
            "timestamp": "2024-01-01T00:00:00Z"
        },
        {
            "role": "assistant",
            "content": "I'd be happy to help you with Azure AI solutions!",
            "timestamp": "2024-01-01T00:00:01Z"
        },
        {
            "role": "user",
            "content": "What solutions do you recommend for customer support?",
            "timestamp": "2024-01-01T00:00:05Z"
        }
    ]


@pytest.fixture
def mock_redis():
    """Mock Redis client for testing."""
    mock_client = MagicMock()
    mock_client.ping.return_value = True
    mock_client.execute_command.return_value = '{"test": "data"}'
    return mock_client


@pytest.fixture
def mock_websocket():
    """Mock WebSocket for testing."""
    mock_ws = AsyncMock()
    mock_ws.accept = AsyncMock()
    mock_ws.send_text = AsyncMock()
    mock_ws.receive_text = AsyncMock()
    mock_ws.close = AsyncMock()
    return mock_ws


@pytest.fixture
def mock_azure_websocket():
    """Mock Azure WebSocket connection for testing."""
    mock_ws = AsyncMock()
    mock_ws.send = AsyncMock()
    mock_ws.recv = AsyncMock(return_value='{"type": "session.updated"}')
    mock_ws.close = AsyncMock()
    mock_ws.__aenter__ = AsyncMock(return_value=mock_ws)
    mock_ws.__aexit__ = AsyncMock()
    return mock_ws
