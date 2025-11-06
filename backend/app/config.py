import os
from typing import Optional
from dotenv import load_dotenv

if os.getenv("ENVIRONMENT", "development") == "development":
    load_dotenv(override=False)

class Config:
    """Centralized configuration management for the application."""
    
    def __init__(self):
        self.PORT = int(os.getenv("PORT", "8000"))
        self.ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
        
        self.AZURE_AI_RESOURCE_NAME = os.getenv("AZURE_AI_RESOURCE_NAME", "")
        self.AZURE_AI_REGION = os.getenv("AZURE_AI_REGION", "eastus2")
        self.AZURE_AI_PROJECT_NAME = os.getenv("AZURE_AI_PROJECT_NAME", "")
        self.PROJECT_ENDPOINT = os.getenv("PROJECT_ENDPOINT", "")
        
        self.AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "")
        self.AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY", "")
        self.MODEL_DEPLOYMENT_NAME = os.getenv("MODEL_DEPLOYMENT_NAME", "gpt-4o")
        
        self.AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY", "")
        self.AZURE_SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION", "eastus2")
        
        self.SUBSCRIPTION_ID = os.getenv("SUBSCRIPTION_ID", "")
        self.RESOURCE_GROUP_NAME = os.getenv("RESOURCE_GROUP_NAME", "")
        
        self.AZURE_AVATAR_CHARACTER = os.getenv("AZURE_AVATAR_CHARACTER", "lori")
        self.AZURE_AVATAR_STYLE = os.getenv("AZURE_AVATAR_STYLE", "graceful")
        
        self.VOICE_NAME = os.getenv("VOICE_NAME", "en-US-Ava:DragonHDLatestNeural")
        self.VOICE_TYPE = os.getenv("VOICE_TYPE", "azure-standard")
        
        self.AI_INSTRUCTIONS = os.getenv(
            "AI_INSTRUCTIONS",
            "You are Aria, a helpful AI assistant for Frontier AI Solutions. Help users understand Microsoft's AI offerings, Azure AI Foundry, partner ISV solutions, products, pricing, and roadmaps. Be concise, informative, and friendly. When users ask about solutions, recommend specific Azure services or ISV partner solutions from the Azure Marketplace that match their needs."
        )
        
        self.AI_TEMPERATURE = float(os.getenv("AI_TEMPERATURE", "0.8"))
        self.MAX_RESPONSE_TOKENS = int(os.getenv("MAX_RESPONSE_TOKENS", "4096"))
        self.RECOMMENDATIONS_MAX_TOKENS = int(os.getenv("RECOMMENDATIONS_MAX_TOKENS", "800"))
        
        self.AZURE_VOICELIVE_ENDPOINT = os.getenv(
            "AZURE_VOICELIVE_ENDPOINT",
            f"wss://{self.AZURE_AI_REGION}.api.cognitive.microsoft.com/openai/realtime"
        )
    
    def validate(self) -> tuple[bool, list[str]]:
        """Validate that required configuration is present."""
        missing = []
        
        if not self.AZURE_OPENAI_ENDPOINT:
            missing.append("AZURE_OPENAI_ENDPOINT")
        if not self.AZURE_OPENAI_API_KEY:
            missing.append("AZURE_OPENAI_API_KEY")
        if not self.AZURE_SPEECH_KEY:
            missing.append("AZURE_SPEECH_KEY")
        if not self.AZURE_SPEECH_REGION:
            missing.append("AZURE_SPEECH_REGION")
        if not self.AZURE_AI_RESOURCE_NAME:
            missing.append("AZURE_AI_RESOURCE_NAME")
        if not self.MODEL_DEPLOYMENT_NAME:
            missing.append("MODEL_DEPLOYMENT_NAME")
        
        return len(missing) == 0, missing
    
    def to_dict(self) -> dict:
        """Return non-sensitive configuration as a dictionary."""
        return {
            "environment": self.ENVIRONMENT,
            "azure_ai_region": self.AZURE_AI_REGION,
            "model_deployment_name": self.MODEL_DEPLOYMENT_NAME,
            "avatar_character": self.AZURE_AVATAR_CHARACTER,
            "avatar_style": self.AZURE_AVATAR_STYLE,
        }

config = Config()
