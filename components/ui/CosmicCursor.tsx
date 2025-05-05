import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

const TRAIL_LENGTH = 20;
const DOT_SIZE = 6;

export default function CosmicCursor() {
  const [mounted, setMounted] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    setMounted(true);
    
    // Create cursor and trail elements
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Hide default cursor
    document.body.style.cursor = 'none';

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      if (!mounted) return;

      // Animate cursor
      if (cursor) {
        cursor.style.transform = `translate(${e.clientX - DOT_SIZE / 2}px, ${e.clientY - DOT_SIZE / 2}px)`;
      }

      // Animate trail with delay
      trailRefs.current.forEach((trail, index) => {
        if (trail) {
          setTimeout(() => {
            if (trail && mounted) {
              trail.style.transform = `translate(${e.clientX - DOT_SIZE / 2}px, ${e.clientY - DOT_SIZE / 2}px)`;
            }
          }, index * 20);
        }
      });
    };

    // Add event listener
    document.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      setMounted(false);
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
          transition: 'transform 0.1s ease-out',
        }}
      />
      
      {/* Trail dots */}
      {Array.from({ length: TRAIL_LENGTH }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            trailRefs.current[i] = el;
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
            transition: 'transform 0.1s ease-out',
          }}
        />
      ))}
    </>
  );
}