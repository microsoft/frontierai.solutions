from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Dict, Any
import logging
import os
import aiohttp

from .config import config
from .websocket_handler import VoiceProxyHandler
from .story_scraper import scraper
from .redis_client import redis_client

load_dotenv()

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Frontier AI Solutions API",
    description="Backend API for Frontier AI Solutions with Avatar Integration",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConversationMessage(BaseModel):
    role: str
    content: str
    timestamp: str

class AnalyzeRequest(BaseModel):
    transcript: List[ConversationMessage]

class RecommendationRequest(BaseModel):
    transcript: List[ConversationMessage]

class NarrativeRequest(BaseModel):
    scenario: str

class StoryRequest(BaseModel):
    url: str

@app.get("/")
async def root():
    return {
        "message": "Welcome to Frontier AI Solutions API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "config": "/api/config",
            "solutions": "/api/solutions",
            "websocket": "/ws/voice",
            "recommendations": "/api/recommendations",
            "executive-narrative": "/api/executive-narrative",
            "story": "/api/story"
        }
    }

@app.get("/health")
async def health():
    is_valid, missing = config.validate()
    
    redis_status = "not_configured"
    if os.getenv("BACKUP_ONLY", "false").lower() == "true":
        redis_status = "backup_only_mode"
    elif os.getenv("REDIS_HOST") and os.getenv("REDIS_PASSWORD"):
        redis_status = "configured"
    
    return {
        "status": "healthy" if is_valid else "degraded",
        "configuration_valid": is_valid,
        "missing_config": missing if not is_valid else [],
        "redis_status": redis_status,
        "environment": config.ENVIRONMENT
    }

@app.get("/api/config")
async def get_config():
    """Return non-sensitive configuration for the client."""
    return config.to_dict()

@app.get("/api/solutions")
async def get_solutions():
    """Get solutions from Redis."""
    data = redis_client.get_solutions()
    if data:
        return data
    
    return {
        "solutions": [
            {
                "id": "engage",
                "title": "Engage",
                "description": "Talk to our avatar agent – ask about products, pricing, or roadmaps. Get instant voice + on‑screen answers.",
                "category": "Live",
                "enabled": True
            },
            {
                "id": "explore",
                "title": "Explore",
                "description": "Navigate by industry, use case, or stack. Compare reference architectures and live demos.",
                "category": "Catalog",
                "enabled": False
            },
            {
                "id": "envision",
                "title": "Envision",
                "description": "Immerse in the Zava brand narrative – motion, sound, and storyboards that paint the frontier.",
                "category": "Story",
                "enabled": False
            }
        ]
    }

@app.get("/api/catalog")
async def get_catalog():
    """Get catalog index with all roles and industries."""
    data = redis_client.get_catalog()
    if data:
        return data
    raise HTTPException(status_code=500, detail="Failed to load catalog from Redis")

@app.get("/api/category/{category_type}/{slug}")
async def get_category(category_type: str, slug: str):
    """Get category data (role or industry) by type and slug."""
    if category_type not in ["role", "industry"]:
        raise HTTPException(status_code=400, detail="Invalid category type. Must be 'role' or 'industry'")
    
    data = redis_client.get_category(category_type, slug)
    if data:
        return data
    raise HTTPException(status_code=404, detail=f"Category {category_type}:{slug} not found")

@app.get("/api/settings/inspire")
async def get_inspire_settings():
    """Get inspire interests settings."""
    data = redis_client.get_settings("inspire")
    if data:
        return data
    raise HTTPException(status_code=500, detail="Failed to load inspire settings from Redis")

@app.websocket("/ws/voice")
async def websocket_voice_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time voice communication with avatar."""
    logger.info("New WebSocket connection request")
    
    is_valid, missing = config.validate()
    if not is_valid:
        logger.error(f"Configuration invalid. Missing: {missing}")
        await websocket.close(code=1008, reason=f"Server configuration incomplete: {', '.join(missing)}")
        return
    
    handler = VoiceProxyHandler()
    try:
        await handler.handle_connection(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
        try:
            await websocket.close(code=1011, reason="Internal server error")
        except:
            pass

@app.post("/api/recommendations")
async def get_recommendations(request: RecommendationRequest):
    """Generate next steps recommendations based on conversation transcript."""
    try:
        from openai import AzureOpenAI
        
        client = AzureOpenAI(
            api_key=config.AZURE_OPENAI_API_KEY,
            api_version="2024-02-01",
            azure_endpoint=config.AZURE_OPENAI_ENDPOINT
        )
        
        conversation_text = "\n".join([
            f"{msg.role}: {msg.content}" for msg in request.transcript
        ])
        
        system_prompt = """You are an AI assistant helping to recommend next steps for customers interested in Microsoft Azure AI solutions.
Based on the conversation transcript, analyze the customer's needs and recommend:
1. Specific ISV solutions from Azure partners that match their requirements
2. Whether they should contact an Azure seller for custom solution development
3. Specific Azure services or products that would be relevant

Provide 2-3 concrete, actionable recommendations with brief explanations."""
        
        user_prompt = f"""Based on this conversation transcript, provide recommendations for next steps:

{conversation_text}

Provide your recommendations in a structured format."""
        
        response = client.chat.completions.create(
            model=config.MODEL_DEPLOYMENT_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=config.RECOMMENDATIONS_MAX_TOKENS
        )
        
        recommendations_text = response.choices[0].message.content
        
        return {
            "recommendations": recommendations_text,
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")

@app.post("/api/executive-narrative")
async def generate_executive_narrative(request: NarrativeRequest):
    """Generate personalized executive narrative based on user scenario."""
    try:
        from openai import AzureOpenAI
        
        client = AzureOpenAI(
            api_key=config.AZURE_OPENAI_API_KEY,
            api_version="2024-02-01",
            azure_endpoint=config.AZURE_OPENAI_ENDPOINT
        )
        
        narrative_data = redis_client.get_content("exec_narr")
        if narrative_data:
            pdf_context = narrative_data.get("context", "")
            urls = narrative_data.get("urls", [])
        else:
            pdf_context = """
            Becoming Frontier Success Framework:
            
            Key Statistics:
            - Boost developer efficiency by 30%
            - Increase employee productivity by 30%
            - Streamline customer support by 40%
            - Reduce costs by 40%
            - Improve go-to-market speed by 50%
            
            Core Principle: AI-first organizations think in orders of magnitude, not incremental improvements.
            
            Four Pillars:
            
            1. Enrich Employee Experiences
               - Tools: Microsoft 365 Copilot, Copilot Studio, Security Copilot
               - Benefits: 20% reduction in response times, 25-40% reduced helpdesk demand, 840 hours saved
               - Focus: Empower teams with AI copilots and agents to boost productivity
            
            2. Reinvent Customer Engagement
               - Tools: Azure AI Foundry, GitHub Copilot, Copilot for Service
               - Benefits: 55% reduction in wait times, 5x increase in email clickthrough, 66% reduction in support traffic
               - Focus: Transform customer interactions with personalized AI experiences
            
            3. Reshape Business Processes
               - Tools: Copilot Studio, GitHub Copilot, Power Platform
               - Benefits: 30,000 hours saved monthly, 93% reduction in handling time, 50% increase in automatic payments
               - Focus: Automate workflows and streamline operations with intelligent agents
            
            4. Bend the Curve on Innovation
               - Tools: Azure AI Foundry, Azure Quantum, Microsoft Fabric
               - Benefits: 50% reduction in app build time, 80% faster programming, accelerated discovery (years to 80 hours)
               - Focus: Accelerate R&D and experimentation with AI-powered tools
            """
            
            urls = [
                "https://www.microsoft.com/en-us/microsoft-cloud/blog/2025/09/29/frontier-firms-in-action-lessons-from-the-ai-adoption-surge/",
                "https://azure.microsoft.com/en-us/blog/building-the-frontier-firm-with-microsoft-azure-the-business-case-for-cloud-and-ai-modernization/",
                "https://www.microsoft.com/en-us/worklab/work-trend-index/2025-the-year-the-frontier-firm-is-born"
            ]
        
        url_content = "Additional Context from Microsoft Resources:\n\n"
        async with aiohttp.ClientSession() as session:
            for url in urls:
                try:
                    async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                        if response.status == 200:
                            text = await response.text()
                            url_content += f"URL: {url}\n{text[:1000]}...\n\n"
                except Exception as e:
                    logger.warning(f"Failed to fetch {url}: {e}")
        
        system_prompt = f"""You are an AI assistant helping executives understand how the "Becoming Frontier" AI transformation framework applies to their specific business scenario.

Based on the user's scenario description, create a personalized narrative that:
1. Identifies which of the four pillars (Enrich Employee Experiences, Reinvent Customer Engagement, Reshape Business Processes, Bend the Curve on Innovation) are most relevant
2. Recommends specific Microsoft solutions and tools that fit their needs
3. Provides concrete examples and statistics from the framework
4. Suggests actionable next steps

Use this framework context:
{pdf_context}

{url_content}

Format your response in well-structured markdown with:
- Clear headings (##, ###)
- Bullet points for lists
- **Bold** for emphasis on key points
- Specific product names and statistics

Keep the tone professional but conversational, and make it directly applicable to their scenario."""

        user_prompt = f"""Based on my scenario below, help me understand how the Becoming Frontier framework applies to my organization:

{request.scenario}

Please provide a personalized narrative that shows me which pillars are most relevant, which Microsoft solutions I should consider, and what specific benefits I can expect."""
        
        response = client.chat.completions.create(
            model=config.MODEL_DEPLOYMENT_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        narrative_text = response.choices[0].message.content
        
        return {
            "narrative": narrative_text,
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Error generating narrative: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate narrative: {str(e)}")

@app.post("/api/story")
async def get_story(request: StoryRequest):
    """Scrape and return customer story content."""
    try:
        story = scraper.scrape_story(request.url)
        return {
            "story": story,
            "success": True
        }
    except Exception as e:
        logger.error(f"Error scraping story: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to scrape story: {str(e)}")
