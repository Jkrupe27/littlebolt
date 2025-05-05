import { useEffect } from 'react';
import { Platform } from 'react-native';

export function useAccessibility() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Add ARIA landmarks
      document.body.setAttribute('role', 'application');
      
      // Ensure proper focus management
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          // Add visible focus indicators
          document.body.classList.add('keyboard-navigation');
        }
      };
      
      const handleMouseDown = () => {
        document.body.classList.remove('keyboard-navigation');
      };
      
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleMouseDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('mousedown', handleMouseDown);
      };
    }
  }, []);

  return {
    setAccessibleLabel: (element: HTMLElement, label: string) => {
      if (Platform.OS === 'web') {
        element.setAttribute('aria-label', label);
      }
    },
    setAccessibleRole: (element: HTMLElement, role: string) => {
      if (Platform.OS === 'web') {
        element.setAttribute('role', role);
      }
    },
  };
}