# Copilot Instructions for Frontier AI Solutions

## Project Overview

This is a full-stack AI-powered web application showcasing Frontier AI solutions with voice-first experiences. The application enables real-time voice conversations with an AI avatar agent, powered by Azure AI services.

## Technology Stack

### Backend
- **Language**: Python 3.12+
- **Framework**: FastAPI (with standard extras for uvicorn)
- **Package Manager**: uv
- **Key Dependencies**:
  - `fastapi[standard]>=0.120.0` - Web framework with async support
  - `azure-cognitiveservices-speech>=1.38.0` - Azure Speech Services SDK
  - `openai>=1.0.0` - OpenAI/Azure OpenAI client
  - `azure-identity>=1.15.0` - Azure authentication
  - `websockets>=12.0` - WebSocket support for real-time voice
  - `redis>=7.0.1` - Redis client for caching
  - `aiohttp>=3.9.0` - Async HTTP client
  - `beautifulsoup4>=4.14.2`, `lxml>=6.0.2` - HTML parsing
  - `requests>=2.32.5` - HTTP client
- **Main Entry**: `backend/app/main.py`
- **API Documentation**: Available at `/docs` (Swagger UI)

### Frontend
- **Language**: TypeScript 5.9+
- **Framework**: React 19+
- **Build Tool**: Vite 7+
- **Package Manager**: pnpm
- **Key Dependencies**:
  - `react` & `react-dom` - Core React libraries
  - `framer-motion` - Animation library for smooth transitions
  - `lucide-react` - Icon library
  - `react-markdown` & `remark-gfm` - Markdown rendering with GitHub Flavored Markdown
  - `@azure/cosmos` - Azure Cosmos DB client
  - `redis` - Redis client for frontend scripts
- **Dev Dependencies**:
  - `@tailwindcss/postcss` & `tailwindcss` - Utility-first CSS framework
  - `@tailwindcss/typography` - Typography plugin
  - `@vitejs/plugin-react` - React plugin for Vite
  - `typescript` - Type checking
- **Main Entry**: `frontend/src/main.tsx`

### Infrastructure
- **Cloud Provider**: Azure
- **Deployment**: Azure Container Apps
- **IaC**: Bicep templates in `infra/`
- **CLI**: Azure Developer CLI (azd)
- **Container Registry**: Azure Container Registry (ACR)
- **Monitoring**: Application Insights + Log Analytics Workspace

## Code Style and Conventions

### Python Backend
- Use Python 3.12+ type hints for all function signatures
- Follow PEP 8 style guidelines
- Use async/await for I/O operations (FastAPI endpoints, WebSocket handlers)
- Organize code in the `app/` directory by feature:
  - `config.py` - Configuration and environment variables
  - `websocket_handler.py` - WebSocket connection management
  - `story_scraper.py` - Data fetching and processing
  - `redis_client.py` - Redis caching layer
- Use dependency injection for services (FastAPI `Depends`)
- Handle errors with appropriate HTTP status codes and clear error messages

### TypeScript Frontend
- Use functional components with React Hooks
- Prefer `const` over `let`, avoid `var`
- Use TypeScript strict mode - always define interfaces/types
- Component organization:
  - Place UI components in `src/components/`
  - Use feature-based folders (e.g., `avatar/`, `explore/`, `inspire/`)
  - Keep reusable UI components in `src/components/ui/`
- Custom hooks go in `src/hooks/`
- API services in `src/services/`
- Use Framer Motion for animations
- Follow Tailwind CSS utility-first approach

### General Guidelines
- Write clear, descriptive commit messages
- Add comments for complex business logic
- Keep functions small and focused (single responsibility)
- Use meaningful variable and function names

## Development Workflow

### Starting Development Servers

**Backend:**
```bash
cd backend
uv sync
uv run fastapi dev app/main.py
```

**Frontend:**
```bash
cd frontend
pnpm install
pnpm run dev
```

### Adding Dependencies

**Backend:**
```bash
cd backend
uv add <package-name>
```

**Frontend:**
```bash
cd frontend
pnpm add <package-name>
```

## Azure Integration

### Services Used
- **Azure AI Foundry (Cognitive Services)**: Multi-service AI resource
  - Deployed as `Microsoft.CognitiveServices/accounts` with kind `AIServices`
  - SKU: S0 (Standard)
  - Custom subdomain for API access
  - Includes model deployments:
    - `gpt-4o` (version 2024-08-06) - Primary conversation model
    - `text-embedding-ada-002` - Text embeddings
- **Azure Speech Services**: Dedicated speech resource
  - Real-time voice conversations via Voice Live API
  - SKU: S0 (Standard)
  - Region: eastus2
- **Azure OpenAI**: Language models via AI Foundry
  - Endpoint: Part of AI Foundry resource
  - Model: gpt-4o deployment
- **Azure Container Apps**: Application hosting
  - Managed Kubernetes environment
  - Separate apps for backend and frontend
  - Log Analytics integration for monitoring
- **Azure Container Registry (ACR)**: Docker image storage
  - Basic SKU with admin user enabled
  - Stores backend and frontend container images
- **Azure Redis Cache**: Distributed caching
  - Host: `frontiersolredis.eastus2.redis.azure.net`
  - Port: 10000 (SSL)
  - Used for caching stories and frequently accessed data
- **Application Insights**: Application performance monitoring
  - Integrated with Log Analytics
  - Tracks requests, dependencies, and exceptions
- **Managed Identity**: RBAC authentication
  - User-assigned identity for backend service
  - Roles: Cognitive Services User, Cognitive Services OpenAI User

### Environment Variables

#### Backend (`backend/.env`)
Required environment variables:
```bash
# Server Configuration
PORT=8000
ENVIRONMENT=development

# Azure AI Configuration
AZURE_AI_RESOURCE_NAME=aifoundry-voicelab-xfb4fkemkyfbg
AZURE_AI_REGION=eastus2
AZURE_AI_PROJECT_NAME=default-project
PROJECT_ENDPOINT=https://{resource}.cognitiveservices.azure.com/api/projects/{project}
USE_AZURE_AI_AGENTS=false

# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://{resource}.cognitiveservices.azure.com/
AZURE_OPENAI_API_KEY={key}  # Use Managed Identity in production
MODEL_DEPLOYMENT_NAME=gpt-4o

# Azure Speech Configuration
AZURE_SPEECH_KEY={key}  # Use Managed Identity in production
AZURE_SPEECH_REGION=eastus2

# Azure Subscription Configuration
SUBSCRIPTION_ID={subscription-id}
RESOURCE_GROUP_NAME=rg-avatar-gh-sample

# Avatar Configuration
AZURE_AVATAR_CHARACTER=lori
AZURE_AVATAR_STYLE=graceful

# Redis Configuration
REDIS_HOST={redis-name}.eastus2.redis.azure.net
REDIS_PORT=10000
REDIS_PASSWORD={redis-key}
```

#### Frontend
- Frontend environment variables should be prefixed with `VITE_`
- Typically includes backend API URL

### Security Best Practices
- **Never commit secrets or API keys** to the repository
- Use Azure Key Vault or Managed Identity in production
- The `.env` file should be in `.gitignore`
- Use RBAC role assignments for service-to-service authentication
- Rotate keys regularly and use Key Vault references

## Key Features to Maintain

1. **Real-time Voice Conversations**: WebSocket-based bidirectional communication
2. **Avatar Integration**: Visual avatar with synchronized voice responses
3. **Conversation Transcripts**: Real-time display of conversation text
4. **AI Recommendations**: Context-aware suggestions based on conversations
5. **Catalog System**: Dynamic loading of solutions and categories from data files

## Testing and Quality

- Write unit tests for business logic
- Test WebSocket connections thoroughly
- Validate API responses and error handling
- Test responsive design across different screen sizes
- Verify Azure service integrations before deployment

## Deployment

### Azure Developer CLI (azd)
- Use `azd up` for full deployment to Azure (provision + deploy)
- Use `azd provision` to only provision infrastructure
- Use `azd deploy` to only deploy application code
- Configuration file: `azure.yaml` at project root

### Infrastructure as Code (Bicep)
Infrastructure is defined in `infra/` directory:
- **`main.bicep`**: Entry point, creates resource group and calls resources module
  - Parameters: environmentName, location, principalId, principalType
  - Outputs: Container registry, OpenAI endpoints, app URIs, managed identity
- **`resources.bicep`**: Defines all Azure resources
  - AI Foundry with model deployments (gpt-4o, embeddings)
  - Speech Services
  - Container Registry (Basic SKU)
  - Container Apps Environment with Log Analytics
  - Application Insights
  - User-assigned Managed Identity for backend
  - RBAC role assignments (Cognitive Services User, OpenAI User)
- **`core/host/container-app.bicep`**: Container App definition template
- **`core/host/container-apps.bicep`**: Multiple container apps orchestration
- **`modules/fetch-container-image.bicep`**: Helper for container image references
- **`abbreviations.json`**: Azure resource naming abbreviations
- **`main.parameters.json`**: Parameter values for deployment

### Deployment Process
1. **Build Containers**: Docker images built for backend and frontend
2. **Push to ACR**: Images pushed to Azure Container Registry
3. **Provision Infrastructure**: Bicep templates create/update Azure resources
4. **Deploy Apps**: Container Apps pull images from ACR and run
5. **Configure Networking**: CORS, custom domains, SSL certificates

### Container Apps Architecture
- Frontend and backend are deployed as separate container apps
- Both run in the same Container Apps Environment
- Log Analytics captures all container logs
- Application Insights monitors performance and errors
- Managed Identity used for secure service-to-service authentication

### Important Notes
- Infrastructure changes require updating Bicep templates in `infra/`
- Test infrastructure changes with `azd provision` before full deployment
- Review `DEPLOYMENT.md` and related deployment docs for detailed procedures
- Container images are stored in ACR with unique tags
- Health check endpoints should be defined for Container Apps

## Data Management

- Data files located in `backend/data/`:
  - `catalog.json` - Solution catalog
  - `categories.json` - Category definitions
  - `content.json` - Content metadata
  - `solutions.json` - Solution details
  - `settings.json` - Application settings
- Redis used for caching (see `redis_client.py`)
- Backup scripts available in `backend/scripts/`

## Common Tasks

### Adding a New API Endpoint
1. Add route in `backend/app/main.py` or create new module
2. Use FastAPI dependency injection for services
3. Add proper type hints and response models
4. Update frontend API service in `frontend/src/services/api.ts`

### Adding a New Component
1. Create component file in appropriate `src/components/` subfolder
2. Define TypeScript interfaces for props
3. Use Tailwind CSS for styling
4. Add to parent component imports

### Modifying Infrastructure
1. Update relevant Bicep files in `infra/`
2. Test changes with `azd provision`
3. Document changes in deployment docs

## Helpful Context

- WebSocket connections handle real-time voice streaming
- Avatar state management is in `AvatarModal.tsx`
- Conversation flow managed through custom hooks (`useWebRTC.tsx`, `useRecorder.tsx`)
- Category and role data dynamically loaded from backend API
- Redis caching improves performance for frequently accessed data

## Questions to Ask Before Implementation

1. Does this change affect both frontend and backend? Consider API contracts.
2. Are there environment variables or secrets needed? Use secure storage.
3. Does this require Azure service changes? Update infrastructure as code.
4. Is this user-facing? Ensure responsive design and accessibility.
5. Does this impact WebSocket communication? Test thoroughly with real-time scenarios.
