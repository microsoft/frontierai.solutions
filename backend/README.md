# Backend - Frontier AI Solutions

FastAPI backend service providing REST API endpoints and WebSocket proxy for real-time voice interactions with Azure AI services.

## Architecture

The backend serves as a bridge between the frontend client and Azure AI services, handling:
- HTTP REST API for configuration, solutions catalog, and AI recommendations
- WebSocket proxy for bidirectional audio streaming with Azure Voice Live API
- Configuration management and validation
- Redis caching with local JSON fallback

## Code Organization

```
backend/
├── app/
│   ├── __init__.py              # Package initialization
│   ├── main.py                  # FastAPI application & endpoints
│   ├── config.py                # Configuration management
│   ├── websocket_handler.py     # Voice WebSocket proxy
│   ├── redis_client.py          # Redis client with fallback
│   └── story_scraper.py         # Content scraping utilities
├── data/                        # Local JSON backup files
│   ├── catalog.json            # Solutions catalog index
│   ├── categories.json         # Role and industry categories
│   ├── solutions.json          # Available solutions
│   ├── settings.json           # Application settings
│   └── content.json            # Content for narratives
├── scripts/
│   └── export_redis_to_backup.py  # Redis export utility
├── Dockerfile                   # Container image definition
├── pyproject.toml              # Python dependencies (uv)
├── uv.lock                     # Dependency lock file
├── .env.example                # Environment template
└── README.md                   # This file
```

## Core Components

### 1. FastAPI Application (`app/main.py`)

Main application file containing all HTTP endpoints and WebSocket handler.

#### HTTP Endpoints

**`GET /`** - API documentation
- Returns welcome message and endpoint list
- No authentication required

**`GET /health`** - Health check
- Validates required Azure configuration
- Returns configuration status and missing variables
- Response:
  ```json
  {
    "status": "healthy" | "degraded",
    "configuration_valid": true | false,
    "missing_config": ["AZURE_OPENAI_API_KEY", ...],
    "redis_status": "configured" | "not_configured" | "backup_only_mode",
    "environment": "development" | "production"
  }
  ```

**`GET /api/config`** - Client configuration
- Returns non-sensitive configuration for frontend
- Response includes: environment, region, model name, avatar settings

**`GET /api/solutions`** - Available solutions
- Returns list of solution categories (Engage, Explore, Envision)
- Falls back to hardcoded defaults if Redis unavailable

**`GET /api/catalog`** - Solutions catalog index
- Returns roles and industries for navigation
- Requires Redis or local backup files

**`GET /api/category/{type}/{slug}`** - Category details
- Returns detailed information for a role or industry
- Includes use cases, solutions, and customer evidence

**`GET /api/settings/inspire`** - Inspire settings
- Returns configuration for the Envision experience

**`POST /api/recommendations`** - AI recommendations
- Generates next steps based on conversation transcript
- Request body:
  ```json
  {
    "transcript": [
      {"role": "user", "content": "...", "timestamp": "..."},
      {"role": "assistant", "content": "...", "timestamp": "..."}
    ]
  }
  ```
- Uses Azure OpenAI with temperature=0.7, max_tokens=800

**`POST /api/executive-narrative`** - Executive narrative
- Generates personalized narrative based on user scenario
- Uses Azure OpenAI with temperature=0.7, max_tokens=1500

**`POST /api/story`** - Customer story scraping
- Scrapes and returns customer story content from URL

#### WebSocket Endpoint

**`WS /ws/voice`** - Real-time voice communication
- Establishes dual WebSocket connections (client ↔ Azure)
- Validates configuration before accepting connection
- Forwards audio bidirectionally
- Handles session configuration and avatar setup

### 2. Configuration Management (`app/config.py`)

Centralized configuration class that loads and validates environment variables.

**Key Features:**
- Loads `.env` file only in development mode
- Validates required Azure credentials
- Provides non-sensitive config export for frontend
- Supports optional Redis configuration

**Configuration Properties:**
- `PORT`, `ENVIRONMENT` - Server settings
- `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY` - OpenAI config
- `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` - Speech config
- `AZURE_AI_RESOURCE_NAME`, `MODEL_DEPLOYMENT_NAME` - AI Foundry config
- `AZURE_AVATAR_CHARACTER`, `AZURE_AVATAR_STYLE` - Avatar config
- `VOICE_NAME`, `VOICE_TYPE` - Voice config
- `AI_INSTRUCTIONS`, `AI_TEMPERATURE`, `MAX_RESPONSE_TOKENS` - AI behavior
- `REDIS_HOST`, `REDIS_PASSWORD`, `BACKUP_ONLY` - Redis config

**Methods:**
- `validate()` - Returns (is_valid, missing_vars) tuple
- `to_dict()` - Returns non-sensitive configuration dictionary

### 3. WebSocket Proxy Handler (`app/websocket_handler.py`)

Manages dual WebSocket connections for real-time voice communication.

**VoiceProxyHandler Class:**

**Connection Flow:**
1. Accept client WebSocket connection
2. Validate Azure configuration
3. Connect to Azure Voice Live API
4. Send session configuration (avatar, voice, instructions)
5. Forward `proxy.connected` message to client
6. Start bidirectional message forwarding

**Key Methods:**
- `handle_connection(websocket)` - Main connection lifecycle
- `_connect_to_azure()` - Establishes Azure WebSocket
- `_send_initial_config()` - Sends session.update to Azure
- `_build_session_config()` - Constructs session configuration
- `_forward_client_to_azure()` - Client → Azure relay
- `_forward_azure_to_client()` - Azure → Client relay
- `_cleanup()` - Closes both connections

**Session Configuration:**
- Modalities: text, audio
- Turn detection: Azure semantic VAD
- Noise reduction: Azure deep noise suppression
- Echo cancellation: Server-side
- Avatar: Configurable character and style
- Voice: Configurable name and type
- Instructions: Configurable AI personality
- Temperature: Configurable creativity level

### 4. Redis Client (`app/redis_client.py`)

Redis client with automatic fallback to local JSON files.

**Features:**
- Lazy connection initialization
- Automatic fallback to backup files if Redis unavailable
- In-memory caching of backup data
- Support for `BACKUP_ONLY` mode

**Methods:**
- `get_catalog()` - Returns catalog index
- `get_solutions()` - Returns solutions list
- `get_category(type, slug)` - Returns category details
- `get_settings(type)` - Returns settings
- `get_content(type)` - Returns content

## Environment Variables

See [.env.example](.env.example) for complete list with descriptions.

**Required:**
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_SPEECH_KEY`
- `AZURE_SPEECH_REGION`
- `AZURE_AI_RESOURCE_NAME`
- `MODEL_DEPLOYMENT_NAME`

**Optional:**
- `PORT` (default: 8000)
- `ENVIRONMENT` (default: development)
- `AZURE_AI_REGION` (default: eastus2)
- `AZURE_AVATAR_CHARACTER` (default: lori)
- `AZURE_AVATAR_STYLE` (default: graceful)
- `VOICE_NAME` (default: en-US-Ava:DragonHDLatestNeural)
- `AI_TEMPERATURE` (default: 0.8)
- `MAX_RESPONSE_TOKENS` (default: 4096)
- `BACKUP_ONLY` (default: false)
- `REDIS_HOST`, `REDIS_PASSWORD` (optional)

## Development

### Setup

```bash
# Install dependencies
uv sync

# Copy environment template
cp .env.example .env

# Edit .env with your Azure credentials
nano .env
```

### Running

```bash
# Development mode (auto-reload)
uv run fastapi dev app/main.py

# Production mode
uv run fastapi run app/main.py
```

### Testing

```bash
# Run tests
uv run pytest

# Run with coverage
uv run pytest --cov=app
```

### API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Common Issues

### Configuration Validation Fails

Check `/health` endpoint to see missing variables:
```bash
curl http://localhost:8000/health | jq
```

### WebSocket Connection Fails

1. Verify `AZURE_AI_RESOURCE_NAME` matches your Azure resource
2. Check `AZURE_OPENAI_API_KEY` is valid
3. Ensure `MODEL_DEPLOYMENT_NAME` exists in your resource
4. Check logs for detailed error messages

### Redis Connection Issues

Set `BACKUP_ONLY=true` to use local JSON files:
```bash
echo "BACKUP_ONLY=true" >> .env
```

## Docker

### Build

```bash
docker build -f Dockerfile -t frontierai-backend ..
```

### Run

```bash
docker run -p 8000:8000 \
  -e AZURE_OPENAI_ENDPOINT=$AZURE_OPENAI_ENDPOINT \
  -e AZURE_OPENAI_API_KEY=$AZURE_OPENAI_API_KEY \
  -e AZURE_SPEECH_KEY=$AZURE_SPEECH_KEY \
  -e AZURE_SPEECH_REGION=$AZURE_SPEECH_REGION \
  -e AZURE_AI_RESOURCE_NAME=$AZURE_AI_RESOURCE_NAME \
  -e MODEL_DEPLOYMENT_NAME=$MODEL_DEPLOYMENT_NAME \
  frontierai-backend
```

## Dependencies

Key dependencies (see `pyproject.toml` for complete list):
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `websockets` - WebSocket client
- `python-dotenv` - Environment variable management
- `openai` - Azure OpenAI SDK
- `azure-cognitiveservices-speech` - Azure Speech SDK
- `redis` - Redis client
- `pydantic` - Data validation

## Security

- Never commit `.env` files
- API keys are not logged (only presence is logged)
- Use `.dockerignore` to prevent secrets in images
- Validate all configuration on startup
- Use Azure Managed Identity in production when possible
