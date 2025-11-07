# Backend Tests

Comprehensive test suite for the Frontier AI Solutions backend.

## Quick Start

```bash
# Run all tests
uv run pytest tests/

# Run with verbose output
uv run pytest tests/ -v

# Run with coverage
uv run pytest tests/ --cov=app --cov-report=term --cov-report=html

# Run specific test file
uv run pytest tests/test_main.py

# Run specific test class
uv run pytest tests/test_main.py::TestHealthEndpoint

# Run specific test function
uv run pytest tests/test_config.py::TestConfig::test_validate_returns_true_when_all_required_present
```

## Test Coverage

- **Overall**: 87%
- **99 tests** covering all critical functionality
- All tests passing

See [TEST_COVERAGE_REPORT.md](../TEST_COVERAGE_REPORT.md) for detailed coverage information.

## Test Structure

```
tests/
├── __init__.py
├── conftest.py              # Shared fixtures and utilities
├── test_config.py           # Configuration tests (10 tests)
├── test_redis_client.py     # Redis client tests (21 tests)
├── test_story_scraper.py    # Story scraper tests (18 tests)
├── test_main.py             # API endpoint tests (29 tests)
└── test_websocket_handler.py # WebSocket tests (21 tests)
```

## Test Categories

### Unit Tests
- Configuration management
- Redis client with backup fallback
- Story scraping and caching
- Data transformation logic

### Integration Tests
- All HTTP endpoints
- WebSocket proxy initialization
- Error handling scenarios
- CORS middleware

### Async Tests
- WebSocket message forwarding
- Async HTTP operations
- Azure service integrations

## Fixtures

Common fixtures are defined in `conftest.py`:

- `mock_env_vars` - Mocked environment variables
- `client` - FastAPI TestClient
- `mock_openai_client` - Mocked Azure OpenAI
- `sample_transcript` - Sample conversation data
- `mock_redis` - Mocked Redis client
- `mock_websocket` - Mocked WebSocket connection
- `mock_azure_websocket` - Mocked Azure WebSocket

## Running Tests in CI/CD

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: |
    cd backend
    uv sync
    uv run pytest tests/ --cov=app --cov-report=xml

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./backend/coverage.xml
```

## Writing New Tests

### Example Test

```python
import pytest
from unittest.mock import patch

def test_my_feature(client, mock_env_vars):
    """Test description."""
    # Arrange
    expected_result = {"status": "ok"}
    
    # Act
    response = client.get("/api/my-endpoint")
    
    # Assert
    assert response.status_code == 200
    assert response.json() == expected_result
```

### Async Test Example

```python
import pytest
from unittest.mock import AsyncMock

@pytest.mark.asyncio
async def test_async_feature(mock_websocket):
    """Test async functionality."""
    mock_websocket.receive_text.return_value = '{"type": "test"}'
    
    # Your async test code here
    await some_async_function(mock_websocket)
    
    mock_websocket.send_text.assert_called_once()
```

## Test Requirements

All test dependencies are managed through `pyproject.toml`:

```toml
dependencies = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.25.0",
    "pytest-mock>=3.14.0",
    "pytest-cov>=6.0.0",
    "httpx>=0.28.0",
]
```

## Mocking Strategy

- **Azure OpenAI**: Mocked at `openai.AzureOpenAI` level
- **Redis**: Mocked at `app.redis_client.redis.Redis` level
- **WebSockets**: Mocked at `websockets.connect` level
- **HTTP Requests**: Mocked with `requests.get` and `aiohttp.ClientSession.get`
- **File System**: Mocked with `mock_open` for cache files

## Common Issues

### Environment Variables

Tests use isolated environment variables via `monkeypatch`. The `mock_env_vars` fixture sets up a clean test environment with `BACKUP_ONLY=true` to avoid requiring Redis.

### Module Reloading

Some tests reload modules to pick up environment variable changes:

```python
import importlib
import app.config
importlib.reload(app.config)
```

### Async Iterator Mocking

For async iterators (like WebSocket message streams), use a custom class:

```python
class AsyncIterator:
    def __init__(self, items):
        self.items = items
        self.index = 0
    
    def __aiter__(self):
        return self
    
    async def __anext__(self):
        if self.index >= len(self.items):
            raise StopAsyncIteration
        item = self.items[self.index]
        self.index += 1
        return item
```

## Coverage Goals

- **Critical paths**: 100% coverage (config validation, authentication)
- **API endpoints**: 90%+ coverage
- **Overall**: 80%+ coverage

Current: **87%** ✅

## Contributing

When adding new functionality:

1. Write tests first (TDD)
2. Ensure tests cover happy path, error cases, and edge cases
3. Run tests locally before committing
4. Maintain or improve coverage percentage
5. Update this README if adding new test patterns

## References

- [pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing Guide](https://fastapi.tiangolo.com/tutorial/testing/)
- [pytest-asyncio](https://pytest-asyncio.readthedocs.io/)
- [Coverage.py](https://coverage.readthedocs.io/)
