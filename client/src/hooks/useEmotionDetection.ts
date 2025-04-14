import { useState, useEffect, useRef } from 'react';

type DetectionState = 'idle' | 'waiting' | 'detected';

export function useEmotionDetection(timeThreshold = 15000) {
  const [state, setState] = useState<DetectionState>('idle');
  const [lastInteractionTime, setLastInteractionTime] = useState<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const registerInteraction = () => {
    setLastInteractionTime(Date.now());
    
    if (state === 'detected') {
      setState('idle');
    }
  };

  const resetDetection = () => {
    setState('idle');
  };

  useEffect(() => {
    // Start monitoring for inactivity
    if (state === 'idle') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setState('waiting');
      }, timeThreshold);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [lastInteractionTime, state, timeThreshold]);

  useEffect(() => {
    // If waiting for too long (additional 5 seconds), trigger detected state
    if (state === 'waiting') {
      const additionalWaitTime = 5000;
      
      timeoutRef.current = setTimeout(() => {
        setState('detected');
      }, additionalWaitTime);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state]);

  return {
    state,
    registerInteraction,
    resetDetection,
    lastInteractionTime
  };
}
