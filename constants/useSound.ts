import { Howl } from 'howler';

// Cache sounds to avoid reloading
const soundCache: { [key: string]: Howl } = {};

export const useSound = (soundName: string) => {
  const play = () => {
    try {
      let sound = soundCache[soundName];
      if (!sound) {
        // Adjust the path based on where your sound files are stored
        // Assuming sounds are in public/sounds/ or assets/sounds/
        const soundPath = `/sounds/${soundName}.mp3`; // Update path as needed
        sound = new Howl({
          src: [soundPath],
          volume: 0.5,
          preload: true,
        });
        soundCache[soundName] = sound;
      }
      sound.play();
    } catch (error) {
      console.error(`Failed to play sound ${soundName}:`, error);
    }
  };

  return { play };
};