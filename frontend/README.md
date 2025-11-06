# Frontend - Frontier AI Solutions

React TypeScript frontend application providing an interactive voice-first user interface for engaging with Azure AI services.

## Architecture

The frontend is a single-page application (SPA) built with React and TypeScript, featuring:
- Real-time voice interaction with AI avatar
- WebSocket and WebRTC connections for bidirectional audio/video
- Responsive design with Tailwind CSS
- Smooth animations with Framer Motion
- Production-ready Nginx deployment

## Code Organization

```
frontend/
├── src/
│   ├── main.tsx                 # Application entry point
│   ├── App.tsx                  # Main application component
│   ├── index.css                # Global styles & Tailwind imports
│   ├── vite-env.d.ts           # Vite type definitions
│   ├── components/
│   │   ├── avatar/
│   │   │   └── AvatarModal.tsx  # Voice interaction modal
│   │   ├── explore/
│   │   │   └── ExploreModal.tsx # Solutions catalog modal
│   │   ├── inspire/
│   │   │   └── InspireModal.tsx # Envision experience modal
│   │   └── ui/
│   │       └── Dropdown.tsx     # Reusable dropdown component
│   ├── hooks/
│   │   ├── useWebRTC.tsx       # WebRTC connection management
│   │   ├── useRecorder.tsx     # Audio recording utilities
│   │   └── useRealtime.tsx     # WebSocket communication
│   ├── services/
│   │   └── api.ts              # Backend API client
│   └── data/
│       ├── rolesData.ts        # Role definitions
│       └── functionsData.ts    # Function definitions
├── public/
│   ├── favicon.svg             # Application icon
│   └── videos/                 # Video assets
├── index.html                  # HTML entry point
├── nginx.conf                  # Production web server config
├── Dockerfile                  # Multi-stage container build
├── vite.config.ts             # Vite build configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Node dependencies (pnpm)
├── .env.example               # Environment template
└── README.md                  # This file
```

## Core Components

### 1. Main Application (`App.tsx`)

Root component managing application state and layout.

**Features:**
- Three main solution cards: Engage, Explore, Envision
- Animated card expansion/collapse
- Modal management for each solution type
- Dynamic catalog loading from backend API
- Responsive grid layout

**State Management:**
- `isAvatarModalOpen` - Controls voice interaction modal
- `isExploreModalOpen` - Controls solutions catalog modal
- `isInspireModalOpen` - Controls envision experience modal
- `exploreCategory` - Selected category for exploration
- `industries`, `roles` - Catalog data from backend

**Key Functions:**
- `handleIndustrySelect(industry)` - Opens explore modal for industry
- `handleRoleSelect(role)` - Opens explore modal for role
- `handleExecutiveOverview()` - Opens executive overview
- `toggleAll()` - Expands/collapses all cards

### 2. Avatar Modal (`components/avatar/AvatarModal.tsx`)

Modal component for real-time voice interaction with AI avatar.

**Features:**
- WebSocket connection to backend `/ws/voice`
- WebRTC video stream for avatar display
- Real-time audio recording and playback
- Live conversation transcript
- AI-powered recommendations

**Integration:**
- Uses `useRealtime` hook for WebSocket communication
- Uses `useWebRTC` hook for avatar video stream
- Uses `useRecorder` hook for audio capture
- Calls `/api/recommendations` for next steps

### 3. Explore Modal (`components/explore/ExploreModal.tsx`)

Modal component for browsing solutions catalog by category.

**Features:**
- Dynamic category loading from backend
- Use case exploration
- Solution links (Azure services, ISV partners)
- Customer evidence and case studies
- Filterable content

**API Integration:**
- Fetches category data from `/api/category/{type}/{slug}`
- Displays personas, priorities, use cases
- Links to external resources

### 4. Inspire Modal (`components/inspire/InspireModal.tsx`)

Modal component for immersive "Becoming Frontier" narrative experience.

**Features:**
- Interest selection
- Personalized narrative generation
- Video content display
- Executive overview

**API Integration:**
- Fetches settings from `/api/settings/inspire`
- Generates narrative via `/api/executive-narrative`

## Custom Hooks

### useRealtime (`hooks/useRealtime.tsx`)

Manages WebSocket connection for real-time voice communication.

**Features:**
- Establishes WebSocket connection to `/ws/voice`
- Handles connection lifecycle (connect, disconnect, reconnect)
- Sends and receives audio chunks
- Processes transcript updates
- Manages session state

**Methods:**
- `connect()` - Establishes WebSocket connection
- `disconnect()` - Closes WebSocket connection
- `sendAudio(audioData)` - Sends audio chunk to backend
- Event handlers for various message types

### useWebRTC (`hooks/useWebRTC.tsx`)

Manages WebRTC connection for avatar video stream.

**Features:**
- Creates peer connection for avatar video
- Handles SDP offer/answer exchange
- Manages ICE candidates
- Displays video stream in DOM element

**Methods:**
- `createPeerConnection()` - Initializes WebRTC connection
- `handleSessionUpdate(sdp)` - Processes Azure SDP answer
- `setVideoElement(element)` - Attaches video to DOM

### useRecorder (`hooks/useRecorder.tsx`)

Manages audio recording from user microphone.

**Features:**
- Requests microphone permissions
- Captures audio stream
- Converts audio to required format
- Sends audio chunks to WebSocket

**Methods:**
- `startRecording()` - Begins audio capture
- `stopRecording()` - Ends audio capture
- `getAudioChunk()` - Returns audio data

## Services

### API Client (`services/api.ts`)

Centralized API client for backend communication.

**Configuration:**
- Base URL from `VITE_API_URL` environment variable
- Default: `http://localhost:8000`

**Functions:**
- `fetchCatalog()` - Returns catalog index
- `fetchCategory(type, slug)` - Returns category details
- `fetchInspireSettings()` - Returns inspire settings

**Types:**
- `Catalog` - Catalog structure
- `CatalogItem` - Individual catalog item
- `CategoryData` - Category details
- `InspireSettings` - Inspire configuration

## Styling

### Tailwind CSS

Utility-first CSS framework with custom configuration.

**Custom Theme (`tailwind.config.js`):**
- Custom colors for Azure branding
- Extended spacing and sizing
- Custom animations
- Responsive breakpoints

**Global Styles (`index.css`):**
- Tailwind base, components, utilities
- Custom CSS variables for accent colors
- Font family configuration
- Base element styling

### Framer Motion

Animation library for smooth transitions and interactions.

**Usage:**
- Card entrance animations
- Modal transitions
- Button hover effects
- Staggered children animations

## Environment Variables

### Configuration

**`VITE_API_URL`** (optional)
- Backend API base URL
- Default: `http://localhost:8000`
- Production: Set to deployed backend URL

**Example `.env`:**
```
VITE_API_URL=http://localhost:8000
```

**Example `.env.production`:**
```
VITE_API_URL=https://api.frontierai.solutions
```

## Development

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Edit .env if needed
nano .env
```

### Running

```bash
# Development mode (hot reload)
pnpm run dev

# Preview production build
pnpm run preview
```

### Building

```bash
# Build for production
pnpm run build

# Output: dist/ directory
```

### Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

## Production Deployment

### Nginx Configuration

The `nginx.conf` file configures the production web server:

**Features:**
- Serves static files from `/usr/share/nginx/html`
- SPA routing fallback (all routes → `index.html`)
- API proxy to backend (`/api` → backend service)
- WebSocket upgrade headers for `/ws` routes
- Gzip compression
- Security headers

**Key Directives:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location /api {
    proxy_pass http://backend:8000;
}

location /ws {
    proxy_pass http://backend:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### Docker Build

Multi-stage build for optimized production image:

**Stage 1: Builder**
- Node.js base image
- Install pnpm
- Copy package files and install dependencies
- Build application with Vite

**Stage 2: Production**
- Nginx base image
- Copy built files from builder stage
- Copy nginx.conf
- Expose port 80

**Build Command:**
```bash
docker build -f Dockerfile -t frontierai-frontend ..
```

## Common Issues

### API Connection Fails

Check `VITE_API_URL` environment variable:
```bash
echo $VITE_API_URL
```

Verify backend is running:
```bash
curl http://localhost:8000/health
```

### WebSocket Connection Fails

1. Check browser console for errors
2. Verify backend WebSocket endpoint is accessible
3. Check for CORS issues
4. Ensure WebSocket upgrade headers are configured

### Avatar Video Not Displaying

1. Check browser permissions for camera/microphone
2. Verify WebRTC connection in console
3. Test with Chrome/Edge (recommended browsers)
4. Check backend avatar configuration

### Build Fails

Clear cache and reinstall:
```bash
rm -rf node_modules dist
pnpm install
pnpm run build
```

## Dependencies

Key dependencies (see `package.json` for complete list):
- `react` - UI library
- `react-dom` - React DOM renderer
- `typescript` - Type safety
- `vite` - Build tool
- `tailwindcss` - Utility-first CSS
- `framer-motion` - Animation library
- `lucide-react` - Icon library

## Browser Support

- Chrome/Edge 90+ (recommended)
- Firefox 88+
- Safari 14+

**Note**: WebRTC features require modern browser support.

## Security

- No secrets in frontend code
- API calls use environment-based URLs
- CORS handled by backend
- WebSocket connections validated by backend
- No sensitive data stored in localStorage

## Performance

- Code splitting with Vite
- Lazy loading of modals
- Optimized bundle size
- Gzip compression in production
- Asset caching with Nginx
