import asyncio
import json
import logging
import uuid
from typing import Optional
import websockets
from fastapi import WebSocket, WebSocketDisconnect
from .config import config
from .redis_client import redis_client

logger = logging.getLogger(__name__)

# WebSocket constants
AZURE_VOICE_API_VERSION = "2025-05-01-preview"
AZURE_COGNITIVE_SERVICES_DOMAIN = "cognitiveservices.azure.com"
VOICE_AGENT_ENDPOINT = "voice-agent/realtime"

# Session configuration constants
DEFAULT_MODALITIES = ["text", "audio"]
DEFAULT_TURN_DETECTION_TYPE = "azure_semantic_vad"
DEFAULT_NOISE_REDUCTION_TYPE = "azure_deep_noise_suppression"
DEFAULT_ECHO_CANCELLATION_TYPE = "server_echo_cancellation"

# Message types
SESSION_UPDATE_TYPE = "session.update"
PROXY_CONNECTED_TYPE = "proxy.connected"
ERROR_TYPE = "error"

class VoiceProxyHandler:
    """Handles WebSocket connections between client and Azure Voice Live API."""
    
    def __init__(self):
        self.config = config
        self.azure_ws: Optional[websockets.WebSocketClientProtocol] = None
        self.client_ws: Optional[WebSocket] = None
        self.client_closed = False
        
    async def handle_connection(self, websocket: WebSocket):
        """Handle a new WebSocket connection from the client."""
        await websocket.accept()
        self.client_ws = websocket
        
        try:
            await self._connect_to_azure()
            
            await self._send_message(
                {"type": PROXY_CONNECTED_TYPE, "message": "Connected to Azure Voice API"}
            )
            
            await asyncio.gather(
                self._forward_client_to_azure(),
                self._forward_azure_to_client()
            )
            
        except WebSocketDisconnect:
            logger.info("Client disconnected")
        except Exception as e:
            logger.error(f"Error in WebSocket handler: {e}", exc_info=True)
        finally:
            await self._cleanup()
    
    async def _connect_to_azure(self):
        """Establish WebSocket connection to Azure Voice Live API."""
        api_key = self.config.AZURE_OPENAI_API_KEY
        resource_name = self.config.AZURE_AI_RESOURCE_NAME
        model_name = self.config.MODEL_DEPLOYMENT_NAME
        
        logger.info(f"Connecting to Azure Voice Live API")
        logger.info(f"  Resource Name: {resource_name}")
        logger.info(f"  Model: {model_name}")
        logger.info(f"  API Key configured: {bool(api_key)}")
        
        client_request_id = uuid.uuid4()
        
        ws_url = (
            f"wss://{resource_name}.{AZURE_COGNITIVE_SERVICES_DOMAIN}/"
            f"{VOICE_AGENT_ENDPOINT}?api-version={AZURE_VOICE_API_VERSION}"
            f"&x-ms-client-request-id={client_request_id}"
            f"&model={model_name}"
        )
        
        headers = {
            "api-key": api_key,
        }
        
        logger.info(f"Connecting to Azure Voice Live API at {ws_url}")
        logger.info(f"Request headers: {list(headers.keys())}")
        
        try:
            self.azure_ws = await websockets.connect(
                ws_url,
                additional_headers=headers,
                ping_interval=20,
                ping_timeout=10
            )
            logger.info("Successfully connected to Azure Voice Live API")
            
            await self._send_initial_config()
            
        except Exception as e:
            logger.error(f"Failed to connect to Azure Voice Live API: {e}", exc_info=True)
            logger.error(f"Please verify your Azure configuration:")
            logger.error(f"  - AZURE_OPENAI_API_KEY is set correctly")
            logger.error(f"  - AZURE_AI_RESOURCE_NAME matches your Azure resource")
            logger.error(f"  - MODEL_DEPLOYMENT_NAME ({model_name}) exists in your resource")
            raise
    
    async def _send_initial_config(self):
        """Send initial session configuration to Azure."""
        if not self.azure_ws:
            return
        
        config_message = self._build_session_config()
        
        logger.info(f"Sending session config to Azure:")
        logger.info(f"  Modalities: {config_message['session']['modalities']}")
        logger.info(f"  Avatar: {config_message['session']['avatar']}")
        logger.info(f"  Voice: {config_message['session']['voice']}")
        
        try:
            await self.azure_ws.send(json.dumps(config_message))
            logger.info("Sent initial configuration to Azure")
        except Exception as e:
            logger.error(f"Failed to send initial config: {e}", exc_info=True)
    
    def _build_session_config(self) -> dict:
        """Build the session configuration message."""
        return {
            "type": SESSION_UPDATE_TYPE,
            "session": {
                "modalities": DEFAULT_MODALITIES,
                "turn_detection": {
                    "type": DEFAULT_TURN_DETECTION_TYPE,
                    "silence_duration_ms": 1000,  # Wait 1 second of silence before considering turn done (default: 500ms)
                    "threshold": 0.6,  # Higher threshold = less sensitive, waits longer (default: 0.5)
                    "prefix_padding_ms": 300,  # Padding before speech detection (default: 300ms)
                    "create_response": True  # Automatically create response after turn ends
                },
                "input_audio_transcription": {"model": "whisper-1"},
                "input_audio_noise_reduction": {"type": DEFAULT_NOISE_REDUCTION_TYPE},
                "input_audio_echo_cancellation": {"type": DEFAULT_ECHO_CANCELLATION_TYPE},
                "avatar": {
                    "character": self.config.AZURE_AVATAR_CHARACTER,
                    "style": self.config.AZURE_AVATAR_STYLE,
                },
                "voice": {
                    "name": self.config.VOICE_NAME,
                    "type": self.config.VOICE_TYPE,
                },
                "instructions": self.config.AI_INSTRUCTIONS,
                "temperature": self.config.AI_TEMPERATURE,
                "max_response_output_tokens": self.config.MAX_RESPONSE_TOKENS,
            }
        }
    
    async def _forward_client_to_azure(self):
        """Forward messages from client to Azure."""
        if not self.client_ws or not self.azure_ws:
            return
        
        try:
            while True:
                message = await self.client_ws.receive_text()
                
                try:
                    msg_data = json.loads(message)
                    msg_type = msg_data.get('type', 'unknown')
                    logger.debug(f"Client -> Azure: {msg_type}")
                    
                    # Log avatar connection requests
                    if msg_type == 'session.avatar.connect':
                        client_sdp = msg_data.get('client_sdp', '')
                        logger.info(f"Avatar connect request with client_sdp field present: {bool(client_sdp)}")
                        logger.info(f"Client SDP length: {len(client_sdp)}")
                        logger.info(f"Client SDP (first 50 chars): {client_sdp[:50]}")
                        # Try to decode and check
                        try:
                            import base64
                            decoded = base64.b64decode(client_sdp).decode('utf-8')
                            logger.info(f"Decoded SDP (first 100 chars): {decoded[:100]}")
                        except Exception as e:
                            logger.error(f"Failed to decode client_sdp: {e}")
                    
                except json.JSONDecodeError:
                    logger.warning("Received non-JSON message from client")
                
                await self.azure_ws.send(message)
                
        except WebSocketDisconnect:
            logger.info("Client disconnected during forwarding")
            self.client_closed = True
        except Exception as e:
            logger.error(f"Error forwarding client to Azure: {e}", exc_info=True)
    
    async def _forward_azure_to_client(self):
        """Forward messages from Azure to client."""
        if not self.client_ws or not self.azure_ws:
            return
        
        try:
            async for message in self.azure_ws:
                try:
                    msg_data = json.loads(message)
                    msg_type = msg_data.get('type', 'unknown')
                    logger.debug(f"Azure -> Client: {msg_type}")
                    
                    # Log session.updated messages with avatar/rtc info
                    if msg_type == 'session.updated':
                        logger.info(f"Session updated message: {json.dumps(msg_data, indent=2)}")
                        if 'session' in msg_data:
                            session = msg_data['session']
                            if 'avatar' in session:
                                logger.info(f"Avatar config present: {list(session['avatar'].keys())}")
                            if 'rtc' in session:
                                logger.info(f"RTC config present: {list(session['rtc'].keys())}")
                    
                    # Log error messages with full details
                    if msg_type == 'error':
                        logger.error(f"Error from Azure: {json.dumps(msg_data, indent=2)}")
                    
                    await self.client_ws.send_text(message)
                    
                except json.JSONDecodeError:
                    logger.warning("Received non-JSON message from Azure")
                    await self.client_ws.send_text(message)
                    
        except websockets.exceptions.ConnectionClosed:
            logger.info("Azure connection closed")
        except Exception as e:
            logger.error(f"Error forwarding Azure to client: {e}", exc_info=True)
    
    async def _send_message(self, message: dict):
        """Send a JSON message to the client WebSocket."""
        if not self.client_ws:
            return
        
        try:
            await self.client_ws.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Failed to send message to client: {e}")
    
    async def _cleanup(self):
        """Clean up WebSocket connections."""
        if self.azure_ws:
            try:
                await self.azure_ws.close()
                logger.info("Closed Azure WebSocket connection")
            except Exception as e:
                logger.error(f"Error closing Azure connection: {e}")
        
        if self.client_ws and not self.client_closed:
            try:
                await self.client_ws.close()
                self.client_closed = True
                logger.info("Closed client WebSocket connection")
            except Exception as e:
                logger.error(f"Error closing client connection: {e}")
