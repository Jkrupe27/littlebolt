import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { gsap } from 'gsap';
import { Colors } from '@/constants/Colors';

const TRAIL_LENGTH = 20;
const DOT_SIZE = 6;

export default function CosmicCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Create cursor and trail elements
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Hide default cursor
    document.body.style.cursor = 'none';

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      // Animate cursor
      gsap.to(cursor, {
        x: e.clientX - DOT_SIZE / 2,
        y: e.clientY - DOT_SIZE / 2,
        duration: 0.1,
        ease: 'power2.out',
      });

      // Animate trail with stagger
      gsap.to(trailRefs.current, {
        x: e.clientX - DOT_SIZE / 2,
        y: e.clientY - DOT_SIZE / 2,
        duration: 0.5,
        stagger: 0.02,
        ease: 'power2.out',
      });
    };

    // Add event listener
    document.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      document.body.style.cursor = 'auto';
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (Platform.OS !== 'web') return null;

  return (
    <>
      {/* Main cursor */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          width: DOT_SIZE * 2,
          height: DOT_SIZE * 2,
          backgroundColor: Colors.accent[500],
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          mixBlendMode: 'screen',
          boxShadow: `0 0 10px ${Colors.accent[500]}`,
        }}
      />
      
      {/* Trail dots */}
      {Array.from({ length: TRAIL_LENGTH }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) trailRefs.current[i] = el;
          }}
          style={{
            position: 'fixed',
            width: DOT_SIZE * (1 - i / TRAIL_LENGTH),
            height: DOT_SIZE * (1 - i / TRAIL_LENGTH),
            backgroundColor: Colors.accent[500],
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 9998,
            opacity: 1 - i / TRAIL_LENGTH,
            mixBlendMode: 'screen',
            boxShadow: `0 0 ${5 * (1 - i / TRAIL_LENGTH)}px ${Colors.accent[500]}`,
          }}
        />
      ))}
    </>
  );
}