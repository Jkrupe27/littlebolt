import { useEffect } from 'react';
import { gsap } from 'gsap';
import { Platform } from 'react-native';

export function useAnimations() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Configure GSAP defaults
      gsap.config({
        force3D: true,
      });
      
      // Register any custom GSAP plugins here
    }
  }, []);

  const animateIn = (element: HTMLElement) => {
    if (Platform.OS === 'web') {
      gsap.from(element, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out',
      });
    }
  };

  const animateGlow = (element: HTMLElement) => {
    if (Platform.OS === 'web') {
      gsap.to(element, {
        boxShadow: '0 0 20px rgba(255, 0, 156, 0.7)',
        duration: 0.3,
        yoyo: true,
        repeat: 1,
      });
    }
  };

  const animatePortal = (element: HTMLElement) => {
    if (Platform.OS === 'web') {
      gsap.to(element, {
        scale: 1.1,
        opacity: 0.8,
        duration: 0.5,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      });
    }
  };

  return {
    animateIn,
    animateGlow,
    animatePortal,
  };
}