import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function useCosmicCursor() {
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Check user preference from localStorage
    const savedPreference = localStorage.getItem('cosmicCursorEnabled');
    if (savedPreference !== null) {
      setIsEnabled(savedPreference === 'true');
    }
  }, []);

  const toggleCursor = () => {
    if (Platform.OS !== 'web') return;
    
    setIsEnabled(!isEnabled);
    localStorage.setItem('cosmicCursorEnabled', (!isEnabled).toString());
  };

  return {
    isEnabled,
    toggleCursor,
  };
}