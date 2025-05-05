import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { Platform } from 'react-native';

const sounds = {
  click: '/assets/sounds/click.mp3',
  swoosh: '/assets/sounds/swoosh.mp3',
  glitch: '/assets/sounds/glitch.mp3',
  portal: '/assets/sounds/portal.mp3',
};

export function useSound(soundName: keyof typeof sounds) {
  const soundRef = useRef<Howl | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      soundRef.current = new Howl({
        src: [sounds[soundName]],
        volume: 0.5,
        preload: true,
      });
    }
    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, [soundName]);

  const play = () => {
    if (Platform.OS === 'web' && soundRef.current) {
      soundRef.current.play();
    }
  };

  return { play };
}