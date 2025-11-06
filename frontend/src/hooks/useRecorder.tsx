import { useRef, useState, useCallback } from 'react';

interface UseRecorderOptions {
  onDataAvailable?: (data: ArrayBuffer) => void;
}

export function useRecorder({ onDataAvailable }: UseRecorderOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isMutedRef = useRef(false);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 24000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      mediaStreamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        // Use ref instead of state to avoid closure issues
        if (isMutedRef.current) return;

        const inputData = e.inputBuffer.getChannelData(0);
        
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        onDataAvailable?.(pcm16.buffer);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      setIsRecording(true);
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }, [onDataAvailable]);

  const stopRecording = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    setIsRecording(false);
    setIsMuted(false);
    console.log('Recording stopped');
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    isMutedRef.current = !isMutedRef.current;
    console.log('Microphone', isMutedRef.current ? 'muted' : 'unmuted');
  }, []);

  return {
    isRecording,
    isMuted,
    startRecording,
    stopRecording,
    toggleMute,
  };
}
