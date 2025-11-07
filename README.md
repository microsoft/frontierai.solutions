# Frontier AI Solutions

> [!NOTE]
> See it live at [frontierai.solutions](https://frontierai.solutions)
> Learn more about the implementation at [deepwiki](https://deepwiki.com/microsoft/frontierai.solutions)

An interactive experience that helps customers discover how frontier AI capabilities solve their specific business challenges. Built for experience centers, innovation hubs, demo booths, and partner demonstrations where customers need to quickly understand how cutting-edge solutions map to their roles, KPIs, and business outcomes.

**What makes this different:** Traditional solution catalogs overwhelm customers with features. This experience guides customers through conversational discovery—whether they're exploring by role, function, or business challenge—and connects them to the right solutions with personalized context.

### Key Capabilities

- **Conversational Discovery** - Natural voice and text interaction with an AI avatar (Aria) that understands business context
- **Role-Based Exploration** - Navigate solutions by job function, industry vertical, or business scenario
- **Outcome Mapping** - See how frontier capabilities connect to specific KPIs and success metrics
- **Experience Center Ready** - Designed for in-person demonstrations in showrooms, partner events, and customer visits
- **Extensible & Self-Hostable** - Fork and customize for your offerings, brand, and partner ecosystem

**Powered by Azure AI Foundry:** Real-time voice, intelligent avatar, and Azure OpenAI for contextual understanding.

## Quick Start (Local)

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env with your Azure credentials
uv sync
uv run fastapi dev app/main.py
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
pnpm install
pnpm run dev
```

Open http://localhost:5173

## Deploy to Azure

```bash
azd auth login
azd up
```

The deployment outputs will include your app URLs.

## Architecture

### System Overview

```mermaid
graph TB
    subgraph "Client Browser"
        UI[React Frontend<br/>Vite + TypeScript]
        WS_Client[WebSocket Client]
        RTC[WebRTC Connection]
    end
    
    subgraph "Backend Services"
        API[FastAPI Backend<br/>Python 3.12]
        WS_Proxy[WebSocket Proxy]
    end
    
    subgraph "Azure Services"
        OpenAI[Azure OpenAI<br/>GPT-4o]
        VoiceLive[Azure Voice Live<br/>API]
        Avatar[Azure Avatar<br/>Service]
    end
    
    UI -->|HTTP/REST| API
    UI -->|WebSocket| WS_Proxy
    UI -->|WebRTC| RTC
    
    WS_Proxy <-->|Bidirectional<br/>Audio Stream| VoiceLive
    API -->|Chat Completions| OpenAI
    
    VoiceLive --> OpenAI
    VoiceLive --> Avatar
    
    RTC -.->|Avatar Video| Avatar
    
    style UI fill:#e1f5ff
    style API fill:#fff4e1
    style OpenAI fill:#d4edda
    style VoiceLive fill:#d4edda
```

### Voice WebSocket Flow

```mermaid
sequenceDiagram
    participant Client
    participant Backend
    participant Azure Voice Live
    
    Client->>Backend: Connect WebSocket /ws/voice
    Backend->>Backend: Validate Configuration
    Backend->>Azure Voice Live: Connect WebSocket
    Azure Voice Live-->>Backend: Connection Established
    
    Backend->>Azure Voice Live: session.update<br/>(avatar, voice, instructions)
    Azure Voice Live-->>Backend: session.updated<br/>(RTC config, avatar SDP)
    Backend-->>Client: proxy.connected + session.updated
    
    Client->>Backend: session.avatar.connect<br/>(client SDP)
    Backend->>Azure Voice Live: Forward SDP
    
    loop Real-time Conversation
        Client->>Backend: Audio chunks
        Backend->>Azure Voice Live: Forward audio
        Azure Voice Live-->>Backend: AI response + audio
        Backend-->>Client: Forward response
    end
```

## Documentation

- **[Backend README](backend/README.md)** - API endpoints, configuration, WebSocket protocol
- **[Frontend README](frontend/README.md)** - Component structure, hooks, deployment

## License

MIT