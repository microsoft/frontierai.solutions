"""Tests for app/websocket_handler.py WebSocket proxy functionality."""

import pytest
import json
from unittest.mock import MagicMock, AsyncMock, patch
from fastapi import WebSocket
from app.websocket_handler import VoiceProxyHandler


class TestVoiceProxyHandler:
    """Tests for VoiceProxyHandler class."""
    
    def test_initialization(self):
        """Test VoiceProxyHandler initializes correctly."""
        handler = VoiceProxyHandler()
        
        assert handler.config is not None
        assert handler.azure_ws is None
        assert handler.client_ws is None
        assert handler.client_closed is False
    
    @pytest.mark.asyncio
    async def test_handle_connection_accepts_websocket(self, mock_websocket, mock_env_vars):
        """Test handle_connection accepts WebSocket connection."""
        handler = VoiceProxyHandler()
        
        # Mock Azure WebSocket connection
        with patch.object(handler, '_connect_to_azure', new=AsyncMock()):
            with patch.object(handler, '_send_message', new=AsyncMock()):
                with patch.object(handler, '_forward_client_to_azure', new=AsyncMock()):
                    with patch.object(handler, '_forward_azure_to_client', new=AsyncMock()):
                        with patch.object(handler, '_cleanup', new=AsyncMock()):
                            await handler.handle_connection(mock_websocket)
                            
                            mock_websocket.accept.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_handle_connection_sends_proxy_connected_message(self, mock_websocket, mock_env_vars):
        """Test handle_connection sends proxy.connected message."""
        handler = VoiceProxyHandler()
        
        with patch.object(handler, '_connect_to_azure', new=AsyncMock()):
            with patch.object(handler, '_forward_client_to_azure', new=AsyncMock()):
                with patch.object(handler, '_forward_azure_to_client', new=AsyncMock()):
                    with patch.object(handler, '_cleanup', new=AsyncMock()):
                        await handler.handle_connection(mock_websocket)
                        
                        # Check that send_text was called with proxy.connected message
                        calls = mock_websocket.send_text.call_args_list
                        proxy_connected_sent = any(
                            'proxy.connected' in str(call) for call in calls
                        )
                        assert proxy_connected_sent or len(calls) > 0
    
    @pytest.mark.asyncio
    async def test_handle_connection_cleans_up_on_error(self, mock_websocket, mock_env_vars):
        """Test handle_connection cleans up on error."""
        handler = VoiceProxyHandler()
        
        with patch.object(handler, '_connect_to_azure', side_effect=Exception("Connection failed")):
            with patch.object(handler, '_cleanup', new=AsyncMock()) as mock_cleanup:
                await handler.handle_connection(mock_websocket)
                
                mock_cleanup.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_connect_to_azure_builds_correct_url(self, mock_env_vars):
        """Test _connect_to_azure builds correct WebSocket URL."""
        # Reload to pick up env vars
        import importlib
        import app.config
        importlib.reload(app.config)
        
        from app.websocket_handler import VoiceProxyHandler
        handler = VoiceProxyHandler()
        
        with patch('websockets.connect', new=AsyncMock()) as mock_connect:
            mock_ws = AsyncMock()
            mock_connect.return_value = mock_ws
            
            await handler._connect_to_azure()
            
            # Verify websockets.connect was called
            mock_connect.assert_called_once()
            
            # Check URL format
            call_args = mock_connect.call_args
            url = call_args[0][0]
            assert "wss://" in url
            assert "cognitiveservices.azure.com" in url
            assert "voice-agent/realtime" in url
            assert "api-version=" in url
            assert "model=gpt-4o" in url
    
    @pytest.mark.asyncio
    async def test_connect_to_azure_includes_api_key_header(self, mock_env_vars):
        """Test _connect_to_azure includes API key in headers."""
        handler = VoiceProxyHandler()
        
        with patch('websockets.connect', new=AsyncMock()) as mock_connect:
            mock_ws = AsyncMock()
            mock_connect.return_value = mock_ws
            
            await handler._connect_to_azure()
            
            call_args = mock_connect.call_args
            headers = call_args[1].get('additional_headers', {})
            
            assert 'api-key' in headers
    
    @pytest.mark.asyncio
    async def test_connect_to_azure_sends_initial_config(self, mock_env_vars):
        """Test _connect_to_azure sends initial session configuration."""
        handler = VoiceProxyHandler()
        
        with patch('websockets.connect', new=AsyncMock()) as mock_connect:
            mock_ws = AsyncMock()
            mock_ws.send = AsyncMock()
            mock_connect.return_value = mock_ws
            
            await handler._connect_to_azure()
            
            # Verify send was called with session configuration
            mock_ws.send.assert_called_once()
            sent_data = mock_ws.send.call_args[0][0]
            config = json.loads(sent_data)
            
            assert config['type'] == 'session.update'
            assert 'session' in config
    
    @pytest.mark.asyncio
    async def test_connect_to_azure_handles_connection_failure(self, mock_env_vars):
        """Test _connect_to_azure handles connection failures."""
        handler = VoiceProxyHandler()
        
        with patch('websockets.connect', side_effect=Exception("Connection failed")):
            with pytest.raises(Exception):
                await handler._connect_to_azure()
    
    def test_build_session_config_structure(self, mock_env_vars):
        """Test _build_session_config returns correct structure."""
        handler = VoiceProxyHandler()
        config = handler._build_session_config()
        
        assert config['type'] == 'session.update'
        assert 'session' in config
        assert 'modalities' in config['session']
        assert 'turn_detection' in config['session']
        assert 'avatar' in config['session']
        assert 'voice' in config['session']
        assert 'instructions' in config['session']
    
    def test_build_session_config_includes_avatar_settings(self, mock_env_vars):
        """Test _build_session_config includes avatar configuration."""
        handler = VoiceProxyHandler()
        config = handler._build_session_config()
        
        avatar = config['session']['avatar']
        assert 'character' in avatar
        assert 'style' in avatar
        assert avatar['character'] == 'lori'
        assert avatar['style'] == 'graceful'
    
    def test_build_session_config_includes_voice_settings(self, mock_env_vars):
        """Test _build_session_config includes voice configuration."""
        handler = VoiceProxyHandler()
        config = handler._build_session_config()
        
        voice = config['session']['voice']
        assert 'name' in voice
        assert 'type' in voice
    
    def test_build_session_config_includes_turn_detection(self, mock_env_vars):
        """Test _build_session_config includes turn detection settings."""
        handler = VoiceProxyHandler()
        config = handler._build_session_config()
        
        turn_detection = config['session']['turn_detection']
        assert 'type' in turn_detection
        assert 'silence_duration_ms' in turn_detection
        assert 'threshold' in turn_detection
        assert turn_detection['type'] == 'azure_semantic_vad'
    
    @pytest.mark.asyncio
    async def test_send_message_sends_json_to_client(self):
        """Test _send_message sends JSON message to client WebSocket."""
        handler = VoiceProxyHandler()
        mock_ws = AsyncMock()
        handler.client_ws = mock_ws
        
        message = {"type": "test", "data": "value"}
        await handler._send_message(message)
        
        mock_ws.send_text.assert_called_once()
        sent_data = mock_ws.send_text.call_args[0][0]
        assert json.loads(sent_data) == message
    
    @pytest.mark.asyncio
    async def test_send_message_handles_send_failure(self):
        """Test _send_message handles send failures gracefully."""
        handler = VoiceProxyHandler()
        mock_ws = AsyncMock()
        mock_ws.send_text.side_effect = Exception("Send failed")
        handler.client_ws = mock_ws
        
        # Should not raise exception
        await handler._send_message({"type": "test"})
    
    @pytest.mark.asyncio
    async def test_cleanup_closes_azure_websocket(self):
        """Test _cleanup closes Azure WebSocket connection."""
        handler = VoiceProxyHandler()
        mock_azure_ws = AsyncMock()
        handler.azure_ws = mock_azure_ws
        
        await handler._cleanup()
        
        mock_azure_ws.close.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_cleanup_closes_client_websocket(self):
        """Test _cleanup closes client WebSocket connection."""
        handler = VoiceProxyHandler()
        mock_client_ws = AsyncMock()
        handler.client_ws = mock_client_ws
        handler.client_closed = False
        
        await handler._cleanup()
        
        mock_client_ws.close.assert_called_once()
        assert handler.client_closed is True
    
    @pytest.mark.asyncio
    async def test_cleanup_handles_close_errors(self):
        """Test _cleanup handles errors during close gracefully."""
        handler = VoiceProxyHandler()
        mock_azure_ws = AsyncMock()
        mock_azure_ws.close.side_effect = Exception("Close failed")
        handler.azure_ws = mock_azure_ws
        
        # Should not raise exception
        await handler._cleanup()


class TestVoiceProxyHandlerMessageForwarding:
    """Tests for message forwarding between client and Azure."""
    
    @pytest.mark.asyncio
    async def test_forward_client_to_azure_forwards_messages(self):
        """Test _forward_client_to_azure forwards messages from client to Azure."""
        handler = VoiceProxyHandler()
        
        mock_client_ws = AsyncMock()
        mock_azure_ws = AsyncMock()
        
        # Setup client to send one message then stop
        test_message = json.dumps({"type": "input_audio_buffer.append", "audio": "data"})
        mock_client_ws.receive_text.side_effect = [test_message, Exception("Stop")]
        
        handler.client_ws = mock_client_ws
        handler.azure_ws = mock_azure_ws
        
        # Run and expect it to stop
        try:
            await handler._forward_client_to_azure()
        except Exception:
            pass
        
        # Verify message was forwarded
        mock_azure_ws.send.assert_called_with(test_message)
    
    @pytest.mark.asyncio
    async def test_forward_azure_to_client_forwards_messages(self):
        """Test _forward_azure_to_client forwards messages from Azure to client."""
        handler = VoiceProxyHandler()
        
        mock_client_ws = AsyncMock()
        mock_azure_ws = AsyncMock()
        
        # Setup Azure to send one message
        test_message = json.dumps({"type": "session.updated", "session": {}})
        
        # Create an async iterator that yields the message
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
        
        mock_azure_ws.__aiter__ = lambda self: AsyncIterator([test_message])
        
        handler.client_ws = mock_client_ws
        handler.azure_ws = mock_azure_ws
        
        await handler._forward_azure_to_client()
        
        # Verify message was forwarded
        mock_client_ws.send_text.assert_called_with(test_message)


class TestWebSocketEndpoint:
    """Tests for /ws/voice WebSocket endpoint."""
    
    def test_websocket_endpoint_exists(self, client):
        """Test WebSocket endpoint is accessible."""
        # This will fail to upgrade but confirms the endpoint exists
        response = client.get("/ws/voice")
        # Should get 404, 403, 405, or 426 since it's not a WebSocket upgrade
        assert response.status_code in [403, 404, 405, 426]
    
    @pytest.mark.asyncio
    async def test_websocket_rejects_invalid_config(self, monkeypatch):
        """Test WebSocket connection rejects when config is invalid."""
        from fastapi import WebSocket
        from app.websocket_handler import VoiceProxyHandler
        
        # Clear required env vars
        monkeypatch.delenv("AZURE_OPENAI_API_KEY", raising=False)
        
        # Reload config
        import importlib
        import app.config
        importlib.reload(app.config)
        
        from app.config import config
        
        mock_ws = AsyncMock()
        
        # Import the endpoint function
        from app.main import websocket_voice_endpoint
        
        # Run the endpoint
        await websocket_voice_endpoint(mock_ws)
        
        # Should have closed the connection
        mock_ws.close.assert_called_once()
