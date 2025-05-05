import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';

export function usePerformance() {
  const frameRef = useRef<number>();
  
  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const throttle = useCallback(<T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): T => {
    let inThrottle: boolean;
    let lastResult: any;
    
    return ((...args: any[]) => {
      if (!inThrottle) {
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
        lastResult = func(...args);
      }
      return lastResult;
    }) as T;
  }, []);

  const debounce = useCallback(<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): T => {
    let timeout: NodeJS.Timeout;
    
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    }) as T;
  }, []);

  const requestAnimationFrameThrottled = useCallback((callback: FrameRequestCallback) => {
    if (Platform.OS === 'web') {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = requestAnimationFrame(callback);
    } else {
      callback(Date.now());
    }
  }, []);

  return {
    throttle,
    debounce,
    requestAnimationFrameThrottled,
  };
}