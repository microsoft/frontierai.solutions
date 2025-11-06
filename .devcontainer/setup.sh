#!/bin/bash
set -e

echo "🚀 Setting up Frontier AI Solutions development environment..."

echo "📦 Setting up Python backend..."
cd backend

if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
fi

source .venv/bin/activate

echo "Upgrading pip..."
pip install --upgrade pip

if [ -f "requirements.txt" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
fi

if [ ! -f ".env" ]; then
    echo "Creating backend .env file..."
    cat > .env << 'EOF'
PORT=8000
ENVIRONMENT=development
AZURE_AI_RESOURCE_NAME=
AZURE_AI_REGION=
AZURE_AI_PROJECT_NAME=
PROJECT_ENDPOINT=
USE_AZURE_AI_AGENTS=false
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_API_KEY=
MODEL_DEPLOYMENT_NAME=
SUBSCRIPTION_ID=
RESOURCE_GROUP_NAME=
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=
EOF
fi

cd ..

echo "📦 Setting up React frontend..."
cd frontend

if [ -f "package.json" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "Creating frontend .env file..."
    cat > .env << 'EOF'
VITE_API_URL=http://localhost:8000
EOF
fi

cd ..

echo "✅ Development environment setup complete!"
echo ""
echo "To start development:"
echo "  Backend:  cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000"
echo "  Frontend: cd frontend && npm run dev"
