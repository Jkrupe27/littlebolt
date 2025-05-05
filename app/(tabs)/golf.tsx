import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bold as Golf, Target, Sparkles, Zap } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withRepeat
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView
} from 'react-native-gesture-handler';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import Text from '@/components/ui/Text';
import Card from '@/components/ui/Card';
import GradientBackground from '@/components/ui/GradientBackground';
import ParallaxBackground from '@/components/ParallaxBackground';
import SparkComponent from '@/components/SparkComponent';
import { useSound } from '@/hooks/useSound';
import { useRewardSystem } from '../../src/hooks/useRewardSystem';

const POWER_MULTIPLIER = 0.15;
const REMOTE_CONTROL_DURATION = 750; // 0.75 seconds in ms
const MAGNETIC_FORCE = 5;
const TRAIL_COUNT = 5;
const BOUNCE_FORCE = 15;
const SLOW_FACTOR = 0.5;

export default function RupeverseGolf() {
  const [power, setPower] = useState(0);
  const [angle, setAngle] = useState(0);
  const [isAiming, setIsAiming] = useState(false);
  const [ballPosition, setBallPosition] = useState({ x: 100, y: 400 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [isInFlight, setIsInFlight] = useState(false);
  const [isRemoteControlActive, setIsRemoteControlActive] = useState(false);
  const [currentHole, setCurrentHole] = useState(0);
  const [trails, setTrails] = useState<Array<{ x: number; y: number; opacity: number }>>([]);
  const [shots, setShots] = useState(0);
  const [isMagneticActive, setIsMagneticActive] = useState(false);
  const [activeObstacle, setActiveObstacle] = useState<number | null>(null);
  const { triggerReward } = useRewardSystem();

  // Replace ValueXY with individual shared values
  const ballX = useSharedValue(100);
  const ballY = useSharedValue(400);
  const powerAnim = useSharedValue(0);
  const trailOpacity = useSharedValue(0);
  const remoteControlGlow = useSharedValue(0);
  const powerIndicatorScale = useSharedValue(1);
  const powerPulse = useSharedValue(1);
  const magneticGlow = useSharedValue(0);
  const trailDistortion = useSharedValue(0);

  const startPowerPulse = () => {
    powerPulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1
    );
  };

  const shootBall = () => {
    const radians = angle;
    setVelocity({
      x: Math.cos(radians) * power * 0.2,
      y: Math.sin(radians) * power * 0.2
    });
    setIsInFlight(true);
    setPower(0);
    setTrails([]);
    setShots(prev => prev + 1);
    
    powerIndicatorScale.value = withSequence(
      withSpring(0.8),
      withSpring(1)
    );
  };

  // Setup gesture handler for web and native
  const dragGesture = Gesture.Pan()
    .onBegin(() => {
      setIsAiming(true);
      setPower(0);
      startPowerPulse();
    })
    .onUpdate((event) => {
      const distance = Math.sqrt(
        Math.pow(event.translationX, 2) + Math.pow(event.translationY, 2)
      );
      const newPower = Math.min(distance * POWER_MULTIPLIER, 100);
      setPower(newPower);
      setAngle(Math.atan2(event.translationY, event.translationX));
      
      powerAnim.value = withSpring(newPower / 100);
    })
    .onEnd(() => {
      if (isAiming) {
        shootBall();
        setIsAiming(false);
        powerPulse.value = 1;
      }
    });

  const holes = [
    { 
      x: 500, 
      y: 200, 
      name: "Whispering Ridge",
      magnetRadius: 100,
      magnetStrength: MAGNETIC_FORCE 
    },
    { 
      x: 700, 
      y: 300, 
      name: "Bounce Canyon",
      magnetRadius: 120,
      magnetStrength: MAGNETIC_FORCE * 1.5,
      obstacles: [
        { x: 400, y: 250, type: 'bounce' },
        { x: 550, y: 350, type: 'slow' }
      ]
    }
  ];

  // Keyboard controls for Remote Control
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.code === 'Space' && isInFlight && !isRemoteControlActive) {
          activateRemoteControl();
        }
      };
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isInFlight, isRemoteControlActive]);

  // Game loop
  useEffect(() => {
    if (isInFlight) {
      const gameLoop = setInterval(() => {
        setBallPosition(prev => {
          // Update trail with distortion effect
          setTrails(currentTrails => {
            const newTrails = [...currentTrails];
            newTrails.push({
              x: prev.x + (isRemoteControlActive ? Math.random() * 10 - 5 : 0),
              y: prev.y + (isRemoteControlActive ? Math.random() * 10 - 5 : 0),
              opacity: 1
            });
            if (newTrails.length > TRAIL_COUNT) {
              newTrails.shift();
            }
            return newTrails.map(trail => ({
              ...trail,
              opacity: trail.opacity * 0.8
            }));
          });

          const newX = prev.x + velocity.x;
          const newY = prev.y + velocity.y;
          
          // Update shared values
          ballX.value = withSpring(newX);
          ballY.value = withSpring(newY);
          
          // Obstacle collision detection
          const hole = holes[currentHole];
          if (hole.obstacles) {
            hole.obstacles.forEach((obstacle, index) => {
              const distanceToObstacle = Math.sqrt(
                Math.pow(obstacle.x - newX, 2) + Math.pow(obstacle.y - newY, 2)
              );

              if (distanceToObstacle < 30) { // Collision radius
                if (obstacle.type === 'bounce') {
                  // Bounce effect
                  setVelocity(v => ({
                    x: v.x * 0.8,
                    y: -BOUNCE_FORCE
                  }));
                  setActiveObstacle(index);
                  setTimeout(() => setActiveObstacle(null), 500);
                } else if (obstacle.type === 'slow') {
                  // Slow effect
                  setVelocity(v => ({
                    x: v.x * SLOW_FACTOR,
                    y: v.y * SLOW_FACTOR
                  }));
                  setActiveObstacle(index);
                  setTimeout(() => setActiveObstacle(null), 500);
                }
              }
            });
          }
          
          setVelocity(v => {
            let newVx = v.x * 0.99;
            let newVy = v.y + 0.5;

            if (isRemoteControlActive) {
              newVx += 0.5;
              newVy -= 0.3;
            }

            const distanceToHole = Math.sqrt(
              Math.pow(hole.x - newX, 2) + Math.pow(hole.y - newY, 2)
            );
            
            if (distanceToHole < hole.magnetRadius) {
              if (!isMagneticActive) {
                setIsMagneticActive(true);
                magneticGlow.value = withRepeat(
                  withSequence(
                    withTiming(1, { duration: 1000 }),
                    withTiming(0.2, { duration: 1000 })
                  ),
                  -1
                );
              }
              const magneticForce = (hole.magnetRadius - distanceToHole) / hole.magnetRadius * hole.magnetStrength;
              newVx += (hole.x - newX) / distanceToHole * magneticForce;
              newVy += (hole.y - newY) / distanceToHole * magneticForce;
            } else if (isMagneticActive) {
              setIsMagneticActive(false);
              magneticGlow.value = 0;
            }

            return { x: newVx, y: newVy };
          });
          
          const distanceToHole = Math.sqrt(
            Math.pow(hole.x - newX, 2) + Math.pow(hole.y - newY, 2)
          );
          
          if (distanceToHole < 20) {
            clearInterval(gameLoop);
            setIsInFlight(false);
            nextHole();
            return { x: 100, y: 400 };
          }
          
          if (newY > 600 || newX < 0 || newX > 800) {
            clearInterval(gameLoop);
            setIsInFlight(false);
            resetBall();
            return { x: 100, y: 400 };
          }
          
          return { x: newX, y: newY };
        });
      }, 16);

      return () => clearInterval(gameLoop);
    }
  }, [isInFlight, velocity, isRemoteControlActive, isMagneticActive]);

  const activateRemoteControl = () => {
    setIsRemoteControlActive(true);
    
    // Trail distortion effect
    trailDistortion.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: REMOTE_CONTROL_DURATION })
    );

    // Enhanced remote control animation
    remoteControlGlow.value = withSequence(
      withSpring(1),
      withTiming(0, { duration: REMOTE_CONTROL_DURATION })
    );
    
    setTimeout(() => {
      setIsRemoteControlActive(false);
    }, REMOTE_CONTROL_DURATION);
  };

  const resetBall = () => {
    setBallPosition({ x: 100, y: 400 });
    setVelocity({ x: 0, y: 0 });
    setIsInFlight(false);
    setIsRemoteControlActive(false);
    setTrails([]);
    setIsMagneticActive(false);
    magneticGlow.value = 0;
    
    // Reset shared values
    ballX.value = 100;
    ballY.value = 400;
  };

  const nextHole = () => {
    const reward = triggerReward();
    // Show reward notification
    console.log(`Reward earned: ${reward.tier} - ${reward.flavor}`);
    
    setCurrentHole(prev => (prev + 1) % holes.length);
    resetBall();
  };

  // Animated styles using the new shared values
  const ballStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: ballX.value },
      { translateY: ballY.value },
      { scale: powerIndicatorScale.value }
    ]
  }));

  const powerIndicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: ballX.value },
      { translateY: ballY.value },
      { rotate: `${angle}rad` },
      { scaleX: powerAnim.value },
      { scale: powerPulse.value }
    ]
  }));

  const magneticFieldStyle = useAnimatedStyle(() => ({
    opacity: magneticGlow.value,
    shadowOpacity: magneticGlow.value * 0.8,
    elevation: magneticGlow.value * 8,
  }));

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text variant="h4" weight="bold" color={Colors.neutral[50]}>
            {holes[currentHole].name}
          </Text>
          <View style={styles.statsContainer}>
            <Card variant="elevated" style={styles.statsCard}>
              <Text variant="h5" weight="bold" color={Colors.accent[500]}>
                Power: {Math.round(power)}%
              </Text>
            </Card>
            <Card variant="elevated" style={styles.statsCard}>
              <Text variant="h5" weight="bold" color={Colors.accent[500]}>
                Shots: {shots}
              </Text>
            </Card>
          </View>
        </View>

        <GestureHandlerRootView style={styles.gameContainer}>
          <GestureDetector gesture={dragGesture}>
            <View style={styles.field}>
              {trails.map((trail, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.trail,
                    {
                      left: trail.x,
                      top: trail.y,
                      opacity: trail.opacity,
                      transform: [
                        {
                          scale: trailDistortion.value * (1 + Math.random() * 0.5),
                        },
                      ],
                      backgroundColor: isRemoteControlActive ? Colors.accent[400] : Colors.accent[300]
                    }
                  ]}
                />
              ))}

              {holes[currentHole].obstacles?.map((obstacle, index) => (
                <Obstacle
                  key={index}
                  type={obstacle.type}
                  x={obstacle.x}
                  y={obstacle.y}
                  isActive={activeObstacle === index}
                />
              ))}

              <Animated.View
                style={[
                  styles.magneticField,
                  {
                    left: holes[currentHole].x - holes[currentHole].magnetRadius,
                    top: holes[currentHole].y - holes[currentHole].magnetRadius,
                    width: holes[currentHole].magnetRadius * 2,
                    height: holes[currentHole].magnetRadius * 2,
                    borderColor: Colors.accent[500],
                  },
                  magneticFieldStyle
                ]}
              />

              <Animated.View style={[styles.ball, ballStyle]}>
                <Golf size={24} color={Colors.neutral[50]} />
              </Animated.View>

              <View
                style={[
                  styles.hole,
                  {
                    left: holes[currentHole].x,
                    top: holes[currentHole].y
                  }
                ]}
              >
                <Target size={32} color={Colors.accent[500]} />
              </View>

              {isAiming && (
                <Animated.View style={[styles.powerIndicator, powerIndicatorStyle]}>
                  <LinearGradient
                    colors={[Colors.accent[500], Colors.accent[300]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.powerGradient}
                  />
                </Animated.View>
              )}

              {isRemoteControlActive && (
                <Animated.View
                  style={[
                    styles.remoteControl,
                    {
                      opacity: remoteControlGlow.value,
                      transform: [
                        { translateX: ballX.value },
                        { translateY: ballY.value },
                        {
                          scale: remoteControlGlow.value * 1.5 + 1,
                        },
                      ]
                    }
                  ]}
                >
                  <Zap size={32} color={Colors.accent[500]} style={styles.remoteControlIcon} />
                  <Sparkles size={24} color={Colors.accent[300]} />
                </Animated.View>
              )}
            </View>
          </GestureDetector>
        </GestureHandlerRootView>

        <Card variant="glowing" style={styles.controls}>
          <Text variant="body2" color={Colors.neutral[300]} style={styles.instruction}>
            {isInFlight
              ? isRemoteControlActive
                ? "Remote Control Active!"
                : "Press SPACE for Remote Control!"
              : "Drag to Aim & Power"}
          </Text>
        </Card>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.screen.md,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statsCard: {
    padding: Spacing.sm,
  },
  gameContainer: {
    flex: 1,
    margin: Spacing.screen.md,
    backgroundColor: Colors.background.tertiary,
    borderRadius: 20,
    overflow: 'hidden',
  },
  field: {
    flex: 1,
    position: 'relative',
  },
  ball: {
    position: 'absolute',
    width: 24,
    height: 24,
    marginLeft: -12,
    marginTop: -12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hole: {
    position: 'absolute',
    width: 32,
    height: 32,
    marginLeft: -16,
    marginTop: -16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerIndicator: {
    position: 'absolute',
    width: 100,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    transformOrigin: 'left',
  },
  powerGradient: {
    flex: 1,
    borderRadius: 2,
  },
  trail: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: -4,
    marginTop: -4,
  },
  magneticField: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
  },
  remoteControl: {
    position: 'absolute',
    width: 32,
    height: 32,
    marginLeft: -16,
    marginTop: -16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remoteControlIcon: {
    position: 'absolute',
  },
  controls: {
    margin: Spacing.screen.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  instruction: {
    textAlign: 'center',
  },
});