import { useRef, useCallback, useState } from 'react';

interface UseWebRTCOptions {
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}

export function useWebRTC({ onConnectionStateChange }: UseWebRTCOptions = {}) {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');

  const setupWebRTC = useCallback(async (iceServers: RTCIceServer[]) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: iceServers.length > 0 ? iceServers : [
          { urls: 'stun:stun.l.google.com:19302' }
        ],
        bundlePolicy: 'max-bundle', // Important for Azure Avatar Service
        iceCandidatePoolSize: 10 // Pre-gather ICE candidates to speed up connection
      });

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        console.log('WebRTC connection state:', state);
        setConnectionState(state);
        onConnectionStateChange?.(state);
      };

      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
      };

      pc.ontrack = (event) => {
        console.log('Received track:', event.track.kind);
        if (event.track.kind === 'video' && videoRef.current) {
          // Only handle video track - audio will be handled separately
          if (videoRef.current.srcObject !== event.streams[0]) {
            videoRef.current.srcObject = event.streams[0];
            videoRef.current.play().catch(err => {
              console.error('Error playing video:', err);
            });
          }
        } else if (event.track.kind === 'audio') {
          // Handle audio track separately to avoid conflicts
          const audio = document.createElement('audio');
          audio.srcObject = event.streams[0];
          audio.autoplay = true;
          audio.style.display = 'none';
          document.body.appendChild(audio);
        }
      };

      peerConnectionRef.current = pc;

      pc.addTransceiver('video', { direction: 'recvonly' });
      pc.addTransceiver('audio', { direction: 'recvonly' });

      return pc;
    } catch (error) {
      console.error('Error setting up WebRTC:', error);
      throw error;
    }
  }, [onConnectionStateChange]);

  const createOffer = useCallback(async (): Promise<RTCSessionDescriptionInit | null> => {
    if (!peerConnectionRef.current) {
      console.error('Peer connection not initialized');
      return null;
    }

    try {
      const pc = peerConnectionRef.current;
      
      // Create and set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // Wait for ICE gathering to complete, but with a timeout
      // Chrome/Edge can take much longer than Safari for ICE gathering
      const gatheringStartTime = Date.now();
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === 'complete') {
          console.log('ICE gathering already complete');
          resolve();
          return;
        }
        
        // Set a timeout to not wait forever (2 seconds max)
        const timeout = setTimeout(() => {
          const elapsed = Date.now() - gatheringStartTime;
          console.log(`ICE gathering timeout after ${elapsed}ms, proceeding anyway`);
          pc.removeEventListener('icegatheringstatechange', checkState);
          resolve();
        }, 2000);
        
        const checkState = () => {
          if (pc.iceGatheringState === 'complete') {
            const elapsed = Date.now() - gatheringStartTime;
            console.log(`ICE gathering completed in ${elapsed}ms`);
            clearTimeout(timeout);
            pc.removeEventListener('icegatheringstatechange', checkState);
            resolve();
          }
        };
        
        pc.addEventListener('icegatheringstatechange', checkState);
      });
      
      // Return the complete offer with all ICE candidates
      return pc.localDescription;
    } catch (error) {
      console.error('Error creating offer:', error);
      return null;
    }
  }, []);

  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) {
      console.error('Peer connection not initialized');
      return;
    }

    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('Remote description set successfully');
    } catch (error) {
      console.error('Error setting remote description:', error);
    }
  }, []);

  const close = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setConnectionState('closed');
  }, []);

  return {
    videoRef,
    connectionState,
    setupWebRTC,
    createOffer,
    handleAnswer,
    close,
  };
}
