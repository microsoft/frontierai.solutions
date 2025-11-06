import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Send, Loader2, ExternalLink, Users, Target, Briefcase, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRealtime } from '../../hooks/useRealtime';
import { useRecorder } from '../../hooks/useRecorder';
import { fetchCategory, type CategoryData } from '../../services/api';

interface ExploreModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
  isExecutiveOverview?: boolean;
}

export function ExploreModal({ isOpen, onClose, category, isExecutiveOverview = false }: ExploreModalProps) {
  const [scenarioInput, setScenarioInput] = useState('');
  const [narrative, setNarrative] = useState('');
  const [transcript, setTranscript] = useState<Array<{ role: string; content: string }>>([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState('');
  const [hasStartedVoice, setHasStartedVoice] = useState(false);
  const [expandedUseCases, setExpandedUseCases] = useState<Set<number>>(new Set([0]));
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());
  const [loadedStories, setLoadedStories] = useState<Record<string, any>>({});
  const [unavailableStories, setUnavailableStories] = useState<Set<string>>(new Set());
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  const [isAssistantThinking, setIsAssistantThinking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const currentResponseIdRef = useRef<string | null>(null);
  const responseTimeoutRef = useRef<number | null>(null);
  const hasActiveResponseRef = useRef<boolean>(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
  
  const shouldShowVoiceChat = isExecutiveOverview || !!categoryData;

  const { isConnected, connect, disconnect, send } = useRealtime({
    url: `${wsUrl}/ws/voice`,
    onMessage: handleWebSocketMessage,
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

  function clearResponseTimeout() {
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
      responseTimeoutRef.current = null;
    }
  }

  function scheduleResponseCompletion() {
    // Clear any existing timeout
    clearResponseTimeout();
    
    // Set a new timeout - if no more deltas arrive in 1.5s, consider response complete
    responseTimeoutRef.current = setTimeout(() => {
      console.log('Response timeout - finalizing response');
      setCurrentAssistantMessage(prev => {
        if (prev.trim()) {
          addTranscriptMessage('assistant', prev);
          setNarrative(prev);
        }
        return ''; // Clear for next response
      });
      currentResponseIdRef.current = null;
      hasActiveResponseRef.current = false;
      setIsAssistantThinking(false);
    }, 1500);
  }

  function handleWebSocketMessage(data: any) {
    console.log('Received message:', data.type, data);

    switch (data.type) {
      case 'session.created':
        console.log('Session created');
        break;

      case 'session.updated':
        console.log('Session updated:', data);
        break;

      case 'conversation.item.created':
        // Only handle user messages here (from transcription)
        if (data.item?.role === 'user') {
          if (data.item?.content) {
            const content = data.item.content;
            if (Array.isArray(content)) {
              const textContent = content.find((c: any) => c.type === 'input_audio' || c.type === 'text');
              if (textContent?.transcript) {
                // This is from audio transcription
                console.log('Adding user message from audio:', textContent.transcript.substring(0, 50));
                addTranscriptMessage('user', textContent.transcript);
                setIsProcessingAudio(false);
                setIsAssistantThinking(true);
              } else if (textContent?.type === 'input_text') {
                // This is from typed text - already added to transcript before sending, so skip
                console.log('Skipping duplicate typed message');
                setIsAssistantThinking(true);
              }
            }
          }
        }
        break;

      case 'response.created':
        // New response started, clear any previous assistant message
        console.log('Response created:', data.response?.id);
        clearResponseTimeout(); // Clear any pending timeout from previous response
        hasActiveResponseRef.current = true;
        if (data.response?.id) {
          currentResponseIdRef.current = data.response.id;
        }
        setCurrentAssistantMessage('');
        setIsAssistantThinking(false);
        break;

      case 'response.audio_transcript.delta':
        // Build up the assistant's response as it comes in (for audio)
        if (data.delta) {
          setCurrentAssistantMessage(prev => prev + data.delta);
          setIsAssistantThinking(false);
          scheduleResponseCompletion(); // Schedule timeout to finalize if no more deltas
        }
        break;

      case 'response.text.delta':
        // Build up the assistant's text response (for typed messages)
        if (data.delta) {
          console.log('Text delta:', data.delta);
          setCurrentAssistantMessage(prev => prev + data.delta);
          setIsAssistantThinking(false);
          scheduleResponseCompletion(); // Schedule timeout to finalize if no more deltas
        }
        break;

      case 'response.audio_transcript.done':
        // Add the complete assistant response (for audio)
        clearResponseTimeout(); // Clear timeout since we got explicit completion
        setCurrentAssistantMessage(prev => {
          console.log('Assistant transcript done:', prev);
          if (prev.trim()) {
            addTranscriptMessage('assistant', prev);
            setNarrative(prev); // Also update the narrative display
          }
          return ''; // Clear for next response
        });
        currentResponseIdRef.current = null;
        setIsAssistantThinking(false);
        break;

      case 'response.text.done':
        // Add the complete assistant text response (for typed messages)
        clearResponseTimeout(); // Clear timeout since we got explicit completion
        setCurrentAssistantMessage(prev => {
          console.log('Assistant text done:', prev);
          if (prev.trim()) {
            addTranscriptMessage('assistant', prev);
            setNarrative(prev); // Also update the narrative display
          }
          return ''; // Clear for next response
        });
        currentResponseIdRef.current = null;
        setIsAssistantThinking(false);
        break;

      case 'input_audio_buffer.speech_started':
        console.log('User started speaking');
        // Cancel any active text response when user starts speaking
        if (hasActiveResponseRef.current) {
          console.log('Cancelling active text response for voice input');
          send({
            type: 'response.cancel'
          });
          clearResponseTimeout();
          setCurrentAssistantMessage('');
          currentResponseIdRef.current = null;
          hasActiveResponseRef.current = false;
        }
        setIsUserSpeaking(true);
        setIsProcessingAudio(false);
        break;

      case 'input_audio_buffer.speech_stopped':
        console.log('User stopped speaking');
        setIsUserSpeaking(false);
        setIsProcessingAudio(true);
        break;

      case 'response.output_item.done':
        // Output item completed
        console.log('Output item done:', data);
        clearResponseTimeout(); // Clear timeout since we got explicit completion
        if (data.item?.content) {
          const content = data.item.content;
          if (Array.isArray(content)) {
            const textContent = content.find((c: any) => c.type === 'text');
            if (textContent?.text) {
              if (!currentAssistantMessage) {
                // Fallback: if we didn't get deltas, add the complete text here
                console.log('Adding complete text from output_item:', textContent.text.substring(0, 50));
                setCurrentAssistantMessage(textContent.text);
                addTranscriptMessage('assistant', textContent.text);
                setNarrative(textContent.text);
              }
              // Clear thinking state when output item is done
              setIsAssistantThinking(false);
            }
          }
        }
        break;

      case 'response.cancelled':
        console.log('Response cancelled');
        clearResponseTimeout();
        setCurrentAssistantMessage('');
        setIsAssistantThinking(false);
        currentResponseIdRef.current = null;
        hasActiveResponseRef.current = false;
        break;

      case 'response.done':
        console.log('Response completed');
        clearResponseTimeout(); // Clear timeout since we got explicit completion
        // Final cleanup - ensure thinking indicator is off
        setIsAssistantThinking(false);
        currentResponseIdRef.current = null;
        hasActiveResponseRef.current = false;
        break;

      case 'error':
        console.error('Server error:', data.error);
        clearResponseTimeout(); // Clear timeout on error
        setIsAssistantThinking(false);
        setIsProcessingAudio(false);
        // Only clear active response flag if it's not a "already has active response" error
        // because that means we need to wait for the current one to finish
        if (data.error?.code !== 'conversation_already_has_active_response') {
          hasActiveResponseRef.current = false;
        }
        break;
    }
  }

  function addTranscriptMessage(role: string, content: string) {
    // Don't add empty messages
    if (!content || content.trim().length === 0) {
      return;
    }
    
    // Prevent duplicate consecutive messages with same content
    setTranscript(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && 
          lastMessage.role === role && 
          lastMessage.content === content) {
        console.log('Skipping duplicate message:', content.substring(0, 50));
        return prev;
      }
      return [...prev, { role, content }];
    });
    
    if (role === 'assistant') {
      setIsSidebarExpanded(true);
    }
  }

  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  const handleGenerateNarrative = async () => {
    if (!scenarioInput.trim() || !isConnected) return;

    const userMessage = scenarioInput;
    addTranscriptMessage('user', userMessage);
    setScenarioInput('');
    setIsSidebarExpanded(true);
    setIsAssistantThinking(true);

    try {
      // Cancel any active response first
      if (hasActiveResponseRef.current || currentResponseIdRef.current) {
        console.log('Cancelling active response before text input:', currentResponseIdRef.current);
        send({
          type: 'response.cancel'
        });
        clearResponseTimeout();
        setCurrentAssistantMessage('');
        currentResponseIdRef.current = null;
        hasActiveResponseRef.current = false;
        
        // Wait for cancellation to be processed
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Send text message through WebSocket for streaming response
      send({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: userMessage
            }
          ]
        }
      });

      // Wait briefly for item creation, then trigger response
      await new Promise(resolve => setTimeout(resolve, 100));

      // Trigger the assistant to respond
      send({
        type: 'response.create'
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setIsAssistantThinking(false);
      hasActiveResponseRef.current = false;
    }
  };

  const handleStartVoice = async () => {
    try {
      await startRecording();
      setHasStartedVoice(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Unable to access microphone. Please grant microphone permissions and try again.');
    }
  };

  const toggleUseCase = (index: number) => {
    setExpandedUseCases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleStory = async (storyUrl: string) => {
    const storyKey = storyUrl;
    const isCurrentlyExpanded = expandedStories.has(storyKey);
    
    // Toggle the expanded state
    setExpandedStories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(storyKey)) {
        newSet.delete(storyKey);
      } else {
        newSet.add(storyKey);
      }
      return newSet;
    });

    // Fetch story if expanding and not already loaded
    if (!isCurrentlyExpanded && !loadedStories[storyKey] && !unavailableStories.has(storyKey)) {
      try {
        const response = await fetch(`${apiUrl}/api/story`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: storyUrl })
        });
        const data = await response.json();
        
        // Check if story has valid content or summary
        const hasValidContent = data.story?.content && data.story.content.length > 50;
        const hasValidSummary = data.story?.summary && data.story.summary.length > 20;
        const hasValidTitle = data.story?.title && data.story.title.length > 0;
        
        if (data.success && data.story && (hasValidContent || hasValidSummary || hasValidTitle)) {
          setLoadedStories(prev => ({ ...prev, [storyKey]: data.story }));
        } else {
          // Story is invalid or unavailable
          console.warn(`Story unavailable or invalid: ${storyUrl}`, data);
          setUnavailableStories(prev => new Set(prev).add(storyKey));
          setExpandedStories(prev => {
            const newSet = new Set(prev);
            newSet.delete(storyKey);
            return newSet;
          });
        }
      } catch (error) {
        console.error('Error loading story:', error);
        setUnavailableStories(prev => new Set(prev).add(storyKey));
        setExpandedStories(prev => {
          const newSet = new Set(prev);
          newSet.delete(storyKey);
          return newSet;
        });
      }
    }
  };

  const handleClose = () => {
    if (isRecording) {
      stopRecording();
    }
    disconnect();
    clearResponseTimeout(); // Clear any pending timeout
    setTranscript([]);
    setCurrentAssistantMessage('');
    setNarrative('');
    setScenarioInput('');
    setIsSidebarExpanded(false);
    setHasStartedVoice(false);
    setExpandedUseCases(new Set([0]));
    setExpandedStories(new Set());
    setLoadedStories({});
    setUnavailableStories(new Set());
    setIsAssistantThinking(false);
    setIsUserSpeaking(false);
    setIsProcessingAudio(false);
    currentResponseIdRef.current = null;
    hasActiveResponseRef.current = false;
    onClose();
  };

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, currentAssistantMessage, isAssistantThinking]);

  useEffect(() => {
    if (isOpen && !isConnected) {
      connect();
    }
  }, [isOpen, isConnected, connect]);

  useEffect(() => {
    if (isOpen && category && !isExecutiveOverview) {
      setIsLoadingCategory(true);
      const roles = ['Software Development', 'Legal', 'Sales', 'HR', 'IT', 'Marketing', 'Service'];
      const isRole = roles.includes(category);
      const type = isRole ? 'role' : 'industry';
      const slug = category.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-');
      
      fetchCategory(type, slug)
        .then(data => {
          setCategoryData(data);
          setIsLoadingCategory(false);
        })
        .catch(error => {
          console.error('Failed to fetch category data:', error);
          setIsLoadingCategory(false);
        });
    } else if (isOpen && isExecutiveOverview) {
      setCategoryData(null);
    }
  }, [isOpen, category, isExecutiveOverview]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearResponseTimeout(); // Clear any pending timeout
      setTranscript([]);
      setCurrentAssistantMessage('');
      setNarrative('');
      setScenarioInput('');
      setIsAssistantThinking(false);
      setIsUserSpeaking(false);
      setIsProcessingAudio(false);
      currentResponseIdRef.current = null;
      hasActiveResponseRef.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="explore-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={handleClose}
      />

      <motion.div
        key="explore-modal-content"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-4 md:inset-8 lg:inset-16 xl:inset-24 bg-[#0a0a0a] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-medium text-white">
              {isExecutiveOverview ? 'Executive Overview' : category}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              {shouldShowVoiceChat ? (
                !isConnected ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Connecting...
                  </span>
                ) : isUserSpeaking ? (
                  <span className="flex items-center gap-2 text-[--acc-azure]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[--acc-azure] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[--acc-azure]"></span>
                    </span>
                    Listening...
                  </span>
                ) : isProcessingAudio ? (
                  <span className="flex items-center gap-2 text-[--acc-purple]">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Processing speech...
                  </span>
                ) : isAssistantThinking ? (
                  <span className="flex items-center gap-2 text-[--acc-green]">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Assistant is thinking...
                  </span>
                ) : !hasStartedVoice ? (
                  'Ready - Click microphone to enable voice'
                ) : (
                  'Voice enabled - Start speaking'
                )
              ) : (
                'Category Information'
              )}
            </p>
            {isExecutiveOverview && (
              <p className="text-xs text-zinc-500 mt-1 italic">
                AI-first organizations think in orders of magnitude, not incremental improvements.
              </p>
            )}
            {categoryData?.type === 'role' && (
              <p className="text-xs text-zinc-500 mt-1 italic">
                Explore AI solutions tailored for {category} teams to drive efficiency and innovation.
              </p>
            )}
            {categoryData?.type === 'industry' && (
              <p className="text-xs text-zinc-500 mt-1 italic">
                Discover AI solutions designed for the {category} industry to transform operations and drive growth.
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <motion.div 
            className="overflow-y-auto px-6 py-6"
            animate={{ 
              width: shouldShowVoiceChat ? (isSidebarExpanded ? '30%' : '60%') : '100%'
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {isLoadingCategory ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 text-[--acc-azure] animate-spin" />
              </div>
            ) : categoryData ? (
              <div className="mx-auto max-w-5xl space-y-6">
                <div className="prose prose-invert max-w-none">
                  <h3 className="text-2xl font-medium text-white mb-4">Use Cases & Solutions</h3>

                  <div className="space-y-4">
                    {categoryData.useCases.map((useCase, idx) => {
                      const isExpanded = expandedUseCases.has(idx);
                      return (
                        <div key={idx} className="rounded-xl bg-gradient-to-br from-[--acc-purple]/5 to-transparent border border-white/10 overflow-hidden">
                          <button
                            onClick={() => toggleUseCase(idx)}
                            className="w-full flex items-start gap-3 p-5 text-left hover:bg-white/5 transition-colors"
                          >
                            <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-[--acc-purple] to-[--acc-azure] flex items-center justify-center">
                              <Briefcase className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-medium text-white mb-1">{useCase.name}</h4>
                              <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">{useCase.description}</p>
                            </div>
                            <ChevronDown 
                              className={`h-5 w-5 text-zinc-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>

                          {isExpanded && (() => {
                            // Calculate if there are any valid customer evidence items
                            const validEvidence = useCase.customerEvidence
                              .filter(evidence => evidence.storyUrl && !unavailableStories.has(evidence.storyUrl));
                            const hasEvidence = validEvidence.length > 0;

                            return (
                            <div className="px-5 pb-5">
                              <p className="text-sm text-zinc-300 leading-relaxed mb-4">{useCase.description}</p>
                              
                              <div className={`grid grid-cols-1 ${hasEvidence ? 'md:grid-cols-2' : ''} gap-4`}>
                                <div className="rounded-lg bg-white/5 border border-white/10 p-4">
                                  <div className="flex items-center gap-2 mb-4">
                                    <div className="h-5 w-5 rounded bg-[--acc-azure]/20 flex items-center justify-center">
                                      <Target className="h-3 w-3 text-[--acc-azure]" />
                                    </div>
                                    <p className="text-xs font-semibold text-[--acc-azure]">Solutions & Templates</p>
                                  </div>
                                  <div className="space-y-2">
                                    {useCase.solutions.map((solution, sIdx) => (
                                      <div key={sIdx} className="rounded-lg bg-white/5 border border-white/10 p-3 hover:bg-white/10 transition-colors">
                                        <p className="text-sm font-medium text-white mb-2">{solution.name}</p>
                                        <div className="flex flex-wrap gap-2">
                                          {solution.links.map((link, lIdx) => (
                                            <a
                                              key={lIdx}
                                              href={link.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[--acc-azure]/10 text-xs text-[--acc-azure] hover:bg-[--acc-azure]/20 hover:text-white transition-all border border-[--acc-azure]/20"
                                            >
                                              {link.type}
                                              <ExternalLink className="h-3 w-3" />
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {hasEvidence && (
                                <div className="rounded-lg bg-white/5 border border-white/10 p-4">
                                  <div className="flex items-center gap-2 mb-4">
                                    <div className="h-5 w-5 rounded bg-[--acc-green]/20 flex items-center justify-center">
                                      <Users className="h-3 w-3 text-[--acc-green]" />
                                    </div>
                                    <p className="text-xs font-semibold text-[--acc-green]">Customer Evidence</p>
                                  </div>
                                  <div className="space-y-2">
                                    {validEvidence.map((evidence, eIdx) => {
                                      const hasStory = !!evidence.storyUrl;
                                      const storyKey = evidence.storyUrl || '';
                                      const isStoryExpanded = expandedStories.has(storyKey);
                                      const story = loadedStories[storyKey];
                                      // Use storyUrl in key since it's unique and guaranteed to exist (we filter for it)
                                      const uniqueKey = `story-${idx}-${eIdx}-${evidence.storyUrl}`;

                                      return (
                                        <div key={uniqueKey} className="rounded-lg border border-white/10 overflow-hidden bg-white/5 hover:bg-white/10 transition-colors">
                                          <button
                                            onClick={() => hasStory && toggleStory(evidence.storyUrl!)}
                                            className={`w-full text-left p-3 ${hasStory ? 'cursor-pointer' : ''}`}
                                            disabled={!hasStory}
                                          >
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white">{evidence.name}</p>
                                                <p className="text-xs text-zinc-400 mt-1">{evidence.solutionPlay}</p>
                                              </div>
                                              {hasStory && (
                                                <ChevronDown 
                                                  className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform ${isStoryExpanded ? 'rotate-180' : ''}`}
                                                />
                                              )}
                                            </div>
                                          </button>

                                          {hasStory && isStoryExpanded && (
                                            <div className="px-3 pb-3 border-t border-white/10">
                                              {story ? (
                                                <div className="mt-3 space-y-2">
                                                  {story.title && story.title.length > 0 && (
                                                    <h5 className="text-sm font-medium text-white">{story.title}</h5>
                                                  )}
                                                  {story.summary && (
                                                    <p className="text-xs text-zinc-300 leading-relaxed">{story.summary}</p>
                                                  )}
                                                  {story.content && story.content.length > 0 && (
                                                    <p className="text-xs text-zinc-400 leading-relaxed">{story.content}</p>
                                                  )}
                                                  {(!story.content || story.content.length === 0) && story.summary && (
                                                    <p className="text-xs text-zinc-500 italic mt-1">
                                                      Visit the link below for the complete story
                                                    </p>
                                                  )}
                                                  <a
                                                    href={evidence.storyUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs text-[--acc-green] hover:text-white transition-colors mt-2"
                                                  >
                                                    Read full story
                                                    <ExternalLink className="h-3 w-3" />
                                                  </a>
                                                </div>
                                              ) : (
                                                <div className="mt-3 text-xs text-zinc-400">
                                                  Loading story...
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                                )}
                              </div>
                            </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8">
                    <div className="rounded-xl bg-gradient-to-br from-[--acc-green]/10 to-transparent border border-white/10 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Target className="h-6 w-6 text-[--acc-green]" />
                        <h4 className="text-lg font-medium text-white">Customer Priorities</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {categoryData.priorities.map((priority, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[--acc-green]/20 flex items-center justify-center mt-0.5">
                              <span className="text-[--acc-green] text-sm font-bold">✓</span>
                            </div>
                            <span className="text-sm text-zinc-200 leading-relaxed">{priority}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {narrative && (
                  <div className="rounded-xl bg-gradient-to-br from-[--acc-azure]/5 to-[--acc-purple]/5 border border-white/10 p-6 mt-6">
                    <h4 className="text-lg font-medium text-white mb-4">
                      What This Means for Your Scenario
                    </h4>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{narrative}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ) : isExecutiveOverview ? (
              <div className="mx-auto max-w-5xl space-y-6">
                <div className="prose prose-invert max-w-none">
                  <h3 className="text-2xl font-medium text-white mb-6">Four Pillars of Success</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="rounded-xl bg-gradient-to-br from-[--acc-azure]/10 to-transparent border border-white/10 p-6">
                      <h5 className="text-lg font-medium text-white mb-2">1. Enrich Employee Experiences</h5>
                      <p className="text-sm text-zinc-300 mb-3">
                        Empower teams with AI copilots and agents to boost productivity and reduce manual work.
                      </p>
                      <ul className="text-xs text-zinc-400 space-y-1 mb-3">
                        <li>• Microsoft 365 Copilot, Copilot Studio, Security Copilot</li>
                      </ul>
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-xs font-medium text-[--acc-azure] mb-2">Key Impact:</p>
                        <ul className="text-xs text-zinc-400 space-y-1">
                          <li>• <strong>30%</strong> increase in employee productivity</li>
                          <li>• <strong>20%</strong> reduction in response times</li>
                          <li>• <strong>25-40%</strong> reduced helpdesk demand</li>
                        </ul>
                      </div>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-[--acc-green]/10 to-transparent border border-white/10 p-6">
                      <h5 className="text-lg font-medium text-white mb-2">2. Reinvent Customer Engagement</h5>
                      <p className="text-sm text-zinc-300 mb-3">
                        Transform customer interactions with personalized, AI-powered experiences.
                      </p>
                      <ul className="text-xs text-zinc-400 space-y-1 mb-3">
                        <li>• Azure AI Foundry, GitHub Copilot, Copilot for Service</li>
                      </ul>
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-xs font-medium text-[--acc-green] mb-2">Key Impact:</p>
                        <ul className="text-xs text-zinc-400 space-y-1">
                          <li>• <strong>40%</strong> streamlined customer support</li>
                          <li>• <strong>55%</strong> reduction in wait times</li>
                          <li>• <strong>5x</strong> increase in email clickthrough</li>
                        </ul>
                      </div>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-[--acc-purple]/10 to-transparent border border-white/10 p-6">
                      <h5 className="text-lg font-medium text-white mb-2">3. Reshape Business Processes</h5>
                      <p className="text-sm text-zinc-300 mb-3">
                        Automate workflows and streamline operations with intelligent agents.
                      </p>
                      <ul className="text-xs text-zinc-400 space-y-1 mb-3">
                        <li>• Copilot Studio, GitHub Copilot, Power Platform</li>
                      </ul>
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-xs font-medium text-[--acc-purple] mb-2">Key Impact:</p>
                        <ul className="text-xs text-zinc-400 space-y-1">
                          <li>• <strong>40%</strong> cost reduction</li>
                          <li>• <strong>30,000</strong> hours saved monthly</li>
                          <li>• <strong>93%</strong> reduction in handling time</li>
                        </ul>
                      </div>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-[--acc-azure]/10 to-transparent border border-white/10 p-6">
                      <h5 className="text-lg font-medium text-white mb-2">4. Bend the Curve on Innovation</h5>
                      <p className="text-sm text-zinc-300 mb-3">
                        Accelerate R&D and experimentation with AI-powered tools and platforms.
                      </p>
                      <ul className="text-xs text-zinc-400 space-y-1 mb-3">
                        <li>• Azure AI Foundry, Azure Quantum, Microsoft Fabric</li>
                      </ul>
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-xs font-medium text-[--acc-azure] mb-2">Key Impact:</p>
                        <ul className="text-xs text-zinc-400 space-y-1">
                          <li>• <strong>50%</strong> faster go-to-market speed</li>
                          <li>• <strong>30%</strong> boost in developer efficiency</li>
                          <li>• <strong>80%</strong> faster programming</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {narrative && (
                  <div className="rounded-xl bg-gradient-to-br from-[--acc-azure]/5 to-[--acc-purple]/5 border border-white/10 p-6 mt-6">
                    <h4 className="text-lg font-medium text-white mb-4">
                      What This Means for You: {category || 'Your Organization'}
                    </h4>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{narrative}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mx-auto max-w-4xl">
                <div className="rounded-xl bg-white/5 border border-white/10 p-8 text-center">
                  <h3 className="text-xl font-medium text-white mb-2">{category}</h3>
                  <p className="text-zinc-400">Content for this category will be added soon.</p>
                </div>
              </div>
            )}
          </motion.div>

          {shouldShowVoiceChat && (
            <>
              {/* Resizable Divider */}
              <div 
                className="w-1 hover:w-2 bg-white/10 hover:bg-[--acc-azure]/50 cursor-col-resize transition-all"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const modalWidth = e.currentTarget.parentElement?.clientWidth || 0;
                  
                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const deltaX = moveEvent.clientX - startX;
                    const newLeftWidth = Math.max(20, Math.min(80, ((startX + deltaX) / modalWidth) * 100));
                    setIsSidebarExpanded(newLeftWidth < 50);
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
              
              <motion.div 
                className="flex flex-col bg-[#0a0a0a]"
                animate={{ 
                  width: isSidebarExpanded ? '70%' : '40%'
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
              <div className="px-6 py-4 border-b border-white/10">
                <h3 className="text-sm font-medium text-white mb-1">Relate this to my scenario</h3>
                <p className="text-xs text-zinc-400">Describe your situation to get a personalized narrative</p>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {transcript.length === 0 && !currentAssistantMessage && !isAssistantThinking && (
                  <motion.p 
                    className="text-sm text-zinc-500 text-center mt-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    {hasStartedVoice ? 'Start speaking or typing to begin the conversation' : 'Type your scenario or click microphone to enable voice'}
                  </motion.p>
                )}

                {transcript.map((msg, idx) => (
                  <motion.div
                    key={`msg-${idx}-${msg.role}-${msg.content.substring(0, 20)}`}
                    initial={{ 
                      opacity: 0, 
                      y: 20, 
                      scale: 0.9,
                      x: msg.role === 'user' ? 20 : -20
                    }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      scale: 1,
                      x: 0
                    }}
                    transition={{ 
                      duration: 0.4, 
                      ease: [0.25, 0.1, 0.25, 1],
                      type: "spring",
                      stiffness: 200,
                      damping: 20
                    }}
                    className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}
                  >
                    <motion.div 
                      className={`inline-block max-w-[85%] rounded-lg px-4 py-3 text-sm ${
                        msg.role === 'user' 
                          ? 'bg-[--acc-azure]/20 text-zinc-200 border border-[--acc-azure]/30' 
                          : 'bg-white/5 text-zinc-300'
                      }`}
                      whileHover={{ 
                        scale: 1.01,
                        boxShadow: msg.role === 'user' 
                          ? '0 4px 12px rgba(110, 231, 183, 0.15)'
                          : '0 4px 12px rgba(255, 255, 255, 0.05)'
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-invert prose-sm max-w-none
                          prose-headings:text-white prose-headings:font-semibold prose-headings:mb-2
                          prose-p:my-2 prose-p:leading-relaxed
                          prose-strong:text-white prose-strong:font-semibold
                          prose-ul:my-2 prose-ul:ml-4 prose-li:my-1
                          prose-ol:my-2 prose-ol:ml-4
                          prose-code:text-[--acc-azure] prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                          prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10
                          prose-a:text-[--acc-azure] prose-a:no-underline hover:prose-a:underline">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="leading-relaxed">{msg.content}</p>
                      )}
                    </motion.div>
                  </motion.div>
                ))}

                {isAssistantThinking && !currentAssistantMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      scale: 1 
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ 
                      duration: 0.3,
                      ease: "easeOut"
                    }}
                    className="text-left"
                  >
                    <motion.div 
                      className="inline-block rounded-lg px-4 py-3 bg-white/5 text-zinc-300 border border-white/10"
                      animate={{ 
                        borderColor: ['rgba(255,255,255,0.1)', 'rgba(var(--acc-green-rgb, 110, 231, 183), 0.3)', 'rgba(255,255,255,0.1)']
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <motion.span 
                            className="w-2 h-2 bg-zinc-400 rounded-full"
                            animate={{ 
                              y: [0, -8, 0],
                              scale: [1, 1.2, 1]
                            }}
                            transition={{ 
                              duration: 0.6, 
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          <motion.span 
                            className="w-2 h-2 bg-zinc-400 rounded-full"
                            animate={{ 
                              y: [0, -8, 0],
                              scale: [1, 1.2, 1]
                            }}
                            transition={{ 
                              duration: 0.6, 
                              repeat: Infinity,
                              delay: 0.1,
                              ease: "easeInOut"
                            }}
                          />
                          <motion.span 
                            className="w-2 h-2 bg-zinc-400 rounded-full"
                            animate={{ 
                              y: [0, -8, 0],
                              scale: [1, 1.2, 1]
                            }}
                            transition={{ 
                              duration: 0.6, 
                              repeat: Infinity,
                              delay: 0.2,
                              ease: "easeInOut"
                            }}
                          />
                        </div>
                        <motion.span 
                          className="text-xs text-zinc-500"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          Thinking...
                        </motion.span>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {currentAssistantMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      duration: 0.3,
                      ease: "easeOut"
                    }}
                    className="text-left"
                  >
                    <motion.div 
                      className="inline-block max-w-[85%] rounded-lg px-4 py-3 bg-white/5 text-zinc-300 border border-[--acc-green]/20"
                      animate={{ 
                        boxShadow: [
                          '0 0 0 0 rgba(110, 231, 183, 0)',
                          '0 0 20px 0 rgba(110, 231, 183, 0.1)',
                          '0 0 0 0 rgba(110, 231, 183, 0)'
                        ]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
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
                      <motion.div 
                        className="flex items-center gap-1 mt-2 pt-2 border-t border-white/5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.div 
                          className="w-1 h-1 bg-[--acc-green] rounded-full"
                          animate={{ 
                            scale: [1, 1.5, 1],
                            opacity: [1, 0.5, 1]
                          }}
                          transition={{ 
                            duration: 1, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        <motion.span 
                          className="text-[10px] text-zinc-500"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          Responding...
                        </motion.span>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}

                <div ref={transcriptEndRef} />
              </div>

              <div className="px-6 py-4 border-t border-white/10">
                {/* Status indicator bar */}
                <AnimatePresence mode="wait">
                  {(isUserSpeaking || isProcessingAudio || isAssistantThinking) && (
                    <motion.div 
                      key="status-indicator"
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ 
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                      className="mb-3 px-3 py-2 rounded-lg bg-gradient-to-r from-[--acc-azure]/10 to-[--acc-purple]/10 border border-white/10 overflow-hidden"
                    >
                      <motion.div 
                        className="flex items-center gap-2 text-xs"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                      >
                        {isUserSpeaking && (
                          <>
                            <motion.span 
                              className="relative flex h-2 w-2"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[--acc-azure] opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-[--acc-azure]"></span>
                            </motion.span>
                            <motion.span 
                              className="text-[--acc-azure] font-medium"
                              animate={{ opacity: [0.8, 1, 0.8] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              Listening to your voice...
                            </motion.span>
                          </>
                        )}
                        {isProcessingAudio && !isUserSpeaking && (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Loader2 className="h-3 w-3 text-[--acc-purple]" />
                            </motion.div>
                            <motion.span 
                              className="text-[--acc-purple] font-medium"
                              animate={{ opacity: [0.8, 1, 0.8] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              Processing your speech...
                            </motion.span>
                          </>
                        )}
                        {isAssistantThinking && !isProcessingAudio && !isUserSpeaking && (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Loader2 className="h-3 w-3 text-[--acc-green]" />
                            </motion.div>
                            <motion.span 
                              className="text-[--acc-green] font-medium"
                              animate={{ opacity: [0.8, 1, 0.8] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              Assistant is thinking...
                            </motion.span>
                          </>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-2 items-center">
                  <motion.button
                    onClick={hasStartedVoice ? toggleMute : handleStartVoice}
                    disabled={!isConnected}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={hasStartedVoice && isUserSpeaking ? { 
                      scale: [1, 1.1, 1],
                    } : {}}
                    transition={{ 
                      scale: { duration: 0.5, repeat: hasStartedVoice && isUserSpeaking ? Infinity : 0 }
                    }}
                    className={`relative p-2.5 rounded-lg transition-all flex-shrink-0 ${
                      hasStartedVoice && isMuted
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : hasStartedVoice && isUserSpeaking
                        ? 'bg-[--acc-azure]/30 text-[--acc-azure] ring-2 ring-[--acc-azure]/50'
                        : hasStartedVoice
                        ? 'bg-[--acc-azure]/20 text-[--acc-azure] hover:bg-[--acc-azure]/30'
                        : 'bg-white/10 text-zinc-400 hover:bg-white/20'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={!hasStartedVoice ? 'Enable voice input' : isMuted ? 'Unmute microphone' : 'Mute microphone'}
                  >
                    {!isConnected && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="h-4 w-4" />
                      </motion.div>
                    )}
                    {isConnected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      >
                        {hasStartedVoice && isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </motion.div>
                    )}
                    {hasStartedVoice && isUserSpeaking && (
                      <motion.span 
                        className="absolute -top-1 -right-1 flex h-3 w-3"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[--acc-azure] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[--acc-azure]"></span>
                      </motion.span>
                    )}
                  </motion.button>
                  
                  <motion.input
                    type="text"
                    value={scenarioInput}
                    onChange={(e) => setScenarioInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isAssistantThinking && handleGenerateNarrative()}
                    placeholder={isUserSpeaking ? "Listening..." : isProcessingAudio ? "Processing..." : "Type your scenario here or speak..."}
                    animate={{
                      borderColor: isUserSpeaking || isProcessingAudio
                        ? 'rgba(110, 231, 183, 0.5)'
                        : isAssistantThinking
                        ? 'rgba(110, 231, 183, 0.5)'
                        : 'rgba(255, 255, 255, 0.1)'
                    }}
                    transition={{ duration: 0.3 }}
                    className={`flex-1 px-4 py-2.5 rounded-lg bg-white/5 border text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none transition-all ${
                      isUserSpeaking || isProcessingAudio
                        ? 'ring-2 ring-[--acc-azure]/20'
                        : ''
                    }`}
                    disabled={isAssistantThinking}
                  />
                  
                  <motion.button
                    onClick={handleGenerateNarrative}
                    disabled={!scenarioInput.trim() || isAssistantThinking}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 rounded-lg bg-[--acc-azure]/20 text-[--acc-azure] hover:bg-[--acc-azure]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    title="Send scenario"
                  >
                    {isAssistantThinking ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ scale: 1 }}
                        whileHover={{ x: 2 }}
                      >
                        <Send className="h-5 w-5" />
                      </motion.div>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

