import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Loader2, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRealtime } from '../../hooks/useRealtime';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useRecorder } from '../../hooks/useRecorder';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AvatarModal({ isOpen, onClose }: AvatarModalProps) {
  const [transcript, setTranscript] = useState<ConversationMessage[]>([]);
  const [isAvatarReady, setIsAvatarReady] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<string>('');
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState('');
  const [email, setEmail] = useState('');
  const [shareConversation, setShareConversation] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const currentResponseIdRef = useRef<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');

  const { videoRef, setupWebRTC, createOffer, handleAnswer, close: closeWebRTC } = useWebRTC({
    onConnectionStateChange: (state) => {
      console.log('WebRTC state:', state);
      if (state === 'connected') {
        setIsAvatarReady(true);
      }
    }
  });

  const { isConnected, connect, disconnect, send } = useRealtime({
    url: `${wsUrl}/ws/voice`,
    onMessage: handleWebSocketMessage,
    onOpen: () => {
      console.log('WebSocket connected');
    },
    onClose: () => {
      console.log('WebSocket closed');
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    }
  });

  const { isRecording, isMuted, startRecording, stopRecording, toggleMute } = useRecorder({
    onDataAvailable: (audioData) => {
      if (isConnected) {
        const base64Audio = arrayBufferToBase64(audioData);
        send({
          type: 'input_audio_buffer.append',
          audio: base64Audio
        });
      }
    }
  });

  function handleWebSocketMessage(data: any) {
    console.log('Received message:', data.type, data);

    switch (data.type) {
      case 'session.created':
        console.log('Session created');
        break;

      case 'session.updated':
        console.log('Session updated:', data);
        
        // Handle avatar/RTC configuration from session.updated
        if (data.session) {
          const session = data.session;
          
          // Check for ICE servers in various possible locations
          const iceServers = 
            session.avatar?.ice_servers || 
            session.rtc?.ice_servers || 
            session.ice_servers ||
            [];
          
          console.log('ICE servers:', iceServers);
          
          if (iceServers.length > 0) {
            setupWebRTC(iceServers).then(async (pc) => {
              if (pc) {
                console.log('WebRTC setup complete, creating offer...');
                const offer = await createOffer();
                if (offer && offer.sdp) {
                  console.log('Sending offer to server (first 100 chars):', offer.sdp.substring(0, 100));
                  // Azure expects base64-encoded JSON object containing {type: 'offer', sdp: '...'}
                  const sdpObject = {
                    type: 'offer',
                    sdp: offer.sdp
                  };
                  const base64Sdp = btoa(JSON.stringify(sdpObject));
                  console.log('Encoded SDP (first 50 chars):', base64Sdp.substring(0, 50));
                  send({
                    type: 'session.avatar.connect',
                    client_sdp: base64Sdp
                  });
                }
              }
            });
          } else {
            console.warn('No ICE servers found in session.updated');
          }
          
          // Handle server SDP (answer) if present in session.updated
          const serverSdp = session.server_sdp || session.sdp || session.avatar?.sdp;
          if (serverSdp) {
            console.log('Received server SDP in session.updated');
            try {
              // Azure sends base64-encoded JSON object with {type, sdp}
              const sdpObject = JSON.parse(atob(serverSdp));
              console.log('Decoded SDP object:', sdpObject.type, sdpObject.sdp?.substring(0, 100));
              handleAnswer({ type: 'answer', sdp: sdpObject.sdp });
            } catch (e) {
              console.error('Failed to decode server SDP:', e);
            }
          }
        }
        break;

      case 'session.avatar.connected':
      case 'session.avatar.connecting':
        console.log('Avatar connection event:', data.type, data);
        // Handle avatar connection with server SDP
        if (data.server_sdp) {
          console.log('Received avatar SDP answer');
          try {
            // Azure sends base64-encoded JSON object with {type, sdp}
            const sdpObject = JSON.parse(atob(data.server_sdp));
            console.log('Decoded SDP object:', sdpObject.type, sdpObject.sdp?.substring(0, 100));
            handleAnswer({ type: 'answer', sdp: sdpObject.sdp });
          } catch (e) {
            console.error('Failed to decode server SDP:', e);
          }
        }
        break;

      case 'conversation.item.created':
        // Only handle user messages here (from transcription)
        if (data.item?.role === 'user') {
          if (data.item?.content) {
            const content = data.item.content;
            if (Array.isArray(content)) {
              const textContent = content.find((c: any) => c.type === 'input_audio' || c.type === 'text');
              if (textContent?.transcript) {
                console.log('Adding user message:', textContent.transcript.substring(0, 50));
                addTranscriptMessage('user', textContent.transcript);
              } else if (textContent?.text) {
                console.log('Adding user text:', textContent.text.substring(0, 50));
                addTranscriptMessage('user', textContent.text);
              }
            }
          }
        }
        break;

      case 'response.created':
        // New response started, clear any previous assistant message
        console.log('Response created:', data.response?.id);
        if (data.response?.id) {
          currentResponseIdRef.current = data.response.id;
        }
        setCurrentAssistantMessage('');
        break;

      case 'response.audio_transcript.delta':
        // Build up the assistant's response as it comes in
        if (data.delta) {
          setCurrentAssistantMessage(prev => prev + data.delta);
        }
        break;

      case 'response.audio_transcript.done':
        // Add the complete assistant response
        setCurrentAssistantMessage(prev => {
          console.log('Assistant transcript done:', prev);
          if (prev.trim()) {
            addTranscriptMessage('assistant', prev);
          }
          currentResponseIdRef.current = null;
          return ''; // Clear for next response
        });
        break;

      case 'input_audio_buffer.speech_started':
        console.log('User started speaking');
        break;

      case 'input_audio_buffer.speech_stopped':
        console.log('User stopped speaking');
        break;

      case 'response.done':
        console.log('Response completed');
        break;

      case 'error':
        console.error('Server error:', data.error);
        break;
    }
  }

  function addTranscriptMessage(role: 'user' | 'assistant', content: string) {
    // Don't add empty messages
    if (!content || content.trim().length === 0) {
      return;
    }
    
    const message: ConversationMessage = {
      role,
      content,
      timestamp: new Date().toISOString()
    };
    
    // Prevent duplicate consecutive messages with same content
    setTranscript(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && 
          lastMessage.role === role && 
          lastMessage.content === content) {
        console.log('Skipping duplicate message:', content.substring(0, 50));
        return prev;
      }
      return [...prev, message];
    });
  }

  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  const handleGetRecommendations = useCallback(async () => {
    if (transcript.length === 0) {
      return;
    }

    setIsLoadingRecommendations(true);
    setShowRecommendations(true);

    try {
      const response = await fetch(`${apiUrl}/api/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setRecommendations('Failed to generate recommendations. Please try again.');
    } finally {
      setIsLoadingRecommendations(false);
    }
  }, [transcript, apiUrl]);

  const handleSendToSeller = useCallback(async () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSendingEmail(true);

    try {
      const payload = {
        email,
        recommendations,
        ...(shareConversation && { transcript })
      };

      const response = await fetch(`${apiUrl}/api/send-to-seller`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      alert('Successfully sent! An Azure seller will follow up with you shortly.');
      setEmail('');
    } catch (error) {
      console.error('Error sending to seller:', error);
      alert('Failed to send. Please try again or contact support.');
    } finally {
      setIsSendingEmail(false);
    }
  }, [email, recommendations, shareConversation, transcript, apiUrl]);

  const handleStartConversation = useCallback(async () => {
    try {
      await startRecording();
      setHasStartedConversation(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Unable to access microphone. Please grant microphone permissions and try again.');
    }
  }, [startRecording]);

  const handleClose = useCallback(() => {
    if (isRecording) {
      stopRecording();
    }
    disconnect();
    closeWebRTC();
    setTranscript([]);
    setCurrentAssistantMessage('');
    setShowRecommendations(false);
    setRecommendations('');
    setIsAvatarReady(false);
    setHasStartedConversation(false);
    currentResponseIdRef.current = null;
    onClose();
  }, [isRecording, stopRecording, disconnect, closeWebRTC, onClose]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, currentAssistantMessage]);

  useEffect(() => {
    if (isOpen && !isConnected) {
      connect();
    }
  }, [isOpen, isConnected, connect]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTranscript([]);
      setCurrentAssistantMessage('');
      setShowRecommendations(false);
      setRecommendations('');
      currentResponseIdRef.current = null;
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-[#0a0a0a] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h2 className="text-xl font-medium text-white">Engage with Aria to discover solutions</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  {!isAvatarReady ? 'Connecting...' : 
                   !hasStartedConversation ? 'Ready - Click "Start Conversation" to begin' : 
                   'Connected - Start speaking'}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5 text-zinc-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left: Avatar Video */}
              <div className="w-[40%] flex items-center justify-center bg-white relative overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted={false}
                  className="w-full h-full object-cover"
                  style={{ 
                    display: isAvatarReady && hasStartedConversation ? 'block' : 'none'
                  }}
                />
                
                {/* Start Conversation Overlay */}
                {isConnected && !hasStartedConversation && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center gap-6 px-8"
                  >
                    <div className="text-center mb-2">
                      <h3 className="text-2xl font-semibold text-zinc-700 mb-2">Ready to chat with Aria</h3>
                      <p className="text-sm text-zinc-500">
                        {isAvatarReady 
                          ? 'Click below to grant microphone access and start your conversation'
                          : 'Avatar is still loading, but you can start the voice conversation now'}
                      </p>
                    </div>
                    <motion.button
                      onClick={handleStartConversation}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative px-8 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-base transition-all flex items-center gap-3 cursor-pointer shadow-lg hover:shadow-xl"
                    >
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#00e5ff]/20 to-[#7c4dff]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#00e5ff] to-[#7c4dff] flex items-center justify-center">
                          <Mic className="h-5 w-5 text-white" />
                        </div>
                        <span>Start Conversation</span>
                      </div>
                    </motion.button>
                  </motion.div>
                )}
                
                {!isConnected && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <div className="relative">
                      {/* Outer pulsing ring */}
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.2, 0.5]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 rounded-full bg-[--acc-azure]/20 blur-xl"
                        style={{ width: '80px', height: '80px', margin: '-10px' }}
                      />
                      {/* Spinning loader */}
                      <Loader2 className="h-16 w-16 text-[--acc-azure] animate-spin relative z-10" />
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                      <motion.p 
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ 
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="text-lg font-medium text-zinc-700"
                      >
                        Initializing avatar...
                      </motion.p>
                      <motion.div 
                        className="flex gap-1.5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ 
                              y: [0, -8, 0],
                              opacity: [0.3, 1, 0.3]
                            }}
                            transition={{ 
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.15,
                              ease: "easeInOut"
                            }}
                            className="w-2 h-2 rounded-full bg-[--acc-azure]"
                          />
                        ))}
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* Recording Indicator */}
                {isRecording && hasStartedConversation && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-500/50 rounded-full"
                  >
                    <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm text-red-400">Recording</span>
                  </motion.div>
                )}
              </div>

              {/* Right: Transcript */}
              <div className="flex-1 w-[60%] border-l border-white/10 flex flex-col bg-[#0a0a0a]">
                <div className="px-4 py-3 border-b border-white/10">
                  <h3 className="text-sm font-medium text-white">Conversation</h3>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                  {transcript.length === 0 && !currentAssistantMessage && (
                    <p className="text-sm text-zinc-500 text-center mt-8">
                      {hasStartedConversation ? 'Start speaking to begin the conversation' : 'Click "Start Conversation" to begin'}
                    </p>
                  )}

                  {transcript.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.3, 
                        ease: 'easeOut',
                        delay: index * 0.05 
                      }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-[--acc-azure]/20 text-white'
                            : 'bg-white/5 text-zinc-200'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <div className="text-sm prose prose-invert prose-sm max-w-none
                            prose-headings:text-white prose-headings:font-semibold prose-headings:mb-2
                            prose-p:my-2 prose-p:leading-relaxed
                            prose-strong:text-white prose-strong:font-semibold
                            prose-ul:my-2 prose-ul:ml-4 prose-li:my-1
                            prose-ol:my-2 prose-ol:ml-4
                            prose-code:text-[--acc-azure] prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                            prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10
                            prose-a:text-[--acc-azure] prose-a:no-underline hover:prose-a:underline">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {currentAssistantMessage && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex justify-start"
                    >
                      <div className="max-w-[85%] rounded-lg px-4 py-3 bg-white/5 text-zinc-200">
                        <div className="text-sm prose prose-invert prose-sm max-w-none
                          prose-headings:text-white prose-headings:font-semibold prose-headings:mb-2
                          prose-p:my-2 prose-p:leading-relaxed
                          prose-strong:text-white prose-strong:font-semibold
                          prose-ul:my-2 prose-ul:ml-4 prose-li:my-1
                          prose-ol:my-2 prose-ol:ml-4
                          prose-code:text-[--acc-azure] prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                          prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10
                          prose-a:text-[--acc-azure] prose-a:no-underline hover:prose-a:underline">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {currentAssistantMessage}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={transcriptEndRef} />
                </div>

                {/* Recommendations Section */}
                {showRecommendations && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-white/10 bg-[#0f0f0f]"
                  >
                    <div className="p-4 max-h-96 overflow-y-auto">
                      <h4 className="text-base font-semibold text-white mb-3">Next Steps</h4>
                      {isLoadingRecommendations ? (
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Generating recommendations...</span>
                        </div>
                      ) : (
                        <>
                          <div className="prose prose-invert prose-sm max-w-none mb-4
                            prose-headings:text-white prose-headings:font-semibold prose-headings:mb-2 prose-headings:mt-3
                            prose-p:my-2 prose-p:leading-relaxed prose-p:text-zinc-300
                            prose-strong:text-white prose-strong:font-semibold
                            prose-ul:my-2 prose-ul:ml-4 prose-li:my-1 prose-li:text-zinc-300
                            prose-ol:my-2 prose-ol:ml-4
                            prose-code:text-[--acc-azure] prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                            prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10
                            prose-a:text-[--acc-azure] prose-a:no-underline hover:prose-a:underline">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {recommendations}
                            </ReactMarkdown>
                          </div>
                          
                          {/* Email Form */}
                          <div className="mt-6 pt-4 border-t border-white/10">
                            <h5 className="text-sm font-medium text-white mb-3">Get Follow-up from Azure Seller</h5>
                            <div className="space-y-3">
                              <div>
                                <label htmlFor="email" className="block text-xs text-zinc-400 mb-1.5">
                                  Email Address
                                </label>
                                <input
                                  type="email"
                                  id="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  placeholder="your.email@company.com"
                                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[--acc-azure] focus:border-transparent"
                                  disabled={isSendingEmail}
                                />
                              </div>
                              
                              <label className="flex items-start gap-2.5 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={shareConversation}
                                  onChange={(e) => setShareConversation(e.target.checked)}
                                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-[--acc-azure] focus:ring-2 focus:ring-[--acc-azure] focus:ring-offset-0 cursor-pointer"
                                  disabled={isSendingEmail}
                                />
                                <span className="text-xs text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                                  Share my conversation with Aria with the seller to provide better context for follow-up
                                </span>
                              </label>
                              
                              <motion.button
                                onClick={handleSendToSeller}
                                disabled={isSendingEmail || !email}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full px-5 py-3 rounded-lg text-white text-sm md:text-base font-semibold transition-colors flex items-center justify-center gap-2 bg-[--acc-azure] hover:bg-[--acc-azure]/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              >
                                {/* Primary button */}
                                
                                {isSendingEmail ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin relative z-10" />
                                    <span className="relative z-10">Sending...</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="tracking-wide">Send to Azure Specialist</span>
                                    <ArrowRight className="h-4 w-4" />
                                  </>
                                )}
                              </motion.button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Footer Controls */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#0a0a0a]">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  disabled={!isConnected || !hasStartedConversation}
                  className={`p-4 rounded-full transition-all ${
                    isMuted
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-[--acc-azure] hover:bg-[--acc-azure]/80'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMuted ? (
                    <MicOff className="h-5 w-5 text-white" />
                  ) : (
                    <Mic className="h-5 w-5 text-white" />
                  )}
                </button>
                
                <div className="text-sm">
                  <p className="text-white font-medium">
                    {!hasStartedConversation ? 'Not Started' : isMuted ? 'Muted' : 'Recording'}
                  </p>
                  <p className="text-zinc-500">
                    {!isConnected ? 'Connecting...' : !hasStartedConversation ? 'Click "Start Conversation"' : 'Ready to talk'}
                  </p>
                </div>
              </div>

              <motion.button
                onClick={handleGetRecommendations}
                disabled={transcript.length === 0 || isLoadingRecommendations}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold bg-[--acc-azure] hover:bg-[--acc-azure]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                title={transcript.length === 0 ? 'Have a conversation first to get personalized recommendations' : 'Get AI-powered next steps based on your conversation'}
              >
                <span>Next Steps</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
